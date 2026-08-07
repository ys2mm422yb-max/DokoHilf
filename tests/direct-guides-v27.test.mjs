import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, guides, css, worker, confirmed, mobileRule] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('assets/direct-guides-v27.js', 'utf8'),
  readFile('assets/direct-guides-chat-v27.css', 'utf8'),
  readFile('service-worker.js', 'utf8'),
  readFile('CONFIRMED_WORKFLOWS.md', 'utf8'),
  readFile('ACTIVE_WORK_MOBILE_CROSS_PLATFORM.md', 'utf8'),
]);

test('häufige Abläufe werden als sieben robuste Direktanleitungen übernommen', () => {
  const staticButtons = [...html.matchAll(/data-direct-guide="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(staticButtons, ['bericht', 'visite', 'vitalwerte', 'anwesenheit', 'medikation', 'formular']);
  assert.match(guides, /function ensureDirectWorkflowButtons\(\)/);
  assert.match(guides, /direct-guides-cross-platform/);
  assert.match(guides, /new MutationObserver/);
  assert.match(guides, /requestAnimationFrame\(syncPresentation\)/);
  assert.match(guides, /\['uebergabe', 'Übergabe anzeigen'\]/);
  assert.match(html, /direct-guides-v27\.js\?v=20260807-28/);
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

test('Schreibmodus bleibt kompakt und besitzt ausreichend große mobile Touchflächen', () => {
  assert.match(html, /class="chat-eyebrow">DokoHilf Chat/);
  assert.match(guides, /function ensureCompactChatCopy\(\)/);
  assert.match(guides, /heading\.textContent = 'Schreib deine Frage\.'/);
  assert.match(css, /\.chat-eyebrow/);
  assert.match(css, /quick-prompts button\{min-height:42px!important/);
  assert.match(css, /direct-guide-footer button\{min-height:48px/);
});

test('iOS und Android sind für diese mobile Änderung gleichberechtigte Freigabebedingung', () => {
  assert.match(mobileRule, /iOS und Android/);
  assert.match(mobileRule, /393 × 852/);
  assert.match(mobileRule, /412 × 915/);
  assert.match(css, /env\(safe-area-inset-left\)/);
  assert.match(css, /env\(safe-area-inset-right\)/);
});

test('PWA cached die Direkt-Guide-Logik innerhalb der aktuellen v28-3-Revision', () => {
  assert.match(worker, /HOTFIX_REVISION = '20260807-voice-guides-report-v28-3'/);
  assert.match(worker, /direct-guides-v27\.js\?v=20260807-28/);
  assert.match(worker, /direct-guides-chat-v27\.css\?v=20260807-28/);
});
