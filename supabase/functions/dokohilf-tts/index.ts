const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const PRIMARY_MODEL = 'gemini-3.1-flash-tts-preview';
const FALLBACK_MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Gacrux';
const VOICE_STYLE = 'natural-spoken-german-colleague-v10-rest-audio';
const INTERACTIONS_API_REVISION = '2026-05-20';
const INTERACTIONS_AUDIO_PARSER = 'raw-steps-content-v1';
const PRIMARY_TIMEOUT_MS = 8_000;
const FALLBACK_TIMEOUT_MS = 6_000;
const LEGACY_TIMEOUT_MS = 5_000;
const MAX_TEXT_CHARS = 520;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 36;
const CACHE_TTL_MS = 2 * 60 * 60_000;
const CACHE_LIMIT = 96;

type UnknownRecord = Record<string, unknown>;
type AudioPayload = {
  bytes: Uint8Array;
  mimeType: string;
  sampleRate: number;
  channels: number;
};
type GeneratedAudio = {
  wav: Uint8Array;
  model: string;
  mode: string;
  latency: number;
};

class TtsProviderError extends Error {
  constructor(
    readonly source: string,
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'TtsProviderError';
  }
}

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const audioCache = new Map<string, { wav: Uint8Array; model: string; mode: string; createdAt: number }>();
const pendingAudio = new Map<string, Promise<GeneratedAudio>>();

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': [
      'X-DokoHilf-Voice',
      'X-DokoHilf-TTS-Model',
      'X-DokoHilf-TTS-API',
      'X-DokoHilf-TTS-Parser',
      'X-DokoHilf-Voice-Mode',
      'X-DokoHilf-Voice-Style',
      'X-DokoHilf-TTS-Latency',
      'X-DokoHilf-TTS-Cache',
    ].join(', '),
    Vary: 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function isRateLimited(req: Request): boolean {
  const key = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/\*\*/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TEXT_CHARS);
}

function containsDirectPersonalData(text: string): boolean {
  return [
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
    /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
    /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[a-zäöüß-]{2,}/i,
    /\b\d{6,}\b/,
  ].some(pattern => pattern.test(text));
}

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function positiveInteger(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value;
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function audioFromRecord(value: unknown): AudioPayload | null {
  const record = asRecord(value);
  if (!record) return null;

  const inline = asRecord(record.inlineData) || asRecord(record.inline_data);
  if (inline) {
    const data = asString(inline.data);
    const mimeType = asString(inline.mimeType || inline.mime_type).toLowerCase();
    if (data && mimeType.startsWith('audio/')) {
      return {
        bytes: base64ToBytes(data),
        mimeType,
        sampleRate: positiveInteger(record.sampleRate || record.sample_rate, 24000),
        channels: positiveInteger(record.channels, 1),
      };
    }
  }

  const data = asString(record.data);
  const type = asString(record.type).toLowerCase();
  const mimeType = asString(record.mimeType || record.mime_type).toLowerCase();
  if (data && (type === 'audio' || mimeType.startsWith('audio/'))) {
    return {
      bytes: base64ToBytes(data),
      mimeType: mimeType || 'audio/l16',
      sampleRate: positiveInteger(record.sampleRate || record.sample_rate, 24000),
      channels: positiveInteger(record.channels, 1),
    };
  }
  return null;
}

function extractInteractionAudio(payload: unknown): AudioPayload | null {
  const root = asRecord(payload);
  if (!root) return null;

  const convenience = audioFromRecord(root.output_audio) || audioFromRecord(root.outputAudio);
  if (convenience) return convenience;

  const steps = Array.isArray(root.steps) ? [...root.steps].reverse() : [];
  for (const stepValue of steps) {
    const step = asRecord(stepValue);
    if (!step) continue;
    const content = Array.isArray(step.content) ? [...step.content].reverse() : [];
    for (const block of content) {
      const audio = audioFromRecord(block);
      if (audio) return audio;
    }
  }

  const queue: unknown[] = [root];
  const visited = new Set<object>();
  let inspected = 0;
  while (queue.length && inspected < 400) {
    const current = queue.shift();
    inspected += 1;
    const direct = audioFromRecord(current);
    if (direct) return direct;
    if (Array.isArray(current)) {
      queue.push(...current.slice(0, 50));
      continue;
    }
    const record = asRecord(current);
    if (!record || visited.has(record)) continue;
    visited.add(record);
    queue.push(...Object.values(record).slice(0, 50));
  }
  return null;
}

function isWave(bytes: Uint8Array): boolean {
  return bytes.byteLength > 44
    && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70
    && bytes[8] === 87 && bytes[9] === 65 && bytes[10] === 86 && bytes[11] === 69;
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function pcmToWav(
  pcm: Uint8Array,
  sampleRate = 24000,
  channels = 1,
  bitsPerSample = 16,
): Uint8Array {
  const headerSize = 44;
  const buffer = new ArrayBuffer(headerSize + pcm.byteLength);
  const view = new DataView(buffer);
  const blockAlign = channels * bitsPerSample / 8;
  const byteRate = sampleRate * blockAlign;
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + pcm.byteLength, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, pcm.byteLength, true);
  new Uint8Array(buffer, headerSize).set(pcm);
  return new Uint8Array(buffer);
}

function ensureWav(audio: AudioPayload): Uint8Array {
  return isWave(audio.bytes)
    ? audio.bytes
    : pcmToWav(audio.bytes, audio.sampleRate, audio.channels);
}

function voicePrompt(text: string): string {
  return [
    'Erzeuge ausschließlich eine deutsche Sprachausgabe.',
    'Stimme: erfahrene Kollegin, natürlich, ruhig, klar und zügig.',
    'Normale Satzmelodie, kurze Pausen, kein Ansagerhythmus.',
    'Lies nur den Text nach der Markierung TRANSKRIPT vor.',
    'TRANSKRIPT:',
    text,
  ].join('\n');
}

async function requestViaInteractions(
  apiKey: string,
  model: string,
  text: string,
  timeoutMs: number,
): Promise<AudioPayload> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
      'Api-Revision': INTERACTIONS_API_REVISION,
    },
    signal: AbortSignal.timeout(timeoutMs),
    body: JSON.stringify({
      model,
      input: voicePrompt(text),
      response_format: { type: 'audio' },
      generation_config: { speech_config: [{ voice: VOICE_NAME }] },
    }),
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorRecord = asRecord(asRecord(payload)?.error);
    const providerStatus = asString(errorRecord?.status) || `HTTP_${response.status}`;
    throw new TtsProviderError(
      'interactions',
      response.status,
      `tts_interactions_${response.status}_${providerStatus}`,
    );
  }
  const audio = extractInteractionAudio(payload);
  if (!audio || audio.bytes.byteLength === 0) {
    throw new TtsProviderError('interactions', 502, 'tts_interactions_missing_raw_audio');
  }
  return audio;
}

async function requestViaGenerateContent(
  apiKey: string,
  model: string,
  text: string,
  timeoutMs: number,
): Promise<AudioPayload> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify({
        contents: [{ parts: [{ text: voicePrompt(text) }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } } },
        },
      }),
    },
  );
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new TtsProviderError('generate-content', response.status, `tts_generate_${response.status}`);
  }

  const root = asRecord(payload);
  const candidates = Array.isArray(root?.candidates) ? root.candidates : [];
  const firstCandidate = asRecord(candidates[0]);
  const content = asRecord(firstCandidate?.content);
  const parts = Array.isArray(content?.parts) ? content.parts : [];
  for (const part of parts) {
    const audio = audioFromRecord(part);
    if (audio) return audio;
  }
  throw new TtsProviderError('generate-content', 502, 'tts_generate_missing_audio');
}

function cacheKey(text: string): string {
  return text.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}

function getCached(text: string): { wav: Uint8Array; model: string; mode: string } | null {
  const key = cacheKey(text);
  const entry = audioCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }
  audioCache.delete(key);
  audioCache.set(key, entry);
  return { wav: entry.wav, model: entry.model, mode: entry.mode };
}

function putCached(text: string, wav: Uint8Array, model: string, mode: string): void {
  const key = cacheKey(text);
  audioCache.set(key, { wav, model, mode, createdAt: Date.now() });
  while (audioCache.size > CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value;
    if (typeof oldest !== 'string') break;
    audioCache.delete(oldest);
  }
}

function apiName(mode: string): string {
  if (mode.includes('interactions')) return 'interactions-v1beta';
  if (mode.includes('generate-content')) return 'generate-content-v1beta';
  return 'server-memory-cache';
}

function audioResponse(
  origin: string | null,
  wav: Uint8Array,
  model: string,
  mode: string,
  latency: number,
  cache: 'hit' | 'miss' | 'shared',
): Response {
  return new Response(wav, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.byteLength),
      'X-DokoHilf-Voice': VOICE_NAME,
      'X-DokoHilf-TTS-Model': model,
      'X-DokoHilf-TTS-API': apiName(mode),
      'X-DokoHilf-TTS-Parser': INTERACTIONS_AUDIO_PARSER,
      'X-DokoHilf-Voice-Mode': mode,
      'X-DokoHilf-Voice-Style': VOICE_STYLE,
      'X-DokoHilf-TTS-Latency': String(latency),
      'X-DokoHilf-TTS-Cache': cache,
    },
  });
}

async function generateAudio(apiKey: string, text: string): Promise<GeneratedAudio> {
  const startedAt = Date.now();
  let audio: AudioPayload;
  let model = PRIMARY_MODEL;
  let mode = 'gemini-3.1-interactions-primary';
  try {
    audio = await requestViaInteractions(apiKey, PRIMARY_MODEL, text, PRIMARY_TIMEOUT_MS);
  } catch {
    model = FALLBACK_MODEL;
    mode = 'gemini-2.5-interactions-fallback';
    try {
      audio = await requestViaInteractions(apiKey, FALLBACK_MODEL, text, FALLBACK_TIMEOUT_MS);
    } catch {
      mode = 'gemini-2.5-generate-content-fallback';
      audio = await requestViaGenerateContent(apiKey, FALLBACK_MODEL, text, LEGACY_TIMEOUT_MS);
    }
  }
  const wav = ensureWav(audio);
  putCached(text, wav, model, mode);
  return { wav, model, mode, latency: Date.now() - startedAt };
}

function responseStatusForError(error: unknown): number {
  if (error instanceof TtsProviderError && [429, 502, 503, 504].includes(error.status)) {
    return error.status;
  }
  if (error instanceof DOMException && error.name === 'TimeoutError') return 504;
  return 502;
}

function publicError(status: number): string {
  if (status === 429) return 'Die Sprach-KI hat ihr aktuelles Kontingent erreicht.';
  if (status === 504) return 'Die natürliche Stimme hat zu lange gebraucht.';
  return 'Die natürliche Stimme ist gerade nicht verfügbar.';
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  }
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  }
  if (isRateLimited(req)) {
    return jsonResponse(origin, 429, { error: 'Zu viele Sprachanfragen. Bitte kurz warten.' });
  }

  let parsed: UnknownRecord;
  try {
    const raw = await req.text();
    if (!raw || raw.length > 5000) {
      return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });
    }
    parsed = JSON.parse(raw) as UnknownRecord;
  } catch {
    return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' });
  }

  const text = sanitizeText(parsed.text);
  if (!text) return jsonResponse(origin, 400, { error: 'Es fehlt ein Text.' });
  if (containsDirectPersonalData(text)) {
    return jsonResponse(origin, 422, {
      blocked: true,
      error: 'Mögliche Echtdaten erkannt. Keine Sprachausgabe erstellt.',
    });
  }

  const cached = getCached(text);
  if (cached) return audioResponse(origin, cached.wav, cached.model, cached.mode, 0, 'hit');

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse(origin, 503, { error: 'Die Sprach-KI ist noch nicht eingerichtet.' });
  }

  const key = cacheKey(text);
  const existing = pendingAudio.get(key);
  if (existing) {
    try {
      const result = await existing;
      return audioResponse(
        origin,
        result.wav,
        result.model,
        `${result.mode}-shared`,
        result.latency,
        'shared',
      );
    } catch (error) {
      const status = responseStatusForError(error);
      return jsonResponse(origin, status, { error: publicError(status) });
    }
  }

  const generation = generateAudio(apiKey, text).finally(() => pendingAudio.delete(key));
  pendingAudio.set(key, generation);
  try {
    const result = await generation;
    return audioResponse(origin, result.wav, result.model, result.mode, result.latency, 'miss');
  } catch (error) {
    const status = responseStatusForError(error);
    return jsonResponse(origin, status, { error: publicError(status) });
  }
});
