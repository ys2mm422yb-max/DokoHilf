import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [source, syncSource, apply, build] = await Promise.all([
  readFile(new URL('../assets/detail-help-polish-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../assets/detail-help-render-sync-v27.js', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/apply-detail-help-v27.mjs', import.meta.url), 'utf8'),
  readFile(new URL('../scripts/build-static-site-v27.sh', import.meta.url), 'utf8'),
]);

test('legacy device fallback stays available only outside the v28 local voice path', () => {
  assert.match(source, /const DEVICE_FALLBACK_MS = 160;/);
  assert.match(source, /deviceFallbackResponse\(\)/);
  assert.match(source, /Promise\.race\(\[cloud, fallback\]\)/);
  assert.match(source, /&& !localVoiceV28\(\)/);
  assert.match(source, /deviceFallbackMs: localVoiceV28\(\) \? null : DEVICE_FALLBACK_MS/);
  assert.match(source, /data-local-voice-only/);
});

test('Detailhilfe zeigt kurze nutzernahe Texte statt interner Zustandsformulierungen', () => {
  assert.match(source, /Okay\. Schau oben in die grüne Reiterleiste\. Siehst du \*\*Doku-Erweitert\*\*\?/);
  assert.match(source, /Suche in \*\*Doku-Erweitert\*\* nach \*\*Vitalwerte\*\*/);
  assert.match(source, /Okay\. Was siehst du gerade\?/);
  assert.doesNotMatch(source, /tun \*\*nicht\*\* so, als wäre er erledigt/);
  assert.doesNotMatch(source, /Ich markiere noch keinen Schritt als erledigt/);
});

test('Bereits gerenderte Detailhilfe-Buttons werden wirklich und idempotent auf kurze Labels synchronisiert', () => {
  assert.match(syncSource, /'area-open': 'Doku-Erweitert offen'/);
  assert.match(syncSource, /'other-page': 'Anderer Reiter \/ andere Seite'/);
  assert.match(syncSource, /span\.textContent !== label/);
  assert.match(syncSource, /button\.dataset\.detailHelpLabel !== label/);
  assert.match(syncSource, /if \(small\) small\.remove\(\)/);
  assert.match(syncSource, /MutationObserver/);
  assert.match(syncSource, /__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__/);
});

test('Voice-Detailhilfe ist kompakt und blendet konkurrierende Aktionen aus', () => {
  assert.match(source, /grid-template-columns:1fr 1fr!important/);
  assert.match(source, /\.voice-orb\{width:96px!important;height:96px!important/);
  assert.match(source, /\.voice-focus-actions\{display:none!important\}/);
  assert.match(source, /\.voice-copy>span:not\(\.voice-engine-badge\)\{display:none!important\}/);
  assert.match(source, /\.pause-button\{display:none!important\}/);
});

test('Release keeps detail help around the v28-3 static-first voice load order', () => {
  assert.match(apply, /localVoiceIndex < experienceIndex && experienceIndex < polishIndex && polishIndex < syncIndex && syncIndex < gateIndex/);
  assert.match(apply, /20260807-voice-guides-report-v28-3/);
  assert.match(apply, /detail-help-polish-v27\.js/);
  assert.match(apply, /detail-help-render-sync-v27\.js/);
  assert.match(build, /detail-help-polish-v27\.js/);
  assert.match(build, /detail-help-render-sync-v27\.js/);
  assert.match(build, /20260807-voice-guides-report-v28-3/);
});
