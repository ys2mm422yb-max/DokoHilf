import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, guides, css, worker, confirmed] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('assets/direct-guides-v27.js', 'utf8'),
  readFile('assets/ux-v27.css', 'utf8'),
  readFile('service-worker.js', 'utf8'),
  readFile('CONFIRMED_WORKFLOWS.md', 'utf8'),
]);

test('häufige Abläufe werden nach dem alten Build-27-Pass als sieben Direktanleitungen übernommen', () => {
  const staticButtons = [...html.matchAll(/data-direct-guide="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(staticButtons, ['bericht', 'visite', 'vitalwerte', 'anwesenheit', 'medikation', 'formular']);
  assert.match(guides, /function ensureDirectWorkflowButtons\(\)/);
  assert.match(guides, /data-direct-guide="bericht"/);
  assert.match(guides, /data-direct-guide="visite"/);
  assert.match(guides, /data-direct-guide="vitalwerte"/);
  assert.match(guides, /data-direct-guide="anwesenheit"/);
  assert.match(guides, /data-direct-guide="medikation"/);
  assert.match(guides, /data-direct-guide="formular"/);
  assert.match(guides, /data-direct-guide="uebergabe"/);
  assert.match(guides, /Häufige Abläufe · direkt öffnen/);
  assert.match(html, /direct-guides-v27\.js\?v=20260806-27/);
});

test('direkte Bericht- und Visitenanleitungen entsprechen der bestätigten Fachquelle', () => {
  assert.match(confirmed, /## Bericht anlegen/);
  assert.match(guides, /title: 'Bericht anlegen'/);
  assert.match(guides, /Das rote X entfernt nur die Protokollverknüpfung, nicht den Bericht/);
  assert.match(guides, /Mit „OK“ bestätigen und den neuen Eintrag kontrollieren/);
  assert.match(confirmed, /## Visite oder Sprechstunde dokumentieren/);
  assert.match(guides, /title: 'Visite anlegen'/);
  assert.match(guides, /Im Fenster „Klienten auswählen“ den Bewohner auswählen/);
  assert.match(guides, /Visiten werden hier immer als „durchgeführt“ dokumentiert – niemals als „abgeschlossen“/);
  assert.match(guides, /„Mitarbeiter“ bleibt auf „ohne Mitarbeiter“ beziehungsweise leer/);
});

test('Vitalwerte verzweigen nur in die zwei bestätigten Varianten', () => {
  assert.match(guides, /if \(key === 'vitalwerte'\) return renderVitalChoice\(\)/);
  assert.match(guides, /data-direct-guide-variant="vitalEinzel"/);
  assert.match(guides, /data-direct-guide-variant="vitalSammel"/);
  assert.match(guides, /„Vitalwerte“ und „Vitalwerte Sammelerf\.“ sind zwei getrennte Menüeinträge/);
  assert.match(confirmed, /## Einzelnen Vitalwert erfassen/);
  assert.match(confirmed, /## Mehrere Vitalwerte erfassen/);
});

test('Übergabe ist als vollständige bestätigte Direktanleitung enthalten', () => {
  assert.match(confirmed, /## Übergabe anzeigen/);
  assert.match(guides, /title: 'Übergabe anzeigen'/);
  assert.match(guides, /Oben den Reiter „Analyse“ öffnen/);
  assert.match(guides, /Dort „Was war los\?“ wählen/);
  assert.match(guides, /Oben links „Alle anzeigen“ anklicken/);
  assert.match(guides, /Danach „Alles ausklappen“ wählen/);
});

test('sicherheitskritische Direktanleitungen behalten ihre harten Regeln', () => {
  assert.match(guides, /„Bis“ leer lassen und niemals schätzen/);
  assert.match(guides, /Medikamentenübersicht ausschließlich ansehen/);
  assert.match(guides, /nichts ändern, pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen/);
  assert.match(confirmed, /Bis leer lassen und niemals schätzen/);
  assert.match(confirmed, /Medikation ansehen/);
});

test('direkte Anleitung hat eigenen Modus und versteckt Chat sowie Composer', () => {
  assert.match(guides, /elements\.shell\.dataset\.mode = 'direct-guide'/);
  assert.match(guides, /elements\.workspace\.hidden = true/);
  assert.match(guides, /elements\.composer\.hidden = true/);
  assert.match(guides, /direct-guide-step/);
  assert.match(css, /data-mode="direct-guide"/);
  assert.match(css, /\.direct-guide-steps/);
  assert.match(css, /\.direct-guide-choices/);
});

test('Schreibmodus bleibt trotz älterem Experience-Pass als kompakter eigenständiger Chat gestaltet', () => {
  assert.match(html, /class="chat-eyebrow">DokoHilf Chat/);
  assert.match(guides, /function ensureCompactChatCopy\(\)/);
  assert.match(guides, /heading\.textContent = 'Schreib deine Frage\.'/);
  assert.match(css, /Der Chat erhält eine klare eigene Gesprächsfläche/);
  assert.match(css, /\.chat-eyebrow/);
  assert.match(css, /chat-head h1\{margin:0!important;font-size:clamp\(30px,6vw,40px\)/);
  assert.match(css, /conversation\{width:100%!important;max-width:none!important;min-height:128px!important/);
});

test('PWA cached die neue direkte Guide-Logik und trägt eine neue Revision', () => {
  assert.match(worker, /HOTFIX_REVISION = '20260807-direct-guides-chat-2'/);
  assert.match(worker, /direct-guides-v27\.js\?v=20260806-27/);
});
