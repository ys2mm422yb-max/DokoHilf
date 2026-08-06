import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const CATALOG_PATH = new URL('../assets/guide-audio-catalog.json', import.meta.url);
const MANIFEST_PATH = new URL('../assets/guide-audio-manifest.json', import.meta.url);
const RETRYABLE = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 12;
const REQUEST_GAP_MS = 2400;
let nextRequestAt = 0;

function stripExerciseNotice(value) {
  return String(value || '')
    .replace(/\s*In Übungen ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiewerte verwenden\.?/gi, '')
    .replace(/\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*Im öffentlichen Test nur vollständig erfundene Personen verwenden\.?/gi, '')
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

async function respectRateLimit() {
  const wait = Math.max(0, nextRequestAt - Date.now());
  if (wait) await sleep(wait);
  nextRequestAt = Date.now() + REQUEST_GAP_MS;
}

async function requestAudio(text) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
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
      if (!retryable || attempt === MAX_ATTEMPTS) break;
      const backoff = Math.min(15_000, 1200 * attempt);
      console.warn(`Retry ${attempt}/${MAX_ATTEMPTS} after ${error.message}`);
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

const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
if (!Array.isArray(catalog.entries) || catalog.entries.length !== 93) {
  throw new Error(`Expected 93 catalog entries, got ${catalog.entries?.length ?? 'none'}.`);
}

const keys = new Set();
const manifestEntries = [];
for (const [index, entry] of catalog.entries.entries()) {
  const spokenText = optimizeSpokenText(entry.text);
  const key = normalizeKey(spokenText);
  if (!spokenText || !key) throw new Error(`Empty spoken text at catalog index ${index}.`);
  if (keys.has(key)) throw new Error(`Duplicate optimized guide audio key: ${spokenText}`);
  keys.add(key);

  const fileUrl = new URL(`../${entry.file}`, import.meta.url);
  await mkdir(dirname(fileUrl.pathname), { recursive: true });
  let bytes = await readExisting(fileUrl);
  let metadata = { voice: 'Gacrux', model: 'prebuilt-existing', style: 'approved-guide-static' };

  if (!bytes) {
    console.log(`[${index + 1}/${catalog.entries.length}] Generating ${entry.file}`);
    const generated = await requestAudio(spokenText);
    bytes = generated.bytes;
    metadata = generated;
    await writeFile(fileUrl, bytes);
  } else {
    console.log(`[${index + 1}/${catalog.entries.length}] Reusing ${entry.file}`);
  }

  manifestEntries.push({
    key,
    text: spokenText,
    file: `./${entry.file}`,
    bytes: bytes.length,
    sha256: sha256(bytes),
    voice: metadata.voice,
    model: metadata.model,
    style: metadata.style,
  });
}

const manifest = {
  schemaVersion: 1,
  buildId: '20260806-27',
  voice: 'Gacrux',
  source: 'approved-guide-static-audio',
  generatedAt: new Date().toISOString(),
  entryCount: manifestEntries.length,
  entries: manifestEntries,
};
await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated and validated ${manifestEntries.length} approved static guide audios.`);
