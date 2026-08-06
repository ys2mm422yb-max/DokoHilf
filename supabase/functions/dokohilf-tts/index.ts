const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const PRIMARY_MODEL = 'gemini-3.1-flash-tts-preview';
const FALLBACK_MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Gacrux';
const VOICE_STYLE = 'natural-spoken-german-colleague-v8-low-latency';
const PRIMARY_TIMEOUT_MS = 4_500;
const PRIMARY_RETRY_TIMEOUT_MS = 3_000;
const FALLBACK_TIMEOUT_MS = 4_000;
const MAX_TEXT_CHARS = 520;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 36;
const CACHE_TTL_MS = 2 * 60 * 60_000;
const CACHE_LIMIT = 96;

const requestWindows = new Map<string, { startedAt: number; count: number }>();
const audioCache = new Map<string, { wav: Uint8Array; model: string; createdAt: number }>();
const pendingAudio = new Map<string, Promise<{ wav: Uint8Array; model: string; mode: string; latency: number }>>();

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Voice, X-DokoHilf-TTS-Model, X-DokoHilf-Voice-Mode, X-DokoHilf-Voice-Style, X-DokoHilf-TTS-Latency, X-DokoHilf-TTS-Cache',
    'Vary': 'Origin',
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

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) view.setUint8(offset + index, value.charCodeAt(index));
}

function pcmToWav(pcm: Uint8Array, sampleRate = 24000, channels = 1, bitsPerSample = 16): Uint8Array {
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

async function requestViaGenerateContent(apiKey: string, model: string, text: string, timeoutMs: number): Promise<Uint8Array> {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
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
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`tts_generate_${response.status}`);
  const parts = payload?.candidates?.[0]?.content?.parts;
  const audioPart = Array.isArray(parts)
    ? parts.find((part: Record<string, unknown>) => {
      const inlineData = part?.inlineData as Record<string, unknown> | undefined;
      return typeof inlineData?.data === 'string';
    })
    : null;
  const base64 = audioPart?.inlineData?.data;
  if (typeof base64 !== 'string' || !base64) throw new Error('tts_generate_empty');
  return base64ToBytes(base64);
}

function cacheKey(text: string): string {
  return text.toLocaleLowerCase('de-DE').replace(/\s+/g, ' ').trim();
}

function getCached(text: string): { wav: Uint8Array; model: string } | null {
  const key = cacheKey(text);
  const entry = audioCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    audioCache.delete(key);
    return null;
  }
  audioCache.delete(key);
  audioCache.set(key, entry);
  return { wav: entry.wav, model: entry.model };
}

function putCached(text: string, wav: Uint8Array, model: string): void {
  const key = cacheKey(text);
  audioCache.set(key, { wav, model, createdAt: Date.now() });
  while (audioCache.size > CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value;
    if (typeof oldest !== 'string') break;
    audioCache.delete(oldest);
  }
}

function audioResponse(origin: string | null, wav: Uint8Array, model: string, mode: string, latency: number, cache: 'hit' | 'miss' | 'shared'): Response {
  return new Response(wav, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.byteLength),
      'X-DokoHilf-Voice': VOICE_NAME,
      'X-DokoHilf-TTS-Model': model,
      'X-DokoHilf-Voice-Mode': mode,
      'X-DokoHilf-Voice-Style': VOICE_STYLE,
      'X-DokoHilf-TTS-Latency': String(latency),
      'X-DokoHilf-TTS-Cache': cache,
    },
  });
}

async function generateAudio(apiKey: string, text: string): Promise<{ wav: Uint8Array; model: string; mode: string; latency: number }> {
  const startedAt = Date.now();
  let pcm: Uint8Array;
  let model = PRIMARY_MODEL;
  let mode = 'gemini-3.1-fast-natural';
  try {
    pcm = await requestViaGenerateContent(apiKey, PRIMARY_MODEL, text, PRIMARY_TIMEOUT_MS);
  } catch {
    try {
      pcm = await requestViaGenerateContent(apiKey, PRIMARY_MODEL, text, PRIMARY_RETRY_TIMEOUT_MS);
      mode = 'gemini-3.1-fast-retry';
    } catch {
      model = FALLBACK_MODEL;
      mode = 'gemini-2.5-compatible-fallback';
      pcm = await requestViaGenerateContent(apiKey, FALLBACK_MODEL, text, FALLBACK_TIMEOUT_MS);
    }
  }
  const wav = pcmToWav(pcm);
  putCached(text, wav, model);
  return { wav, model, mode, latency: Date.now() - startedAt };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isRateLimited(req)) return jsonResponse(origin, 429, { error: 'Zu viele Sprachanfragen. Bitte kurz warten.' });

  let parsed: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (!raw || raw.length > 5000) return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' });
  }

  const text = sanitizeText(parsed.text);
  if (!text) return jsonResponse(origin, 400, { error: 'Es fehlt ein Text.' });
  if (containsDirectPersonalData(text)) return jsonResponse(origin, 422, { blocked: true, error: 'Mögliche Echtdaten erkannt. Keine Sprachausgabe erstellt.' });

  const cached = getCached(text);
  if (cached) return audioResponse(origin, cached.wav, cached.model, 'server-memory-cache', 0, 'hit');

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jsonResponse(origin, 503, { error: 'Die Sprach-KI ist noch nicht eingerichtet.' });

  const key = cacheKey(text);
  const existing = pendingAudio.get(key);
  if (existing) {
    try {
      const result = await existing;
      return audioResponse(origin, result.wav, result.model, `${result.mode}-shared`, result.latency, 'shared');
    } catch {
      return jsonResponse(origin, 502, { error: 'Die natürliche Stimme ist gerade nicht verfügbar.' });
    }
  }

  const generation = generateAudio(apiKey, text).finally(() => pendingAudio.delete(key));
  pendingAudio.set(key, generation);
  try {
    const result = await generation;
    return audioResponse(origin, result.wav, result.model, result.mode, result.latency, 'miss');
  } catch (error) {
    const timeout = error instanceof DOMException && error.name === 'TimeoutError';
    return jsonResponse(origin, timeout ? 504 : 502, {
      error: timeout ? 'Die natürliche Stimme hat zu lange gebraucht.' : 'Die natürliche Stimme ist gerade nicht verfügbar.',
    });
  }
});
