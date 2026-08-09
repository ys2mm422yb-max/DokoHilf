import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const appPath = resolve(root, 'assets/app.js');
const experiencePath = resolve(root, 'assets/experience-v27.js');
const versionPath = resolve(root, 'version.json');
const BUILD_ID = JSON.parse(await readFile(versionPath, 'utf8')).buildId;
if (!BUILD_ID) throw new Error('buildId fehlt in version.json');

let html = await readFile(htmlPath, 'utf8');
html = html.replace(`  <script src="assets/voice-diagnostics.js?v=${BUILD_ID}"></script>\n`, '');
if (html.includes('voice-diagnostics.js')) throw new Error('Release lädt noch alte Voice-Diagnostik.');
await writeFile(htmlPath, html);

let app = await readFile(appPath, 'utf8');
const oldGreeting = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
const newGreeting = 'Hey! Wobei brauchst du Hilfe?';
if (!app.includes(newGreeting)) {
  if (!app.includes(oldGreeting)) throw new Error('Alter Sprachstart wurde in app.js nicht gefunden.');
  app = app.replace(oldGreeting, newGreeting);
}

const systemVoiceMarker = `  function speakWithSystemVoice(text, requestId) {\n    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) {\n      setVoiceState('error', 'Lokale Stimme nicht bereit', 'Tippe auf das Mikrofon, um die Stimme erneut zu laden.');\n      window.setTimeout(() => finishSpeech(requestId), 900);\n      return;\n    }`;
const staticOnlyGuard = `  function speakWithSystemVoice(text, requestId) {\n    if (window.__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__ === true) {\n      setVoiceState('error', 'Sprachausgabe nicht verfügbar', 'Die Antwort bleibt im Chat sichtbar.');\n      window.setTimeout(() => finishSpeech(requestId), 900);\n      return;\n    }\n    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) {\n      setVoiceState('error', 'Sprachausgabe nicht verfügbar', 'Die Antwort bleibt im Chat sichtbar.');\n      window.setTimeout(() => finishSpeech(requestId), 900);\n      return;\n    }`;
if (!app.includes(staticOnlyGuard)) {
  if (!app.includes(systemVoiceMarker)) throw new Error('System-Voice-Guard in app.js fehlt.');
  app = app.replace(systemVoiceMarker, staticOnlyGuard);
}
if (!app.includes(newGreeting)) throw new Error('Kurzer Hey-Sprachstart fehlt im Release.');
if (!app.includes('__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__')) throw new Error('Static-only System-Voice-Guard fehlt.');
await writeFile(appPath, app);

let experience = await readFile(experiencePath, 'utf8');
const inspectMarker = `  function inspectAiResponse(response) {\n    response.clone().json().then(payload => {`;
const inspectLocal = `  function inspectAiResponse(response) {\n    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) return;\n    response.clone().json().then(payload => {`;
if (!experience.includes('if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) return;')) {
  if (!experience.includes(inspectMarker)) throw new Error('AI voice prefetch marker missing in experience-v27.js');
  experience = experience.replace(inspectMarker, inspectLocal);
}

const warmMarker = `  function warmGreeting() {\n    return prefetchText(GREETING);\n  }`;
const warmLocal = `  function warmGreeting() {\n    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) return Promise.resolve(false);\n    return prefetchText(GREETING);\n  }`;
if (!experience.includes(warmLocal)) {
  if (!experience.includes(warmMarker)) throw new Error('Greeting prefetch marker missing in experience-v27.js');
  experience = experience.replace(warmMarker, warmLocal);
}

const initMarker = `    loadPrebuiltManifest().then(() => warmGreeting()).catch(() => {});`;
const initLocal = `    if (window.__DOKOHILF_LOCAL_VOICE_V28__ !== true) loadPrebuiltManifest().then(() => warmGreeting()).catch(() => {});`;
if (!experience.includes(initLocal)) {
  if (!experience.includes(initMarker)) throw new Error('Static legacy initialization marker missing in experience-v27.js');
  experience = experience.replace(initMarker, initLocal);
}
await writeFile(experiencePath, experience);

console.log(`DokoHilf ${BUILD_ID}: static-only Supertonic release guards + short Hey greeting applied`);
