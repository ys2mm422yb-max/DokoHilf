import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [
  installJs,
  installCss,
  index,
  worker,
  versionRaw,
  library,
  aiRouter,
  conversationRouter,
  extraRaw,
  stuckRaw,
  migration,
  discovery,
  uiPolish,
  ux,
] = await Promise.all([
  read('assets/pwa-install-v69.js'),
  read('assets/pwa-install-v69.css'),
  read('index.html'),
  read('service-worker.js'),
  read('version.json'),
  read('assets/guide-library-v29.js'),
  read('supabase/functions/dokohilf-ai-router/index.ts'),
  read('supabase/functions/dokohilf-conversation-router/index.ts'),
  read('assets/voice-extra-catalog-v28.json'),
  read('assets/voice-context-stuck-catalog-v48.json'),
  read('supabase/migrations/20260904113000_natural_dateiablage_help_v69.sql'),
  read('assets/guide-discovery-v53.js'),
  read('assets/ui-polish-v35.js'),
  read('assets/ux-v27.js'),
]);

const version = JSON.parse(versionRaw);
const extraTexts = JSON.parse(extraRaw).entries.map(entry => entry.text);
const stuckTexts = JSON.parse(stuckRaw).entries.map(entry => entry.text);

test('v69-Installationsbereich bleibt im aktuellen v36/v70-Release in App-Shell und Offline-Cache erhalten', () => {
  assert.equal(version.appVersion, 'v36');
  assert.equal(version.buildId, '20260905-44');
  assert.equal(version.release, 'chat-guide-back-dictation-v70');
  assert.match(index, /pwa-install-v69\.css\?v=20260905-44/);
  assert.match(index, /pwa-install-v69\.js\?v=20260905-44/);
  assert.match(worker, /pwa-install-v69\.css\?v=20260905-44/);
  assert.match(worker, /pwa-install-v69\.js\?v=20260905-44/);
  assert.match(worker, /PWA_INSTALL_REVISION = '20260904-pwa-install-v69-1'/);
});

test('Android nutzt den echten Browserprompt und iOS zeigt die offiziellen manuellen Schritte', () => {
  assert.match(installJs, /window\.addEventListener\('beforeinstallprompt', captureInstallPrompt\)/);
  assert.match(installJs, /event\.preventDefault\(\)/);
  assert.match(installJs, /await promptEvent\.prompt\(\)/);
  assert.match(installJs, /await promptEvent\.userChoice/);
  assert.match(installJs, /window\.addEventListener\('appinstalled'/);
  assert.match(installJs, /display-mode: standalone/);
  assert.match(installJs, /navigator\.standalone === true/);
  for (const expected of ['Safari', '„Teilen“', '„Zum Home-Bildschirm“', '„Als Web-App öffnen“', '„Hinzufügen“']) {
    assert.ok(installJs.includes(expected), expected);
  }
  for (const expected of ['Chrome', 'Drei-Punkte-Menü', '„App installieren“', '„Zum Startbildschirm hinzufügen“']) {
    assert.ok(installJs.includes(expected), expected);
  }
  assert.match(installCss, /\.app-shell:not\(\[data-mode="start"\]\) \.pwa-install-v69/);
  assert.doesNotMatch(installJs, /localStorage|sessionStorage|indexedDB|document\.cookie/);
});

test('allgemeiner Durchführungsnachweis endet auch in der Bibliothek nach dem bestätigten Öffnen', () => {
  const start = library.indexOf("'durchfuehrungsnachweis-oeffnen': {\n      title:");
  const end = library.indexOf('\n    stammdaten:', start);
  const block = library.slice(start, end);
  assert.ok(start >= 0 && end > start, 'DNF-Bibliotheksblock fehlt');
  assert.match(block, /steps: \['„Doku“ öffnen\.', '„Durchführungsnachweis“ wählen\.'\]/);
  assert.doesNotMatch(block, /gewünschten Eintrag|gewünschte Funktion/);
});

test('Sprachrouter geben jeden bestätigten Schritt vollständig statt mitten im Wort gekürzt aus', () => {
  for (const source of [aiRouter, conversationRouter]) {
    const spoken = source.match(/function spokenStep[\s\S]*?\n\}/)?.[0] || '';
    assert.ok(spoken, 'spokenStep fehlt');
    assert.match(spoken, /replace\(\/\\s\+\/g, ' '\)\.trim\(\)/);
    assert.doesNotMatch(spoken, /slice\(/);
  }
});

test('hörbare Hilfetexte sind natürlich formuliert und bleiben innerhalb der bestätigten Grenzen', () => {
  assert.ok(extraTexts.includes('Beim gewünschten Bewohner kannst du Vitalwerte entweder über Doku und danach Vitalwerte oder über Doku-Erweitert und danach Vitalwerte öffnen. Beide Wege führen zum selben Bereich.'));
  assert.ok(extraTexts.includes('Beim gewünschten Bewohner kannst du An-/Abwesenheiten entweder über Doku oder über Doku-Erweitert öffnen. Beide Wege führen zum selben Bereich.'));
  assert.ok(stuckTexts.includes('Bleibe in der Dateiablage. Wenn das gewünschte Dokument nicht angezeigt wird, frag bitte kurz im Team, ob und wo es abgelegt ist.'));
  assert.ok(!stuckTexts.some(text => text.includes('ist nicht bestätigt, dass es dort hinterlegt ist')));
  assert.match(migration, /where slug = 'dateiablage'/);
  assert.match(migration, /ändert nur die Wortlaut|changes only the wording/i);
  assert.doesNotMatch(migration, /insert into|delete from|drop table|alter table/i);
});

test('sichtbare Systemtexte sprechen verständlich statt in interner Freigabesprache', () => {
  assert.match(discovery, /Keine passende Anleitung gefunden/);
  assert.match(discovery, /DokoHilf startet diese Anleitung im Chat/);
  assert.doesNotMatch(discovery, /Keine passende freigegebene Anleitung|denselben bestätigten Ablauf/);
  assert.match(uiPolish, /Weitere Bedienwege/);
  assert.match(uiPolish, /Anleitungen werden noch ergänzt/);
  assert.match(ux, /DokoHilf antwortet mit der integrierten DokoHilf-Stimme/);
  assert.match(aiRouter, /const fallback = 'Okay\. Was siehst du gerade\?'/);
  assert.match(aiRouter, /Dazu habe ich keine passende Anleitung\. Frag bitte kurz eine Kollegin oder einen Kollegen/);
  assert.doesNotMatch(aiRouter, /noch keine genauere Positionsangabe bestätigt|Ich erfinde keinen alternativen Klickweg/);
});