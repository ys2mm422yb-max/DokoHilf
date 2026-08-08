import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/local-voice-v29/${PROFILE}`;
const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
const FIRST_SPEECH = 'Wähle zuerst den gewünschten Bewohner aus.';
const HELP_SPEECH = 'Bleib beim ausgewählten Bewohner und prüfe, ob der richtige Bewohner geöffnet ist.';

function assert(condition, message) { if (!condition) throw new Error(message); }
function silentWav() {
  const sampleRate = 8000, samples = 640, dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF', 0, 'ascii'); buffer.writeUInt32LE(36 + dataSize, 4); buffer.write('WAVE', 8, 'ascii');
  buffer.write('fmt ', 12, 'ascii'); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36, 'ascii'); buffer.writeUInt32LE(dataSize, 40);
  return buffer;
}

function routePayload(body) {
  const userText = [...(Array.isArray(body?.messages) ? body.messages : [])].reverse().find(message => message?.role === 'user')?.content || '';
  const contextual = body?.smartHelpIntent === true || (body?.guideSlug && /weiß nicht|weiss nicht|keine ahnung|wo finde/i.test(userText));
  if (contextual) return {
    reply: `${HELP_SPEECH}\n\nIst der richtige Bewohner geöffnet?`, spokenText: HELP_SPEECH,
    guideSlug:'vitalwerte-einzelwert',guideTitle:'Einzelnen Vitalwert erfassen',guideVersion:7,guideStep:Number(body.guideStep)||1,guideStepCount:7,completed:false,source:'approved-guide-context-help-v29-4',
  };
  return {
    reply:`${FIRST_SPEECH}\n\nIst der richtige Bewohner ausgewählt?`,spokenText:FIRST_SPEECH,
    guideSlug:'vitalwerte-einzelwert',guideTitle:'Einzelnen Vitalwert erfassen',guideVersion:7,guideStep:1,guideStepCount:7,completed:false,source:'approved-guide-smart-start-v29-1',
  };
}

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block',
  userAgent: PROFILE === 'android'
    ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const consoleErrors = []; const pageErrors = []; const routerBodies = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => pageErrors.push(error.message));

await page.addInitScript(({ profile }) => {
  try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {}
  const synthCalls = []; const systemSpeechCalls = [];
  window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__ = synthCalls;
  window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ = systemSpeechCalls;
  window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__ = {
    async prepare() {
      return { backend: profile === 'android' ? 'webgpu-test' : 'wasm-test', async synthesize(text) {
        synthCalls.push(String(text || ''));
        const sampleRate = 8000, samples = 640, dataSize = samples * 2, buffer = new ArrayBuffer(44 + dataSize), view = new DataView(buffer);
        const ascii = (offset, value) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
        ascii(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); ascii(8, 'WAVE'); ascii(12, 'fmt '); view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true); view.setUint16(34, 16, true); ascii(36, 'data'); view.setUint32(40, dataSize, true);
        return { wav: buffer, latencyMs: 6 };
      }};
    },
  };
  class FakeAudioContext { constructor(){this.state='running';this.destination={};} async resume(){this.state='running';} async decodeAudioData(){return{duration:.08};} createBufferSource(){const source={buffer:null,onended:null,connect(){},disconnect(){},stop(){},start(){setTimeout(()=>source.onended?.(),25);}};return source;} }
  Object.defineProperty(window,'AudioContext',{configurable:true,value:FakeAudioContext}); Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:FakeAudioContext});
  class FakeRecognition { constructor(){this.lang='de-DE';this.interimResults=false;this.continuous=false;this.maxAlternatives=1;this.onstart=null;this.onresult=null;this.onerror=null;this.onend=null;} start(){this.onstart?.();setTimeout(()=>this.onend?.(),35);} abort(){this.onend?.();} }
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:FakeRecognition}); Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:FakeRecognition});
  const speechSynthesis={getVoices:()=>[{name:'Forbidden System Voice',voiceURI:'forbidden',lang:'de-DE',localService:true}],speak(utterance){systemSpeechCalls.push(String(utterance?.text||''));},cancel(){},pause(){},resume(){},addEventListener(){},onvoiceschanged:null};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:speechSynthesis});
  class FakeUtterance { constructor(text){this.text=text;this.onerror=null;this.onend=null;this.onstart=null;} addEventListener(){} dispatchEvent(){return true;} }
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:FakeUtterance});
}, { profile: PROFILE });

let cloudTtsRequests = 0, routerRequests = 0, staticManifestRequests = 0, staticAudioRequests = 0;
await page.route('**/assets/guide-audio-catalog.json*', async route => {
  staticManifestRequests += 1;
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    schemaVersion: 1, voice: 'Supertonic-F1', entries: [
      { file: 'assets/audio/guides/000.wav', text: GREETING },
      { file: 'assets/audio/guides/001.wav', text: FIRST_SPEECH },
      { file: 'assets/audio/guides/002.wav', text: HELP_SPEECH },
    ],
  }) });
});
await page.route('**/assets/audio/guides/*.wav', async route => { staticAudioRequests += 1; await route.fulfill({status:200,contentType:'audio/wav',body:silentWav()}); });
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => { cloudTtsRequests += 1; await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'tts_network_must_not_be_called_in_v29'})}); });
const routerHandler = async route => {
  routerRequests += 1;
  let body={}; try{body=JSON.parse(route.request().postData()||'{}');}catch{}
  routerBodies.push(body);
  await route.fulfill({status:200,contentType:'application/json',headers:{'X-DokoHilf-Chat-Router':'context-aware-v29-4'},body:JSON.stringify(routePayload(body))});
};
for (const pattern of [/\/functions\/v1\/dokohilf-chat-router(?:\?.*)?$/, /\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/]) await page.route(pattern, routerHandler);

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.locator('#buildPill').innerText()).includes('v29'), 'Die gerenderte App ist nicht v29.');
  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('000.wav'));
  await page.waitForTimeout(100);

  let synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(synthCalls.length === 0, 'Begrüßung darf keine lokale iPhone-Inferenz starten.');
  assert(staticManifestRequests >= 1, 'Lokaler Supertonic-Katalog wurde nicht geprüft.');
  assert(staticAudioRequests >= 1, 'Statisches Supertonic-Begrüßungs-Audio wurde nicht geladen.');
  const beforeState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(beforeState?.armed === true, 'Voice-Einstieg muss lokale Engine für freie Antworten freischalten.');

  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Hallo ich suche den Blutdruck', { fromVoice: true }));
  await page.waitForFunction(text => document.querySelector('#voiceFocusText')?.textContent?.includes(text), FIRST_SPEECH);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('001.wav'));
  assert(routerBodies[0]?.selectedGuideSlug === 'vitalwerte-einzelwert', 'Blutdruck wurde nicht direkt zum Einzelwert-Guide geroutet.');

  for (const text of ['ich weiß nicht', 'wo finde ich das?', 'keine Ahnung']) {
    await page.evaluate(textValue => window.DokoHilf?.sendMessage?.(textValue, { fromVoice: true }), text);
    await page.waitForFunction(speech => document.querySelector('#voiceFocusText')?.textContent?.includes(speech), HELP_SPEECH);
    await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('002.wav'));
    assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 7'), `Hilferuf „${text}“ hat den Guide-Schritt verschoben.`);
  }
  assert(routerBodies.slice(1).some(body=>body.smartHelpIntent===true), 'Natürliche Hilferufe wurden nicht kontextuell markiert.');
  assert(!await page.locator('#voiceDetailHelpOptionsV27').count(), 'Alter Vier-Button-Hilfemodus ist noch sichtbar.');
  synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(synthCalls.length === 0, 'Bestätigte Kontext-Hilfe darf nicht in lokale iPhone-Inferenz fallen.');

  const uniqueFreeText = 'Dies ist ein absichtlich nicht vorbereiteter freier Testsatz für die lokale Notinferenz.';
  await page.evaluate(async text => {
    const response = await fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}) });
    window.__LOCAL_FALLBACK_TEST__ = { ok: response.ok, voice: response.headers.get('X-DokoHilf-Voice'), mode: response.headers.get('X-DokoHilf-Voice-Mode') };
  }, uniqueFreeText);
  await page.waitForFunction(() => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__ || []).length === 1);
  const fallback = await page.evaluate(() => window.__LOCAL_FALLBACK_TEST__);
  assert(fallback?.ok && fallback.voice === 'Supertonic-F1' && fallback.mode === 'local-on-device-v29', 'Lokaler Notweg verwendet nicht dieselbe Supertonic-F1-Stimme.');

  const systemCalls = await page.evaluate(() => [...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);
  assert(systemCalls.length === 0, `Systemstimme wurde ${systemCalls.length}x aufgerufen.`);
  assert(cloudTtsRequests === 0, `TTS-Netzwerkpfad wurde ${cloudTtsRequests}x erreicht.`);
  assert(routerRequests >= 4, `Kontext-Hilfe hat nur ${routerRequests} Router-Aufrufe erzeugt.`);
  const localState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(PROFILE === 'android' ? /webgpu/.test(localState.backend) : /wasm/.test(localState.backend), `Unerwartetes Test-Backend: ${localState?.backend}`);
  const staticState = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  const geometry = await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,status:document.getElementById('voiceStatus')?.textContent||'',hint:document.getElementById('voiceHint')?.textContent||'',voiceState:document.getElementById('appShell')?.dataset?.voiceState||''}));
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, `Horizontaler Overflow: ${geometry.scrollWidth} > ${geometry.viewportWidth}`);
  assert(!/Sofortstimme|Gerätestimme|Gacrux/i.test(`${geometry.status} ${geometry.hint}`), 'Voice-UI erwähnt eine alte/abweichende Stimme.');
  await page.screenshot({path:`${OUTPUT_DIR}/local-voice-v29-${PROFILE}.png`,fullPage:false});
  await writeFile(`${OUTPUT_DIR}/summary.json`,JSON.stringify({profile:PROFILE,viewport:{width:WIDTH,height:HEIGHT},synthCalls:await page.evaluate(()=>[...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]),systemCalls,cloudTtsRequests,routerRequests,routerBodies:routerBodies.map(body=>({guideSlug:body.guideSlug||null,guideStep:body.guideStep||null,selectedGuideSlug:body.selectedGuideSlug||null,smartHelpIntent:body.smartHelpIntent===true})),staticManifestRequests,staticAudioRequests,localState,staticState,fallback,geometry,consoleErrors,pageErrors},null,2));
  assert(consoleErrors.length===0,`Console-Fehler: ${consoleErrors.join(' | ')}`); assert(pageErrors.length===0,`Page-Fehler: ${pageErrors.join(' | ')}`);
} finally { await context.close(); await browser.close(); }
