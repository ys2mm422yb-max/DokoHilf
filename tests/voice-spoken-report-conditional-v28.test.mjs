import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [gate, confirmed] = await Promise.all([
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../CONFIRMED_WORKFLOWS.md', import.meta.url), 'utf8'),
]);

test('Voice verwendet den vom Router vorgesehenen spokenText statt des langen sichtbaren reply', () => {
  assert.match(gate, /AI_MARKERS/);
  assert.match(gate, /payload\.spokenText/);
  assert.match(gate, /spokenByReply\.set/);
  assert.match(gate, /mappedSpokenText\(requestedText\)/);
  assert.match(gate, /replaceTtsBody\(init, text\)/);
});

test('kurze bestätigte Gacrux-Sätze dürfen als Teil eines längeren Voice-Texts sicher getroffen werden', () => {
  assert.match(gate, /approvedText\.length < 16/);
  assert.match(gate, /key\.includes\(approvedText\)/);
  assert.ok(gate.indexOf('loadApprovedStaticVoice(text)') < gate.indexOf('localFallback(text)'));
});

test('Bericht zeigt Schritte 6 bis 9 als klaren Sonderfall für genau zwei Kategorien', () => {
  assert.match(gate, /Sonderfall · nur bei 2 Kategorien/);
  assert.match(gate, /Kontakt – alles außer Arzt[^\n]*Fallgespräch/);
  assert.match(gate, /Sturzereignis[^\n]*Sturzprotokoll/);
  assert.match(gate, /Schritte 6–9 überspringen[^\n]*Schritt 10/);
  assert.match(gate, /report-protocol-step/);
});

test('verbindliche Fachquelle enthält dieselbe bedingte Berichtlogik', () => {
  assert.match(confirmed, /Kontakt – alles außer Arzt\*\* ist automatisch das \*\*Fallgespräch/);
  assert.match(confirmed, /Sturzereignis\*\* ist automatisch das \*\*Sturzprotokoll/);
  assert.match(confirmed, /allen anderen Berichtskategorien die Schritte 6–9 überspringen und direkt mit Schritt 10 fortfahren/);
  assert.match(confirmed, /Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht/);
});
