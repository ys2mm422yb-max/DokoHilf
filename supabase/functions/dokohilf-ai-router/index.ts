const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
const MODEL = 'gemini-3.6-flash';
const requestWindows = new Map<string, { at: number; count: number }>();

type Message = { role: 'user' | 'assistant'; content: string };
type Step = { text?: string; check?: string; stuck?: string };
type Guide = { slug: string; title: string; aliases: string[]; steps: Step[] };
type Option = { label: string; guideSlug: string; description?: string };
type Decision = { action: string; guideSlug?: string; reply?: string };
type VitalMode = 'single' | 'batch' | 'choice' | null;

function normalize(value: unknown): string {
  return String(value || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}
function cors(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://ys2mm422yb-max.github.io',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Router',
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin',
  };
}
function respond(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: {
    ...cors(origin), 'Content-Type': 'application/json; charset=utf-8',
    'X-DokoHilf-Router': 'conversational-guide-router-v5',
  }});
}
function limited(req: Request): boolean {
  const key = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now(); const current = requestWindows.get(key);
  if (!current || now - current.at >= 60_000) { requestWindows.set(key, { at: now, count: 1 }); return false; }
  current.count += 1; return current.count > 18;
}
function messages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-12).map(item => {
    if (!item || typeof item !== 'object') return null;
    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const clean = content.replace(/\u0000/g, '').trim().slice(0, 350);
    return clean ? { role, content: clean } as Message : null;
  }).filter((item): item is Message => Boolean(item));
}
function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(item => typeof item === 'string').map(item => String(item).trim()).filter(Boolean))].slice(0, 3);
}
function sensitive(text: string): boolean {
  const raw = text.trim(); const n = normalize(raw);
  if ([/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,/\b(?:\+49|0)[\d\s/()-]{7,}\b/,/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[a-zäöüß-]{2,}/i,
    /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer|bewohnernummer)\b/i,/\b\d{6,}\b/]
    .some(pattern => pattern.test(raw))) return true;
  return /\b(diagnose|blutdruck|puls|temperatur|medikament|dosis|insulin|schmerz|wunde|mg|ml)\b/i.test(n)
    && (/\b(hat|bekommt|nimmt|leidet|gesturzt|bewohner|klient|patient)\b/i.test(n) || /\d/.test(raw));
}
async function loadGuides(): Promise<Guide[]> {
  const url = Deno.env.get('SUPABASE_URL'); const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) throw new Error('knowledge');
  const response = await fetch(`${url}/rest/v1/dokohilf_guides?select=slug,title,aliases,steps&status=eq.approved`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) throw new Error('knowledge');
  const data = await response.json(); return Array.isArray(data) ? data : [];
}
function lastUser(list: Message[]): string { return [...list].reverse().find(item => item.role === 'user')?.content || ''; }
function lastAssistant(list: Message[]): string {
  for (let index = list.length - 2; index >= 0; index -= 1) if (list[index].role === 'assistant') return list[index].content;
  return '';
}
function option(guides: Guide[], slug: string, fallback: string, description = ''): Option | null {
  const guide = guides.find(item => item.slug === slug);
  return guide ? { label: guide.title || fallback, guideSlug: slug, ...(description ? { description } : {}) } : null;
}
function correctionOptions(guides: Guide[]): Option[] {
  return [option(guides, 'bericht-durchstreichen', 'Bericht durchstreichen'), option(guides, 'durchfuehrung-storno', 'Durchführung stornieren')]
    .filter((item): item is Option => Boolean(item));
}
function correctionAmbiguous(text: string): boolean {
  const n = normalize(text);
  return /\b(falsch dokumentiert|falsch eingetragen|falsch erfasst|etwas stornieren|etwas loschen|eintrag korrigieren|eintrag wegmachen|dokumentation ruckgangig)\b/.test(n)
    && !/\b(bericht|berichtseintrag|pflegebericht|durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme)\b/.test(n);
}
function vitalTypes(text: string): string[] {
  const n = normalize(text); const found: string[] = [];
  for (const [name, pattern] of [['blutdruck',/\bblutdruck\b/],['puls',/\bpuls\b/],['temperatur',/\btemperatur\b/],['gewicht',/\bgewicht\b/],['blutzucker',/\bblutzucker\b/],['sauerstoff',/\b(sauerstoff|sattigung|spo2)\b/]] as const) {
    if (pattern.test(n)) found.push(name);
  }
  return found;
}
function vitalAction(text: string): boolean { return /\b(eingeben|eintragen|erfassen|dokumentieren|anlegen|aufnehmen|speichern|festhalten)\b/.test(normalize(text)); }
function inferVitalChoice(list: Message[], alternatives: string[]): Exclude<VitalMode, 'choice' | null> | null {
  if (!/\b(einzel|mehrere|sammelerfassung|gleichzeitig)\b/.test(normalize(lastAssistant(list)))) return null;
  const answer = normalize([lastUser(list), ...alternatives].join(' '));
  if (/\b(mehrere|sammelerfassung|sammel erfassung|gleichzeitig|zusammen|alle)\b/.test(answer)) return 'batch';
  if (/\b(einzelwert|einzelerfassung|ein einzelner|einen einzelnen|nur ein|ein wert)\b/.test(answer)) return 'single';
  return null;
}
function detectVitalEntryMode(list: Message[], alternatives: string[], active: Guide | null): VitalMode {
  const inferred = inferVitalChoice(list, alternatives); if (inferred) return inferred;
  const recent = normalize(list.slice(-6).map(item => item.content).join(' '));
  const context = Boolean(active?.slug.startsWith('vitalwerte')) || /\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|sattigung)\b/.test(recent);
  const relevant = [lastUser(list), ...alternatives].filter(text => vitalAction(text)
    && (context || /\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|sattigung|spo2)\b/.test(normalize(text))));
  if (!relevant.length) return null;
  const joined = normalize(relevant.join(' ')); const types = new Set(relevant.flatMap(vitalTypes));
  if (/\b(sammelerfassung|sammel erfassung|mehrere|gleichzeitig|zusammen|alle werte)\b/.test(joined) || types.size >= 2) return 'batch';
  if (/\b(einen vitalwert|ein vitalwert|einzelwert|einzelerfassung)\b/.test(joined) || types.size === 1) return 'single';
  return 'choice';
}
function vitalChoice(origin: string | null, guides: Guide[], continuation: boolean): Response {
  const single = continuation ? 'vitalwerte-erfassen-fortsetzen' : 'vitalwerte-erfassen';
  const batch = continuation ? 'vitalwerte-sammelerfassung-fortsetzen' : 'vitalwerte-sammelerfassung';
  const options = [
    option(guides, single, 'Einzelwert erfassen', 'Grünes Plus oben links → Vitalwert im Pop-up auswählen'),
    option(guides, batch, 'Mehrere Werte erfassen', 'Sammelerfassung für mehrere Vitalwerte gleichzeitig'),
  ].filter((item): item is Option => Boolean(item));
  return respond(origin, 200, {
    reply: continuation
      ? 'Dein Ziel ist klar: Du möchtest Vitalwerte eingeben. Wähle jetzt einen Einzelwert über das grüne Plus oder mehrere Werte über die Sammelerfassung.'
      : 'Dein Ziel ist klar: Du möchtest Vitalwerte eingeben. Geht es um einen Einzelwert oder um mehrere Werte gleichzeitig?',
    guideSlug: null, source: 'vital-entry-mode-choice', intent: 'vitalwerte-erfassen',
    choiceTitle: 'Wie möchtest du die Vitalwerte erfassen?', options,
  });
}
function nothingOpen(text: string): boolean {
  const n = normalize(text); return /\b(nichts|nix|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\bwelches\b.*\b(fenster|bereich)\b/.test(n) || /\bich bin noch nicht\b.*\b(vitalwert|doku|bereich|fenster)\b/.test(n);
}
function positive(text: string): boolean { return /^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ist offen|ist geoffnet)$/.test(normalize(text)); }
function repeat(text: string): boolean { return /^(nochmal|erneut|wiederholen|noch einmal|schritt wiederholen)$/.test(normalize(text)); }
function back(text: string): boolean { return /^(zuruck|einen schritt zuruck|schritt zuruck)$/.test(normalize(text)); }
function stuck(text: string): boolean {
  const n = normalize(text); return /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
    || /^(geht|klappt|funktioniert) nicht\b/.test(n) || /^(ich komme|komme) nicht weiter\b/.test(n)
    || /^(ich finde es nicht|ich finde das nicht|finde ich nicht|sehe ich nicht|ich brauche hilfe)$/.test(n);
}
function confirmation(list: Message[]): boolean {
  const user = normalize(lastUser(list)); const assistant = normalize(lastAssistant(list));
  if (!user || /\b(nicht|nichts|noch nicht|falsch|keine|kein|geht nicht|klappt nicht)\b/.test(user)) return false;
  if (positive(user)) return true;
  if (/\b(geoffnet|ausgewahlt|angeklickt|geklickt|eingetragen|erfasst|eingegeben|ausgefullt|gespeichert|sichtbar|durchgefuhrt)\b/.test(user)
    && /\b(ich|habe|hab|ist|sind|wurde|wurden|jetzt)\b/.test(user)) return true;
  return /\b(richtig|vitalwert|ausgewahlt)\b/.test(assistant)
    && /\b(blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|vitalwert|set)\b/.test(user)
    && /\b(ausgewahlt|genommen|markiert|angeklickt)\b/.test(user);
}
function currentIndex(parsed: Record<string, unknown>, list: Message[], guide: Guide): number {
  const supplied = Number(parsed.guideStep);
  if (Number.isInteger(supplied) && supplied >= 1 && supplied <= guide.steps.length) return supplied - 1;
  const assistant = normalize(lastAssistant(list)); let best = 0; let score = 0;
  guide.steps.forEach((step, index) => {
    const text = normalize(step.text); const check = normalize(step.check); let next = 0;
    if (text && assistant.includes(text)) next += 100; if (check && assistant.includes(check)) next += 60;
    const anchor = text.split(' ').slice(0, 8).join(' '); if (anchor.length >= 18 && assistant.includes(anchor)) next += 35;
    if (next > score) { score = next; best = index; }
  });
  return best;
}
function renderGuideStep(origin: string | null, guide: Guide, index: number, source: string, prefix = ''): Response {
  const safe = Math.max(0, Math.min(index, guide.steps.length));
  if (safe >= guide.steps.length) return respond(origin, 200, {
    reply: `${prefix}Der Ablauf ist erledigt. Kontrolliere zum Schluss, ob der Eintrag in der vorgesehenen Übersicht sichtbar ist.`.trim(),
    guideSlug: null, guideTitle: guide.title, guideStep: guide.steps.length,
    guideStepCount: guide.steps.length, completed: true, source,
  });
  const step = guide.steps[safe] || {};
  return respond(origin, 200, {
    reply: `${prefix}${String(step.text || '').trim()}\n\n${String(step.check || 'Ist dieser Schritt erledigt?').trim()}`.trim(),
    guideSlug: guide.slug, guideTitle: guide.title, guideStep: safe + 1,
    guideStepCount: guide.steps.length, completed: false, source,
  });
}
function start(origin: string | null, guides: Guide[], slug: string, prefix = ''): Response {
  const guide = guides.find(item => item.slug === slug);
  return guide ? renderGuideStep(origin, guide, 0, 'approved-guide-router-start', prefix)
    : respond(origin, 400, { error: 'Diese Anleitung ist nicht freigegeben.' });
}
function command(origin: string | null, parsed: Record<string, unknown>, list: Message[], guide: Guide, action: 'weiter'|'nochmal'|'zurück'): Response {
  const current = currentIndex(parsed, list, guide);
  const next = action === 'weiter' ? current + 1 : action === 'zurück' ? Math.max(0, current - 1) : current;
  return renderGuideStep(origin, guide, next, `approved-guide-router-${action}`);
}
function help(origin: string | null, parsed: Record<string, unknown>, list: Message[], guide: Guide): Response {
  const index = currentIndex(parsed, list, guide); const step = guide.steps[index] || guide.steps[0] || {};
  return respond(origin, 200, {
    reply: `${String(step.stuck || `Bleibe beim aktuellen Schritt und suche genau nach der genannten Stelle: ${step.text || ''}`).trim()}\n\nKlappt es so?`,
    guideSlug: guide.slug, guideTitle: guide.title, guideStep: index + 1,
    guideStepCount: guide.steps.length, source: 'approved-guide-router-stuck',
  });
}
async function core(body: Record<string, unknown>): Promise<{status:number; payload:Record<string,unknown>}> {
  const url = Deno.env.get('SUPABASE_URL'); if (!url) return { status: 503, payload: { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' } };
  const response = await fetch(`${url}/functions/v1/dokohilf-ai`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json().catch(() => ({}));
  if (typeof payload?.reply === 'string' && /noch nicht freigegeben|bestatigt ist bisher|genauen klickweg/i.test(normalize(payload.reply))) {
    payload.reply = 'Dafür ist aktuell noch keine bestätigte Schritt-für-Schritt-Anleitung hinterlegt. Beschreibe bitte genauer, welche vorhandene Funktion du nutzen möchtest.';
    payload.guideSlug = null; payload.source = 'neutral-unavailable-guide';
  }
  return { status: response.status, payload };
}
function modelText(payload: Record<string, unknown>): string {
  const parts = (payload.candidates as Array<Record<string, unknown>> | undefined)?.[0]?.content as Record<string, unknown> | undefined;
  return Array.isArray(parts?.parts) ? parts.parts.map(part => typeof (part as Record<string, unknown>).text === 'string' ? (part as Record<string, unknown>).text : '').join('').trim() : '';
}
async function interpret(apiKey: string, guides: Guide[], active: Guide, list: Message[], alternatives: string[]): Promise<Decision> {
  const prompt = [
    'Du interpretierst nur die letzte Antwort in einem laufenden DokoHilf-Ablauf.',
    'Das einmal genannte Ziel bleibt bestehen. Frage nicht erneut nach erfassen oder ansehen, wenn eingeben, eintragen oder erfassen bereits genannt wurde.',
    'Erfinde keine Klickwege. Antworte nur als JSON.',
    'action: continue, repeat, back, restart_current, start_guide, cancel, clarify oder fallback.',
    'Bei start_guide muss guideSlug aus dem Katalog stammen. clarify maximal 30 Wörter.',
    `Aktiver Guide: ${JSON.stringify({slug:active.slug,title:active.title})}`,
    `Letzte Anweisung: ${JSON.stringify(lastAssistant(list))}`,
    `Antwort: ${JSON.stringify(lastUser(list))}`,
    `Alternativen: ${JSON.stringify(alternatives)}`,
    `Katalog: ${JSON.stringify(guides.map(g=>({slug:g.slug,title:g.title,aliases:g.aliases})))}`,
  ].join('\n');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:180,responseMimeType:'application/json',thinkingConfig:{thinkingLevel:'minimal'}}}),
  });
  if (!response.ok) return { action: 'fallback' };
  try {
    const parsed = JSON.parse(modelText(await response.json())) as Decision;
    const allowed = new Set(['continue','repeat','back','restart_current','start_guide','cancel','clarify','fallback']);
    if (!allowed.has(parsed.action)) return { action:'fallback' };
    if (parsed.action === 'start_guide' && !guides.some(g=>g.slug===parsed.guideSlug)) return { action:'fallback' };
    if (parsed.action === 'clarify') parsed.reply = String(parsed.reply || '').trim().slice(0,200);
    return parsed;
  } catch { return { action:'fallback' }; }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null,{status:204,headers:cors(origin)});
  if (req.method !== 'POST') return respond(origin,405,{error:'Nur POST ist erlaubt.'});
  if (origin && !ALLOWED_ORIGINS.has(origin)) return respond(origin,403,{error:'Diese Herkunft ist nicht freigegeben.'});
  if (limited(req)) return respond(origin,429,{error:'Zu viele Anfragen. Bitte kurz warten.'});
  let parsed: Record<string, unknown>;
  try { const raw=await req.text(); if(!raw||raw.length>16_000) throw new Error(); parsed=JSON.parse(raw); }
  catch { return respond(origin,400,{error:'Ungültige oder zu große Anfrage.'}); }
  const list=messages(parsed.messages);
  if(!list.length||list.at(-1)?.role!=='user') return respond(origin,400,{error:'Es fehlt eine gültige Nutzernachricht.'});
  if(list.some(item=>item.role==='user'&&sensitive(item.content))) return respond(origin,422,{blocked:true,error:'Mögliche Echtdaten erkannt. Die Anfrage wurde nicht weiterverarbeitet.'});
  let guides: Guide[]; try { guides=await loadGuides(); } catch { return respond(origin,503,{error:'Die freigegebene Wissensbasis ist gerade nicht erreichbar.'}); }
  const text=lastUser(list); const alternatives=strings(parsed.speechAlternatives);
  const active=guides.find(item=>item.slug===String(parsed.guideSlug||''))||null;
  const selected=String(parsed.selectedGuideSlug||''); if(selected) return start(origin,guides,selected);
  const mode=detectVitalEntryMode(list,alternatives,active);
  const suppliedStep=Number(parsed.guideStep);
  const continuation=active?.slug==='vitalwerte'||(Boolean(active?.slug.startsWith('vitalwerte'))&&Number.isInteger(suppliedStep)&&suppliedStep>=2)||(/\bvitalwerte\b/.test(normalize(lastAssistant(list)))&&/\b(geoffnet|offen)\b/.test(normalize(lastAssistant(list))));
  if(!active&&mode) return mode==='single'?start(origin,guides,'vitalwerte-erfassen'):mode==='batch'?start(origin,guides,'vitalwerte-sammelerfassung'):vitalChoice(origin,guides,false);
  if(active?.slug==='vitalwerte'&&mode) return mode==='single'?start(origin,guides,'vitalwerte-erfassen-fortsetzen'):mode==='batch'?start(origin,guides,'vitalwerte-sammelerfassung-fortsetzen'):vitalChoice(origin,guides,true);
  if(active?.slug.includes('erfassen')&&mode==='batch') return start(origin,guides,continuation?'vitalwerte-sammelerfassung-fortsetzen':'vitalwerte-sammelerfassung','Verstanden – du möchtest mehrere Werte gleichzeitig erfassen. ');
  if(active?.slug.includes('sammelerfassung')&&mode==='single') return start(origin,guides,continuation?'vitalwerte-erfassen-fortsetzen':'vitalwerte-erfassen','Verstanden – du möchtest einen einzelnen Wert erfassen. ');
  if(active?.slug.endsWith('-fortsetzen')&&nothingOpen(text)) return start(origin,guides,active.slug.includes('sammelerfassung')?'vitalwerte-sammelerfassung':'vitalwerte-erfassen','Stimmt – dann starten wir ganz vorne. ');
  if(!active&&/^(albert|allwert|vital wert) erfassen$/.test(normalize(text))) {
    const item=option(guides,'vitalwerte-erfassen','Vitalwerte erfassen','Einzelwert über das grüne Plus erfassen');
    return respond(origin,200,{reply:'Ich habe „Albert erfassen“ verstanden. Meinst du einen Vitalwert erfassen?',guideSlug:null,source:'speech-recognition-clarification',choiceTitle:'Meintest du Vitalwerte?',options:item?[item]:[]});
  }
  if(!active&&/^(erfassen|neu erfassen|eingeben|eintragen|nachsehen|ansehen|verlauf)$/.test(normalize(text))) return respond(origin,200,{reply:'Was möchtest du erfassen oder ansehen? Nenne bitte den Bereich, zum Beispiel Vitalwerte oder Berichte.',guideSlug:null,source:'context-required-clarification',options:[]});
  if(correctionAmbiguous(text)) return respond(origin,200,{reply:'Was möchtest du korrigieren: einen Bericht oder eine Durchführung?',guideSlug:null,source:'structured-clarification',choiceTitle:'Was soll korrigiert werden?',options:correctionOptions(guides)});
  if(active){
    if(back(text)) return command(origin,parsed,list,active,'zurück');
    if(repeat(text)) return command(origin,parsed,list,active,'nochmal');
    if(stuck(text)) return help(origin,parsed,list,active);
    if(positive(text)||confirmation(list)) return command(origin,parsed,list,active,'weiter');
    const key=Deno.env.get('GEMINI_API_KEY');
    if(key){
      const decision=await interpret(key,guides,active,list,alternatives);
      if(decision.action==='continue') return command(origin,parsed,list,active,'weiter');
      if(decision.action==='repeat') return command(origin,parsed,list,active,'nochmal');
      if(decision.action==='back') return command(origin,parsed,list,active,'zurück');
      if(decision.action==='restart_current') return start(origin,guides,active.slug,'Okay, wir beginnen diesen Ablauf noch einmal von vorne. ');
      if(decision.action==='start_guide'&&decision.guideSlug) return start(origin,guides,decision.guideSlug,'Verstanden. Ich wechsle zum passenden Ablauf. ');
      if(decision.action==='cancel') return respond(origin,200,{reply:'Okay, ich stoppe diesen Ablauf. Was möchtest du stattdessen erledigen?',guideSlug:null,source:'ai-dialogue-cancel'});
      if(decision.action==='clarify'&&decision.reply){ const index=currentIndex(parsed,list,active); return respond(origin,200,{reply:decision.reply,guideSlug:active.slug,guideTitle:active.title,guideStep:index+1,guideStepCount:active.steps.length,source:'ai-dialogue-clarification'}); }
    }
    const index=currentIndex(parsed,list,active);
    return respond(origin,200,{reply:'Ich bleibe beim aktuellen Schritt. Ist er erledigt, soll ich ihn wiederholen oder brauchst du Hilfe dabei?',guideSlug:active.slug,guideTitle:active.title,guideStep:index+1,guideStepCount:active.steps.length,source:'guide-context-clarification'});
  }
  const result=await core(parsed); return respond(origin,result.status,result.payload);
});
