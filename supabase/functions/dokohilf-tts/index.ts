const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const PRIMARY_MODEL = 'gemini-3.1-flash-tts-preview';
const FALLBACK_MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Achird';
const MAX_TEXT_CHARS = 900;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;

const requestWindows = new Map<string, { startedAt: number; count: number }>();

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Voice, X-DokoHilf-TTS-Model, X-DokoHilf-Voice-Mode',
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
  ].some((pattern) => pattern.test(text));
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function writeAscii(view: DataView, offset: number, value: string): void {
  for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
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

async function requestAudio(apiKey: string, model: string, text: string): Promise<Uint8Array> {
  const prompt = [
    'Lies den folgenden deutschen Text wie eine freundliche Kollegin oder ein freundlicher Kollege in einem normalen Gespräch vor.',
    'Die Stimme soll warm, locker, ruhig und glaubwürdig klingen, ohne Werbestimme, Ansagerstil oder künstliche Überbetonung.',
    'Sprich in natürlichem Alltagstempo mit kurzen sinnvollen Pausen. Keine zusätzlichen Wörter, Erklärungen oder Begrüßungen.',
    'Lies ausschließlich den Text nach TRANSKRIPT vor.',
    `TRANSKRIPT: ${text}`,
  ].join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: VOICE_NAME },
          },
        },
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`tts_${response.status}`);
  const base64 = payload?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (typeof base64 !== 'string' || !base64) throw new Error('tts_empty');
  return base64ToBytes(base64);
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
  if (containsDirectPersonalData(text)) {
    return jsonResponse(origin, 422, { blocked: true, error: 'Mögliche Echtdaten erkannt. Keine Sprachausgabe erstellt.' });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jsonResponse(origin, 503, { error: 'Die Sprach-KI ist noch nicht eingerichtet.' });

  let pcm: Uint8Array;
  let model = PRIMARY_MODEL;
  try {
    pcm = await requestAudio(apiKey, PRIMARY_MODEL, text);
  } catch {
    model = FALLBACK_MODEL;
    try {
      pcm = await requestAudio(apiKey, FALLBACK_MODEL, text);
    } catch {
      return jsonResponse(origin, 502, { error: 'Die natürliche Stimme ist gerade nicht verfügbar.' });
    }
  }

  const wav = pcmToWav(pcm);
  return new Response(wav, {
    status: 200,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'audio/wav',
      'Content-Length': String(wav.byteLength),
      'X-DokoHilf-Voice': VOICE_NAME,
      'X-DokoHilf-TTS-Model': model,
      'X-DokoHilf-Voice-Mode': 'natural-cloud',
    },
  });
});
