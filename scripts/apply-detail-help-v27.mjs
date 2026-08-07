import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BUILD_ID = '20260807-28';
const REVISION = '20260807-local-natural-voice-v28-1';
const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const workerPath = resolve(root, 'service-worker.js');

let html = await readFile(htmlPath, 'utf8');
const helpScriptTag = `  <script src="assets/detail-help-v27.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/detail-help-v27.js')) {
  const marker = `  <script src="assets/clarification-ui.js?v=${BUILD_ID}"></script>`;
  if (!html.includes(marker)) throw new Error('clarification-ui marker fehlt in index.html');
  html = html.replace(marker, `${marker}\n${helpScriptTag}`);
}
if (!html.includes(helpScriptTag.trim())) throw new Error('Detailhilfe konnte nicht in index.html aktiviert werden.');

const polishScriptTag = `  <script src="assets/detail-help-polish-v27.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/detail-help-polish-v27.js')) {
  const marker = `  <script src="assets/experience-v27.js?v=${BUILD_ID}"></script>`;
  if (!html.includes(marker)) throw new Error('experience-v27 marker fehlt in index.html');
  html = html.replace(marker, `${marker}\n${polishScriptTag}`);
}
if (!html.includes(polishScriptTag.trim())) throw new Error('Detailhilfe-Polish konnte nicht in index.html aktiviert werden.');

const syncScriptTag = `  <script src="assets/detail-help-render-sync-v27.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/detail-help-render-sync-v27.js')) {
  if (!html.includes(polishScriptTag)) throw new Error('Polish marker fehlt in index.html');
  html = html.replace(polishScriptTag, `${polishScriptTag}\n${syncScriptTag}`);
}
if (!html.includes(syncScriptTag.trim())) throw new Error('Detailhilfe-Render-Sync konnte nicht in index.html aktiviert werden.');

const clarificationIndex = html.indexOf(`assets/clarification-ui.js?v=${BUILD_ID}`);
const helpIndex = html.indexOf(`assets/detail-help-v27.js?v=${BUILD_ID}`);
const progressIndex = html.indexOf(`assets/guide-progress.js?v=${BUILD_ID}`);
const localVoiceIndex = html.indexOf(`assets/local-voice-v28.js?v=${BUILD_ID}`);
const experienceIndex = html.indexOf(`assets/experience-v27.js?v=${BUILD_ID}`);
const polishIndex = html.indexOf(`assets/detail-help-polish-v27.js?v=${BUILD_ID}`);
const syncIndex = html.indexOf(`assets/detail-help-render-sync-v27.js?v=${BUILD_ID}`);
const gateIndex = html.indexOf(`assets/local-voice-gate-v28.js?v=${BUILD_ID}`);
if (!(clarificationIndex >= 0 && clarificationIndex < helpIndex && helpIndex < progressIndex)) {
  throw new Error('Detailhilfe muss nach Clarification und vor Guide-Progress geladen werden.');
}
if (!(localVoiceIndex >= 0 && localVoiceIndex < experienceIndex && experienceIndex < polishIndex && polishIndex < syncIndex && syncIndex < gateIndex)) {
  throw new Error('Lokale Stimme, Experience, Detailhilfe-Polish, Render-Sync und finaler Voice-Gate sind falsch sortiert.');
}
await writeFile(htmlPath, html);

let worker = await readFile(workerPath, 'utf8');
worker = worker
  .replace(/const HOTFIX_REVISION = '[^']+';/, `const HOTFIX_REVISION = '${REVISION}';`);

const helpAssetLine = `  './assets/detail-help-v27.js?v=${BUILD_ID}',`;
if (!worker.includes(helpAssetLine)) {
  const marker = `  './assets/clarification-ui.js?v=${BUILD_ID}',`;
  if (!worker.includes(marker)) throw new Error('clarification-ui marker fehlt im Service Worker');
  worker = worker.replace(marker, `${marker}\n${helpAssetLine}`);
}

const polishAssetLine = `  './assets/detail-help-polish-v27.js?v=${BUILD_ID}',`;
if (!worker.includes(polishAssetLine)) {
  const marker = `  './assets/experience-v27.js?v=${BUILD_ID}',`;
  if (!worker.includes(marker)) throw new Error('experience-v27 marker fehlt im Service Worker');
  worker = worker.replace(marker, `${marker}\n${polishAssetLine}`);
}

const syncAssetLine = `  './assets/detail-help-render-sync-v27.js?v=${BUILD_ID}',`;
if (!worker.includes(syncAssetLine)) {
  if (!worker.includes(polishAssetLine)) throw new Error('Polish asset marker fehlt im Service Worker');
  worker = worker.replace(polishAssetLine, `${polishAssetLine}\n${syncAssetLine}`);
}

if (!worker.includes(`HOTFIX_REVISION = '${REVISION}'`) || !worker.includes(helpAssetLine) || !worker.includes(polishAssetLine) || !worker.includes(syncAssetLine)) {
  throw new Error('Detailhilfe, Voice-Polish und Render-Sync konnten nicht in den Service Worker aufgenommen werden.');
}
await writeFile(workerPath, worker);

console.log(`DokoHilf detail help + local voice release applied: ${REVISION}`);
