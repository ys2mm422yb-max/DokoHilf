import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/local-voice-v29/${PROFILE}`;
const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
const CONTEXT_HELP = 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“.';

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

await mkdir(OUTPUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block',
  userAgent: PROFILE === 'android'
    ? 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36'
    : 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();
const consoleErrors = []; const pageErrors = [];
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

let cloudTtsRequests = 0, unexpectedRouterRequests = 0, staticManifestRequests = 0, staticAudioRequests = 0;
await page.route('**/assets/guide-audio-catalog.json*', async route => {
  staticManifestRequests += 1;
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    schemaVersion: 1, voice: 'Supertonic-F1', entries: [
      { file: 'assets/audio/guides/greeting.wav', text: GREETING },
      { file: 'assets/audio/guides/context-report.wav', text: CONTEXT_HELP },
    ],
  }) });
});
await page.route('**/assets/audio/guides/*.wav', async route => { staticAudioRequests += 1; await route.fulfill({status:200,contentType:'audio/wav',body:silentWav()}); });
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/, async route => { cloudTtsRequests += 1; await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'tts_network_must_not_be_called_in_v29'})}); });
await page.route(/\/functions\/v1\/dokohilf-(?:chat-router|ai-router)(?:\?.*)?$/, async route => { unexpectedRouterRequests += 1; await route.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'voice_static_test_does_not_need_router'})}); });

async function requestVoice(text) {
  return page.evaluate(async value => {
    const response = await fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: value }),
    });
    await response.arrayBuffer();
    return {
      ok: response.ok,
      voice: response.headers.get('X-DokoHilf-Voice'),
      mode: response.headers.get('X-DokoHilf-Voice-Mode'),
    };
  }, text);
}

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  assert((await page.locator('#buildPill').innerText()).includes('v29'), 'Die gerenderte App ist nicht v29.');
  await page.locator('[data-select-mode="voice"]').click();
  await page.locator('.voice-focus-stage').waitFor({ state: 'visible' });

  let synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  const beforeState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(beforeState?.armed === true, 'Voice-Einstieg muss die lokale Engine für freie Antworten freischalten.');
  assert(beforeState?.state === 'idle', `Großes Modell wurde beim Einstieg trotzdem vorbereitet: ${beforeState?.state}`);
  assert(synthCalls.length === 0, 'Der Voice-Einstieg darf keine lokale iPhone-Inferenz starten.');

  const greeting = await requestVoice(GREETING);
  assert(greeting.ok && greeting.voice === 'Supertonic-F1' && greeting.mode === 'static-supertonic-guide-v29', 'Begrüßung kommt nicht aus dem statischen F1-Bestand.');
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('greeting.wav'));
  synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(synthCalls.length === 0, 'Begrüßung darf keine lokale iPhone-Inferenz starten.');

  const contextHelp = await requestVoice(CONTEXT_HELP);
  assert(contextHelp.ok && contextHelp.voice === 'Supertonic-F1' && contextHelp.mode === 'static-supertonic-guide-v29', 'Bestätigte Kontext-Hilfe kommt nicht aus dem statischen F1-Bestand.');
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('context-report.wav'));
  synthCalls = await page.evaluate(() => [...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]);
  assert(synthCalls.length === 0, 'Bestätigte Kontext-Hilfe darf auf dem iPhone keine lokale Inferenz starten.');

  assert(staticManifestRequests >= 1, 'Statischer Supertonic-Katalog wurde nicht geprüft.');
  assert(staticAudioRequests >= 2, 'Die beiden statischen Supertonic-Audios wurden nicht geladen.');

  const uniqueFreeText = 'Dies ist ein absichtlich nicht vorbereiteter freier Testsatz für die lokale Notinferenz.';
  const fallback = await requestVoice(uniqueFreeText);
  await page.waitForFunction(() => (window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__ || []).length === 1);
  assert(fallback.ok && fallback.voice === 'Supertonic-F1' && fallback.mode === 'local-on-device-v29', 'Lokaler Notweg verwendet nicht dieselbe Supertonic-F1-Stimme.');

  const systemCalls = await page.evaluate(() => [...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);
  assert(systemCalls.length === 0, `Systemstimme wurde ${systemCalls.length}x aufgerufen.`);
  assert(cloudTtsRequests === 0, `TTS-Netzwerkpfad wurde ${cloudTtsRequests}x erreicht.`);
  assert(unexpectedRouterRequests === 0, `Der isolierte Voice-Test hat ${unexpectedRouterRequests} unnötige Router-Aufrufe erzeugt.`);
  const localState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(PROFILE === 'android' ? /webgpu/.test(localState.backend) : /wasm/.test(localState.backend), `Unerwartetes Test-Backend: ${localState?.backend}`);
  const staticState = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  const geometry = await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,status:document.getElementById('voiceStatus')?.textContent||'',hint:document.getElementById('voiceHint')?.textContent||''}));
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, `Horizontaler Overflow: ${geometry.scrollWidth} > ${geometry.viewportWidth}`);
  assert(!/Sofortstimme|Gerätestimme|Gacrux/i.test(`${geometry.status} ${geometry.hint}`), 'Voice-UI erwähnt eine alte/abweichende Stimme.');
  await page.screenshot({path:`${OUTPUT_DIR}/local-voice-v29-${PROFILE}.png`,fullPage:false});
  await writeFile(`${OUTPUT_DIR}/summary.json`,JSON.stringify({profile:PROFILE,viewport:{width:WIDTH,height:HEIGHT},synthCalls:await page.evaluate(()=>[...window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__]),systemCalls,cloudTtsRequests,unexpectedRouterRequests,staticManifestRequests,staticAudioRequests,localState,staticState,greeting,contextHelp,fallback,geometry,consoleErrors,pageErrors},null,2));
  assert(consoleErrors.length===0,`Console-Fehler: ${consoleErrors.join(' | ')}`); assert(pageErrors.length===0,`Page-Fehler: ${pageErrors.join(' | ')}`);
} finally { await context.close(); await browser.close(); }
