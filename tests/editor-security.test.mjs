import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, js, css, edge, migration, hardening, rollout] = await Promise.all([
  readFile(new URL('../editor.html', import.meta.url), 'utf8'),
  readFile(new URL('../assets/editor.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/editor.css', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-editor/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260805224500_dokohilf_editor_rbac.sql', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260805230000_dokohilf_editor_security_hardening.sql', import.meta.url), 'utf8'),
  readFile(new URL('../docs/EDITOR_ROLLOUT.md', import.meta.url), 'utf8'),
]);

test('Redaktionsoberfläche bietet Anmeldung, aber keine öffentliche Registrierung', () => {
  assert.match(html, /Redaktion anmelden/);
  assert.match(html, /keine öffentliche Registrierung/i);
  assert.match(js, /grant_type=password/);
  assert.doesNotMatch(html, /Registrieren|Konto erstellen|Sign up/i);
  assert.doesNotMatch(js, /auth\/v1\/signup|signUp\s*\(/i);
});

test('Browser enthält nur Publishable Key und niemals Service Role', () => {
  assert.match(js, /sb_publishable_/);
  assert.doesNotMatch(js, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(html, /service_role|SUPABASE_SERVICE_ROLE_KEY/);
});

test('Sitzung bleibt auf die aktuelle Browser-Sitzung begrenzt', () => {
  assert.match(js, /sessionStorage\.setItem/);
  assert.match(js, /sessionStorage\.removeItem/);
  assert.doesNotMatch(js, /localStorage|indexedDB/);
});

test('Rollen und Statusübergänge werden serverseitig geprüft', () => {
  assert.match(edge, /type EditorRole = 'staff' \| 'editor' \| 'admin'/);
  assert.match(edge, /EDITOR_STATUSES = new Set\(\['draft', 'reviewed'\]\)/);
  assert.match(edge, /role === 'admin'/);
  assert.match(edge, /guide_status_forbidden/);
  assert.match(edge, /getRole\(userId\)/);
  assert.match(edge, /requireEditor/);
});

test('öffentlicher statischer Editor enthält keine internen Klickwege', () => {
  const staticBundle = `${html}\n${js}\n${css}`;
  for (const internalStep of [
    'Den betreffenden Berichtseintrag mit Rechtsklick öffnen',
    'Durchführung stornieren auswählen',
    'Oben Doku erweitert öffnen',
    'Analyse Was war los',
  ]) assert.doesNotMatch(staticBundle, new RegExp(internalStep, 'i'));
  assert.match(html, /Beispielperson A|Fantasie-Vorschau/);
});

test('Echtdaten werden vor serverseitigem Speichern blockiert', () => {
  assert.match(edge, /containsSensitiveData/);
  assert.match(edge, /possible_real_data/);
  assert.match(edge, /Mögliche Echtdaten erkannt/);
  assert.match(html, /Keine Bewohner-, Klienten-, Gesundheits-/);
});

test('Migration enthält Rollen, RLS, Versionsverlauf und Prüfintervalle', () => {
  assert.match(migration, /create table if not exists public\.dokohilf_user_roles/);
  assert.match(migration, /create table if not exists public\.dokohilf_guide_versions/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /dokohilf_guides_select_editor/);
  assert.match(migration, /dokohilf_guides_delete_admin/);
  assert.match(migration, /review_interval_days between 30 and 730/);
  assert.match(migration, /dokohilf_guides_archive_version/);
});

test('Rollenfunktionen liegen nach Advisor-Prüfung außerhalb des exponierten public-Schemas', () => {
  assert.match(hardening, /create schema if not exists dokohilf_private/);
  assert.match(hardening, /dokohilf_private\.role_for/);
  assert.match(hardening, /dokohilf_private\.has_role/);
  assert.match(hardening, /drop function if exists public\.dokohilf_role_for/);
  assert.match(hardening, /dokohilf_editor_audit_deny_anon/);
  assert.match(hardening, /dokohilf_editor_audit_deny_authenticated/);
});

test('Einladungs-Hook ist vorbereitet und echter Rollout bleibt gesondert freigabepflichtig', () => {
  assert.match(migration, /dokohilf_reject_public_signup/);
  assert.match(migration, /authentication_method.*invite/s);
  assert.match(rollout, /Before User Created/);
  assert.match(rollout, /Arbeitgeber beziehungsweise Einrichtungsleitung/);
  assert.match(rollout, /keine realen Nutzerkonten/i);
});

test('mobile Redaktionsoberfläche besitzt ausreichend große Touchflächen', () => {
  assert.match(css, /min-height:42px/);
  assert.match(css, /@media\(max-width:620px\)/);
  assert.match(css, /safe-area-inset-bottom/);
  assert.match(css, /position:sticky/);
});
