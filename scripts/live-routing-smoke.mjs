import { mkdir, writeFile } from 'node:fs/promises';

const CORE_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';
const ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';

const cases = [
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte einen Bericht schreiben', expectedGuide: 'bericht-neu' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich muss einen Bericht löschen', expectedGuide: 'bericht-durchstreichen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Wo finde ich den Durchführungsnachweis?', expectedGuide: 'durchfuehrungsnachweis-oeffnen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte eine Durchführung stornieren', expectedGuide: 'durchfuehrung-storno' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte Blutdruck als Vitalwert eintragen', expectedGuide: 'vitalwerte-erfassen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte eine Visite anlegen', expectedGuide: 'visite-anlegen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Wie komme ich zur Übergabe?', expectedGuide: 'uebergabeformular' },
  {
    endpoint: CORE_ENDPOINT,
    endpointName: 'Kern-Endpunkt',
    input: 'Wie öffne ich das Notfallblatt?',
    expectedGuide: 'notfallblatt',
    expectedReplyIncludes: 'Bewohner',
  },
  { endpoint: ROUTER_ENDPOINT, endpointName: 'App-Router', input: 'Ich habe falsch dokumentiert', expectedSource: 'structured-clarification', expectedOptions: 2 },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'App-Router Vitalwerte-Kontext',
    guideSlug: 'vitalwerte',
    messages: [
      { role: 'user', content: 'Wo finde ich die Vitalwerte?' },
      { role: 'assistant', content: 'Entscheide, ob du einen neuen Vitalwert erfassen oder vorhandene Werte beziehungsweise den Verlauf ansehen möchtest.' },
      { role: 'user', content: 'Erfassen' },
    ],
    expectedGuide: 'vitalwerte-erfassen-fortsetzen',
    expectedReplyIncludes: 'grüne Plus',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'App-Router falsche Voraussetzung korrigieren',
    guideSlug: 'vitalwerte-erfassen-fortsetzen',
    messages: [
      { role: 'assistant', content: 'Klicke jetzt im bereits geöffneten Bereich „Vitalwerte“ auf das grüne Plus beziehungsweise auf „Neu“.' },
      { role: 'user', content: 'Welches bereits geöffnete Fenster? Ich habe noch nichts geöffnet.' },
    ],
    expectedGuide: 'vitalwerte-erfassen',
    expectedReplyIncludes: 'Stimmt',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'App-Router Spracherkennungs-Alternativen',
    input: 'Albert erfassen',
    speechAlternatives: ['Albert erfassen', 'Vitalwert erfassen'],
    expectedGuide: 'vitalwerte-erfassen',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'App-Router Sprachfehler klären',
    input: 'Albert erfassen',
    expectedSource: 'speech-recognition-clarification',
    expectedOptions: 1,
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'App-Router ohne Kontext',
    input: 'Erfassen',
    expectedSource: 'context-required-clarification',
    expectedOptions: 0,
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Exakter iPhone-Fall: freie Bestätigung im Vitalwerte-Guide',
    guideSlug: 'vitalwerte-erfassen',
    messages: [
      { role: 'user', content: 'Ich möchte vital Wert anlegen' },
      { role: 'assistant', content: 'Öffne den gewünschten Klienten und anschließend „Doku erweitert“ oder „Doku“. Hast du den richtigen Bereich geöffnet?' },
      { role: 'user', content: 'Ja' },
      { role: 'assistant', content: 'Wähle „Vitalwerte“. Ist der Bereich „Vitalwerte“ geöffnet?' },
      { role: 'user', content: 'Weiter' },
      { role: 'assistant', content: 'Klicke auf das grüne Plus beziehungsweise auf „Neu“. Ist die Eingabemaske für einen neuen Vitalwert geöffnet?' },
      { role: 'user', content: 'Ja' },
      { role: 'assistant', content: 'Wähle den Vitalwert oder ein vorhandenes Vitalwert-Set aus, zum Beispiel Blutdruck, Puls, Temperatur oder Gewicht. Ist der richtige Vitalwert ausgewählt?' },
      { role: 'user', content: 'Ich habe Blutdruck ausgewählt' },
    ],
    expectedGuide: 'vitalwerte-erfassen',
    expectedReplyIncludes: 'Datum',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Gemini-Dialogmanager',
    guideSlug: 'bericht-neu',
    messages: [
      { role: 'assistant', content: 'Öffne in der grauen Leiste den festen Reiter „Berichte“.' },
      { role: 'user', content: 'Stopp, ich möchte diesen Ablauf abbrechen.' },
    ],
    expectedSource: 'ai-dialogue-cancel',
    expectedOptions: 0,
  },
];

async function requestWithRetry(testCase) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const messages = testCase.messages || [{ role: 'user', content: testCase.input }];
      const response = await fetch(testCase.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({
          messages,
          guideSlug: testCase.guideSlug || null,
          inputMode: testCase.speechAlternatives ? 'voice' : 'chat',
          speechAlternatives: testCase.speechAlternatives || [],
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${payload.error || 'unbekannt'}`);
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise(resolve => setTimeout(resolve, attempt * 700));
    }
  }
  throw lastError;
}

const results = [];
for (const testCase of cases) {
  try {
    const payload = await requestWithRetry(testCase);
    const options = Array.isArray(payload.options) ? payload.options : [];
    const reply = typeof payload.reply === 'string' ? payload.reply : '';
    const routingPassed = testCase.expectedGuide
      ? payload.guideSlug === testCase.expectedGuide
      : payload.source === testCase.expectedSource && options.length === testCase.expectedOptions;
    const replyPassed = !testCase.expectedReplyIncludes
      || reply.toLowerCase().includes(testCase.expectedReplyIncludes.toLowerCase());
    const passed = routingPassed && replyPassed;
    results.push({
      endpointName: testCase.endpointName,
      input: testCase.input || testCase.messages?.at(-1)?.content || '',
      expectedGuide: testCase.expectedGuide || null,
      expectedSource: testCase.expectedSource || null,
      expectedReplyIncludes: testCase.expectedReplyIncludes || null,
      actualGuide: payload.guideSlug || null,
      actualSource: payload.source || null,
      optionCount: options.length,
      reply: reply || null,
      passed,
    });
  } catch (error) {
    results.push({
      endpointName: testCase.endpointName,
      input: testCase.input || testCase.messages?.at(-1)?.content || '',
      expectedGuide: testCase.expectedGuide || null,
      expectedSource: testCase.expectedSource || null,
      error: String(error?.message || error),
      passed: false,
    });
  }
}

await mkdir('artifacts', { recursive: true });
const markdown = [
  '# DokoHilf Live-Routing-Smoke-Test',
  '',
  ...results.map(result => `- ${result.passed ? '✅' : '❌'} ${result.endpointName}: „${result.input}“ → ${result.actualGuide || result.actualSource || result.error || 'keine Antwort'}`),
  '',
].join('\n');
await writeFile('artifacts/dokohilf-live-routing.md', markdown, 'utf8');
await writeFile('artifacts/dokohilf-live-routing.json', JSON.stringify(results, null, 2), 'utf8');

const failures = results.filter(result => !result.passed);
console.log(`DokoHilf Live-Routing: ${results.length - failures.length}/${results.length} bestanden.`);
if (failures.length) process.exitCode = 1;
