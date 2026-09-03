import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const [smartHelpSource, appSource, conversationRouter, completionContract, catalogRaw, migration, workDoc] = await Promise.all([
  readFile(new URL('../assets/smart-help-v29.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-conversation-router/index.ts', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/functions/dokohilf-conversation-router/guide-completion-contract.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../assets/guide-audio-catalog.json', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260903070000_attendance_status_examples_v66.sql', import.meta.url), 'utf8'),
  readFile(new URL('../ACTIVE_WORK_VOICE_CHAT_PARITY_GUIDE_AUDIT_V66.md', import.meta.url), 'utf8'),
]);

function loadSmartHelp() {
  const window = {
    fetch: async () => ({ ok: true }),
  };
  const document = {
    querySelector: () => null,
    head: { append: () => {} },
    createElement: () => ({ dataset: {} }),
  };
  vm.runInNewContext(smartHelpSource, { window, document, Request: class Request {} });
  return window.DokoHilfSmartHelpV29;
}

const smartHelp = loadSmartHelp();
const catalog = JSON.parse(catalogRaw);
const catalogTexts = catalog.entries.map(entry => String(entry.text || ''));

test('Sprachmodus erfasst mehrere Alternativen und überträgt nur gefilterte Kandidaten', () => {
  assert.match(appSource, /recognition\.maxAlternatives\s*=\s*5/);
  assert.match(appSource, /safeSpeechAlternatives/);
  assert.match(appSource, /speechAlternatives:\s*safeAlternatives/);
  assert.match(conversationRouter, /sanitizeSpeechAlternatives/);
  assert.match(conversationRouter, /containsSensitiveData\(text\)/);
  assert.match(conversationRouter, /MAX_SPEECH_ALTERNATIVES\s*=\s*4/);
});

test('eine sichere ASR-Alternative kann einen bestätigten Guide retten', () => {
  const body = smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'durch führung nach heiß' }],
    speechAlternatives: ['Durchführungsnachweis'],
  }, 'durch führung nach heiß');
  assert.ok(body);
  const parsed = JSON.parse(body);
  assert.equal(parsed.selectedGuideSlug, 'durchfuehrungsnachweis-finden');
  assert.equal(parsed.smartSpeechAlternativeIntent, true);
});

test('klare Primärabsicht wird nicht durch eine Sprachalternative umgedeutet', () => {
  const abhaken = smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'Medikamente abhaken' }],
    speechAlternatives: ['Medikamente abzeichnen'],
  }, 'Medikamente abhaken');
  assert.equal(abhaken, null);

  const reportSearch = smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'Berichtssuche' }],
    speechAlternatives: ['Berichte'],
  }, 'Berichtssuche');
  assert.equal(reportSearch, null);

  const easyPlan = smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'Easy Plan' }],
    speechAlternatives: ['Planung'],
  }, 'Easy Plan');
  assert.equal(easyPlan, null);
});

test('Schreib- und Sprachmodus benutzen dieselbe bestätigte Smart-Help-Zielauswahl', () => {
  const typed = JSON.parse(smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'Medikation' }],
  }, 'Medikation'));
  const spoken = JSON.parse(smartHelp.preparedBody({
    messages: [{ role: 'user', content: 'Medi kation' }],
    speechAlternatives: ['Medikation'],
  }, 'Medi kation'));
  assert.equal(typed.selectedGuideSlug, 'medikation-finden');
  assert.equal(spoken.selectedGuideSlug, typed.selectedGuideSlug);
});

test('Hilfealternative darf nur den laufenden Guide halten, nicht einen neuen Weg erfinden', () => {
  const body = smartHelp.preparedBody({
    guideSlug: 'vitalwerte-einzelwert',
    messages: [{ role: 'user', content: 'äh' }],
    speechAlternatives: ['Wo finde ich das?'],
  }, 'äh');
  assert.ok(body);
  const parsed = JSON.parse(body);
  assert.equal(parsed.guideSlug, 'vitalwerte-einzelwert');
  assert.equal(parsed.smartHelpIntent, true);
  assert.equal(parsed.selectedGuideSlug, undefined);
});

test('unvollständige allgemeine Spracheingabe bekommt dieselbe konkrete Text- und Sprachantwort', () => {
  assert.match(conversationRouter, /const VAGUE_HELP_REPLY = 'Wobei brauchst du Hilfe\?/);
  assert.match(conversationRouter, /reply:\s*VAGUE_HELP_REPLY/);
  assert.match(conversationRouter, /spokenText:\s*VAGUE_HELP_REPLY/);
  assert.match(conversationRouter, /source:\s*'vague-help-clarification-v66'/);
});

test('DNF bleibt nach dem Öffnen fachlich offen statt eine erfundene Auswahlliste vorzulesen', () => {
  assert.match(completionContract, /Der Durchführungsnachweis ist geöffnet\. Sag mir einfach, was du dort machen möchtest\./);
  assert.doesNotMatch(completionContract, /Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahme ohne Zeitangabe, Storno oder nur ansehen/);
  assert.doesNotMatch(completionContract, /Was möchtest du im Durchführungsnachweis machen: eine Bedarfsmedikation/);
});

test('statische F1-Basis enthält keine veralteten An-/Abwesenheits-Statusbeispiele', () => {
  assert.ok(catalogTexts.includes('Wähle den passenden Status aus.'));
  assert.ok(!catalogTexts.some(text => text.includes('Abwesend – Krankenhaus')));
  assert.ok(!catalogTexts.some(text => text.includes('das passende externe Angebot')));
});

test('v66-Migration entfernt ausschließlich die nicht bestätigten Statusbeispiele', () => {
  assert.match(migration, /slug = 'anwesenheit'/);
  assert.match(migration, /Wähle den passenden Status aus\./);
  assert.match(migration, /nicht bestätigte Status-Beispiele entfernt/);
  assert.doesNotMatch(migration, /Abwesend – Krankenhaus|externes Angebot/);
});

test('Arbeitsdokument hält die offenen Fachgrenzen fest', () => {
  assert.match(workDoc, /Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen/);
  assert.match(workDoc, /keine Browser-\/Systemstimme/);
  assert.match(workDoc, /Keine neuen Vivendi-Felder, Statusnamen, Menüpunkte oder Klickwege werden ergänzt\./i);
});
