import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [ui, loader, worker, fn, migration, config] = await Promise.all([
  read('assets/feedback-report-v47.js'),
  read('assets/ui-polish-v35.js'),
  read('service-worker.js'),
  read('supabase/functions/dokohilf-feedback/index.ts'),
  read('supabase/migrations/20260812205500_dokohilf_private_feedback_reports.sql'),
  read('supabase/config.toml'),
]);

test('Fehler-melden UI uses the agreed test-phase copy and privacy warning', () => {
  assert.match(ui, /DokoHilf befindet sich noch in der Testphase\. Fehler oder fehlende Information gefunden\?/);
  assert.match(ui, /Fehler oder Hinweis melden/);
  assert.match(ui, /Aktuelle Stelle mitsenden/);
  assert.match(ui, /nur Build, aktueller Guide und Schritt mitgesendet\. Keine Chatnachrichten/);
  assert.match(ui, /Bitte keine Namen, Bewohner-\/Klienten- oder Gesundheitsdaten eingeben/);
  assert.match(ui, /Technische Meldungsnummer/);
});

test('client payload contains only feedback plus optional build-guide-step context', () => {
  assert.match(ui, /DokoHilfGuideProgress\?\.getCurrentGuide/);
  assert.match(ui, /buildId: buildId\(\)/);
  assert.match(ui, /guideSlug: guide\?\.guideSlug \|\| null/);
  assert.match(ui, /guideStep:/);
  assert.match(ui, /credentials: 'omit'/);
  assert.match(ui, /referrerPolicy: 'no-referrer'/);
  assert.doesNotMatch(ui, /#messages|chatInput|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.userAgent/);
});

test('server never reads or stores user, device, cookie, session or chat identifiers', () => {
  assert.match(fn, /Identifier-free global abuse guard/);
  assert.doesNotMatch(fn, /x-forwarded-for|cf-connecting-ip|user-agent|document\.cookie|session_id|device_id|user_id|messageHistory|auth\.uid/iu);
  assert.match(migration, /No IP, device, cookie, session, user identifier or chat transcript columns/);
  assert.doesNotMatch(migration, /^\s*(ip_address|user_agent|cookie|session_id|user_id|device_id|chat_transcript|messages?)\s+/imu);
});

test('reports live in a private non-readable schema with RLS defense in depth', () => {
  assert.match(migration, /create schema if not exists private/);
  assert.match(migration, /private\.dokohilf_feedback_reports/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on schema private from anon, authenticated/);
  assert.match(migration, /revoke all on table private\.dokohilf_feedback_reports from public, anon, authenticated/);
  assert.doesNotMatch(migration, /create policy/);
});

test('public endpoint validates origin, size, categories, context and returns a technical number', () => {
  assert.match(fn, /ALLOWED_ORIGINS/);
  assert.match(fn, /contentLength > 4096/);
  assert.match(fn, /ALLOWED_CATEGORIES/);
  assert.match(fn, /description\.length < 5/);
  assert.match(fn, /reportNumberFromId/);
  assert.match(fn, /DH-\$\{id\.replaceAll/);
  assert.match(fn, /recent\[0\]\?\.count/);
  assert.match(config, /\[functions\.dokohilf-feedback\]\s*\nverify_jwt = false/);
});

test('PWA refreshes and loads the feedback module', () => {
  assert.match(loader, /FEEDBACK_REVISION = '20260812-feedback-v47-1'/);
  assert.match(loader, /feedback-report-v47\.js\?v=\$\{FEEDBACK_REVISION\}/);
  assert.match(worker, /FEEDBACK_REVISION = '20260812-feedback-v47-1'/);
  assert.match(worker, /feedback-report-v47\.js\?v=20260812-feedback-v47-1/);
  assert.match(worker, /feedbackRevision: FEEDBACK_REVISION/);
});
