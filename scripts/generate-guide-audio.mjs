import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const CATALOG_PATH = new URL('../assets/guide-audio-catalog.json', import.meta.url);
const FINAL_MANIFEST_PATH = new URL('../assets/guide-audio-manifest.json', import.meta.url);
const PARTIAL_MANIFEST_PATH = new URL('../assets/guide-audio-manifest.partial.json', import.meta.url);
const STATUS_PATH = new URL('../assets/guide-audio-generation-status.json', import.meta.url);
const RETRYABLE = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS_PER_TEXT = 4;
const MAX_TEXTS_PER_RUN = 12;
const MAX_AUTOMATIC_ROUNDS = 24;
const REQUEST_GAP_MS = 1800;
let nextRequestAt = 0;

function stripExerciseNotice(value) {
  return String(value || '')
    .replace(/\s*In Übungen ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiewerte verwenden\.?/gi, '')
    .replace(/\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*Verwende in Übungen ausschließlich Fantasiedaten\.?/gi, '')
    .replace(/\s*Verwende dabei nur Fantasiedaten\.?/gi, '')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function optimizeSpokenText(value) {
  const raw = stripExerciseNotice(String(value || '').replace(/\*\*/g, '').trim());
  const first = (raw.split(/\n\s*\n/)[0] || raw).replace(/\s+/g, ' ').trim();
  if (!first || first.length <= 185) return first;
  const sentences = first.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(part => part.trim()).filter(Boolean) || [first];
  const short = sentences.slice(0, 2).join(' ').trim();
  if (short.length <= 220) return short;
  const clipped = short.slice(0, 215).replace(/\s+\S*$/, '').trim();
  return clipped ? `${clipped}.` : short.slice(0, 215);
}

function normalizeKey(value) {
  return String(value || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[„“”"']/g, '')
    .replace(/[^a-z0-9äöü\s./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isWave(bytes) {
  return bytes.length > 44
    && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WAVE';
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function readJson(pathUrl, fallback) {
  try {
    return JSON.parse(await readFile(pathUrl, 'utf8'));
  } catch {
    return fallback;
  }
}

async function respectRateLimit() {
  const wait = Math.max(0, nextRequestAt - Date.now());
  if (wait) await sleep(wait);
  nextRequestAt = Date.now() + REQUEST_GAP_MS;
}

async function requestAudio(text) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_TEXT; attempt += 1) {
    await respectRateLimit();
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        const error = new Error(`TTS HTTP ${response.status}: ${message.slice(0, 180)}`);
        error.status = response.status;
        throw error;
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!isWave(bytes)) throw new Error('TTS response is not a valid RIFF/WAVE file.');
      const voice = response.headers.get('x-dokohilf-voice') || '';
      const model = response.headers.get('x-dokohilf-tts-model') || '';
      const style = response.headers.get('x-dokohilf-voice-style') || '';
      if (voice !== 'Gacrux') throw new Error(`Unexpected voice: ${voice || 'missing'}`);
      if (!/gemini-(?:3\.1|2\.5)-flash.*tts/i.test(model)) throw new Error(`Unexpected TTS model: ${model || 'missing'}`);
      return { bytes, voice, model, style };
    } catch (error) {
      lastError = error;
      const status = Number(error?.status || 0);
      const retryable = RETRYABLE.has(status)
        || error?.name === 'TimeoutError'
        || /fetch failed|timeout|network/i.test(String(error?.message || ''));
      if (!retryable || attempt === MAX_ATTEMPTS_PER_TEXT) break;
      const backoff = Math.min(6500, 1200 * attempt);
      console.warn(`Retry ${attempt}/${MAX_ATTEMPTS_PER_TEXT} after ${error.message}`);
      await sleep(backoff);
    }
  }
  throw lastError || new Error('Unknown TTS generation failure.');
}

async function readExisting(pathUrl) {
  try {
    await access(pathUrl);
    const bytes = Buffer.from(await readFile(pathUrl));
    return isWave(bytes) ? bytes : null;
  } catch {
    return null;
  }
}

function buildManifestEntry(record, bytes, metadata = {}) {
  return {
    key: record.key,
    text: record.spokenText,
    file: `./${record.entry.file}`,
    bytes: bytes.length,
    sha256: sha256(bytes),
    voice: metadata.voice || 'Gacrux',
    model: metadata.model || 'prebuilt-existing',
    style: metadata.style || 'approved-guide-static',
  };
}

async function writeCheckpoint({ records, metadataByKey, round, cursor, attempted, generated, failures }) {
  const entries = [];
  for (const record of records) {
    const bytes = await readExisting(record.fileUrl);
    if (!bytes) continue;
    entries.push(buildManifestEntry(record, bytes, metadataByKey.get(record.key)));
  }

  const complete = entries.length === records.length;
  const manifest = {
    schemaVersion: 1,
    buildId: '20260806-27',
    voice: 'Gacrux',
    source: 'approved-guide-static-audio',
    generatedAt: new Date().toISOString(),
    entryCount: entries.length,
    entries,
  };

  if (complete) {
    await writeFile(FINAL_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    await unlink(PARTIAL_MANIFEST_PATH).catch(() => {});
  } else {
    await writeFile(PARTIAL_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    await unlink(FINAL_MANIFEST_PATH).catch(() => {});
  }

  const status = {
    schemaVersion: 1,
    buildId: '20260806-27',
    round,
    maxAutomaticRounds: MAX_AUTOMATIC_ROUNDS,
    cursor,
    total: records.length,
    completed: entries.length,
    remaining: records.length - entries.length,
    complete,
    attempted,
    generated,
    failures,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(STATUS_PATH, `${JSON.stringify(status, null, 2)}\n`, 'utf8');
  return status;
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
if (!Array.isArray(catalog.entries) || catalog.entries.length !== 93) {
  throw new Error(`Expected 93 catalog entries, got ${catalog.entries?.length ?? 'none'}.`);
}

const keys = new Set();
const records = catalog.entries.map((entry, index) => {
  const spokenText = optimizeSpokenText(entry.text);
  const key = normalizeKey(spokenText);
  if (!spokenText || !key) throw new Error(`Empty spoken text at catalog index ${index}.`);
  if (keys.has(key)) throw new Error(`Duplicate optimized guide audio key: ${spokenText}`);
  keys.add(key);
  return {
    index,
    entry,
    spokenText,
    key,
    fileUrl: new URL(`../${entry.file}`, import.meta.url),
  };
});

const previousStatus = await readJson(STATUS_PATH, { round: 0, cursor: 0 });
const previousPartial = await readJson(PARTIAL_MANIFEST_PATH, { entries: [] });
const previousFinal = await readJson(FINAL_MANIFEST_PATH, { entries: [] });
const metadataByKey = new Map(
  [...(previousPartial.entries || []), ...(previousFinal.entries || [])]
    .filter(entry => entry?.key)
    .map(entry => [entry.key, entry]),
);

for (const record of records) await mkdir(dirname(record.fileUrl.pathname), { recursive: true });

const missingIndexes = [];
for (const record of records) {
  if (!(await readExisting(record.fileUrl))) missingIndexes.push(record.index);
}

if (!missingIndexes.length) {
  const status = await writeCheckpoint({
    records,
    metadataByKey,
    round: Number(previousStatus.round || 0),
    cursor: 0,
    attempted: [],
    generated: [],
    failures: [],
  });
  console.log(`All ${status.completed} approved static guide audios are complete.`);
  process.exit(0);
}

const previousRound = Number(previousStatus.round || 0);
if (previousRound >= MAX_AUTOMATIC_ROUNDS) {
  console.error(`Automatic generation stopped after ${previousRound} rounds with ${missingIndexes.length} files remaining.`);
  process.exit(3);
}

const startCursor = Number(previousStatus.cursor || 0) % records.length;
const missingSet = new Set(missingIndexes);
const selected = [];
for (let offset = 0; offset < records.length && selected.length < MAX_TEXTS_PER_RUN; offset += 1) {
  const index = (startCursor + offset) % records.length;
  if (missingSet.has(index)) selected.push(records[index]);
}

const round = previousRound + 1;
const attempted = [];
const generated = [];
const failures = [];
let cursor = startCursor;

for (const record of selected) {
  attempted.push(record.entry.file);
  cursor = (record.index + 1) % records.length;
  console.log(`[round ${round}] Generating ${record.entry.file}`);
  try {
    const result = await requestAudio(record.spokenText);
    await writeFile(record.fileUrl, result.bytes);
    metadataByKey.set(record.key, result);
    generated.push(record.entry.file);
    console.log(`Saved ${record.entry.file} (${result.bytes.length} bytes, ${result.model}).`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    failures.push({ file: record.entry.file, error: message });
    console.warn(`Deferred ${record.entry.file}: ${message}`);
  }
}

const status = await writeCheckpoint({ records, metadataByKey, round, cursor, attempted, generated, failures });
console.log(`Guide audio checkpoint: ${status.completed}/${status.total} complete; ${generated.length} generated in round ${round}.`);
if (!status.complete) process.exitCode = 2;
