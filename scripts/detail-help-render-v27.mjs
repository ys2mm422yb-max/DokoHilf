import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const SCALE = Number(process.env.DOKOHILF_DEVICE_SCALE_FACTOR || 2);
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/detail-help-v29/${PROFILE}`;
const GREETING = 'Hey! Wobei brauchst du Hilfe?';
const FIRST_SPEECH = 'Wähle zuerst den gewünschten Bewohner aus.';
const HELP_SPEECH = 'Bleib beim ausgewählten Bewohner und prüfe, ob der richtige Bewohner geöffnet ist.';

function assert(condition, message) { if (!condition) throw new Error(message); }
function silentWav() {
  const sampleRate = 8000, samples = 640, dataSize = samples * 2, buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF',0,'ascii'); buffer.writeUInt32LE(36+dataSize,4); buffer.write('WAVE',8,'ascii'); buffer.write('fmt ',12,'ascii');
  buffer.writeUInt32LE(16,16); buffer.writeUInt16LE(1,20); buffer.writeUInt16LE(1,22); buffer.writeUInt32LE(sampleRate,24); buffer.writeUInt32LE(sampleRate*2,28);
  buffer.writeUInt16LE(2,32); buffer.writeUInt16LE(16,34); buffer.write('data',36,'ascii'); buffer.writeUInt32LE(dataSize,40); return buffer;
}

function responseFor(body) {
  const userText = [...(Array.isArray(body?.messages) ? body.messages : [])].reverse().find(message => message?.role === 'user')?.content || '';
  const contextual = body?.smartHelpIntent === true || /weiß nicht|weiss nicht|keine ahnung|wo finde/i.test(userText) && body?.guideSlug;
  if (contextual) {
    return {
      reply: `${HELP_SPEECH}\n\nIst der richtige Bewohner geöffnet?`,
      spokenText: HELP_SPEECH,
      guideSlug: 'vitalwerte-einzelwert',
      guideTitle: 'Einzelnen Vitalwert erfassen',
      guideVersion: 7,
      guideStep: Number(body.guideStep) || 1,
      guideStepCount: 7,
      completed: false,
      source: 'approved-guide-context-help-v29-4',
    };
  }
  return {
    reply: `${FIRST_SPEECH}\n\nIst der richtige Bewohner ausgewählt?`,
    spokenText: FIRST_SPEECH,
    guideSlug: 'vitalwerte-einzelwert',
    guideTitle: 'Einzelnen Vitalwert erfassen',
    guideVersion: 7,
    guideStep: 1,
    guideStepCount: 7,
    completed: false,
    source: 'approved-guide-smart-start-v29-1',
  };
}

await mkdir(OUTPUT_DIR,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:WIDTH,height:HEIGHT},deviceScaleFactor:SCALE,isMobile:true,hasTouch:true,serviceWorkers:'block',
  userAgent:PROFILE==='android'?'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page=await context.newPage();
const consoleErrors=[]; const pageErrors=[]; const routerBodies=[];
page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text());}); page.on('pageerror',e=>pageErrors.push(e.message));

await page.addInitScript(({profile})=>{
  try{localStorage.setItem('dokohilf-privacy-ack-v1','yes');}catch{}
  const localCalls=[]; const systemCalls=[];
  window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__=localCalls; window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__=systemCalls;
  window.__DOKOHILF_LOCAL_VOICE_TEST_ADAPTER__={async prepare(){return{backend:profile==='android'?'webgpu-test':'wasm-test',async synthesize(text){
    localCalls.push(String(text||'')); const s=8000,n=640,d=n*2,b=new ArrayBuffer(44+d),v=new DataView(b),a=(o,x)=>[...x].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));
    a(0,'RIFF');v.setUint32(4,36+d,true);a(8,'WAVE');a(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,s,true);v.setUint32(28,s*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);a(36,'data');v.setUint32(40,d,true);return{wav:b,latencyMs:6};
  }};}};
  class AC{constructor(){this.state='running';this.destination={};}async resume(){this.state='running';}async decodeAudioData(){return{duration:.08};}createBufferSource(){const x={buffer:null,onended:null,connect(){},disconnect(){},stop(){},start(){setTimeout(()=>x.onended?.(),25);}};return x;}}
  Object.defineProperty(window,'AudioContext',{configurable:true,value:AC});Object.defineProperty(window,'webkitAudioContext',{configurable:true,value:AC});
  class R{constructor(){this.lang='de-DE';this.interimResults=false;this.continuous=false;this.maxAlternatives=1;this.onstart=null;this.onresult=null;this.onerror=null;this.onend=null;}start(){this.onstart?.();setTimeout(()=>this.onend?.(),35);}abort(){this.onend?.();}}
  Object.defineProperty(window,'SpeechRecognition',{configurable:true,value:R});Object.defineProperty(window,'webkitSpeechRecognition',{configurable:true,value:R});
  const synth={getVoices:()=>[{name:'Forbidden System Voice',voiceURI:'forbidden',lang:'de-DE',localService:true}],cancel(){},pause(){},resume(){},addEventListener(){},onvoiceschanged:null,speak(u){systemCalls.push(String(u?.text||''));}};
  Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synth});class U{constructor(t){this.text=String(t||'');this.onstart=null;this.onend=null;this.onerror=null;}addEventListener(){}dispatchEvent(){return true;}}Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:U});
},{profile:PROFILE});

let routerRequests=0,cloudTtsRequests=0,staticManifestRequests=0,staticAudioRequests=0;
const routerHandler=async route=>{
  routerRequests+=1;
  let body={}; try{body=JSON.parse(route.request().postData()||'{}');}catch{}
  routerBodies.push(body);
  await route.fulfill({status:200,contentType:'application/json',headers:{'X-DokoHilf-Chat-Router':'context-aware-v29-4'},body:JSON.stringify(responseFor(body))});
};
for(const pattern of [/\/functions\/v1\/dokohilf-chat-router(?:\?.*)?$/, /\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/]) await page.route(pattern,routerHandler);
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/,async r=>{cloudTtsRequests+=1;await r.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'tts_network_forbidden_in_v29'})});});
await page.route('**/assets/guide-audio-catalog.json*',async r=>{staticManifestRequests+=1;await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,voice:'Supertonic-F1',entries:[{file:'assets/audio/guides/000.wav',text:GREETING},{file:'assets/audio/guides/001.wav',text:FIRST_SPEECH},{file:'assets/audio/guides/002.wav',text:HELP_SPEECH}]})});});
await page.route(/\/assets\/audio\/guides\/[^/?]+\.wav(?:\?.*)?$/,async r=>{staticAudioRequests+=1;await r.fulfill({status:200,contentType:'audio/wav',body:silentWav()});});

try{
  await page.goto(BASE_URL,{waitUntil:'networkidle'});assert((await page.locator('#buildPill').innerText()).includes('v29'),'Detailhilfe-Test läuft nicht auf v29.');

  await page.locator('[data-select-mode="chat"]').click();await page.locator('#workspace').waitFor({state:'visible'});
  await page.locator('#chatInput').fill('Hallo ich suche den Blutdruck');await page.getByRole('button',{name:'Senden'}).click();
  await page.waitForFunction(text=>[...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes(text),FIRST_SPEECH);
  const firstReply=await page.locator('.message.assistant .bubble p').last().innerText();
  assert(firstReply.length<180,'Erste Blutdruck-Antwort ist wieder eine Textwand.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 7'),'Einzelwert-Guide startet nicht bei Schritt 1.');
  assert(!await page.locator('#detailHelpOptionsV27').count(),'Alter Vier-Button-Hilfemodus ist noch sichtbar.');
  assert(routerBodies[0]?.selectedGuideSlug==='vitalwerte-einzelwert','Blutdruck-Suche wurde nicht direkt dem Einzelwert-Guide zugeordnet.');

  for(const text of ['ich weiß nicht','wo finde ich das?','keine Ahnung']){
    await page.locator('#chatInput').fill(text);await page.getByRole('button',{name:'Senden'}).click();
    await page.waitForFunction(s=>[...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes(s),HELP_SPEECH);
    assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 7'),`Hilferuf „${text}“ hat den Guide-Schritt verändert.`);
    assert(!await page.locator('#detailHelpOptionsV27').count(),`Hilferuf „${text}“ hat den alten Sonderdialog geöffnet.`);
  }
  assert(routerBodies.slice(1).some(body=>body.smartHelpIntent===true),'Freie Hilferufe wurden nicht als kontextuelle Hilfe markiert.');
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));assert(dimensions.width<=dimensions.viewport+1,'Chat horizontaler Overflow.');await page.screenshot({path:`${OUTPUT_DIR}/detail-help-chat-${PROFILE}.png`,fullPage:true});

  await page.evaluate(()=>window.DokoHilf?.resetConversation?.({keepMode:false}));await page.locator('#startScreen').waitFor({state:'visible'});await page.locator('[data-select-mode="voice"]').click();await page.locator('.voice-focus-stage').waitFor({state:'visible'});await page.waitForFunction(()=>window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('000.wav'));
  await page.evaluate(()=>window.DokoHilf?.sendMessage?.('Hallo ich suche den Blutdruck',{fromVoice:true}));await page.waitForFunction(text=>document.querySelector('#voiceFocusText')?.textContent?.includes(text),FIRST_SPEECH);await page.waitForFunction(()=>window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('001.wav'));
  await page.evaluate(()=>window.DokoHilf?.sendMessage?.('ich weiß nicht',{fromVoice:true}));await page.waitForFunction(text=>document.querySelector('#voiceFocusText')?.textContent?.includes(text),HELP_SPEECH);await page.waitForFunction(()=>window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('002.wav'));
  assert(!await page.locator('#voiceDetailHelpOptionsV27').count(),'Voice zeigt noch den alten Vier-Button-Hilfemodus.');
  assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 7'),'Voice-Hilfe hat den aktuellen Schritt verändert.');
  assert(await page.evaluate(()=>window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__.length)===0,'Bestätigte v29-Hilfe fiel unnötig in lokale Inferenz.');
  const systemCalls=await page.evaluate(()=>[...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);assert(systemCalls.length===0,'Systemstimme aufgerufen.');assert(cloudTtsRequests===0,'TTS-Netzwerkpfad erreicht.');assert(routerRequests>=5,'Kontext-Hilfe lief nicht über den Router.');
  const geometry=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,orb:document.querySelector('.voice-focus-stage .voice-orb')?.getBoundingClientRect(),state:document.getElementById('appShell')?.dataset?.voiceState||''}));
  assert(geometry.scrollWidth<=geometry.viewportWidth+1,'Voice horizontaler Overflow.');assert(geometry.orb?.width<=150,`Mikrofon zu groß: ${geometry.orb?.width}`);
  await page.screenshot({path:`${OUTPUT_DIR}/detail-help-voice-${PROFILE}.png`,fullPage:false});assert(consoleErrors.length===0,`Console-Fehler: ${consoleErrors.join(' | ')}`);assert(pageErrors.length===0,`Page-Fehler: ${pageErrors.join(' | ')}`);
  await writeFile(`${OUTPUT_DIR}/detail-help-summary.json`,JSON.stringify({profile:PROFILE,viewport:{width:WIDTH,height:HEIGHT},routerRequests,routerBodies:routerBodies.map(body=>({guideSlug:body.guideSlug||null,guideStep:body.guideStep||null,selectedGuideSlug:body.selectedGuideSlug||null,smartHelpIntent:body.smartHelpIntent===true})),cloudTtsRequests,staticManifestRequests,staticAudioRequests,systemCalls,geometry,consoleErrors,pageErrors},null,2));
}finally{await context.close();await browser.close();}
