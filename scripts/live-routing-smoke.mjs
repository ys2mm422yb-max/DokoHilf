import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';

const cases = [
  { input: 'Ich muss einen Bericht löschen', expectedGuide: 'bericht-durchstreichen' },
  { input: 'Ich möchte eine Visite anlegen', expectedGuide: 'visite-anlegen' },
  { input: 'Ich möchte eine Durchführung stornieren', expectedGuide: 'durchfuehrung-storno' },
  { input: 'Ich habe falsch dokumentiert', expectedSource: 'structured-clarification', expectedOptions: 2 },
];

async function requestWithRetry(testCase) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
        body: JSON.stringify({ messages: [{ role: 'user', content: testCase.input }], guideSlug: null }),
        signal: AbortSignal.timeout(15_000),
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
    const passed = testCase.expectedGuide
      ? payload.guideSlug === testCase.expectedGuide
      : payload.source === testCase.expectedSource && options.length === testCase.expectedOptions;
    results.push({ ...testCase, actualGuide: payload.guideSlug || null, actualSource: payload.source || null, optionCount: options.length, passed });
  } catch (error) {
    results.push({ ...testCase, error: String(error?.message || error), passed: false });
  }
}

await mkdir('artifacts', { recursive: true });
const markdown = [
  '# DokoHilf Live-Routing-Smoke-Test',
  '',
  ...results.map(result => `- ${result.passed ? '✅' : '❌'} „${result.input}“ → ${result.actualGuide || result.actualSource || result.error || 'keine Antwort'}`),
  '',
].join('\n');
await writeFile('artifacts/dokohilf-live-routing.md', markdown, 'utf8');
await writeFile('artifacts/dokohilf-live-routing.json', JSON.stringify(results, null, 2), 'utf8');

const failures = results.filter(result => !result.passed);
console.log(`DokoHilf Live-Routing: ${results.length - failures.length}/${results.length} bestanden.`);
if (failures.length) process.exitCode = 1;
