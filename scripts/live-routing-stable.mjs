import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const CHAT_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-chat-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';

const choiceSource = payload => String(payload.source || '').startsWith('vital-entry-mode-choice');
const clarificationSource = payload => String(payload.source || '').startsWith('structured-clarification');

const cases = [
  {
    name: 'Vitalwerte-Erfassungsziel bleibt erhalten',
    body: { messages: [{ role: 'user', content: 'Ich möchte Vitalwerte eingeben' }] },
    validate: payload => choiceSource(payload) && Array.isArray(payload.options) && payload.options.length === 2,
  },
  {
    name: 'Einzelwert startet richtigen Guide',
    body: { messages: [{ role: 'user', content: 'Ich möchte Blutdruck eingeben' }] },
    validate: payload => payload.guideSlug === 'vitalwerte-einzelwert' && Number(payload.guideStep) === 1,
  },
  {
    name: 'Sammelerfassung startet richtigen Guide',
    body: { messages: [{ role: 'user', content: 'Ich möchte mehrere Vitalwerte gleichzeitig eingeben' }] },
    validate: payload => payload.guideSlug === 'vitalwerte-sammelerfassung' && Number(payload.guideStep) === 1,
  },
  {
    name: 'Freie Bestätigung geht genau einen Schritt weiter',
    body: {
      guideSlug: 'vitalwerte-einzelwert-fortsetzen',
      guideStep: 2,
      guideStateVersion: 2,
      messages: [
        { role: 'assistant', content: 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest.' },
        { role: 'user', content: 'Ich habe Blutdruck ausgewählt' },
      ],
    },
    validate: payload => payload.guideSlug === 'vitalwerte-einzelwert-fortsetzen'
      && Number(payload.guideStep) === 3
      && /Datum/i.test(payload.reply || ''),
  },
  {
    name: 'Fehlende Voraussetzung startet vorne',
    body: {
      guideSlug: 'vitalwerte-einzelwert-fortsetzen',
      guideStep: 1,
      guideStateVersion: 2,
      messages: [
        { role: 'assistant', content: 'Klicke oben links auf das grüne Plus.' },
        { role: 'user', content: 'Welches Fenster? Ich habe noch nichts geöffnet.' },
      ],
    },
    validate: payload => payload.guideSlug === 'vitalwerte-einzelwert'
      && Number(payload.guideStep) === 1,
  },
  {
    name: 'Spracherkennungsalternative wird genutzt',
    body: {
      inputMode: 'voice',
      speechAlternatives: ['Albert erfassen', 'Vitalwerte erfassen'],
      messages: [{ role: 'user', content: 'Albert erfassen' }],
    },
    validate: payload => choiceSource(payload) && Array.isArray(payload.options) && payload.options.length === 2,
  },
  {
    name: 'Mehrdeutige Korrektur wird strukturiert geklärt',
    body: { messages: [{ role: 'user', content: 'Ich habe falsch dokumentiert' }] },
    validate: payload => clarificationSource(payload) && Array.isArray(payload.options) && payload.options.length === 2,
  },
  {
    name: 'Folgebericht wird direkt erkannt',
    body: { messages: [{ role: 'user', content: 'Ich möchte einen Folgebericht erstellen' }] },
    validate: payload => payload.guideSlug === 'bericht-folgebericht' && Number(payload.guideStep) === 1,
  },
  {
    name: 'Visite beginnt mit Visitenbereich und enthält Bewohnerauswahl als nächsten Schritt',
    body: { messages: [{ role: 'user', content: 'Ich möchte eine Visite dokumentieren' }] },
    validate: payload => payload.guideSlug === 'visite-anlegen'
      && Number(payload.guideStep) === 1
      && typeof payload.nextSpokenText === 'string'
      && /grüne Plus|Neu/i.test(payload.nextSpokenText),
  },
  {
    name: 'An- und Abwesenheit wird direkt erkannt',
    body: { messages: [{ role: 'user', content: 'Ich möchte eine Abwesenheit eintragen' }] },
    validate: payload => payload.guideSlug === 'anwesenheit' && Number(payload.guideStep) === 1,
  },
  {
    name: 'Formular anlegen wird direkt erkannt',
    body: { messages: [{ role: 'user', content: 'Ich möchte ein Sturzprotokoll anlegen' }] },
    validate: payload => payload.guideSlug === 'formulare-anlegen' && Number(payload.guideStep) === 1,
  },
  {
    name: 'Medikationsänderung wird nicht angeleitet',
    body: { messages: [{ role: 'user', content: 'Wie kann ich die Medikation absetzen?' }] },
    validate: payload => payload.source === 'medication-view-only-safety-v9'
      && payload.guideSlug == null
      && /ausschließlich zum Ansehen/i.test(payload.reply || ''),
  },
  {
    name: 'Klar genanntes neues Ziel ersetzt laufenden Guide',
    body: {
      guideSlug: 'visite-anlegen',
      guideStep: 2,
      guideStateVersion: 2,
      messages: [
        { role: 'assistant', content: 'Klicke oben links auf das grüne Plus beziehungsweise Neu.' },
        { role: 'user', content: 'Ich möchte stattdessen einen Bericht durchstreichen' },
      ],
    },
    validate: payload => payload.guideSlug === 'bericht-durchstreichen'
      && Number(payload.guideStep) === 1
      && /wechsle/i.test(payload.reply || ''),
  },
  {
    name: 'Notfallblatt wird direkt erkannt',
    body: { messages: [{ role: 'user', content: 'Wie rufe ich das Notfallblatt auf?' }] },
    validate: payload => payload.guideSlug === 'notfallblatt' && Number(payload.guideStep) === 1,
  },
];

const chatRouterCases = [
  {
    name: 'v29 Blutdruck-Suche startet kurz direkt im Einzelwert-Guide',
    body: { messages: [{ role: 'user', content: 'Hallo ich suche den Blutdruck' }] },
    validate: payload => payload.guideSlug === 'vitalwerte-einzelwert'
      && Number(payload.guideStep) === 1
      && payload.source === 'approved-guide-smart-start-v29-1'
      && String(payload.reply || '').length < 350,
  },
  {
    name: 'v29 Ich-weiß-nicht bleibt exakt auf dem aktuellen Bericht-Schritt',
    body: {
      guideSlug: 'bericht-folgebericht',
      guideStep: 1,
      guideStateVersion: 2,
      smartHelpIntent: true,
      messages: [{ role: 'user', content: 'ich weiß nicht' }],
    },
    validate: payload => payload.guideSlug === 'bericht-folgebericht'
      && Number(payload.guideStep) === 1
      && payload.source === 'approved-guide-context-help-v29-4'
      && !Array.isArray(payload.helpOptions),
  },
];

async function request(body, endpoint = ENDPOINT) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({
          guideSlug: null,
          guideStep: null,
          inputMode: 'chat',
          speechAlternatives: [],
          ...body,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${payload.error || 'unbekannt'}`);
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 600));
    }
  }
  throw lastError;
}

const results = [];
for (const testCase of cases) {
  try {
    const payload = await request(testCase.body);
    results.push({
      name: testCase.name,
      endpoint: 'dokohilf-ai-router',
      guideSlug: payload.guideSlug || null,
      source: payload.source || null,
      guideStep: payload.guideStep || null,
      passed: Boolean(testCase.validate(payload)),
    });
  } catch (error) {
    results.push({ name: testCase.name, endpoint: 'dokohilf-ai-router', error: String(error?.message || error), passed: false });
  }
}

for (const testCase of chatRouterCases) {
  try {
    const payload = await request(testCase.body, CHAT_ENDPOINT);
    results.push({
      name: testCase.name,
      endpoint: 'dokohilf-chat-router',
      guideSlug: payload.guideSlug || null,
      source: payload.source || null,
      guideStep: payload.guideStep || null,
      replyLength: String(payload.reply || '').length,
      passed: Boolean(testCase.validate(payload)),
    });
  } catch (error) {
    results.push({ name: testCase.name, endpoint: 'dokohilf-chat-router', error: String(error?.message || error), passed: false });
  }
}

await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/dokohilf-live-routing-stable.json', JSON.stringify(results, null, 2), 'utf8');
await writeFile(
  'artifacts/dokohilf-live-routing-stable.md',
  ['# Stabiler Live-Router-Test', '', ...results.map(item => `- ${item.passed ? '✅' : '❌'} ${item.name}`), ''].join('\n'),
  'utf8',
);

const failures = results.filter(item => !item.passed);
console.log(`DokoHilf stabiler Live-Router-Test: ${results.length - failures.length}/${results.length} bestanden.`);
if (failures.length) process.exitCode = 1;
