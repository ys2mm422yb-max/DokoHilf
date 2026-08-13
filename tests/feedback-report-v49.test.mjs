import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [ui, loader, worker, fn, migration, config, version, release] = await Promise.all([
  read('assets/feedback-report-v49.js'),
  read('assets/ui-polish-v35.js'),
  read('service-worker.js'),
  read('supabase/functions/dokohilf-feedback/index.ts'),
  read('supabase/migrations/20260813083000_private_feedback_v49.sql'),
  read('supabase/config.toml'),
  read('version.json'),
  read('assets/release-polish-v29.js'),
]);

test('feedback UI uses the confirmed test-phase copy and warning', () => {
  assert.match(ui, /DokoHilf befindet sich noch in der Testphase\. Fehler oder fehlende Information gefunden\?/);
  assert.match(ui, /Fehler oder Hinweis melden/);
  assert.match(ui, /Aktuelle Stelle mitsenden/);
  assert.match(ui, /nur Build, aktueller Guide und Schritt mitgesendet\. Keine Chatnachrichten/);
  assert.match(ui, /Bitte keine Namen, Bewohner-\/Klienten- oder Gesundheitsdaten eingeben/);
  assert.match(ui, /Technische Meldungsnummer/);
});

test('client payload contains only feedback and explicit optional location context', () => {
  assert.match(ui, /DokoHilfGuideProgress\?\.getCurrentGuide/);
  assert.match(ui, /buildId: buildId\(\)/);
  assert.match(ui, /guideSlug: guide\?\.guideSlug \|\| null/);
  assert.match(ui, /guideStep:/);
  assert.match(ui, /credentials: 'omit'/);
  assert.match(ui, /referrerPolicy: 'no-referrer'/);
  assert.doesNotMatch(ui, /#messages|chatInput|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.userAgent/);
});

test('edge function does not inspect user, device, cookie, session or chat identifiers', () => {
  assert.match(fn, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(fn, /admin\.rpc\("dokohilf_store_feedback"/);
  assert.doesNotMatch(fn, /x-forwarded-for|cf-connecting-ip|user-agent|cookie|session_id|device_id|user_id|messageHistory|auth\.uid/iu);
  assert.match(fn, /new TextEncoder\(\)\.encode\(raw\)\.byteLength > 4096/);
  assert.match(fn, /ALLOWED_ORIGINS/);
});

test('storage is private and public roles have no read or insert route', () => {
  assert.match(migration, /create schema if not exists private/);
  assert.match(migration, /private\.dokohilf_feedback_reports/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /revoke all on schema private from public/);
  assert.match(migration, /revoke all on schema private from anon, authenticated/);
  assert.match(migration, /revoke all on table private\.dokohilf_feedback_reports from public, anon, authenticated/);
  assert.doesNotMatch(migration, /create policy/);
});

test('feedback insert RPC is service-role-only and identifier-free', () => {
  assert.match(migration, /create or replace function public\.dokohilf_store_feedback/);
  assert.match(migration, /security definer/);
  assert.match(migration, /revoke all on function public\.dokohilf_store_feedback[\s\S]*from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.dokohilf_store_feedback[\s\S]*to service_role/);
  assert.match(migration, /recent_count >= 30/);
  assert.doesNotMatch(migration, /^\s*(ip_address|user_agent|cookie|session_id|user_id|device_id|chat_transcript|messages?|audio|screenshot)\s+/imu);
});

test('PWA loads and refreshes the feedback module', () => {
  assert.match(loader, /FEEDBACK_REVISION = '20260813-feedback-v49-1'/);
  assert.match(loader, /feedback-report-v49\.js\?v=\$\{FEEDBACK_REVISION\}/);
  assert.match(worker, /FEEDBACK_REVISION = '20260813-feedback-v49-1'/);
  assert.match(worker, /feedback-report-v49\.js\?v=20260813-feedback-v49-1/);
  assert.match(worker, /feedbackRevision: FEEDBACK_REVISION/);
  assert.match(config, /\[functions\.dokohilf-feedback\]\s*\nverify_jwt = false/);
});

test('major feedback release advances the public version to v31', () => {
  const parsed = JSON.parse(version);
  assert.equal(parsed.appVersion, 'v31');
  assert.match(release, /const VERSION_LABEL = 'v31'/);
  assert.equal(parsed.release, 'private-feedback-v49');
});
