import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/local-voice-v29/${PROFILE}`;
const GREETING = 'Hey! Wobei brauchst du Hilfe?';
const FIRST_SPEECH = 'Öffne beim gewünschten Bewohner „Doku-Erweitert“ in der festen Leiste und wähle dort „Vitalwerte“.';
const HELP_SPEECH = 'Erst „Doku-Erweitert“ in der festen Leiste öffnen, danach darin „Vitalwerte“ wählen.';
const FILE_STUCK_SPEECH = 'Bleibe in den geöffneten Stammdaten. Suche in der grauen Leiste nach „Dateiablage“.';
const FILE_FINAL_SPEECH = 'Warte kurz, bis sich Word öffnet, und führe den Doppelklick nicht mehrfach aus.';
const FALLBACK_SPEECH = 'Ich habe die Antwort im Chat angezeigt.';
const UNPREPARED_SPOKEN = 'Dieser absichtlich nicht vorbereitete gesprochene Testsatz besitzt kein statisches Audio.';

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
  if (/^ich möchte bitte$/i.test(userText.trim())) return {
    reply: `${GREETING}\n\nBitte nenne dein Ziel.`, spokenText: UNPREPARED_SPOKEN,
    guideSlug:null,guideTitle:null,guideVersion:null,guideStep:null,guideStepCount:null,completed:false,source:'synthetic-visible-reply-match-v45',
  };
  if (/^dateiablage testhilfe$/i.test(userText.trim())) return {
    reply: `${FILE_STUCK_SPEECH}\n\nIst „Dateiablage“ geöffnet?`, spokenText: FILE_STUCK_SPEECH,
    guideSlug:'dateiablage',guideTitle:'Dateiablage öffnen',guideVersion:1,guideStep:2,guideStepCount:5,completed:false,source:'synthetic-dateiablage-stuck-v48',
  };
  if (/^dateiablage letzter schritt test$/i.test(userText.trim())) return {
    reply: `${FILE_FINAL_SPEECH}\n\nHat sich das Dokument in Word geöffnet?`, spokenText: FILE_FINAL_SPEECH,
    guideSlug:'dateiablage',guideTitle:'Dateiablage öffnen',guideVersion:1,guideStep:5,guideStepCount:5,completed:false,source:'synthetic-dateiablage-final-progress-v48',
  };
  const contextual = body?.smartHelpIntent === true || (body?.guideSlug && /weiß nicht|weiss nicht|keine ahnung|wo finde/i.test(userText));
  if (contextual) return {
    reply: `${HELP_SPEECH}\n\nIst der Bereich „Vitalwerte“ geöffnet?`, spokenText: HELP_SPEECH,
    guideSlug:'vitalwerte-finden',guideTitle:'Vitalwerte finden',guideVersion:1,guideStep:1,guideStepCount:1,completed:false,source:'approved-guide-context-help-v29-4',
  };
  return {
    reply:`${FIRST_SPEECH}\n\nIst der Bereich „Vitalwerte“ geöffnet?`,spokenText:FIRST_SPEECH,
    guideSlug:'vitalwerte-finden',guideTitle:'Vitalwerte finden',guideVersion:1,guideStep:1,guideStepCount:1,completed:false,source:'approved-guide-smart-start-v44',
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

await page.addInitScript(() => {
  try { localStorage.setItem('dokohilf-privacy-ack-v1', 'yes'); } catch {}
  const systemSpeechCalls = [];
  window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__ = systemSpeechCalls;
  class FakeAudioContext {
    constructor(){this.state='running';this.destination={};}
    async resume(){this.state='running';}
    async decodeAudioData(){return{duration:.08};}
    createBufferSource(){const source={buffer:null,onended:null,connect(){},disconnect(){},stop(){},start(){setTimeout(()=>source.onended?.(),25);}};return source;}
  }
  Object.defineProperty(window,'AudioContext',{configurable:true,value:FakeAudioContext});
  Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:FakeAudioContext});
  class FakeRecognition {
    constructor(){this.lang='de-DE';this.interimResults=false;this.continuous=false;this.maxAlternatives=1;this.onstart=null;this.onresult=null;this.onerror=null;this.onend=null;}
    start(){this.onstart?.();setTimeout(()=>this.onend?.(),35);}
    abort(){this.onend?.();}
  }
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:FakeRecognition});
  Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:FakeRecognition});
  const speechSynthesis={getVoices:()=>[{name:'Forbidden System Voice',voiceURI:'forbidden',lang:'de-DE',localService:true}],speak(utterance){systemSpeechCalls.push(String(utterance?.text||''));},cancel(){},pause(){},resume(){},addEventListener(){},onvoiceschanged:null};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:speechSynthesis});
  class FakeUtterance { constructor(text){this.text=text;this.onerror=null;this.onend=null;this.onstart=null;} addEventListener(){} dispatchEvent(){return true;} }
  Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:FakeUtterance});
});

let cloudTtsRequests = 0, routerRequests = 0, staticManifestRequests = 0, staticAudioRequests = 0;
await page.route('**/assets/guide-audio-catalog.json*', async route => {
  staticManifestRequests += 1;
  await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
    schemaVersion: 1, voice: 'Supertonic-F1', entries: [
      { file: 'assets/audio/guides/000.wav', text: GREETING },
      { file: 'assets/audio/guides/001.wav', text: FIRST_SPEECH },
      { file: 'assets/audio/guides/002.wav', text: HELP_SPEECH },
      { file: 'assets/audio/guides/003.wav', text: FALLBACK_SPEECH },
      { file: 'assets/audio/guides/004.wav', text: FILE_STUCK_SPEECH },
      { file: 'assets/audio/guides/005.wav', text: FILE_FINAL_SPEECH },
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

  assert(staticManifestRequests >= 1, 'Statischer Supertonic-Katalog wurde nicht geladen.');
  assert(staticAudioRequests >= 1, 'Statisches Supertonic-Begrüßungs-Audio wurde nicht geladen.');
  const beforeState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(beforeState?.state === 'retired', `Lokale Voice-Engine ist nicht stillgelegt: ${beforeState?.state}`);
  assert(beforeState?.armed === false, 'Lokale Voice-Engine darf nicht scharfgeschaltet werden.');
  assert(beforeState?.backend === 'none' && beforeState?.inferenceSteps === 0, 'Lokale Inferenz ist noch aktiv.');

  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Hallo ich suche den Blutdruck', { fromVoice: true }));
  await page.waitForFunction(text => document.querySelector('#voiceFocusText')?.textContent?.includes(text), FIRST_SPEECH);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('001.wav'));
  assert(routerBodies[0]?.selectedGuideSlug === 'vitalwerte-finden', 'Blutdruck-Suche wurde nicht zum bestätigten Vitalwerte-Finden-Guide geroutet.');

  for (const text of ['ich weiß nicht', 'wo finde ich das?', 'keine Ahnung']) {
    await page.evaluate(textValue => window.DokoHilf?.sendMessage?.(textValue, { fromVoice: true }), text);
    await page.waitForFunction(speech => document.querySelector('#voiceFocusText')?.textContent?.includes(speech), HELP_SPEECH);
    await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('002.wav'));
    assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 1'), `Hilferuf „${text}“ hat den Guide-Schritt verschoben.`);
  }
  assert(routerBodies.slice(1).some(body=>body.smartHelpIntent===true), 'Natürliche Hilferufe wurden nicht kontextuell markiert.');
  assert(!await page.locator('#voiceDetailHelpOptionsV27').count(), 'Alter Vier-Button-Hilfemodus ist noch sichtbar.');

  const stuckBefore = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Dateiablage Testhilfe', { fromVoice: true }));
  await page.waitForFunction(text => document.querySelector('#voiceFocusText')?.textContent?.includes(text), FILE_STUCK_SPEECH);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('004.wav'));
  const stuckAfter = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  assert(stuckAfter.staticMisses === stuckBefore.staticMisses, 'Dateiablage-Hilfe ist fälschlich in den generischen Sprachfallback gefallen.');
  const stuckVisible = await page.locator('#voiceFocusText').innerText();
  assert(!/erfindet DokoHilf nicht|bestätigte Bereich|DokoHilf kann nicht garantieren/i.test(stuckVisible), `Interne Produktformulierung sichtbar: ${stuckVisible}`);

  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Dateiablage letzter Schritt Test', { fromVoice: true }));
  await page.waitForFunction(text => document.querySelector('#voiceFocusText')?.textContent?.includes(text), FILE_FINAL_SPEECH);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('005.wav'));
  await page.waitForFunction(() => document.getElementById('voiceFocusStep')?.textContent?.includes('Schritt 5 von 5'));
  await page.waitForFunction(() => document.querySelector('.v42-voice-progress')?.dataset?.v48Progress === '5/5:100');
  const finalProgress = await page.evaluate(() => {
    const track = document.querySelector('.v42-voice-progress');
    const fill = track?.querySelector('i');
    if (!track || !fill) return null;
    const trackWidth = track.getBoundingClientRect().width;
    const fillWidth = fill.getBoundingClientRect().width;
    return { trackWidth, fillWidth, ratio: trackWidth > 0 ? fillWidth / trackWidth : 0, marker: track.dataset.v48Progress || '' };
  });
  assert(finalProgress?.marker === '5/5:100', `Finaler Fortschrittsmarker falsch: ${finalProgress?.marker}`);
  assert(finalProgress?.ratio >= 0.995, `Fortschrittsbalken bei 5/5 nicht voll: ${JSON.stringify(finalProgress)}`);

  const replyMatchBefore = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  await page.evaluate(() => window.DokoHilf?.sendMessage?.('Ich möchte bitte', { fromVoice: true }));
  await page.waitForFunction(() => (window.DokoHilfStaticFirstVoiceV28?.getState?.().approvedReplyMatches || 0) >= 1);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('000.wav'));
  const replyMatchAfter = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  assert(replyMatchAfter.approvedReplyMatches === replyMatchBefore.approvedReplyMatches + 1, 'Sichtbare freigegebene Antwort wurde nicht als statischer Voice-Treffer gezählt.');
  assert(replyMatchAfter.staticMisses === replyMatchBefore.staticMisses, 'Sichtbare freigegebene Antwort ist fälschlich in den generischen Fallback gefallen.');

  const uniqueFreeText = 'Dies ist ein absichtlich nicht vorbereiteter freier Testsatz.';
  const fallback = await page.evaluate(async text => {
    const response = await fetch('https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text}) });
    return { ok: response.ok, voice: response.headers.get('X-DokoHilf-Voice'), mode: response.headers.get('X-DokoHilf-Voice-Mode'), cache: response.headers.get('X-DokoHilf-TTS-Cache') };
  }, uniqueFreeText);
  await page.waitForFunction(() => window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('003.wav'));
  assert(fallback?.ok && fallback.voice === 'Supertonic-F1' && fallback.mode === 'static-supertonic-only-v29', 'Freier Text verwendet nicht den statischen Supertonic-Fallback.');
  assert(fallback?.cache === 'static-supertonic-cache-v29-2', 'Statischer Fallback verwendet nicht den aktuellen Audio-Cache.');

  const systemCalls = await page.evaluate(() => [...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);
  assert(systemCalls.length === 0, `Systemstimme wurde ${systemCalls.length}x aufgerufen.`);
  assert(cloudTtsRequests === 0, `TTS-Netzwerkpfad wurde ${cloudTtsRequests}x erreicht.`);
  assert(routerRequests >= 7, `Kontext-Hilfe hat nur ${routerRequests} Router-Aufrufe erzeugt.`);
  const localState = await page.evaluate(() => window.DokoHilfLocalVoiceV28?.getState?.());
  assert(localState?.state === 'retired' && localState?.backend === 'none' && localState?.armed === false, 'Lokale Voice-Kompatibilität ist nicht vollständig stillgelegt.');
  const staticState = await page.evaluate(() => window.DokoHilfStaticFirstVoiceV28?.getState?.());
  assert(staticState?.staticMisses >= 1, 'Unbekannter freier Text wurde nicht als statischer Katalog-Miss erkannt.');
  assert(staticState?.approvedReplyMatches >= 1, 'Sichtbarer freigegebener Satz wurde nicht als statischer Reply-Treffer abgespielt.');
  const geometry = await page.evaluate(() => ({scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,status:document.getElementById('voiceStatus')?.textContent||'',hint:document.getElementById('voiceHint')?.textContent||'',voiceState:document.getElementById('appShell')?.dataset?.voiceState||''}));
  assert(geometry.scrollWidth <= geometry.viewportWidth + 1, `Horizontaler Overflow: ${geometry.scrollWidth} > ${geometry.viewportWidth}`);
  assert(!/Sofortstimme|Gerätestimme|Gacrux/i.test(`${geometry.status} ${geometry.hint}`), 'Voice-UI erwähnt eine alte/abweichende Stimme.');
  await page.screenshot({path:`${OUTPUT_DIR}/static-voice-v29-${PROFILE}.png`,fullPage:false});
  await writeFile(`${OUTPUT_DIR}/summary.json`,JSON.stringify({profile:PROFILE,viewport:{width:WIDTH,height:HEIGHT},systemCalls,cloudTtsRequests,routerRequests,routerBodies:routerBodies.map(body=>({guideSlug:body.guideSlug||null,guideStep:body.guideStep||null,selectedGuideSlug:body.selectedGuideSlug||null,smartHelpIntent:body.smartHelpIntent===true})),staticManifestRequests,staticAudioRequests,localState,staticState,fallback,finalProgress,geometry,consoleErrors,pageErrors},null,2));
  assert(consoleErrors.length===0,`Console-Fehler: ${consoleErrors.join(' | ')}`); assert(pageErrors.length===0,`Page-Fehler: ${pageErrors.join(' | ')}`);
} finally { await context.close(); await browser.close(); }
