import { mkdir, writeFile } from 'node:fs/promises';

const MANIFEST_URL = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-guide-audio?manifest=1&build=20260806-27';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const EXPECTED_COUNT = 93;
const REQUIRE_COMPLETE = process.env.DOKOHILF_REQUIRE_COMPLETE_AUDIO === '1';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isWave(bytes) {
  return bytes.length > 44
    && new TextDecoder('ascii').decode(bytes.slice(0, 4)) === 'RIFF'
    && new TextDecoder('ascii').decode(bytes.slice(8, 12)) === 'WAVE';
}

function sampleIndexes(entries) {
  if (!entries.length) return [];
  const positions = [0, Math.floor((entries.length - 1) / 2), entries.length - 1];
  return [...new Set(positions.map(position => entries[position]?.index).filter(Number.isInteger))];
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
assert(Array.isArray(manifest.entries), 'Manifest-Einträge fehlen.');
assert(manifest.entryCount === manifest.entries.length, 'Manifestanzahl stimmt nicht mit den Einträgen überein.');
assert(manifest.entryCount >= 1, 'Noch keine geprüfte statische Guide-Audiodatei vorhanden.');
assert(manifest.entryCount <= EXPECTED_COUNT, `Zu viele Manifest-Einträge: ${manifest.entryCount}`);
if (REQUIRE_COMPLETE) {
  assert(manifest.complete === true, 'Statischer Guide-Audiobestand ist nicht vollständig.');
  assert(manifest.entryCount === EXPECTED_COUNT, `Erwartet ${EXPECTED_COUNT}, gefunden ${manifest.entryCount}`);
} else {
  assert(manifest.complete === (manifest.entryCount === EXPECTED_COUNT), 'Complete-Marker stimmt nicht mit der Anzahl überein.');
}

assert(new Set(manifest.entries.map(entry => entry.index)).size === manifest.entryCount, 'Doppelte Audioindizes.');
assert(new Set(manifest.entries.map(entry => entry.key)).size === manifest.entryCount, 'Doppelte Textschlüssel.');
assert(new Set(manifest.entries.map(entry => entry.sha256)).size === manifest.entryCount, 'Doppelte oder fehlende Audiohashes.');

for (const entry of manifest.entries) {
  assert(Number.isInteger(entry.index) && entry.index >= 0 && entry.index < EXPECTED_COUNT, `Ungültiger Index: ${entry.index}`);
  assert(typeof entry.file === 'string' && entry.file.includes('/functions/v1/dokohilf-guide-audio?index='), `Ungültiger Dateipfad bei ${entry.index}`);
  assert(entry.bytes > 44, `Leere Audiodatei bei ${entry.index}`);
  assert(/^[a-f0-9]{64}$/.test(entry.sha256), `Ungültiger SHA-256 bei ${entry.index}`);
  assert(entry.voice === 'Gacrux', `Falsche Stimme bei ${entry.index}`);
  assert(entry.parser === 'raw-steps-content-v1', `Falscher Parser bei ${entry.index}: ${entry.parser}`);
}

const samples = [];
for (const index of sampleIndexes(manifest.entries)) {
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
  requireComplete: REQUIRE_COMPLETE,
  manifestUrl: MANIFEST_URL,
  buildId: manifest.buildId,
  entryCount: manifest.entryCount,
  expectedCount: EXPECTED_COUNT,
  complete: manifest.complete,
  voice: manifest.voice,
  samples,
};
await writeFile('artifacts/dokohilf-static-guide-audio.json', `${JSON.stringify(report, null, 2)}\n`, 'utf8');
await writeFile('artifacts/dokohilf-static-guide-audio.md', `# DokoHilf statische Guide-Audios\n\n- ✅ ${manifest.entryCount}/${EXPECTED_COUNT} geprüfte Gacrux-Dateien\n- ${manifest.complete ? '✅ Bestand vollständig' : 'ℹ️ kontrollierter Teilbestand; fehlende Schritte nutzen Live-TTS und Sofortstimme'}\n- ✅ eindeutige Indizes, Textschlüssel und SHA-256\n- ✅ ${samples.length} Stichproben als RIFF/WAVE geprüft\n`, 'utf8');
console.log(`DokoHilf statische Guide-Audios: ${manifest.entryCount}/${EXPECTED_COUNT}, ${samples.length} WAV-Stichproben gültig, strict=${REQUIRE_COMPLETE}.`);
