import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';

const cases = [
  {
    name: 'Vitalwerte-Erfassungsziel bleibt erhalten',
    body: { messages: [{ role: 'user', content: 'Ich möchte Vitalwerte eingeben' }] },
    validate: payload => payload.source === 'vital-entry-mode-choice' && Array.isArray(payload.options) && payload.options.length === 2,
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
    validate: payload => payload.source === 'vital-entry-mode-choice' && Array.isArray(payload.options) && payload.options.length === 2,
  },
  {
    name: 'Mehrdeutige Korrektur wird strukturiert geklärt',
    body: { messages: [{ role: 'user', content: 'Ich habe falsch dokumentiert' }] },
    validate: payload => payload.source === 'structured-clarification' && Array.isArray(payload.options) && payload.options.length === 2,
  },
];

async function request(body) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
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
      guideSlug: payload.guideSlug || null,
      source: payload.source || null,
      guideStep: payload.guideStep || null,
      passed: Boolean(testCase.validate(payload)),
    });
  } catch (error) {
    results.push({ name: testCase.name, error: String(error?.message || error), passed: false });
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
