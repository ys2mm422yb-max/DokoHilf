import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('supabase/functions/dokohilf-ai/index.ts', 'utf8');

test('Core nutzt ausschließlich die freigegebene Wissensbasis', () => {
  assert.match(source, /approved-knowledge-core-v14/);
  assert.match(source, /dokohilf_guides\?select=/);
  assert.match(source, /dokohilf_topics\?select=/);
  assert.match(source, /status=eq\.approved/);
  assert.match(source, /Erfinde niemals Klickwege/);
});

test('Core blockiert mögliche Echtdaten vor Gemini', () => {
  assert.match(source, /containsSensitiveData/);
  assert.match(source, /Mögliche Echtdaten erkannt/);
  const sensitiveCheck = source.indexOf("messages.some((message) => message.role === 'user' && containsSensitiveData(message.content))");
  const geminiKey = source.indexOf("Deno.env.get('GEMINI_API_KEY')", sensitiveCheck);
  assert.ok(sensitiveCheck >= 0, 'Echtdatenprüfung fehlt');
  assert.ok(geminiKey > sensitiveCheck, 'Gemini darf erst nach der Echtdatenprüfung erreicht werden');
});

test('Core nennt keine System- oder Gerätestimme als Voice-Fallback', () => {
  assert.doesNotMatch(source, /Gerätestimme|Geratestimme|Systemstimme|speechSynthesis\.speak/i);
  assert.match(source, /kostenlose DokoHilf-Stimme Supertonic F1/);
});

test('Basisantworten sind nicht von der Wissensbasis abhängig', () => {
  const sensitiveCheck = source.indexOf("messages.some((message) => message.role === 'user' && containsSensitiveData(message.content))");
  const basicReply = source.indexOf('const basic = quickBasicReply(lastText);', sensitiveCheck);
  const knowledgeLoad = source.indexOf('knowledge = await loadKnowledge();', sensitiveCheck);
  assert.ok(basicReply > sensitiveCheck, 'Basisantwort muss nach der Echtdatenprüfung liegen');
  assert.ok(knowledgeLoad > basicReply, 'Basisantwort muss vor dem Wissensabruf liegen');
});

test('Wissensabruf besitzt einen kurzen Retry statt Einmalfehler', () => {
  assert.match(source, /async function fetchKnowledgeJson/);
  assert.match(source, /for \(let attempt = 0; attempt < 2; attempt \+= 1\)/);
  assert.match(source, /setTimeout\(resolve, 120\)/);
  assert.match(source, /AbortSignal\.timeout\(4_000\)/);
});

test('Core enthält keine alte hart codierte Klickweg-Wissensbasis', () => {
  assert.doesNotMatch(source, /FREIGEGEBENE BEDIENWEGE/);
  assert.doesNotMatch(source, /Neuer Berichtseintrag/);
  assert.doesNotMatch(source, /EasyPlan/);
  assert.doesNotMatch(source, /Stammdaten öffnen/);
  assert.doesNotMatch(source, /Doku erweitert.*Vitalwerte.*Weg B/s);
});
