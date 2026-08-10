import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { approvedGuides, expectedCaseCount, routingCases } from '../tests/fixtures/routing-fixtures.mjs';
import { evaluateCases, routeContract } from '../tests/helpers/routing-contract.mjs';

const REQUIRED_GUIDES = [
  'bericht-neu',
  'bericht-durchstreichen',
  'durchfuehrung-storno',
  'visite-anlegen',
  'visite-status-durchgefuehrt',
  'vitalwerte',
  'uebergabeformular',
  'notfallblatt',
];

const CONFIRMED_WORKFLOW_MIGRATION = await readFile(
  new URL('../supabase/migrations/20260806153000_confirmed_workflows_blocks_1_4.sql', import.meta.url),
  'utf8',
);
const UI_POLISH = await readFile(new URL('../assets/ui-polish-v35.js', import.meta.url), 'utf8');

const REQUIRED_LIBRARY_GROUP_MARKERS = [
  "GROUP_LAYOUT_REVISION = '20260810-health-medicine-library-v37-1'",
  "label: 'Gesundheit & Medizin'",
  "hint: 'Visiten, Vitalwerte, Medikation und Notfallblatt'",
  "slugs: ['visite-anlegen', 'visiten-oeffnen', 'visite-status-durchgefuehrt', 'vitalwerte', 'medikation-ansehen', 'notfallblatt']",
  "label: 'Organisation & Dokumente'",
  "slugs: ['anwesenheit', 'formulare-anlegen', 'stammdaten']",
  "label: 'Übergabe & Übersicht'",
  "slugs: ['uebergabeformular']",
  "label: 'Durchführung'",
];

const REQUIRED_WORKFLOW_MARKERS = [
  'bericht-folgebericht',
  'Kontakt – alles außer Arzt',
  'Sturzereignis',
  'Bemerkung zur Bearbeitung',
  'Klienten auswählen',
  'niemals den Status „abgeschlossen“',
  'Vitalwerte Sammelerf.',
  'lasse „Bis“ leer und schätze niemals',
  'Medikation ausschließlich ansehen',
  'formulare-anlegen',
  'Notfallblatt aufrufen',
  'Alles ausklappen',
];

const REAL_DATA_PATTERNS = [
  /@[a-z0-9.-]+\.(?:de|com|net|org)\b/i,
  /\b(?:herr|frau|bewohner|klient|patient)\s+[A-ZÄÖÜ][a-zäöüß-]+\b/,
  /\b\d{1,2}\.\d{1,2}\.\d{4}\b/,
  /\b(?:\+49|0)\d[\d\s/-]{7,}\b/,
];

function sequenceResults() {
  const sequences = [
    {
      name: 'Bericht anlegen zu Visite wechseln',
      messages: ['Ich möchte einen Bericht schreiben', 'weiter', 'Ich möchte eine Visite anlegen'],
      expected: ['bericht-neu', null, 'visite-anlegen'],
    },
    {
      name: 'Visite zu falschem Bericht wechseln',
      messages: ['Neue Visite erstellen', 'zurück', 'Ich muss einen Bericht löschen'],
      expected: ['visite-anlegen', null, 'bericht-durchstreichen'],
    },
    {
      name: 'Durchführung stornieren und Schritt wiederholen',
      messages: ['Durchführung stornieren', 'nochmal', 'ich finde das nicht'],
      expectedKinds: ['guide', 'command-repeat', 'command-stuck'],
    },
  ];

  return sequences.map(sequence => {
    const actual = sequence.messages.map(message => routeContract(message, approvedGuides));
    const passed = sequence.expected
      ? actual.every((result, index) => result.guideSlug === sequence.expected[index])
      : actual.every((result, index) => result.kind === sequence.expectedKinds[index]);
    return { ...sequence, actual, passed };
  });
}

function buildMarkdown(caseResults, sequences, guideFailures, dataFailures, workflowFailures, libraryGroupingFailures) {
  const failedCases = caseResults.filter(result => !result.passed);
  const tagCounts = new Map();
  for (const result of caseResults) {
    for (const tag of result.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }

  const lines = [
    '# DokoHilf Verhaltens- und Regressionstest',
    '',
    `- Routingfälle: **${caseResults.length}**`,
    `- Bestanden: **${caseResults.length - failedCases.length}**`,
    `- Fehlgeschlagen: **${failedCases.length}**`,
    `- Freigegebene Guides im Vertrag: **${approvedGuides.length}**`,
    `- Gesprächssequenzen: **${sequences.length}**`,
    `- Echtdaten in Testfällen erkannt: **${dataFailures.length}**`,
    `- Fehlende bestätigte Workflow-Marker: **${workflowFailures.length}**`,
    `- Fehler in Bibliotheksgruppierung: **${libraryGroupingFailures.length}**`,
    '',
    '## Abgedeckte Varianten',
    '',
    ...[...tagCounts.entries()].sort().map(([tag, count]) => `- ${tag}: ${count}`),
    '',
    '## Gesprächswechsel',
    '',
    ...sequences.map(sequence => `- ${sequence.passed ? '✅' : '❌'} ${sequence.name}`),
    '',
    '## Verbindliche Klickwege',
    '',
    ...(guideFailures.length
      ? guideFailures.map(slug => `- ❌ fehlt: ${slug}`)
      : REQUIRED_GUIDES.map(slug => `- ✅ ${slug}`)),
    '',
    '## Neu bestätigte Arbeitsabläufe',
    '',
    ...(workflowFailures.length
      ? workflowFailures.map(marker => `- ❌ fehlt: ${marker}`)
      : REQUIRED_WORKFLOW_MARKERS.map(marker => `- ✅ ${marker}`)),
    '',
    '## Bibliotheksgruppierung',
    '',
    ...(libraryGroupingFailures.length
      ? libraryGroupingFailures.map(marker => `- ❌ ${marker}`)
      : [
          '- ✅ Gesundheit & Medizin: Visiten, Vitalwerte, Medikation und Notfallblatt',
          '- ✅ Organisation & Dokumente: An-/Abwesenheit, Formulare und Stammdaten',
          '- ✅ Übergabe & Übersicht separat',
          '- ✅ Keine aktive Sammelgruppe „Weitere Bereiche“',
        ]),
    '',
  ];

  if (failedCases.length) {
    lines.push('## Fehlgeschlagene Routingfälle', '');
    for (const result of failedCases.slice(0, 50)) {
      lines.push(`- ❌ „${result.input}“ → erwartet ${result.expectedKind}/${result.expectedGuide || '-'}, erhalten ${result.actualKind}/${result.actualGuide || '-'}`);
    }
    lines.push('');
  } else {
    lines.push('## Ergebnis', '', '✅ Alle natürlichen Formulierungen wurden dem erwarteten Verhalten zugeordnet.', '');
  }

  return `${lines.join('\n')}\n`;
}

const caseResults = evaluateCases(routingCases, approvedGuides);
const sequences = sequenceResults();
const guideSlugs = new Set(approvedGuides.map(guide => guide.slug));
const guideFailures = REQUIRED_GUIDES.filter(slug => !guideSlugs.has(slug));
const workflowFailures = REQUIRED_WORKFLOW_MARKERS.filter(marker => !CONFIRMED_WORKFLOW_MIGRATION.includes(marker));
const libraryGroupingFailures = REQUIRED_LIBRARY_GROUP_MARKERS
  .filter(marker => !UI_POLISH.includes(marker))
  .map(marker => `Marker fehlt: ${marker}`);
if (/label:\s*'Weitere Bereiche'/.test(UI_POLISH)) libraryGroupingFailures.push('„Weitere Bereiche“ ist noch als aktive Gruppe definiert.');
if (/label:\s*'Visiten & Vitalwerte'/.test(UI_POLISH)) libraryGroupingFailures.push('„Visiten & Vitalwerte“ ist noch als aktive Gruppe definiert.');
const dataFailures = routingCases.filter(testCase => REAL_DATA_PATTERNS.some(pattern => pattern.test(testCase.input)));
const countFailure = routingCases.length !== expectedCaseCount || routingCases.length < 100;
const failedCases = caseResults.filter(result => !result.passed);
const failedSequences = sequences.filter(sequence => !sequence.passed);

await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/dokohilf-behavior-report.md',
  buildMarkdown(caseResults, sequences, guideFailures, dataFailures, workflowFailures, libraryGroupingFailures),
  'utf8',
);
await writeFile('artifacts/dokohilf-behavior-report.json', JSON.stringify({
  generatedAt: new Date().toISOString(),
  caseCount: routingCases.length,
  expectedCaseCount,
  passed: caseResults.length - failedCases.length,
  failed: failedCases.length,
  failedCases,
  sequences,
  missingRequiredGuides: guideFailures,
  missingConfirmedWorkflowMarkers: workflowFailures,
  libraryGroupingFailures,
  realDataFindings: dataFailures,
}, null, 2), 'utf8');

console.log(`DokoHilf: ${caseResults.length - failedCases.length}/${caseResults.length} Routingfälle bestanden.`);
console.log(`DokoHilf: ${sequences.length - failedSequences.length}/${sequences.length} Gesprächssequenzen bestanden.`);
console.log(`DokoHilf: ${REQUIRED_WORKFLOW_MARKERS.length - workflowFailures.length}/${REQUIRED_WORKFLOW_MARKERS.length} bestätigte Workflow-Marker vorhanden.`);
console.log(`DokoHilf: Bibliotheksgruppierung ${libraryGroupingFailures.length ? 'fehlerhaft' : 'bestanden'}.`);

if (countFailure || failedCases.length || failedSequences.length || guideFailures.length || workflowFailures.length || libraryGroupingFailures.length || dataFailures.length) {
  console.error('DokoHilf-Verhaltensprüfung fehlgeschlagen. Bericht siehe artifacts/.');
  process.exitCode = 1;
}
