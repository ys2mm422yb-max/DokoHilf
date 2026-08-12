import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [gate, sw, confirmed] = await Promise.all([
  readFile(new URL('../assets/local-voice-gate-v28.js', import.meta.url), 'utf8'),
  readFile(new URL('../service-worker.js', import.meta.url), 'utf8'),
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
  assert.match(gate, /loadStaticSupertonicVoice\(text, requestedText\)/);
  assert.doesNotMatch(gate, /localFallback|DokoHilfLocalVoiceV28\.synthesize|Gacrux|dokohilf-guide-audio\?manifest=1/);
});

test('generischer spokenText nutzt zuerst einen sichtbaren freigegebenen Satz und erst danach den Fallback', () => {
  assert.match(gate, /VOICE_REPLY_MATCH_REVISION = '20260812-static-voice-reply-match-v45-2'/);
  assert.match(gate, /async function loadStaticSupertonicVoice\(text, visibleReply = ''\)/);
  assert.match(gate, /spokenKey === fallbackKey/);
  assert.match(gate, /replyKey && replyKey !== spokenKey/);
  assert.match(gate, /findStaticEntry\(visibleReply, manifest\)/);
  assert.match(gate, /normalizeAudioKey\(replyEntry\.text\) !== fallbackKey/);
  assert.match(gate, /approvedReplyMatches \+= 1/);
  assert.match(gate, /STATIC_FALLBACK_TEXT = 'Ich habe die Antwort im Chat angezeigt\.'/);
  assert.ok(gate.indexOf('findStaticEntry(visibleReply, manifest)') < gate.indexOf('const entry = findStaticEntry(text, manifest)'), 'Beim generischen spokenText muss die sichtbare freigegebene Antwort vor dessen WAV geprüft werden.');
  assert.match(sw, /VOICE_REPLY_MATCH_REVISION = '20260812-static-voice-reply-match-v45-2'/);
  assert.match(sw, /voiceReplyMatchRevision: VOICE_REPLY_MATCH_REVISION/);
  assert.doesNotMatch(gate, /SpeechSynthesisUtterance|DokoHilfLocalVoiceV28\.synthesize|loadTextToSpeech|loadVoiceStyle/);
});

test('Legacy-Voice-Quelle markiert den Bericht-Sonderfall, der im finalen v44-Render normalisiert wird', () => {
  assert.match(gate, /Sonderfall · nur bei 2 Kategorien/);
  assert.match(gate, /Kontakt – alles außer Arzt[^\n]*Fallgespräch/);
  assert.match(gate, /Sturzereignis[^\n]*Sturzprotokoll/);
  assert.match(gate, /Schritte 6–9 überspringen[^\n]*Schritt 10/);
  assert.match(gate, /report-protocol-step/);
});

test('verbindliche Fachquelle enthält die bestätigte Bericht-Sonderfalllogik', () => {
  assert.match(confirmed, /Kontakt – alles außer Arzt\*\* ist automatisch das \*\*Fallgespräch/);
  assert.match(confirmed, /Sturzereignis\*\* ist automatisch das \*\*Sturzprotokoll/);
  assert.match(confirmed, /Bei allen anderen Berichtskategorien gelten die Schritte 5–8 nicht; direkt mit Schritt 9 fortfahren/);
  assert.match(confirmed, /Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht/);
});
