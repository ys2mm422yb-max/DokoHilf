import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BUILD_ID = '20260807-28';
const root = resolve(process.argv[2] || '.');
const htmlPath = resolve(root, 'index.html');
const appPath = resolve(root, 'assets/app.js');
const experiencePath = resolve(root, 'assets/experience-v27.js');

let html = await readFile(htmlPath, 'utf8');
html = html.replace(`  <script src="assets/voice-diagnostics.js?v=${BUILD_ID}"></script>\n`, '');

const localIndex = html.indexOf(`assets/local-voice-v28.js?v=${BUILD_ID}`);
const experienceIndex = html.indexOf(`assets/experience-v27.js?v=${BUILD_ID}`);
const uxIndex = html.indexOf(`assets/ux-v27.js?v=${BUILD_ID}`);
const gateIndex = html.indexOf(`assets/local-voice-gate-v28.js?v=${BUILD_ID}`);
const appIndex = html.indexOf(`assets/app.js?v=${BUILD_ID}`);
if (!(localIndex >= 0 && localIndex < experienceIndex && experienceIndex < uxIndex && uxIndex < gateIndex && gateIndex < appIndex)) {
  throw new Error('v28 local voice load order is invalid.');
}
if (html.includes('voice-diagnostics.js')) throw new Error('v28 release still loads legacy Gacrux voice diagnostics.');
await writeFile(htmlPath, html);

let app = await readFile(appPath, 'utf8');
const systemVoiceMarker = `  function speakWithSystemVoice(text, requestId) {\n    if (!('speechSynthesis' in window) || requestId !== state.speechRequestId) {`;
const localOnlySystemGuard = `  function speakWithSystemVoice(text, requestId) {\n    if (window.__DOKOHILF_LOCAL_VOICE_V28__ === true) {\n      setVoiceState('error', 'Lokale Stimme nicht bereit', 'Tippe auf das Mikrofon, um die Stimme erneut zu laden.');\n      window.setTimeout(() => finishSpeech(requestId), 900);\n      return;\n    }\n    if (!('speechSynthesis' in window) || requestId !== state.speechRequestId) {`;
if (!app.includes('window.__DOKOHILF_LOCAL_VOICE_V28__ === true')) {
  if (!app.includes(systemVoiceMarker)) throw new Error('System voice fallback marker missing in app.js');
  app = app.replace(systemVoiceMarker, localOnlySystemGuard);
}
if (!app.includes(localOnlySystemGuard.trim())) throw new Error('Local-only system voice guard was not applied.');
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
  if (!experience.includes(initMarker)) throw new Error('Static Gacrux initialization marker missing in experience-v27.js');
  experience = experience.replace(initMarker, initLocal);
}
await writeFile(experiencePath, experience);

console.log('DokoHilf v28 local-only voice release guards applied');
