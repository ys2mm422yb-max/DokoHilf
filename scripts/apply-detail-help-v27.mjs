import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BUILD_ID = '20260806-27';
const REVISION = '20260807-detail-help-cross-platform-1';
const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const workerPath = resolve(root, 'service-worker.js');

let html = await readFile(htmlPath, 'utf8');
const scriptTag = `  <script src="assets/detail-help-v27.js?v=${BUILD_ID}"></script>`;
if (!html.includes('assets/detail-help-v27.js')) {
  const marker = `  <script src="assets/clarification-ui.js?v=${BUILD_ID}"></script>`;
  if (!html.includes(marker)) throw new Error('clarification-ui marker fehlt in index.html');
  html = html.replace(marker, `${marker}\n${scriptTag}`);
}
if (!html.includes(scriptTag.trim())) throw new Error('Detailhilfe konnte nicht in index.html aktiviert werden.');
const clarificationIndex = html.indexOf(`assets/clarification-ui.js?v=${BUILD_ID}`);
const helpIndex = html.indexOf(`assets/detail-help-v27.js?v=${BUILD_ID}`);
const progressIndex = html.indexOf(`assets/guide-progress.js?v=${BUILD_ID}`);
if (!(clarificationIndex >= 0 && clarificationIndex < helpIndex && helpIndex < progressIndex)) {
  throw new Error('Detailhilfe muss nach Clarification und vor Guide-Progress geladen werden.');
}
await writeFile(htmlPath, html);

let worker = await readFile(workerPath, 'utf8');
worker = worker
  .replace("const HOTFIX_REVISION = '20260807-pwa-icons-cross-platform-1';", `const HOTFIX_REVISION = '${REVISION}';`)
  .replace("const HOTFIX_REVISION = '20260807-direct-guides-cross-platform-1';", `const HOTFIX_REVISION = '${REVISION}';`);

const assetLine = `  './assets/detail-help-v27.js?v=${BUILD_ID}',`;
if (!worker.includes(assetLine)) {
  const marker = `  './assets/clarification-ui.js?v=${BUILD_ID}',`;
  if (!worker.includes(marker)) throw new Error('clarification-ui marker fehlt im Service Worker');
  worker = worker.replace(marker, `${marker}\n${assetLine}`);
}
if (!worker.includes(`HOTFIX_REVISION = '${REVISION}'`) || !worker.includes(assetLine)) {
  throw new Error('Detailhilfe konnte nicht in den Service Worker aufgenommen werden.');
}
await writeFile(workerPath, worker);

console.log(`DokoHilf detail help applied: ${REVISION}`);
