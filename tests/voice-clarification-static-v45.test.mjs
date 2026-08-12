import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [extraText, uiText, gate, router, core, app] = await Promise.all([
  read('assets/voice-extra-catalog-v28.json'),
  read('assets/voice-ui-catalog-v29.json'),
  read('assets/local-voice-gate-v28.js'),
  read('supabase/functions/dokohilf-ai-router/index.ts'),
  read('supabase/functions/dokohilf-ai/index.ts'),
  read('assets/app.js'),
]);

const extra = JSON.parse(extraText);
const ui = JSON.parse(uiText);
const staticTexts = new Set([
  ...(extra.entries || []).map(entry => entry.text),
  ...(ui.entries || []).map(entry => entry.text),
]);

const fixedClarifications = [
  'Ich habe dich noch nicht sicher verstanden. Was möchtest du in der Dokumentation öffnen oder erledigen?',
  'Was möchtest du erfassen oder ansehen? Nenne bitte den Bereich, zum Beispiel Vitalwerte oder Berichte.',
  'Was möchtest du korrigieren: einen Bericht oder eine Durchführung?',
  'Ich habe „Albert erfassen“ verstanden. Meinst du Vitalwerte erfassen?',
  'Ich bleibe beim aktuellen Schritt. Ist er erledigt, soll ich ihn wiederholen oder brauchst du Hilfe dabei?',
  'Okay, ich stoppe diesen Ablauf. Was möchtest du stattdessen erledigen?',
  'Dafür ist aktuell noch keine bestätigte Schritt-für-Schritt-Anleitung hinterlegt. Beschreibe bitte genauer, welche vorhandene Funktion du nutzen möchtest.',
];

const fixedGeneralReplies = [
  'Hey! Wobei brauchst du Hilfe?',
  'Klar. Sag einfach in deinen eigenen Worten, was du öffnen oder erledigen möchtest.',
  'Stimmt. Ich habe fälschlich einen Ablauf gestartet. Sag mir bitte erst, wobei du tatsächlich Hilfe brauchst.',
  'Entschuldige. Die Sprachausgabe verwendet die kostenlose DokoHilf-Stimme Supertonic F1. Du kannst deine Bedienfrage sofort erneut sagen.',
  'Ich bin DokoHilf. Ich verstehe allgemeine Bedienfragen und führe nur durch bestätigte Klickwege. Echte Namen, Berichte oder Gesundheitsdaten dürfen niemals eingegeben werden.',
  'Diese Eingabe wird nicht an die KI übertragen. Bitte stelle nur eine allgemeine Bedienfrage und entferne alle echten Personen-, Fall- oder Gesundheitsdaten.',
];

test('feste Rückfragen sind wortgleich als statische Supertonic-Sätze vorhanden', () => {
  assert.equal(extra.entries.length, 33, 'Der kontrollierte Extra-Katalog muss bei 33 Quellen bleiben.');
  for (const sentence of [...fixedClarifications, ...fixedGeneralReplies]) {
    assert.ok(staticTexts.has(sentence), `Statischer Sprachsatz fehlt: ${sentence}`);
  }
});

test('die katalogisierten Rückfragen stammen wortgleich aus bestehenden DokoHilf-Antworten', () => {
  const sources = `${router}\n${core}\n${app}`;
  for (const sentence of fixedClarifications) {
    assert.ok(sources.includes(sentence), `Rückfrage ist nicht wortgleich im bestehenden Antwortcode belegt: ${sentence}`);
  }
  for (const sentence of fixedGeneralReplies.filter(sentence => sentence !== 'Hey! Wobei brauchst du Hilfe?')) {
    assert.ok(sources.includes(sentence), `Allgemeiner Sprachsatz ist nicht wortgleich im bestehenden Antwortcode belegt: ${sentence}`);
  }
});

test('Voice-Gate liest nur exakte oder enthaltene freigegebene statische Sätze und erfindet nichts', () => {
  assert.match(gate, /const exact = manifest\.get\(key\)/);
  assert.match(gate, /!key\.includes\(approvedText\)/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /STATIC_FALLBACK_TEXT = 'Ich habe die Antwort im Chat angezeigt\.'/);
  assert.match(gate, /blockSystemSpeech/);
  assert.doesNotMatch(gate, /localFallback|DokoHilfLocalVoiceV28\.synthesize|speechSynthesis\.speak\(new SpeechSynthesisUtterance/);
});

test('freie nicht katalogisierte Antworten werden nicht in einen anderen fachlichen Satz umgeschrieben', () => {
  assert.doesNotMatch(gate, /replace.*reply.*spokenText/is);
  assert.doesNotMatch(gate, /Gemini|generateContent|generativelanguage\.googleapis\.com/);
});
