import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const TEST_TEXT = 'Öffne Vitalwerte. Für einen einzelnen Wert klickst du oben links auf das grüne Plus.';
const EXPECTED_VOICE = 'Gacrux';
const EXPECTED_STYLE = 'natural-spoken-german-colleague-v6-fast';
const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash-preview-tts',
  'gemini-2.5-pro-preview-tts',
]);
const MAX_COLD_LATENCY_MS = 12_000;
const MAX_WARM_LATENCY_MS = 1_500;

async function requestAudio() {
  const startedAt = Date.now();
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
    body: JSON.stringify({ text: TEST_TEXT }),
    signal: AbortSignal.timeout(22_000),
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
    serverLatency: Number(response.headers.get('x-dokohilf-tts-latency') || 0),
    roundTripLatency: Date.now() - startedAt,
    cache: response.headers.get('x-dokohilf-tts-cache') || '',
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
  return result;
}

async function runTest() {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const cold = await requestAudio();
      const warm = await requestAudio();
      if (!cold.serverLatency || cold.serverLatency > MAX_COLD_LATENCY_MS) {
        throw new Error(`Kalte Sprachausgabe zu langsam: ${cold.serverLatency || 0} ms`);
      }
      if (warm.cache !== 'HIT') throw new Error(`Zweiter Abruf kam nicht aus dem Speicher: ${warm.cache || 'leer'}`);
      if (warm.serverLatency > MAX_WARM_LATENCY_MS) {
        throw new Error(`Warme Sprachausgabe zu langsam: ${warm.serverLatency} ms`);
      }
      return { cold, warm };
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}

await mkdir('artifacts', { recursive: true });
let report;
try {
  const { cold, warm } = await runTest();
  report = { passed: true, cold, warm };
  console.log(`DokoHilf Live-TTS: kalt ${cold.serverLatency} ms, warm ${warm.serverLatency} ms, Stimme ${cold.voice}, Modell ${cold.model}.`);
} catch (error) {
  report = { passed: false, endpoint: ENDPOINT, error: String(error?.message || error) };
  console.error(`DokoHilf Live-TTS fehlgeschlagen: ${report.error}`);
  process.exitCode = 1;
}

await writeFile('artifacts/dokohilf-live-tts.json', JSON.stringify(report, null, 2), 'utf8');
await writeFile(
  'artifacts/dokohilf-live-tts.md',
  `# DokoHilf Live-TTS\n\n- ${report.passed ? '✅' : '❌'} ${report.passed ? `kalt ${report.cold.serverLatency} ms · warm ${report.warm.serverLatency} ms · ${report.cold.voice} · ${report.cold.model}` : report.error}\n`,
  'utf8',
);
