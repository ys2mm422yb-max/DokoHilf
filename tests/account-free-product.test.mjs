import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const [
  index,
  serviceWorker,
  build,
  workflow,
  edge,
  config,
  migration,
  historicalRbac,
  historicalHardening,
  historicalIndexes,
  readme,
  rules,
  handoff,
] = await Promise.all([
  read('index.html'),
  read('service-worker.js'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
  readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-editor/index.ts', import.meta.url), 'utf8'),
  read('supabase/config.toml'),
  readFile(new URL('../supabase/migrations/20260807230003_remove_app_account_infrastructure.sql', import.meta.url), 'utf8'),
  read('supabase/migrations/20260805224500_dokohilf_editor_rbac.sql'),
  read('supabase/migrations/20260805230000_dokohilf_editor_security_hardening.sql'),
  read('supabase/migrations/20260805231500_dokohilf_editor_performance_indexes.sql'),
  readFile(new URL('../README.md', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_RULES.md', import.meta.url), 'utf8'),
  readFile(new URL('../PROJECT_HANDOFF.md', import.meta.url), 'utf8'),
]);

async function textFilesBelow(relativeDirectory) {
  const directory = new URL(`../${relativeDirectory}/`, import.meta.url);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = `${relativeDirectory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await textFilesBelow(relative));
    else if (/\.(?:css|html|js|json|mjs|svg)$/i.test(entry.name)) files.push(await read(relative));
  }
  return files;
}

test('öffentliche App enthält keine Konto- oder Redaktionsoberfläche mehr', async () => {
  for (const path of [
    '../editor.html',
    '../assets/editor.js',
    '../assets/editor.css',
    '../docs/EDITOR_ROLLOUT.md',
  ]) {
    await assert.rejects(access(new URL(path, import.meta.url)));
  }

  assert.doesNotMatch(build, /cp .*editor\.html/);
  assert.doesNotMatch(workflow, /cp .*editor\.html/);
  assert.match(build, /test ! -e "\$SITE_DIR\/editor\.html"/);
  assert.match(workflow, /test ! -e editor\.html/);
});

test('öffentliche App enthält keinen Auth-Client und keinen Publishable Key', async () => {
  const publicBundle = [index, serviceWorker, ...await textFilesBelow('assets')].join('\n');
  assert.doesNotMatch(publicBundle, /auth\/v1|grant_type=password|sb_publishable_/i);
  assert.match(build, /auth\/v1\|grant_type=password\|sb_publishable_/);
});

test('früherer Editor-Endpunkt ist ein dauerhafter JWT-geschützter Ruhestandspfad', () => {
  assert.match(edge, /app_accounts_retired_v28/);
  assert.match(edge, /dauerhaft kontenfrei/);
  assert.match(edge, /status: 410/);
  assert.match(edge, /permanently-account-free-v28/);
  assert.doesNotMatch(edge, /fetch\(|SUPABASE_|auth\/v1|dokohilf_user_roles|sessionStorage/);
  assert.match(config, /\[functions\.dokohilf-editor\]\s+verify_jwt = true/s);
});

test('Migration entfernt nur leere Accountstrukturen und erhält allgemeine Guides', () => {
  assert.match(migration, /if exists \(select 1 from auth\.users\)/);
  assert.match(migration, /if exists \(select 1 from public\.dokohilf_user_roles\)/);
  assert.match(migration, /if exists \(select 1 from public\.dokohilf_editor_audit\)/);
  assert.match(migration, /where reviewed_by is not null or approved_by is not null/);
  assert.match(migration, /where changed_by is not null/);
  assert.match(migration, /drop table if exists public\.dokohilf_user_roles/);
  assert.match(migration, /drop table if exists public\.dokohilf_editor_audit/);
  assert.match(migration, /drop column if exists reviewed_by/);
  assert.match(migration, /drop column if exists approved_by/);
  assert.match(migration, /drop column if exists changed_by/);
  assert.doesNotMatch(migration, /drop table if exists public\.dokohilf_guides/);
  assert.doesNotMatch(migration, /drop table if exists public\.dokohilf_guide_versions/);
  assert.match(migration, /create trigger dokohilf_guides_archive_version/);
  assert.match(migration, /revoke all on table public\.dokohilf_guides\s+from anon, authenticated, service_role/);
  assert.match(migration, /grant select on table public\.dokohilf_guides,[\s\S]*public\.dokohilf_guide_versions to service_role/);
  assert.doesNotMatch(migration, /grant all on table public\.dokohilf_guides/);
});

test('serverseitiger Trigger verhindert jede spätere Kontoerstellung', () => {
  assert.match(migration, /lock table auth\.users in share row exclusive mode/);
  assert.match(migration, /create trigger dokohilf_block_all_user_creation/);
  assert.match(migration, /before insert on auth\.users/);
  assert.match(migration, /DokoHilf is permanently account-free/);

  const archiveFunction = migration.slice(migration.indexOf(
    'create or replace function public.dokohilf_archive_guide_version()',
  ));
  assert.match(archiveFunction, /insert into public\.dokohilf_guide_versions/);
  assert.doesNotMatch(archiveFunction, /changed_by|approved_by/);
});

test('Migration löscht oder leert keine allgemeinen Guides und Versionen', () => {
  assert.doesNotMatch(migration, /delete\s+from\s+public\.dokohilf_(?:guides|guide_versions)/i);
  assert.doesNotMatch(migration, /truncate\s+(?:table\s+)?public\.dokohilf_(?:guides|guide_versions)/i);
  assert.doesNotMatch(migration, /drop\s+table\s+(?:if\s+exists\s+)?public\.dokohilf_(?:guides|guide_versions)/i);
});

test('Guide-Archivierung bleibt technisch erhalten und vollständig personenfrei', () => {
  const archiveFunction = migration.slice(migration.indexOf(
    'create or replace function public.dokohilf_archive_guide_version()',
  ));
  assert.match(archiveFunction, /create trigger dokohilf_guides_archive_version/);
  assert.match(archiveFunction, /change_note/);
  assert.doesNotMatch(archiveFunction, /auth\.uid|changed_by|approved_by/);
});

test('historische Editor-Migrationen sind ausdrücklich als stillgelegt markiert', () => {
  for (const historical of [historicalRbac, historicalHardening, historicalIndexes]) {
    assert.match(historical, /HISTORISCHER MIGRATIONSSTAND/);
    assert.match(historical, /20260807230003_remove_app_account_infrastructure\.sql/);
  }
});

test('CI verankert Ruhestandsfunktion, Migration und Konto-frei-Test', () => {
  assert.match(workflow, /supabase\/functions\/dokohilf-editor\/index\.ts/);
  assert.match(workflow, /supabase\/migrations\/20260807230003_remove_app_account_infrastructure\.sql/);
  assert.match(workflow, /tests\/account-free-product\.test\.mjs/);
  assert.match(workflow, /dokohilf_block_all_user_creation/);
});

test('dauerhafte Produktregeln verbieten auch interne App-Konten', () => {
  const core = `${readme}\n${rules}\n${handoff}`;
  assert.match(readme, /keinerlei Konten oder Anmeldung/);
  assert.match(readme, /keine Redaktions-, Mitarbeiter- oder Administrationskonten/);
  assert.match(rules, /App-Konten jeder Art/);
  assert.match(rules, /Redaktions-\/Administrationsrollen/);
  assert.match(rules, /niemals über einen App-Login/);
  assert.match(handoff, /keinerlei Konten oder Anmeldung/);
  assert.doesNotMatch(core, /später(?:e|en|er)?\s+(?:Einladung|Konten-Rollout)|echte Konten einladen/i);
  assert.match(workflow, /tests\/account-free-product\.test\.mjs/);
  assert.doesNotMatch(workflow, /node --check assets\/editor\.js/);
});
