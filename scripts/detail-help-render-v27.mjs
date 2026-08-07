import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const PROFILE = process.env.DOKOHILF_MOBILE_PROFILE || 'ios';
const WIDTH = Number(process.env.DOKOHILF_VIEWPORT_WIDTH || (PROFILE === 'android' ? 412 : 393));
const HEIGHT = Number(process.env.DOKOHILF_VIEWPORT_HEIGHT || (PROFILE === 'android' ? 915 : 852));
const SCALE = Number(process.env.DOKOHILF_DEVICE_SCALE_FACTOR || 2);
const BASE_URL = process.env.DOKOHILF_RENDER_URL || 'http://127.0.0.1:4173/';
const OUTPUT_DIR = process.env.DOKOHILF_RENDER_OUTPUT || `artifacts/detail-help-v27/${PROFILE}`;
const GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.';
const DETAIL_ORIENTATION = 'Okay. Schau oben in die grüne Reiterleiste. Siehst du Doku-Erweitert?';

function assert(condition, message) { if (!condition) throw new Error(message); }
function silentWav() {
  const sampleRate = 8000, samples = 640, dataSize = samples * 2, buffer = Buffer.alloc(44 + dataSize);
  buffer.write('RIFF',0,'ascii'); buffer.writeUInt32LE(36+dataSize,4); buffer.write('WAVE',8,'ascii'); buffer.write('fmt ',12,'ascii');
  buffer.writeUInt32LE(16,16); buffer.writeUInt16LE(1,20); buffer.writeUInt16LE(1,22); buffer.writeUInt32LE(sampleRate,24); buffer.writeUInt32LE(sampleRate*2,28);
  buffer.writeUInt16LE(2,32); buffer.writeUInt16LE(16,34); buffer.write('data',36,'ascii'); buffer.writeUInt32LE(dataSize,40); return buffer;
}

await mkdir(OUTPUT_DIR,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({
  viewport:{width:WIDTH,height:HEIGHT},deviceScaleFactor:SCALE,isMobile:true,hasTouch:true,serviceWorkers:'block',
  userAgent:PROFILE==='android'?'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/139 Mobile Safari/537.36':'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1',
});
const page=await context.newPage();
const consoleErrors=[]; const pageErrors=[];
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

let unexpectedRouterRequests=0,cloudTtsRequests=0,staticManifestRequests=0,staticAudioRequests=0;
await page.route(/\/functions\/v1\/dokohilf-ai-router(?:\?.*)?$/,async r=>{unexpectedRouterRequests+=1;await r.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'detail_help_should_intercept_before_router'})});});
await page.route(/\/functions\/v1\/dokohilf-tts(?:\?.*)?$/,async r=>{cloudTtsRequests+=1;await r.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'tts_network_forbidden_in_v28'})});});
await page.route('**/assets/guide-audio-catalog.json*',async r=>{staticManifestRequests+=1;await r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({schemaVersion:1,voice:'Supertonic-F1',entries:[{file:'assets/audio/guides/000.wav',text:GREETING},{file:'assets/audio/guides/093.wav',text:DETAIL_ORIENTATION}]})});});
await page.route('**/assets/audio/guides/*.wav',async r=>{staticAudioRequests+=1;await r.fulfill({status:200,contentType:'audio/wav',body:silentWav()});});

try{
  await page.goto(BASE_URL,{waitUntil:'networkidle'});assert((await page.locator('#buildPill').innerText()).includes('v28'),'Detailhilfe-Test läuft nicht auf v28.');

  await page.locator('[data-select-mode="chat"]').click();await page.locator('#workspace').waitFor({state:'visible'});await page.locator('#chatInput').fill('Hallo ich finde die Vitalwerte nicht wo sind die?');await page.getByRole('button',{name:'Senden'}).click();
  const chatHelp=page.locator('#detailHelpOptionsV27');await chatHelp.waitFor({state:'visible'});await page.waitForFunction(()=>[...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Schau oben in die grüne Reiterleiste'));
  const firstReply=await page.locator('.message.assistant .bubble p').last().innerText();assert(firstReply.includes('Doku-Erweitert'),'Vitalwerte-Orientierung nennt Doku-Erweitert nicht.');assert(!/erledigt|tun nicht so|markiere/i.test(firstReply),'Interne Zustandsformulierungen sichtbar.');assert(await chatHelp.locator('[data-detail-help-value]').count()===4,'Vier Chat-Optionen fehlen.');assert((await page.locator('#guideProgressStep').innerText()).includes('Schritt 1 von 2'),'Guide nicht bei Schritt 1.');assert(await page.locator('#commandRow').evaluate(n=>getComputedStyle(n).display)==='none','Weiter während Hilfe sichtbar.');
  await page.getByRole('button',{name:'Doku-Erweitert offen'}).click();await page.waitForFunction(()=>document.querySelector('#guideProgressStep')?.textContent?.includes('Schritt 2 von 2'));await page.waitForFunction(()=>[...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Siehst du Vitalwerte'));
  const secondReply=await page.locator('.message.assistant .bubble p').last().innerText();assert(secondReply.includes('Vitalwerte Sammelerf.'),'Sammelerfassung fehlt.');assert(secondReply.length<180,'Zweiter Schritt zu lang.');
  await page.getByRole('button',{name:'Vitalwerte fehlt'}).click();await page.waitForFunction(()=>[...document.querySelectorAll('.message.assistant .bubble p')].at(-1)?.textContent?.includes('Prüfe den Einstieg noch einmal'));const missingReply=await page.locator('.message.assistant .bubble p').last().innerText();assert(!missingReply.includes('bestätigten Alternativ-Klickweg'),'Interne Fachgrenze sichtbar.');
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,viewport:window.innerWidth}));assert(dimensions.width<=dimensions.viewport+1,'Chat horizontaler Overflow.');await page.screenshot({path:`${OUTPUT_DIR}/detail-help-chat-${PROFILE}.png`,fullPage:true});

  await page.evaluate(()=>window.DokoHilf?.resetConversation?.({keepMode:false}));await page.locator('#startScreen').waitFor({state:'visible'});await page.locator('[data-select-mode="voice"]').click();await page.locator('.voice-focus-stage').waitFor({state:'visible'});await page.waitForFunction(()=>window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('000.wav'));
  assert(staticManifestRequests>=1,'Supertonic-Katalog nicht geladen.');assert(staticAudioRequests>=1,'Begrüßungs-Audio nicht geladen.');assert(await page.evaluate(()=>window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__.length)===0,'Begrüßung startete lokale Inferenz.');

  await page.evaluate(()=>window.DokoHilf?.sendMessage?.('Ich finde die Vitalwerte nicht wo sind die?',{fromVoice:true}));const voiceHelp=page.locator('#voiceDetailHelpOptionsV27');await voiceHelp.waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#voiceFocusText')?.textContent?.includes('Schau oben in die grüne Reiterleiste'));await page.waitForFunction(()=>window.DokoHilfStaticFirstVoiceV28?.getState?.().lastStaticHit?.includes('093.wav'));
  const voiceText=await page.locator('#voiceFocusText').innerText();assert(!/erledigt|tun nicht so|markiere/i.test(voiceText),'Voice zeigt interne Zustände.');assert(await voiceHelp.locator('[data-detail-help-value]').count()===4,'Vier Voice-Optionen fehlen.');assert(await page.locator('#appShell').getAttribute('data-detail-help')==='true','Voice-Detailhilfe-Zustand fehlt.');assert(await page.evaluate(()=>window.__DOKOHILF_LOCAL_VOICE_TEST_CALLS__.length)===0,'Bestätigte Detailhilfe fiel in lokale Inferenz.');

  const systemCalls=await page.evaluate(()=>[...window.__DOKOHILF_SYSTEM_SPEECH_TEST_CALLS__]);assert(systemCalls.length===0,'Systemstimme aufgerufen.');assert(cloudTtsRequests===0,'TTS-Netzwerkpfad erreicht.');assert(unexpectedRouterRequests===0,'Detailhilfe rief Router unnötig auf.');
  const geometry=await page.evaluate(()=>{const rect=s=>document.querySelector(s)?.getBoundingClientRect();const opts=[...document.querySelectorAll('#voiceDetailHelpOptionsV27 [data-detail-help-value]')].map(n=>n.getBoundingClientRect());const actions=document.querySelector('#voiceFocusActions');return{instruction:rect('.voice-focus-instruction'),panel:rect('#voiceDetailHelpOptionsV27'),orb:rect('.voice-focus-stage .voice-orb'),actionsDisplay:actions?getComputedStyle(actions).display:'missing',optionRects:opts.map(x=>({x:x.x,y:x.y,width:x.width,height:x.height})),scrollWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth};});
  assert(geometry.actionsDisplay==='none','Voice-Aktionen konkurrieren mit Hilfe.');assert(geometry.orb?.width<=110,`Mikrofon zu groß: ${geometry.orb?.width}`);assert(geometry.instruction&&geometry.panel&&geometry.instruction.bottom<=geometry.panel.top+1,'Frage/Optionen überlappen.');assert(geometry.panel&&geometry.orb&&geometry.panel.bottom<=geometry.orb.top+1,'Optionen/Mikrofon überlappen.');assert(geometry.optionRects.length===4,'Vier Optionen fehlen.');assert(Math.abs(geometry.optionRects[0].y-geometry.optionRects[1].y)<2,'Optionen nicht zweispaltig.');assert(geometry.optionRects[2].y>geometry.optionRects[0].y,'Zweite Optionszeile fehlt.');assert(geometry.scrollWidth<=geometry.viewportWidth+1,'Voice horizontaler Overflow.');
  await page.screenshot({path:`${OUTPUT_DIR}/detail-help-voice-${PROFILE}.png`,fullPage:false});assert(consoleErrors.length===0,`Console-Fehler: ${consoleErrors.join(' | ')}`);assert(pageErrors.length===0,`Page-Fehler: ${pageErrors.join(' | ')}`);
  await writeFile(`${OUTPUT_DIR}/detail-help-summary.json`,JSON.stringify({profile:PROFILE,viewport:{width:WIDTH,height:HEIGHT},routerRequests:unexpectedRouterRequests,cloudTtsRequests,staticManifestRequests,staticAudioRequests,systemCalls,geometry,consoleErrors,pageErrors},null,2));
}finally{await context.close();await browser.close();}
