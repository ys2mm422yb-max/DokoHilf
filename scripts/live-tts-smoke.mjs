import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const TEST_TEXT = 'Die Sprachausgabe ist bereit.';

async function requestAudio() {
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({ text: TEST_TEXT }),
        signal: AbortSignal.timeout(35_000),
      });
      const bytes = new Uint8Array(await response.arrayBuffer());
      const header = new TextDecoder('ascii').decode(bytes.slice(0, 12));
      const result = {
        endpoint: ENDPOINT,
        status: response.status,
        contentType: response.headers.get('content-type') || '',
        voice: response.headers.get('x-dokohilf-voice') || '',
        model: response.headers.get('x-dokohilf-tts-model') || '',
        byteLength: bytes.byteLength,
        header,
      };
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!result.contentType.includes('audio/wav')) throw new Error(`Falscher Inhaltstyp: ${result.contentType}`);
      if (bytes.byteLength <= 44) throw new Error('Audiodatei ist leer.');
      if (!header.startsWith('RIFF') || !header.includes('WAVE')) throw new Error(`Ungültiger WAV-Header: ${header}`);
      return result;
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 1200));
    }
  }
  throw lastError;
}

await mkdir('artifacts', { recursive: true });
let report;
try {
  const result = await requestAudio();
  report = { passed: true, ...result };
  console.log(`DokoHilf Live-TTS: ${result.byteLength} Bytes, Stimme ${result.voice || 'unbekannt'}, Modell ${result.model || 'unbekannt'}.`);
} catch (error) {
  report = { passed: false, endpoint: ENDPOINT, error: String(error?.message || error) };
  console.error(`DokoHilf Live-TTS fehlgeschlagen: ${report.error}`);
  process.exitCode = 1;
}

await writeFile('artifacts/dokohilf-live-tts.json', JSON.stringify(report, null, 2), 'utf8');
await writeFile(
  'artifacts/dokohilf-live-tts.md',
  `# DokoHilf Live-TTS\n\n- ${report.passed ? '✅' : '❌'} ${report.passed ? `${report.byteLength} Bytes · ${report.voice || 'Stimme unbekannt'} · ${report.model || 'Modell unbekannt'}` : report.error}\n`,
  'utf8',
);
