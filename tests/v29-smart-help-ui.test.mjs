import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('v29 build is cache-busted consistently and version badge starts hidden', async () => {
  const [html, version, worker, runtime, gate] = await Promise.all([
    read('index.html'),
    read('version.json'),
    read('service-worker.js'),
    read('assets/local-voice-v28.js'),
    read('assets/local-voice-gate-v28.js'),
  ]);
  const buildId = JSON.parse(version).buildId;
  assert.equal(buildId, '20260809-34');
  assert.match(html, /KI · v29/);
  assert.match(html, /id="buildPill" type="button" hidden/);
  assert.match(html, new RegExp(`dokohilf-build" content="${buildId}`));
  assert.match(html, new RegExp(`v29-ui\\.js\\?v=${buildId}`));
  assert.match(html, new RegExp(`orientation-help-v29\\.js\\?v=${buildId}`));
  assert.match(html, new RegExp(`release-polish-v29\\.js\\?v=${buildId}`));
  assert.match(worker, new RegExp(`BUILD_ID = '${buildId}'`));
  assert.match(runtime, /on_device_voice_retired_static_supertonic_only/);
  assert.doesNotMatch(runtime, /Supertone\/supertonic-3\/resolve\/main|loadTextToSpeech|navigator\.gpu/);
  assert.match(gate, /guide-audio-catalog\.json\?v=\$\{encodeURIComponent\(BUILD_ID\)\}/);
  assert.match(gate, /dokohilf-static-supertonic-audio-v29-2/);
  assert.match(gate, /static-supertonic-only-v29/);
  assert.doesNotMatch(gate, /IOS_LOCAL_TIMEOUT_MS|localFallback|DokoHilfLocalVoiceV28\.synthesize/);
});

test('free-text help and the help button keep the same contextual router path', async () => {
  const [smart, detail, router] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('assets/detail-help-v27.js'),
    read('supabase/functions/dokohilf-chat-router/index.ts'),
  ]);
  assert.match(smart, /ich brauche hilfe/);
  assert.match(smart, /ich weiss nicht/);
  assert.match(smart, /keine ahnung/);
  assert.match(smart, /was meinst du/);
  assert.match(smart, /smartHelpIntent: true/);
  assert.match(detail, /__DOKOHILF_CONTEXTUAL_HELP_V29__/);
  assert.match(router, /smartHelpIntent/);
  assert.match(router, /approved-guide-context-help-v29-4/);
  assert.doesNotMatch(smart, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(detail, /localStorage|sessionStorage|indexedDB/);
});

test('explicit location questions route to dedicated area-finding guides', async () => {
  const [smart, oldMigration, greenMigration] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('supabase/migrations/20260809112500_later_guides_stammdaten_v29.sql'),
    read('supabase/migrations/20260809125500_green_navigation_hierarchy_v29.sql'),
  ]);
  assert.match(smart, /function isLocationQuestion\(text\)/);
  for (const slug of [
    'berichte-finden',
    'doku-erweitert-finden',
    'doku-finden',
    'visiten-finden',
    'vitalwerte-finden',
    'anwesenheiten-finden',
    'medikation-finden',
    'formulare-finden',
    'durchfuehrungsnachweis-finden',
    'analyse-finden',
    'uebergabe-finden',
    'notfallblatt-finden',
    'stammdaten-finden',
  ]) {
    assert.match(smart, new RegExp(`return '${slug}'`));
    assert.match(oldMigration, new RegExp(`'${slug}'`));
  }
  assert.match(smart, /return 'planung-finden'/);
  assert.match(greenMigration, /'planung-finden'/);
  assert.match(greenMigration, /feste grüne Hauptleiste/);
  assert.match(greenMigration, /Direkt darunter erscheinen/);
  assert.match(greenMigration, /Der genaue Easy-Plan-Ablauf bleibt fachlich offen/);
  assert.doesNotMatch(smart, /return 'aufgaben-aktuelles'|return 'easyplan'|return 'berichtssuche'/);
});

test('Bedarfsmedikation, Wirksamkeitskontrolle und Maßnahmen ohne Zeitangabe route deterministically', async () => {
  const [smart, orientation, direct, migration, speech, clarityMigration] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('assets/orientation-help-v29.js'),
    read('assets/durchfuehrungs-workflows-v29.js'),
    read('supabase/migrations/20260809124000_bedarfsmedikation_massnahmen_v29.sql'),
    read('assets/voice-durchfuehrung-catalog-v29.json'),
    read('supabase/migrations/20260809143000_guide_clarity_handover_v29.sql'),
  ]);

  for (const slug of [
    'bedarfsmedikation-gabe',
    'bedarfsmedikation-wirksamkeitskontrolle',
    'bedarfsmedikation-finden',
    'bedarfsmedikation-wirksamkeitskontrolle-finden',
    'massnahmen-ohne-zeitangabe',
    'massnahmen-ohne-zeitangabe-finden',
  ]) assert.match(migration, new RegExp(`'${slug}'`));

  assert.match(smart, /return 'bedarfsmedikation-gabe'/);
  assert.match(smart, /return 'bedarfsmedikation-wirksamkeitskontrolle'/);
  assert.match(smart, /return 'bedarfsmedikation-finden'/);
  assert.match(smart, /return 'bedarfsmedikation-wirksamkeitskontrolle-finden'/);
  assert.match(smart, /return 'massnahmen-ohne-zeitangabe'/);
  assert.match(smart, /return 'massnahmen-ohne-zeitangabe-finden'/);

  assert.match(orientation, /kleinen Pfeil links daneben/);
  assert.match(orientation, /automatisch erzeugte Wirksamkeitskontrolle/);
  assert.match(orientation, /Bereich Maßnahmen ohne Zeitangabe/);

  assert.match(direct, /rechts im kleinen Kästchen den Haken/);
  assert.match(direct, /Verordnung selbst nicht verändern/);
  assert.match(direct, /Wirksamkeitskontrolle automatisch.*angelegt/s);
  assert.match(direct, /„Klienten-Team Sitzung“ oder „Krise“/);
  assert.match(direct, /Wichtig für Schichtübergabe/);
  assert.match(direct, /Textfeld darunter/);
  assert.match(direct, /Pop-up-Fenster/);
  assert.doesNotMatch(direct, /Unter „Was war“/i);
  assert.match(direct, /unten mit „OK“ bestätigen/);
  assert.match(clarityMigration, /Wichtig für Schichtübergabe/);
  assert.match(clarityMigration, /große Textfeld darunter/);
  assert.match(speech, /Bedarfsmedikation/);
  assert.match(speech, /Wirksamkeitskontrolle/);
  assert.match(speech, /Maßnahmen ohne Zeitangabe/);
});

test('nested orientation explains green top bar and child symbols', async () => {
  const [orientation, navigationSpeech, confirmed] = await Promise.all([
    read('assets/orientation-help-v29.js'),
    read('assets/voice-navigation-catalog-v29.json'),
    read('CONFIRMED_WORKFLOWS.md'),
  ]);
  assert.match(orientation, /feste grüne Leiste/);
  assert.match(orientation, /Planung und Analyse/);
  assert.match(orientation, /Unterpunkte beziehungsweise Symbole/);
  assert.match(orientation, /Doku-Erweitert.*Vitalwerte/s);
  assert.match(orientation, /Doku-Erweitert.*Visiten/s);
  assert.match(orientation, /Doku-Erweitert.*Medikation/s);
  assert.match(orientation, /Doku-Erweitert.*Formulare/s);
  assert.match(orientation, /Doku-Erweitert.*An-\/Abwesenheiten/s);
  assert.match(orientation, /Doku.*Durchführungsnachweis/s);
  assert.match(orientation, /Analyse.*Was war los/s);
  assert.match(orientation, /Planung ist ein Hauptbereich ganz oben/);
  assert.match(orientation, /Notfallblatt aufrufen/);
  assert.match(orientation, /Doppelklicke dort auf den gewünschten Bewohner/);
  assert.match(orientation, /Der genaue Easy-Plan-Ablauf bleibt vorerst offen/);
  assert.doesNotMatch(orientation, /Berichtssuche|Aufgaben · Aktuelles/);
  assert.match(navigationSpeech, /Ganz oben in der festen grünen Leiste/);
  assert.match(navigationSpeech, /Planung ist ein Hauptbereich/);
  assert.match(confirmed, /feste grüne Hauptleiste/);
  assert.match(confirmed, /direkt darunter die zu diesem Bereich gehörenden Symbole beziehungsweise Funktionen/);
});

test('active-guide help keeps the guide and approved area details', async () => {
  const migration = await read('supabase/migrations/20260809120500_contextual_area_stuck_help_v29.sql');
  for (const slug of [
    'visite-anlegen',
    'anwesenheit',
    'medikation-ansehen',
    'formulare-anlegen',
    'vitalwerte-einzelwert',
    'vitalwerte-sammelerfassung',
    'durchfuehrung-storno',
    'uebergabeformular',
    'notfallblatt',
  ]) assert.match(migration, new RegExp(`where slug = '${slug}'`));
  assert.match(migration, /Doku-Erweitert.*festen Leiste/);
  assert.match(migration, /wähle danach „Visiten“/);
  assert.match(migration, /wähle darin „An-\/Abwesenheiten“/);
  assert.match(migration, /wähle darin „Medikation“/);
  assert.match(migration, /wähle darin „Formulare“/);
  assert.match(migration, /wähle darin „Vitalwerte“/);
  assert.match(migration, /Vitalwerte Sammelerf\./);
  assert.match(migration, /„Doku“.*festen Leiste/);
  assert.match(migration, /Reiter „Analyse“ findest du oben/);
  assert.match(migration, /„Was war los\?“/);
  assert.match(migration, /„Notfallblatt aufrufen“/);
});

test('Hallo ich suche den Blutdruck keeps the approved single-value task intent', async () => {
  const [smart, router] = await Promise.all([
    read('assets/smart-help-v29.js'),
    read('supabase/functions/dokohilf-chat-router/index.ts'),
  ]);
  assert.match(smart, /blutdruck\|puls\|temperatur/);
  assert.match(smart, /!isLocationQuestion\(n\)\) return 'vitalwerte-einzelwert'/);
  assert.match(smart, /selectedGuideSlug/);
  assert.match(router, /selectedGuideSlug/);
  assert.match(router, /approved-guide-smart-start-v29-1/);
});

test('v29 redesign covers home, written chat and distinct voice states', async () => {
  const [css, ui, html, version] = await Promise.all([
    read('assets/v29-ui.css'),
    read('assets/v29-ui.js'),
    read('index.html'),
    read('version.json'),
  ]);
  const buildId = JSON.parse(version).buildId;
  assert.match(html, new RegExp(`assets\\/v29-ui\\.css\\?v=${buildId}`));
  assert.match(html, new RegExp(`assets\\/smart-help-v29\\.js\\?v=${buildId}`));
  assert.match(html, new RegExp(`assets\\/v29-ui\\.js\\?v=${buildId}`));
  assert.match(css, /\.start-copy:before/);
  assert.match(css, /\.mode-card:before/);
  assert.match(css, /\.chat-head:after/);
  assert.match(css, /data-voice-state="listening"/);
  assert.match(css, /data-voice-state="thinking"/);
  assert.match(css, /data-voice-state="speaking"/);
  assert.match(css, /@keyframes v29ListeningRing/);
  assert.match(css, /@keyframes v29ThinkSpin/);
  assert.match(css, /@keyframes v29VoiceBar/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(ui, /Frühere Nachrichten anzeigen/);
  assert.match(ui, /Was möchtest du erledigen\?/);
  assert.doesNotMatch(ui, /localStorage|sessionStorage|indexedDB/);
});

test('v29 mutation synchronization is idempotent and cannot feed its own observer', async () => {
  const ui = await read('assets/v29-ui.js');
  assert.match(ui, /if \(heading && heading\.textContent !== headingText\) heading\.textContent = headingText/);
  assert.match(ui, /if \(copy && copy\.textContent !== copyText\) copy\.textContent = copyText/);
  assert.match(ui, /if \(!button\.hidden\) button\.hidden = true/);
  assert.match(ui, /if \(button\.hidden !== shouldHide\) button\.hidden = shouldHide/);
  assert.match(ui, /if \(button\.textContent !== desiredText\) button\.textContent = desiredText/);
  assert.match(ui, /new MutationObserver\(scheduleSync\).*attributeFilter: \['hidden', 'data-mode'\]/s);
});

test('legacy v27 presentation yields to the v29 home and chat owner', async () => {
  const experience = await read('assets/experience-v27.js');
  assert.match(experience, /function v29OwnsPresentation\(\)/);
  assert.match(experience, /window\.__DOKOHILF_UI_V29__ === true/);
  assert.match(experience, /examples\?\.dataset\.v29GuideLibrary === 'true'/);
  assert.match(experience, /examples\.dataset\.v27Ready === 'direct-guides-cross-platform'/);
  assert.match(experience, /if \(v29OwnsPresentation\(\)\) return/);
  assert.match(experience, /window\.addEventListener\('pageshow', initialize\)/);
});

test('service worker source keeps new UI, orientation and static audio only', async () => {
  const worker = await read('service-worker.js');
  for (const asset of [
    'assets/v29-ui.css',
    'assets/v29-ui.js',
    'assets/smart-help-v29.js',
    'assets/orientation-help-v29.js',
    'assets/release-polish-v29.js',
    'assets/direct-guide-copy-v29.js',
  ]) assert.ok(worker.includes(asset), `${asset} fehlt im Service Worker`);
  assert.match(worker, /dokohilf-static-supertonic-audio-v29-2/);
  assert.match(worker, /caches\.delete\('dokohilf-local-voice-model-v28-1'\)/);
  assert.doesNotMatch(worker, /LOCAL_VOICE_MODEL_CACHE/);
  assert.doesNotMatch(worker, /vendor\/supertonic-web-v28/);
});

test('version is moved to the footer and update notice stays visible', async () => {
  const polish = await read('assets/release-polish-v29.js');
  assert.match(polish, /UPDATE_NOTICE_MS = 10000/);
  assert.match(polish, /footer-version-wrap/);
  assert.match(polish, /pill\.classList\.remove\('build-pill'\)/);
  assert.match(polish, /Konzept & Umsetzung · MT/);
  assert.match(polish, /DokoHilf wurde aktualisiert/);
});
