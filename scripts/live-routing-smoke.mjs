import { mkdir, writeFile } from 'node:fs/promises';

const CORE_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai';
const ROUTER_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';

const cases = [
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte einen Bericht schreiben', expectedGuide: 'bericht-neu' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich muss einen Bericht löschen', expectedGuide: 'bericht-durchstreichen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Wo finde ich den Durchführungsnachweis?', expectedGuide: 'durchfuehrungsnachweis-oeffnen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte eine Durchführung stornieren', expectedGuide: 'durchfuehrung-storno' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Ich möchte eine Visite anlegen', expectedGuide: 'visite-anlegen' },
  { endpoint: CORE_ENDPOINT, endpointName: 'Kern-Endpunkt', input: 'Wie komme ich zur Übergabe?', expectedGuide: 'uebergabeformular' },
  {
    endpoint: CORE_ENDPOINT,
    endpointName: 'Kern-Endpunkt',
    input: 'Wie öffne ich das Notfallblatt?',
    expectedGuide: 'notfallblatt',
    expectedReplyIncludes: 'Bewohner',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Vitalwerte-Ziel bleibt Erfassen und fragt nur die Erfassungsart',
    input: 'Ich möchte die Vitalwerte eingeben',
    expectedSource: 'vital-entry-mode-choice',
    expectedOptions: 2,
    expectedReplyIncludes: 'einzelnen',
    replyMustNotInclude: 'erfassen oder ansehen',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Benannter Einzelwert startet Einzelerfassung',
    input: 'Ich möchte Blutdruck eingeben',
    expectedGuide: 'vitalwerte-einzelwert',
    expectedGuideStep: 1,
    expectedReplyIncludes: 'Doku',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Mehrere Werte starten Sammelerfassung',
    input: 'Ich möchte mehrere Vitalwerte gleichzeitig eingeben',
    expectedGuide: 'vitalwerte-sammelerfassung',
    expectedGuideStep: 1,
    expectedReplyIncludes: 'Doku',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Expliziter Schrittzustand: Vitalwerte öffnen',
    guideSlug: 'vitalwerte-erfassen',
    guideStep: 1,
    messages: [
      { role: 'user', content: 'Ich möchte die Vitalwerte eingeben' },
      { role: 'assistant', content: 'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.' },
      { role: 'user', content: 'Ja' },
    ],
    expectedGuide: 'vitalwerte-erfassen',
    expectedGuideStep: 2,
    expectedReplyIncludes: 'Vitalwerte',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Expliziter Schrittzustand: Auswahl Einzel oder Sammel',
    guideSlug: 'vitalwerte-erfassen',
    guideStep: 2,
    messages: [
      { role: 'user', content: 'Ich möchte die Vitalwerte eingeben' },
      { role: 'assistant', content: 'Wähle „Vitalwerte“.' },
      { role: 'user', content: 'Ja' },
    ],
    expectedGuide: 'vitalwerte-erfassen',
    expectedGuideStep: 3,
    expectedReplyIncludes: 'Sammelerfassung',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Einzelwahl öffnet grünes Plus',
    guideSlug: 'vitalwerte-erfassen',
    guideStep: 3,
    messages: [
      { role: 'assistant', content: 'Für einen einzelnen Wert klickst du oben links auf das grüne Plus. Für mehrere Werte gleichzeitig wählst du „Sammelerfassung“.' },
      { role: 'user', content: 'Ich möchte einen einzelnen Wert eingeben' },
    ],
    expectedGuide: 'vitalwerte-einzelwert-fortsetzen',
    expectedGuideStep: 1,
    expectedReplyIncludes: 'grüne Plus',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Sammelwahl öffnet Sammelerfassung',
    guideSlug: 'vitalwerte-erfassen',
    guideStep: 3,
    messages: [
      { role: 'assistant', content: 'Für einen einzelnen Wert klickst du oben links auf das grüne Plus. Für mehrere Werte gleichzeitig wählst du „Sammelerfassung“.' },
      { role: 'user', content: 'Mehrere gleichzeitig über Sammelerfassung' },
    ],
    expectedGuide: 'vitalwerte-sammelerfassung-fortsetzen',
    expectedGuideStep: 1,
    expectedReplyIncludes: 'Sammelerfassung',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Pop-up-Auswahl wird als erledigt verstanden',
    guideSlug: 'vitalwerte-einzelwert-fortsetzen',
    guideStep: 2,
    messages: [
      { role: 'assistant', content: 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest.' },
      { role: 'user', content: 'Ich habe Blutdruck ausgewählt' },
    ],
    expectedGuide: 'vitalwerte-einzelwert-fortsetzen',
    expectedGuideStep: 3,
    expectedReplyIncludes: 'Datum',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Viele alte Ja-Antworten überspringen keinen Schritt',
    guideSlug: 'vitalwerte-erfassen',
    guideStep: 2,
    messages: [
      { role: 'user', content: 'Ich möchte die Vitalwerte eingeben' },
      { role: 'assistant', content: 'Öffne Doku.' },
      { role: 'user', content: 'Ja' },
      { role: 'assistant', content: 'Wähle Vitalwerte.' },
      { role: 'user', content: 'Ja' },
      { role: 'assistant', content: 'Nochmal: Wähle Vitalwerte.' },
      { role: 'user', content: 'Ja' },
    ],
    expectedGuide: 'vitalwerte-erfassen',
    expectedGuideStep: 3,
    expectedReplyIncludes: 'grüne Plus',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Falsche Voraussetzung startet Einzelerfassung vorne',
    guideSlug: 'vitalwerte-einzelwert-fortsetzen',
    guideStep: 1,
    messages: [
      { role: 'assistant', content: 'Klicke oben links auf das grüne Plus.' },
      { role: 'user', content: 'Welches Fenster? Ich habe noch nichts geöffnet.' },
    ],
    expectedGuide: 'vitalwerte-einzelwert',
    expectedGuideStep: 1,
    expectedReplyIncludes: 'Stimmt',
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Spracherkennungs-Alternative erhält Erfassungsziel',
    input: 'Albert erfassen',
    speechAlternatives: ['Albert erfassen', 'Vitalwerte erfassen'],
    expectedSource: 'vital-entry-mode-choice',
    expectedOptions: 2,
    expectedReplyIncludes: 'einzelnen',
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
    endpointName: 'Korrektur wird strukturiert geklärt',
    input: 'Ich habe falsch dokumentiert',
    expectedSource: 'structured-clarification',
    expectedOptions: 2,
  },
  {
    endpoint: ROUTER_ENDPOINT,
    endpointName: 'Gemini-Dialogmanager kann abbrechen',
    guideSlug: 'bericht-neu',
    guideStep: 1,
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
          guideStep: testCase.guideStep || null,
          guideStateVersion: testCase.guideStep ? 2 : null,
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
    const stepPassed = !testCase.expectedGuideStep || Number(payload.guideStep) === testCase.expectedGuideStep;
    const replyPassed = !testCase.expectedReplyIncludes
      || reply.toLowerCase().includes(testCase.expectedReplyIncludes.toLowerCase());
    const forbiddenPassed = !testCase.replyMustNotInclude
      || !reply.toLowerCase().includes(testCase.replyMustNotInclude.toLowerCase());
    const passed = routingPassed && stepPassed && replyPassed && forbiddenPassed;
    results.push({
      endpointName: testCase.endpointName,
      input: testCase.input || testCase.messages?.at(-1)?.content || '',
      expectedGuide: testCase.expectedGuide || null,
      expectedSource: testCase.expectedSource || null,
      expectedGuideStep: testCase.expectedGuideStep || null,
      actualGuide: payload.guideSlug || null,
      actualSource: payload.source || null,
      actualGuideStep: payload.guideStep || null,
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
  ...results.map(result => `- ${result.passed ? '✅' : '❌'} ${result.endpointName}: „${result.input}“ → ${result.actualGuide || result.actualSource || result.error || 'keine Antwort'}${result.actualGuideStep ? ` · Schritt ${result.actualGuideStep}` : ''}`),
  '',
].join('\n');
await writeFile('artifacts/dokohilf-live-routing.md', markdown, 'utf8');
await writeFile('artifacts/dokohilf-live-routing.json', JSON.stringify(results, null, 2), 'utf8');

const failures = results.filter(result => !result.passed);
console.log(`DokoHilf Live-Routing: ${results.length - failures.length}/${results.length} bestanden.`);
if (failures.length) process.exitCode = 1;
