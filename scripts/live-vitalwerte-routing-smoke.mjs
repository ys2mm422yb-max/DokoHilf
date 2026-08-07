import { mkdir, writeFile } from 'node:fs/promises';

const ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-ai-router';
const ORIGIN = 'https://ys2mm422yb-max.github.io';
const input = 'Möchte Vitalwerte anlegen';

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: ORIGIN },
  body: JSON.stringify({
    messages: [{ role: 'user', content: input }],
    guideSlug: null,
    guideStep: null,
    inputMode: 'chat',
    speechAlternatives: [],
  }),
  signal: AbortSignal.timeout(20_000),
});

const payload = await response.json().catch(() => ({}));
const options = Array.isArray(payload.options) ? payload.options : [];
const reply = typeof payload.reply === 'string' ? payload.reply : '';
const passed = response.ok
  && String(payload.source || '').startsWith('vital-entry-mode-choice')
  && payload.guideSlug == null
  && options.length === 2
  && /einzelnen wert/i.test(reply)
  && /mehrere werte/i.test(reply)
  && !/doku erweitert|hast du einen der beiden reiter/i.test(reply);

const result = {
  input,
  status: response.status,
  source: payload.source || null,
  guideSlug: payload.guideSlug || null,
  optionCount: options.length,
  reply: reply || null,
  passed,
};

await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/dokohilf-vitalwerte-routing-regression.json', JSON.stringify(result, null, 2), 'utf8');
await writeFile(
  'artifacts/dokohilf-vitalwerte-routing-regression.md',
  `# Vitalwerte-Routing-Regressionsprüfung\n\n- ${passed ? '✅' : '❌'} „${input}“ → ${payload.source || payload.guideSlug || `HTTP ${response.status}`}\n`,
  'utf8',
);

console.log(`DokoHilf Vitalwerte-Routing-Regressionsprüfung: ${passed ? 'bestanden' : 'fehlgeschlagen'}.`);
if (!passed) process.exitCode = 1;
