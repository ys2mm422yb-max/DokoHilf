import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const workerPath = resolve(root, 'service-worker.js');

let html = await readFile(htmlPath, 'utf8');
html = html
  .replace('<link rel="icon" href="icon.svg" type="image/svg+xml">', '<link rel="icon" href="icon-v3.svg" type="image/svg+xml">')
  .replace('<link rel="apple-touch-icon" href="icon.svg">', '<link rel="apple-touch-icon" sizes="180x180" href="icon-touch-180-v3.png">')
  .replace('<img src="icon.svg" alt="" width="48" height="48">', '<img src="icon-v3.svg" alt="" width="48" height="48">');

if (!html.includes('icon-touch-180-v3.png') || !html.includes('icon-v3.svg')) {
  throw new Error('PWA-Icon-Referenzen konnten in index.html nicht gesetzt werden.');
}
await writeFile(htmlPath, html);

let worker = await readFile(workerPath, 'utf8');
worker = worker
  .replace("const HOTFIX_REVISION = '20260807-direct-guides-cross-platform-1';", "const HOTFIX_REVISION = '20260807-pwa-icons-cross-platform-1';")
  .replace("  './icon.svg',", "  './icon-v3.svg',\n  './icon-touch-180-v3.png',\n  './icon-192-v3.png',\n  './icon-512-v3.png',\n  './icon-maskable-512-v3.png',");

for (const marker of ['icon-v3.svg','icon-touch-180-v3.png','icon-192-v3.png','icon-512-v3.png','icon-maskable-512-v3.png']) {
  if (!worker.includes(marker)) throw new Error(`Service Worker enthält ${marker} nicht.`);
}
await writeFile(workerPath, worker);
console.log('DokoHilf PWA icon references applied');
