import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

const [ui, loader, worker, fn, migration, config, version, release, policy] = await Promise.all([
  read('assets/feedback-report-v49.js'),
  read('assets/ui-polish-v35.js'),
  read('service-worker.js'),
  read('supabase/functions/dokohilf-feedback/index.ts'),
  read('supabase/migrations/20260813083000_private_feedback_v49.sql'),
  read('supabase/config.toml'),
  read('version.json'),
  read('assets/release-polish-v29.js'),
  read('FEEDBACK_POLICY.md'),
]);

test('feedback entry is home-only and uses the compact v31 design', () => {
  assert.match(ui, /document\.getElementById\('startScreen'\)/);
  assert.match(ui, /start\.insertBefore\(entry, safety\)/);
  assert.match(ui, /\.app-shell:not\(\[data-mode="start"\]\) \.feedback-v49-entry\{display:none!important\}/);
  assert.match(ui, /Testphase/);
  assert.match(ui, /Fehler oder Hinweis melden/);
  assert.match(ui, /Etwas falsch, unklar oder noch nicht vollständig\?/);
  assert.doesNotMatch(ui, /main\.insertBefore\(entry, legal\)/);
});

test('feedback modal has no location toggle and explains automatic build-only context', () => {
  assert.doesNotMatch(ui, /Aktuelle Stelle mitsenden/);
  assert.doesNotMatch(ui, /name="includeContext"/);
  assert.match(ui, /automatisch nur die aktuelle DokoHilf-Build-ID mitgesendet/);
  assert.match(ui, /Kein Guide, kein Schritt und keine Chatnachrichten/);
  assert.match(ui, /Bitte keine Namen, Bewohner-\/Klienten- oder Gesundheitsdaten eingeben/);
  assert.match(ui, /Technische Meldungsnummer/);
});

test('client payload contains feedback plus automatic build id but no guide or step lookup', () => {
  assert.match(ui, /includeContext: true/);
  assert.match(ui, /buildId: buildId\(\)/);
  assert.match(ui, /guideSlug: null/);
  assert.match(ui, /guideStep: null/);
  assert.doesNotMatch(ui, /DokoHilfGuideProgress/);
  assert.doesNotMatch(ui, /getCurrentGuide/);
  assert.match(ui, /credentials: 'omit'/);
  assert.match(ui, /referrerPolicy: 'no-referrer'/);
  assert.doesNotMatch(ui, /#messages|chatInput|localStorage|sessionStorage|indexedDB|document\.cookie|navigator\.userAgent/);
});

test('binding feedback policy records the home-only and no-toggle decision', () => {
  assert.match(policy, /ausschließlich im Hauptmenü/);
  assert.match(policy, /darf nicht in „Alle Anleitungen“, einzelnen Anleitungen, Chat- oder Sprachmodus/);
  assert.match(policy, /frühere Schalter `Aktuelle Stelle mitsenden` ist entfernt/);
  assert.match(policy, /Guide-Slug oder Guide-Schritt aus dem aktuellen App-Zustand/);
  assert.match(policy, /sichtbare Produktversion bleibt deshalb \*\*v31\*\*/);
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

test('PWA loads and refreshes the home-only feedback revision', () => {
  assert.match(loader, /FEEDBACK_REVISION = '20260813-feedback-home-only-v50-1'/);
  assert.match(loader, /feedback-report-v49\.js\?v=\$\{FEEDBACK_REVISION\}/);
  assert.match(worker, /FEEDBACK_REVISION = '20260813-feedback-home-only-v50-1'/);
  assert.match(worker, /feedback-report-v49\.js\?v=20260813-feedback-home-only-v50-1/);
  assert.match(worker, /feedbackRevision: FEEDBACK_REVISION/);
  assert.match(config, /\[functions\.dokohilf-feedback\]\s*\nverify_jwt = false/);
});

test('v31 feedback UX remains intact after later public version bumps', () => {
  const parsed = JSON.parse(version);
  const publicVersion = Number(String(parsed.appVersion || '').replace(/^v/, ''));
  assert.ok(Number.isInteger(publicVersion) && publicVersion >= 31, `unexpected public version: ${parsed.appVersion}`);
  const label = release.match(/const VERSION_LABEL = '(v\d+)'/)?.[1];
  assert.equal(label, parsed.appVersion);
  assert.match(loader, /FEEDBACK_REVISION = '20260813-feedback-home-only-v50-1'/);
});
