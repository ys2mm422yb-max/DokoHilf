import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const TEST_TEXT = 'Öffne Vitalwerte und klicke oben links auf das grüne Plus.';
const EXPECTED_VOICE = 'Gacrux';
const ALLOWED_STYLES = new Set([
  'natural-spoken-german-colleague-v7-fast-start',
  'natural-spoken-german-colleague-v8-low-latency',
]);
const ALLOWED_MODELS = new Set([
  'gemini-3.1-flash-tts-preview',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
]);
const MAX_SERVER_LATENCY_MS = 8_000;

class ProviderUnavailableError extends Error {
  constructor(message, status = 0) { super(message); this.name = 'ProviderUnavailableError'; this.status = status; }
}

async function requestAudio() {
  const startedAt = Date.now();
  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
      body: JSON.stringify({ text: TEST_TEXT }),
      signal: AbortSignal.timeout(16_000),
    });
  } catch (error) {
    if (error?.name === 'TimeoutError' || error?.name === 'AbortError') throw new ProviderUnavailableError('Zeitüberschreitung beim externen Sprachdienst');
    throw error;
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  const header = new TextDecoder('ascii').decode(bytes.slice(0, 12));
  const result = {
    endpoint: ENDPOINT,
    status: response.status,
    contentType: response.headers.get('content-type') || '',
    voice: response.headers.get('x-dokohilf-voice') || '',
    model: response.headers.get('x-dokohilf-tts-model') || '',
    mode: response.headers.get('x-dokohilf-voice-mode') || '',
    style: response.headers.get('x-dokohilf-voice-style') || '',
    cache: response.headers.get('x-dokohilf-tts-cache') || '',
    serverLatency: Number(response.headers.get('x-dokohilf-tts-latency') || 0),
    roundTripLatency: Date.now() - startedAt,
    byteLength: bytes.byteLength,
    header,
  };

  if ([429, 502, 503, 504].includes(response.status)) throw new ProviderUnavailableError(`Externer Sprachdienst HTTP ${response.status}`, response.status);
  if (!response.ok) throw new Error(`Unerwarteter TTS-Fehler HTTP ${response.status}`);
  if (!result.contentType.includes('audio/wav')) throw new Error(`Falscher Inhaltstyp: ${result.contentType}`);
  if (bytes.byteLength <= 44) throw new Error('Audiodatei ist leer.');
  if (!header.startsWith('RIFF') || !header.includes('WAVE')) throw new Error(`Ungültiger WAV-Header: ${header}`);
  if (result.voice !== EXPECTED_VOICE) throw new Error(`Falsche Stimme: ${result.voice || 'leer'}`);
  if (!ALLOWED_STYLES.has(result.style)) throw new Error(`Falscher Stil: ${result.style || 'leer'}`);
  if (!ALLOWED_MODELS.has(result.model)) throw new Error(`Falsches Modell: ${result.model || 'leer'}`);
  if (!['hit', 'miss', 'shared'].includes(result.cache)) throw new Error(`Cache-Nachweis fehlt: ${result.cache || 'leer'}`);
  if (result.cache === 'miss' && (!result.serverLatency || result.serverLatency > MAX_SERVER_LATENCY_MS)) throw new Error(`Sprachausgabe zu langsam: ${result.serverLatency || 0} ms`);
  return { result, bytes };
}

async function runTest() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try { return await requestAudio(); }
    catch (error) { lastError = error; if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1200)); }
  }
  throw lastError;
}

await mkdir('artifacts', { recursive: true });
let report;
try {
  const first = await runTest();
  const second = await runTest();
  report = { passed: true, providerAvailable: true, first: first.result, second: second.result, cacheReuseObserved: ['hit', 'shared'].includes(second.result.cache) };
  await writeFile('artifacts/dokohilf-live-tts.wav', first.bytes);
  console.log(`DokoHilf Live-TTS: erster Abruf ${first.result.serverLatency} ms, zweiter Abruf ${second.result.serverLatency} ms, Cache ${second.result.cache}, Stimme ${first.result.voice}, Stil ${first.result.style}, Modell ${first.result.model}.`);
} catch (error) {
  const providerUnavailable = error instanceof ProviderUnavailableError;
  report = { passed: false, providerAvailable: !providerUnavailable, nonBlockingExternalOutage: providerUnavailable, endpoint: ENDPOINT, error: String(error?.message || error) };
  if (providerUnavailable) console.warn(`DokoHilf Live-TTS: externer Anbieter vorübergehend nicht verfügbar (${report.error}).`);
  else { console.error(`DokoHilf Live-TTS fehlgeschlagen: ${report.error}`); process.exitCode = 1; }
}

await writeFile('artifacts/dokohilf-live-tts.json', JSON.stringify(report, null, 2), 'utf8');
await writeFile('artifacts/dokohilf-live-tts.md', `# DokoHilf Live-TTS\n\n- ${report.passed ? `✅ ${report.first.serverLatency} ms · Cache ${report.second.cache} · ${report.first.voice} · ${report.first.style} · ${report.first.model}` : report.nonBlockingExternalOutage ? `⚠️ externer Sprachdienst vorübergehend nicht erreichbar: ${report.error}` : `❌ ${report.error}`}\n`, 'utf8');
