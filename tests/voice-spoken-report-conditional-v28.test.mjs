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
  assert.match(gate, /lastSpokenMapping = mapped/);
});

test('bestätigte Supertonic-Sätze werden ausschließlich aus dem statischen Katalog abgespielt', () => {
  assert.match(gate, /approvedText\.length < 16/);
  assert.match(gate, /key\.includes\(approvedText\)/);
  assert.match(gate, /STATIC_VOICE = 'Supertonic-F1'/);
  assert.match(gate, /static-supertonic-only-v29/);
  assert.match(gate, /static-supertonic-cache-v29-2/);
  assert.match(gate, /loadStaticSupertonicVoice\(text\)/);
  assert.doesNotMatch(gate, /localFallback|DokoHilfLocalVoiceV28\.synthesize|Gacrux|dokohilf-guide-audio\?manifest=1/);
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
