import { mkdir, writeFile } from 'node:fs/promises';

const MANIFEST_URL = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio?manifest=1&build=20260806-27';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const EXPECTED_COUNT = 93;
const SAMPLE_INDEXES = [0, 1, 17, 46, 70, 92];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isWave(bytes) {
  return bytes.length > 44
    && new TextDecoder('ascii').decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder('ascii').decode(bytes.slice(8, 12)) === 'WAVE';
}

await mkdir('artifacts', { recursive: true });
const response = await fetch(MANIFEST_URL, {
  headers: { Origin: ORIGIN },
  cache: 'no-store',
  signal: AbortSignal.timeout(20_000),
});
assert(response.ok, `Manifest HTTP ${response.status}`);
const manifest = await response.json();
assert(manifest.schemaVersion === 2, `Falsche Manifestversion: ${manifest.schemaVersion}`);
assert(manifest.buildId === '20260806-27', `Falscher Build: ${manifest.buildId}`);
assert(manifest.voice === 'Gacrux', `Falsche Stimme: ${manifest.voice}`);
assert(manifest.complete === true, 'Statischer Guide-Audiobestand ist nicht vollständig.');
assert(manifest.entryCount === EXPECTED_COUNT, `Erwartet ${EXPECTED_COUNT}, gefunden ${manifest.entryCount}`);
assert(Array.isArray(manifest.entries) && manifest.entries.length === EXPECTED_COUNT, 'Manifest-Einträge fehlen.');
assert(new Set(manifest.entries.map(entry => entry.index)).size === EXPECTED_COUNT, 'Doppelte Audioindizes.');
assert(new Set(manifest.entries.map(entry => entry.key)).size === EXPECTED_COUNT, 'Doppelte Textschlüssel.');
assert(new Set(manifest.entries.map(entry => entry.sha256)).size === EXPECTED_COUNT, 'Doppelte oder fehlende Audiohashes.');

for (const entry of manifest.entries) {
  assert(Number.isInteger(entry.index) && entry.index >= 0 && entry.index < EXPECTED_COUNT, `Ungültiger Index: ${entry.index}`);
  assert(typeof entry.file === 'string' && entry.file.includes('/functions/v1/dokohilf-guide-audio?index='), `Ungültiger Dateipfad bei ${entry.index}`);
  assert(entry.bytes > 44, `Leere Audiodatei bei ${entry.index}`);
  assert(/^[a-f0-9]{64}$/.test(entry.sha256), `Ungültiger SHA-256 bei ${entry.index}`);
  assert(entry.voice === 'Gacrux', `Falsche Stimme bei ${entry.index}`);
  assert(entry.parser === 'raw-steps-content-v1', `Falscher Parser bei ${entry.index}: ${entry.parser}`);
}

const samples = [];
for (const index of SAMPLE_INDEXES) {
  const entry = manifest.entries.find(item => item.index === index);
  assert(entry, `Sample ${index} fehlt.`);
  const audioResponse = await fetch(entry.file, {
    headers: { Origin: ORIGIN },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  assert(audioResponse.ok, `Audio ${index} HTTP ${audioResponse.status}`);
  assert(/audio\/wav/i.test(audioResponse.headers.get('content-type') || ''), `Audio ${index} hat falschen Content-Type.`);
  assert(audioResponse.headers.get('x-dokohilf-audio-sha256') === entry.sha256, `Audio ${index} SHA-Header stimmt nicht.`);
  const bytes = new Uint8Array(await audioResponse.arrayBuffer());
  assert(isWave(bytes), `Audio ${index} ist keine gültige RIFF/WAVE-Datei.`);
  assert(bytes.length === entry.bytes, `Audio ${index} Größe stimmt nicht.`);
  samples.push({ index, bytes: bytes.length, sha256: entry.sha256, model: entry.model, api: entry.api });
}

const report = {
  passed: true,
  manifestUrl: MANIFEST_URL,
  buildId: manifest.buildId,
  entryCount: manifest.entryCount,
  voice: manifest.voice,
  samples,
};
await writeFile('artifacts/dokohilf-static-guide-audio.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile('artifacts/dokohilf-static-guide-audio.md', `# DokoHilf statische Guide-Audios\n\n- ✅ ${manifest.entryCount}/${EXPECTED_COUNT} Gacrux-Dateien vollständig\n- ✅ eindeutige Indizes, Textschlüssel und SHA-256\n- ✅ ${samples.length} Stichproben als RIFF/WAVE geprüft\n`, 'utf8');
console.log(`DokoHilf statische Guide-Audios: ${manifest.entryCount}/${EXPECTED_COUNT}, ${samples.length} WAV-Stichproben gültig.`);
