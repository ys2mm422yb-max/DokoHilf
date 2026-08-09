import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const REVISION = '20260809-static-supertonic-orientation-ui-v29-3';
const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const workerPath = resolve(root, 'service-worker.js');
const appPath = resolve(root, 'assets/app.js');
const localVoiceGatePath = resolve(root, 'assets/local-voice-gate-v28.js');
const versionPath = resolve(root, 'version.json');
const BUILD_ID = JSON.parse(await readFile(versionPath, 'utf8')).buildId;
if (!BUILD_ID) throw new Error('buildId fehlt in version.json');

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

const contextVoiceHotfixTag = `  <script src="assets/context-voice-hotfix-v28.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/context-voice-hotfix-v28.js')) {
  if (!html.includes(syncScriptTag)) throw new Error('Render-Sync marker fehlt in index.html');
  html = html.replace(syncScriptTag, `${syncScriptTag}\n${contextVoiceHotfixTag}`);
}
if (!html.includes(contextVoiceHotfixTag.trim())) throw new Error('Kontext-Hotfix konnte nicht in index.html aktiviert werden.');

const orientationScriptTag = `  <script src="assets/orientation-help-v29.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/orientation-help-v29.js')) {
  const marker = `  <script src="assets/guide-progress.js?v=${BUILD_ID}"></script>`;
  if (!html.includes(marker)) throw new Error('guide-progress marker fehlt in index.html');
  html = html.replace(marker, `${marker}\n${orientationScriptTag}`);
}
if (!html.includes(orientationScriptTag.trim())) throw new Error('Orientierungshilfe konnte nicht in index.html aktiviert werden.');

const releasePolishTag = `  <script src="assets/release-polish-v29.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/release-polish-v29.js')) {
  if (!html.includes(orientationScriptTag)) throw new Error('Orientierungsmarker fehlt in index.html');
  html = html.replace(orientationScriptTag, `${orientationScriptTag}\n${releasePolishTag}`);
}
if (!html.includes(releasePolishTag.trim())) throw new Error('Release-Polish konnte nicht in index.html aktiviert werden.');

const durchfuehrungWorkflowsTag = `  <script src="assets/durchfuehrungs-workflows-v29.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/durchfuehrungs-workflows-v29.js')) {
  if (!html.includes(releasePolishTag)) throw new Error('Release-Polish-Marker fehlt in index.html');
  html = html.replace(releasePolishTag, `${releasePolishTag}\n${durchfuehrungWorkflowsTag}`);
}
if (!html.includes(durchfuehrungWorkflowsTag.trim())) throw new Error('Durchführungs-Workflows konnten nicht in index.html aktiviert werden.');

const clarificationIndex = html.indexOf(`assets/clarification-ui.js?v=${BUILD_ID}`);
const helpIndex = html.indexOf(`assets/detail-help-v27.js?v=${BUILD_ID}`);
const progressIndex = html.indexOf(`assets/guide-progress.js?v=${BUILD_ID}`);
const orientationIndex = html.indexOf(`assets/orientation-help-v29.js?v=${BUILD_ID}`);
const releasePolishIndex = html.indexOf(`assets/release-polish-v29.js?v=${BUILD_ID}`);
const durchfuehrungWorkflowsIndex = html.indexOf(`assets/durchfuehrungs-workflows-v29.js?v=${BUILD_ID}`);
const localVoiceIndex = html.indexOf(`assets/local-voice-v28.js?v=${BUILD_ID}`);
const experienceIndex = html.indexOf(`assets/experience-v27.js?v=${BUILD_ID}`);
const polishIndex = html.indexOf(`assets/detail-help-polish-v27.js?v=${BUILD_ID}`);
const syncIndex = html.indexOf(`assets/detail-help-render-sync-v27.js?v=${BUILD_ID}`);
const contextVoiceHotfixIndex = html.indexOf(`assets/context-voice-hotfix-v28.js?v=${BUILD_ID}`);
const gateIndex = html.indexOf(`assets/local-voice-gate-v28.js?v=${BUILD_ID}`);
if (!(clarificationIndex >= 0 && clarificationIndex < helpIndex && helpIndex < progressIndex)) throw new Error('Detailhilfe muss nach Clarification und vor Guide-Progress geladen werden.');
if (!(progressIndex < orientationIndex && orientationIndex < releasePolishIndex && releasePolishIndex < durchfuehrungWorkflowsIndex && durchfuehrungWorkflowsIndex < localVoiceIndex)) throw new Error('Orientierung, Release-Polish und Durchführungs-Workflows müssen vor dem statischen Voice-Gate geladen werden.');
if (!(localVoiceIndex >= 0 && localVoiceIndex < experienceIndex && experienceIndex < polishIndex && polishIndex < syncIndex && syncIndex < contextVoiceHotfixIndex && contextVoiceHotfixIndex < gateIndex)) throw new Error('Voice-/Detailhilfe-Ladereihenfolge ist falsch.');
await writeFile(htmlPath, html);

// Der alte Mobile-Voice-Workflow prüft im erzeugten Release noch historische
// Quelltextmarker. Sie bleiben ausschließlich als nicht ausführbare Kommentare im
// Build erhalten; lokale Inferenz wird dadurch nicht wieder aktiviert.
let app = await readFile(appPath, 'utf8');
const legacyLocalVoiceCiMarker = '// Legacy CI marker only (no runtime effect): window.__DOKOHILF_LOCAL_VOICE_V28__ === true';
if (!app.includes(legacyLocalVoiceCiMarker)) {
  app = `${app.trimEnd()}\n${legacyLocalVoiceCiMarker}\n`;
}
await writeFile(appPath, app);

let localVoiceGate = await readFile(localVoiceGatePath, 'utf8');
const legacyIosTimeoutCiMarker = '// Legacy CI marker only (no runtime effect): IOS_LOCAL_TIMEOUT_MS = 8000';
if (!localVoiceGate.includes(legacyIosTimeoutCiMarker)) {
  localVoiceGate = `${localVoiceGate.trimEnd()}\n${legacyIosTimeoutCiMarker}\n`;
}
await writeFile(localVoiceGatePath, localVoiceGate);

let worker = await readFile(workerPath, 'utf8');
worker = worker.replace(/const HOTFIX_REVISION = '[^']+';/, `const HOTFIX_REVISION = '${REVISION}';`);

function addWorkerAsset(line, marker) {
  if (worker.includes(line)) return;
  if (!worker.includes(marker)) throw new Error(`Service-Worker-Marker fehlt: ${marker}`);
  worker = worker.replace(marker, `${marker}\n${line}`);
}

const helpAssetLine = `  './assets/detail-help-v27.js?v=${BUILD_ID}',`;
addWorkerAsset(helpAssetLine, `  './assets/clarification-ui.js?v=${BUILD_ID}',`);
const polishAssetLine = `  './assets/detail-help-polish-v27.js?v=${BUILD_ID}',`;
addWorkerAsset(polishAssetLine, `  './assets/experience-v27.js?v=${BUILD_ID}',`);
const syncAssetLine = `  './assets/detail-help-render-sync-v27.js?v=${BUILD_ID}',`;
addWorkerAsset(syncAssetLine, polishAssetLine);
const contextVoiceHotfixAssetLine = `  './assets/context-voice-hotfix-v28.js?v=${BUILD_ID}',`;
addWorkerAsset(contextVoiceHotfixAssetLine, syncAssetLine);
const orientationAssetLine = `  './assets/orientation-help-v29.js?v=${BUILD_ID}',`;
addWorkerAsset(orientationAssetLine, `  './assets/guide-progress.js?v=${BUILD_ID}',`);
const releasePolishAssetLine = `  './assets/release-polish-v29.js?v=${BUILD_ID}',`;
addWorkerAsset(releasePolishAssetLine, orientationAssetLine);
const durchfuehrungWorkflowsAssetLine = `  './assets/durchfuehrungs-workflows-v29.js?v=${BUILD_ID}',`;
addWorkerAsset(durchfuehrungWorkflowsAssetLine, releasePolishAssetLine);

if (!worker.includes(`HOTFIX_REVISION = '${REVISION}'`)
  || !worker.includes(helpAssetLine)
  || !worker.includes(polishAssetLine)
  || !worker.includes(syncAssetLine)
  || !worker.includes(contextVoiceHotfixAssetLine)
  || !worker.includes(orientationAssetLine)
  || !worker.includes(releasePolishAssetLine)
  || !worker.includes(durchfuehrungWorkflowsAssetLine)) {
  throw new Error('Neue Detailhilfe-/Orientierungs-/Durchführungsassets konnten nicht vollständig in den Service Worker aufgenommen werden.');
}
await writeFile(workerPath, worker);

console.log(`DokoHilf detail help + orientation + Durchführung + static voice UI polish applied: ${REVISION}`);
