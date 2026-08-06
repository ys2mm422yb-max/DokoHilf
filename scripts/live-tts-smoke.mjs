import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const TEST_TEXT = 'Öffne Vitalwerte und klicke oben links auf das grüne Plus.';
const EXPECTED_VOICE = 'Gacrux';
const EXPECTED_STYLE = 'natural-spoken-german-colleague-v7-fast-start';
const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
]);
const MAX_SERVER_LATENCY_MS = 8_000;

async function requestAudio() {
  const startedAt = Date.now();
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ text: TEST_TEXT }),
    signal: AbortSignal.timeout(16_000),
  });
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
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!result.contentType.includes('audio/wav')) throw new Error(`Falscher Inhaltstyp: ${result.contentType}`);
  if (bytes.byteLength <= 44) throw new Error('Audiodatei ist leer.');
  if (!header.startsWith('RIFF') || !header.includes('WAVE')) throw new Error(`Ungültiger WAV-Header: ${header}`);
  if (result.voice !== EXPECTED_VOICE) throw new Error(`Falsche Stimme: ${result.voice || 'leer'}`);
  if (result.style !== EXPECTED_STYLE) throw new Error(`Falscher Stil: ${result.style || 'leer'}`);
  if (!ALLOWED_MODELS.has(result.model)) throw new Error(`Falsches Modell: ${result.model || 'leer'}`);
  if (!['hit', 'miss'].includes(result.cache)) throw new Error(`Cache-Nachweis fehlt: ${result.cache || 'leer'}`);
  if (result.cache !== 'hit' && (!result.serverLatency || result.serverLatency > MAX_SERVER_LATENCY_MS)) {
    throw new Error(`Sprachausgabe zu langsam: ${result.serverLatency || 0} ms`);
  }
  return { result, bytes };
}

async function runTest() {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await requestAudio();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

await mkdir('artifacts', { recursive: true });
let report;
try {
  const first = await runTest();
  const second = await runTest();
  report = {
    passed: true,
    first: first.result,
    second: second.result,
    cacheReuseObserved: second.result.cache === 'hit',
  };
  await writeFile('artifacts/dokohilf-live-tts.wav', first.bytes);
  console.log(`DokoHilf Live-TTS: erster Abruf ${first.result.serverLatency} ms, zweiter Abruf ${second.result.serverLatency} ms, Cache ${second.result.cache}, Stimme ${first.result.voice}, Modell ${first.result.model}.`);
} catch (error) {
  report = { passed: false, endpoint: ENDPOINT, error: String(error?.message || error) };
  console.error(`DokoHilf Live-TTS fehlgeschlagen: ${report.error}`);
  process.exitCode = 1;
}

await writeFile('artifacts/dokohilf-live-tts.json', JSON.stringify(report, null, 2), 'utf8');
await writeFile(
  'artifacts/dokohilf-live-tts.md',
  `# DokoHilf Live-TTS\n\n- ${report.passed ? `✅ erster Abruf ${report.first.serverLatency} ms · zweiter Abruf ${report.second.serverLatency} ms · Cache ${report.second.cache} · ${report.first.voice} · ${report.first.model}` : `❌ ${report.error}`}\n`,
  'utf8',
);
