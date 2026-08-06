import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('assets/guide-audio-catalog.json', root), 'utf8'));
const manifest = JSON.parse(await readFile(new URL('assets/guide-audio-manifest.json', root), 'utf8'));
const experience = await readFile(new URL('assets/experience-v27.js', root), 'utf8');
const worker = await readFile(new URL('service-worker.js', root), 'utf8');
const policy = await readFile(new URL('PREBUILT_AUDIO.md', root), 'utf8');

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

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function isWave(bytes) {
  return bytes.length > 44
    && bytes.subarray(0, 4).toString('ascii') === 'RIFF'
    && bytes.subarray(8, 12).toString('ascii') === 'WAVE';
}

test('catalog covers greeting and all 92 unique approved guide steps', () => {
  assert.equal(catalog.schemaVersion, 1);
  assert.equal(catalog.voice, 'Gacrux');
  assert.equal(catalog.entries.length, 93);
  assert.equal(new Set(catalog.entries.map(entry => entry.file)).size, 93);
});

test('manifest exposes one unique static Gacrux audio per optimized instruction', () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.buildId, '20260806-27');
  assert.equal(manifest.voice, 'Gacrux');
  assert.equal(manifest.source, 'approved-guide-static-audio');
  assert.equal(manifest.entryCount, 93);
  assert.equal(manifest.entries.length, 93);
  assert.equal(new Set(manifest.entries.map(entry => entry.key)).size, 93);
  for (const entry of manifest.entries) {
    assert.equal(entry.key, normalizeKey(entry.text));
    assert.match(entry.file, /^\.\/assets\/audio\/guides\/\d{3}\.wav$/);
    assert.ok(entry.bytes > 44);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.equal(entry.voice, 'Gacrux');
  }
});

test('all static audio files are valid WAV files matching manifest sizes and hashes', async () => {
  for (const entry of manifest.entries) {
    const bytes = Buffer.from(await readFile(new URL(entry.file.replace(/^\.\//, ''), root)));
    assert.equal(isWave(bytes), true, `${entry.file} is not RIFF/WAVE`);
    assert.equal(bytes.length, entry.bytes, `${entry.file} size mismatch`);
    assert.equal(sha256(bytes), entry.sha256, `${entry.file} hash mismatch`);
  }
});

test('browser prefers prebuilt guide audio and only falls through to timed live TTS', () => {
  assert.match(experience, /guide-audio-manifest\.json\?v=20260806-27/);
  assert.match(experience, /loadPrebuiltManifest/);
  assert.match(experience, /loadPrebuiltVoice/);
  assert.match(experience, /prebuilt-approved-guide/);
  assert.match(experience, /static-approved-guide/);
  assert.match(experience, /__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__/);
  assert.match(experience, /fastRace\(loadNaturalVoice/);
});

test('service worker installs the manifest and caches approved WAV files for offline reuse', () => {
  assert.match(worker, /guide-audio-manifest\.json\?v=20260806-27/);
  assert.match(worker, /cacheApprovedGuideAudio/);
  assert.match(worker, /assets\/audio\/guides/);
  assert.match(worker, /cacheFirstAudio/);
  assert.match(worker, /CACHE_APPROVED_GUIDE_AUDIO/);
});

test('static audio exception is narrowly documented and excludes user content', () => {
  assert.match(policy, /23 freigegebene Guides/);
  assert.match(policy, /92 eindeutige Schritttexte/);
  assert.match(policy, /Nutzerstimmen, Diktate, freie Antworten, Gesprächsverläufe/);
  assert.match(policy, /nicht dauerhaft gespeichert/);
});
