const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const MODEL = 'gemini-3.6-flash';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 18;
const MAX_BODY_CHARS = 16_000;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GuideOption = { label: string; guideSlug: string; description?: string };
type GuideStep = { text?: string; check?: string; stuck?: string };
type GuideRecord = {
  slug: string;
  title: string;
  aliases: string[];
  steps: GuideStep[];
  troubleshooting?: Record<string, string>;
  version?: number;
};
type CoreResult = { status: number; payload: Record<string, unknown> };
type DialogueDecision = {
  action: 'continue' | 'repeat' | 'back' | 'restart_current' | 'start_guide' | 'cancel' | 'clarify' | 'fallback';
  guideSlug?: string;
  reply?: string;
};
type VitalMode = 'single' | 'batch' | 'choice' | null;

function normalize(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Router',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'X-DokoHilf-Router': 'conversational-guide-router-v8',
    },
  });
}

function isRateLimited(req: Request): boolean {
  const key = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || 'unknown';
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.slice(-12).map((item): ChatMessage | null => {
    if (!item || typeof item !== 'object') return null;
    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const clean = content.replace(/\u0000/g, '').trim().slice(0, 350);
    return clean ? { role, content: clean } : null;
  }).filter((item): item is ChatMessage => Boolean(item));
}

function sanitizeStrings(value: unknown, limit = 3): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value
    .map(item => typeof item === 'string' ? item.trim().slice(0, 350) : '')
    .filter(Boolean)
    .filter(item => {
      const key = normalize(item);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function containsSensitiveData(text: string): boolean {
  const raw = String(text || '').trim();
  const n = normalize(raw);
  const direct = [
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
    /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
    /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[a-zäöüß-]{2,}/i,
    /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer|bewohnernummer)\b/i,
    /\b\d{6,}\b/,
  ];
  if (direct.some(pattern => pattern.test(raw))) return true;
  const health = /\b(diagnose|blutdruck|puls|temperatur|medikament|dosis|insulin|schmerz|wunde|berichtstext|ubergabeinhalt|mg|ml)\b/i.test(n);
  const caseLanguage = /\b(hat|bekommt|nimmt|leidet|war heute|ist gesturzt|verweigert|bewohner|klient|patient)\b/i.test(n);
  return health && (caseLanguage || /\d/.test(raw));
}

async function loadApprovedGuides(): Promise<GuideRecord[]> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('knowledge_unavailable');
  const response = await fetch(
    `${url}/rest/v1/dokohilf_guides?select=slug,title,aliases,steps,troubleshooting,version&status=eq.approved`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!response.ok) throw new Error('knowledge_unavailable');
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function latestUser(messages: ChatMessage[]): string {
  return [...messages].reverse().find(message => message.role === 'user')?.content || '';
}

function previousAssistant(messages: ChatMessage[]): string {
  for (let index = messages.length - 2; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') return messages[index].content;
  }
  return '';
}

function optionFor(
  guides: GuideRecord[],
  slug: string,
  fallbackLabel: string,
  description = '',
): GuideOption | null {
  const guide = guides.find(item => item.slug === slug);
  return guide ? {
    label: guide.title || fallbackLabel,
    guideSlug: guide.slug,
    ...(description ? { description } : {}),
  } : null;
}

function correctionOptions(guides: GuideRecord[]): GuideOption[] {
  return [
    optionFor(guides, 'bericht-durchstreichen', 'Bericht durchstreichen'),
    optionFor(guides, 'durchfuehrung-storno', 'Durchführung stornieren'),
  ].filter((item): item is GuideOption => Boolean(item));
}

function vitalOptions(guides: GuideRecord[], continuation: boolean): GuideOption[] {
  const singleSlug = continuation ? 'vitalwerte-einzelwert-fortsetzen' : 'vitalwerte-einzelwert';
  const batchSlug = continuation ? 'vitalwerte-sammelerfassung-fortsetzen' : 'vitalwerte-sammelerfassung';
  return [
    optionFor(guides, singleSlug, 'Einzelnen Vitalwert erfassen', 'Grünes Plus → Vitalwert im Pop-up auswählen'),
    optionFor(guides, batchSlug, 'Mehrere Vitalwerte erfassen', 'Sammelerfassung für mehrere Werte gleichzeitig'),
  ].filter((item): item is GuideOption => Boolean(item));
}

function isCorrectionAmbiguous(text: string): boolean {
  const n = normalize(text);
  const ambiguous = /\b(falsch dokumentiert|falsch eingetragen|falsch erfasst|etwas stornieren|etwas loschen|eintrag korrigieren|eintrag wegmachen|dokumentation ruckgangig|dokumentation zurucknehmen)\b/.test(n);
  const hasSpecificTarget = /\b(bericht|berichtseintrag|pflegebericht|durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme)\b/.test(n);
  return ambiguous && !hasSpecificTarget;
}

function looksLikeVitalwert(text: string): boolean {
  return /\b(vitalwert|vitalwerte|vital wert|blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoffsattigung|sauerstoff|spo2)\b/.test(normalize(text));
}

function hasVitalEntryAction(text: string): boolean {
  return /\b(eingeben|eintragen|erfassen|anlegen|dokumentieren|aufnehmen|speichern|festhalten)\b/.test(normalize(text));
}

function vitalTypes(text: string): string[] {
  const n = normalize(text);
  const found: string[] = [];
  const candidates: Array<[string, RegExp]> = [
    ['blutdruck', /\bblutdruck\b/],
    ['puls', /\bpuls\b/],
    ['temperatur', /\btemperatur\b/],
    ['gewicht', /\bgewicht\b/],
    ['blutzucker', /\bblutzucker\b/],
    ['sauerstoff', /\b(sauerstoff|sattigung|spo2)\b/],
  ];
  for (const [name, pattern] of candidates) if (pattern.test(n)) found.push(name);
  return found;
}

function inferChoiceAnswer(messages: ChatMessage[], alternatives: string[]): Exclude<VitalMode, 'choice' | null> | null {
  const assistant = normalize(previousAssistant(messages));
  if (!/\b(einzel|mehrere|sammelerfassung|gleichzeitig)\b/.test(assistant)) return null;
  const answer = normalize([latestUser(messages), ...alternatives].join(' '));
  if (/\b(mehrere|sammelerfassung|sammel erfassung|gleichzeitig|zusammen|alle)\b/.test(answer)) return 'batch';
  if (/\b(einzelwert|einzelerfassung|ein einzelner|einen einzelnen|nur ein|ein wert)\b/.test(answer)) return 'single';
  return null;
}

function detectVitalMode(
  messages: ChatMessage[],
  alternatives: string[],
  activeGuide: GuideRecord | null,
): VitalMode {
  const inferred = inferChoiceAnswer(messages, alternatives);
  if (inferred) return inferred;

  const candidates = [latestUser(messages), ...alternatives];
  const recent = normalize(messages.slice(-6).map(message => message.content).join(' '));
  const hasContext = Boolean(activeGuide?.slug.startsWith('vitalwerte'))
    || /\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|sattigung|spo2)\b/.test(recent);
  const relevant = candidates.filter(text => hasVitalEntryAction(text)
    && (hasContext || looksLikeVitalwert(text)));
  if (!relevant.length) return null;

  const joined = normalize(relevant.join(' '));
  const types = new Set(relevant.flatMap(vitalTypes));
  if (/\b(sammelerfassung|sammel erfassung|mehrere|gleichzeitig|zusammen|alle werte)\b/.test(joined) || types.size >= 2) return 'batch';
  if (/\b(einen vitalwert|ein vitalwert|einzelwert|einzelerfassung|einzeln)\b/.test(joined) || types.size === 1) return 'single';
  return 'choice';
}

function vitalChoiceResponse(
  origin: string | null,
  guides: GuideRecord[],
  continuation: boolean,
): Response {
  return jsonResponse(origin, 200, {
    reply: continuation
      ? 'Du möchtest Vitalwerte eingeben. Wähle jetzt: einen einzelnen Wert über das grüne Plus oder mehrere Werte über „Sammelerfassung“.'
      : 'Du möchtest Vitalwerte eingeben. Geht es um einen einzelnen Wert oder um mehrere Werte gleichzeitig?',
    guideSlug: null,
    source: 'vital-entry-mode-choice',
    intent: 'vitalwerte-erfassen',
    choiceTitle: 'Wie möchtest du die Vitalwerte erfassen?',
    options: vitalOptions(guides, continuation),
  });
}

function isRepeat(text: string): boolean {
  return /^(nochmal|erneut|wiederholen|noch einmal|schritt wiederholen)$/.test(normalize(text));
}

function isBack(text: string): boolean {
  return /^(zuruck|einen schritt zuruck|schritt zuruck)$/.test(normalize(text));
}

function isExplicitStuck(text: string): boolean {
  const n = normalize(text);
  return /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
    || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n)
    || /^(geht|klappt|funktioniert) nicht\b/.test(n)
    || /^(ich komme|komme) nicht weiter\b/.test(n)
    || /^(ich finde es nicht|ich finde das nicht|finde ich nicht|sehe ich nicht|ich brauche hilfe)$/.test(n);
}

function saysNothingIsOpen(text: string): boolean {
  const n = normalize(text);
  return /\b(nichts|nix|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\b(hab|habe)\b.*\b(nichts|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\bwelches\b.*\b(fenster|bereich)\b/.test(n)
    || /\bich bin noch nicht\b.*\b(vitalwert|doku|bereich|fenster)\b/.test(n);
}

function isPositiveConfirmation(messages: ChatMessage[]): boolean {
  const user = normalize(latestUser(messages));
  const assistant = normalize(previousAssistant(messages));
  if (!user || /\b(nicht|nichts|nix|noch nicht|falsch|keine|kein|geht nicht|klappt nicht)\b/.test(user)) return false;
  if (/^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ist offen|ist geoffnet)$/.test(user)) return true;
  const completion = /\b(geoffnet|ausgewahlt|angeklickt|geklickt|eingetragen|erfasst|eingegeben|ausgefullt|gespeichert|bestatigt|sichtbar|durchgefuhrt)\b/;
  if (completion.test(user) && /\b(ich|habe|hab|ist|sind|wurde|wurden|jetzt)\b/.test(user)) return true;
  return /\b(richtig|vitalwert|ausgewahlt)\b/.test(assistant)
    && /\b(blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|vitalwert|set)\b/.test(user)
    && /\b(ausgewahlt|genommen|markiert|angeklickt)\b/.test(user);
}

function currentGuideIndex(
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  guide: GuideRecord,
): number {
  const supplied = Number(parsed.guideStep);
  if (Number.isInteger(supplied) && supplied >= 1 && supplied <= Math.max(1, guide.steps.length)) return supplied - 1;

  const assistant = normalize(previousAssistant(messages));
  let bestIndex = 0;
  let bestScore = 0;
  guide.steps.forEach((step, index) => {
    const text = normalize(step.text || '');
    const check = normalize(step.check || '');
    let score = 0;
    if (text && assistant.includes(text)) score += 100;
    if (check && assistant.includes(check)) score += 60;
    const anchor = text.split(' ').slice(0, 8).join(' ');
    if (anchor.length >= 18 && assistant.includes(anchor)) score += 35;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function renderGuideStep(
  origin: string | null,
  guide: GuideRecord,
  index: number,
  source: string,
  prefix = '',
): Response {
  const safeIndex = Math.max(0, Math.min(index, guide.steps.length));
  if (safeIndex >= guide.steps.length) {
    return jsonResponse(origin, 200, {
      reply: `${prefix}Der Ablauf ist erledigt. Kontrolliere zum Schluss, ob der Eintrag in der vorgesehenen Übersicht sichtbar ist.`.trim(),
      guideSlug: null,
      guideTitle: guide.title,
      guideStep: guide.steps.length,
      guideStepCount: guide.steps.length,
      completed: true,
      source,
    });
  }

  const step = guide.steps[safeIndex] || {};
  return jsonResponse(origin, 200, {
    reply: `${prefix}${String(step.text || '').trim()}\n\n${String(step.check || 'Ist dieser Schritt erledigt?').trim()}`.trim(),
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: safeIndex + 1,
    guideStepCount: guide.steps.length,
    completed: false,
    model: 'approved-guide-stateful',
    source,
  });
}

function startGuide(
  origin: string | null,
  guides: GuideRecord[],
  slug: string,
  prefix = '',
): Response {
  const guide = guides.find(item => item.slug === slug);
  if (!guide) return jsonResponse(origin, 400, { error: 'Diese Anleitung ist nicht freigegeben.' });
  return renderGuideStep(origin, guide, 0, 'approved-guide-router-start', prefix);
}

function runGuideCommand(
  origin: string | null,
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  guide: GuideRecord,
  command: 'weiter' | 'nochmal' | 'zurück',
): Response {
  const current = currentGuideIndex(parsed, messages, guide);
  const next = command === 'weiter'
    ? current + 1
    : command === 'zurück'
      ? Math.max(0, current - 1)
      : current;
  return renderGuideStep(origin, guide, next, `approved-guide-router-${command}`);
}

function stuckHelp(
  origin: string | null,
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  guide: GuideRecord,
): Response {
  const index = currentGuideIndex(parsed, messages, guide);
  const step = guide.steps[index] || guide.steps[0] || {};
  const fallback = Object.values(guide.troubleshooting || {})[0]
    || `Bleibe beim aktuellen Schritt und suche genau nach der genannten Stelle: ${step.text || ''}`;
  return jsonResponse(origin, 200, {
    reply: `${String(step.stuck || fallback).trim()}\n\nKlappt es so?`,
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideStep: index + 1,
    guideStepCount: guide.steps.length,
    source: 'approved-guide-router-stuck',
  });
}

function neutralizeInternalText(payload: Record<string, unknown>): Record<string, unknown> {
  const reply = typeof payload.reply === 'string' ? payload.reply : '';
  if (!/noch nicht freigegeben|bestatigt ist bisher|genauen klickweg/i.test(normalize(reply))) return payload;
  return {
    ...payload,
    reply: 'Dafür ist aktuell noch keine bestätigte Schritt-für-Schritt-Anleitung hinterlegt. Beschreibe bitte genauer, welche vorhandene Funktion du nutzen möchtest.',
    guideSlug: null,
    source: 'neutral-unavailable-guide',
  };
}

async function forwardToCore(body: Record<string, unknown>): Promise<CoreResult> {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) return { status: 503, payload: { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' } };
  const response = await fetch(`${url}/functions/v1/dokohilf-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return {
    status: response.status,
    payload: payload && typeof payload === 'object'
      ? neutralizeInternalText(payload as Record<string, unknown>)
      : {},
  };
}

function extractModelText(payload: Record<string, unknown>): string {
  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) return '';
  const first = candidates[0] as Record<string, unknown> | undefined;
  const content = first?.content as Record<string, unknown> | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map(part => {
    if (!part || typeof part !== 'object') return '';
    const text = (part as Record<string, unknown>).text;
    return typeof text === 'string' ? text : '';
  }).join('').trim();
}

async function interpretGuideReply(
  apiKey: string,
  guides: GuideRecord[],
  activeGuide: GuideRecord,
  currentStep: number,
  messages: ChatMessage[],
  alternatives: string[],
): Promise<DialogueDecision> {
  const prompt = [
    'Du interpretierst ausschließlich die letzte Antwort in einem laufenden DokoHilf-Bedienablauf.',
    'Die einmal genannte Absicht bleibt bestehen. Frage nie erneut nach Erfassen oder Ansehen, wenn Eingeben, Eintragen oder Erfassen bereits genannt wurde.',
    'Erfinde keine Klickwege. Die Schritte kommen nur aus freigegebenen Guides.',
    'Antworte ausschließlich als kompaktes JSON ohne Markdown.',
    'Erlaubte action-Werte: continue, repeat, back, restart_current, start_guide, cancel, clarify, fallback.',
    'Bei start_guide muss guideSlug exakt aus dem Katalog stammen. clarify maximal 30 Wörter.',
    `Aktiver Guide: ${JSON.stringify({ slug: activeGuide.slug, title: activeGuide.title, step: currentStep })}`,
    `Aktueller Schritt: ${JSON.stringify(activeGuide.steps[currentStep - 1] || {})}`,
    `Letzte Anweisung: ${JSON.stringify(previousAssistant(messages))}`,
    `Antwort: ${JSON.stringify(latestUser(messages))}`,
    `Spracherkennungs-Alternativen: ${JSON.stringify(alternatives)}`,
    `Freigegebene Guides: ${JSON.stringify(guides.map(guide => ({ slug: guide.slug, title: guide.title, aliases: guide.aliases })))}`,
  ].join('\n');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 180,
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingLevel: 'minimal' },
      },
    }),
  });
  if (!response.ok) return { action: 'fallback' };
  try {
    const parsed = JSON.parse(extractModelText(await response.json())) as DialogueDecision;
    const allowed = new Set(['continue','repeat','back','restart_current','start_guide','cancel','clarify','fallback']);
    if (!allowed.has(parsed.action)) return { action: 'fallback' };
    if (parsed.action === 'start_guide' && !guides.some(guide => guide.slug === parsed.guideSlug)) return { action: 'fallback' };
    if (parsed.action === 'clarify') {
      const reply = String(parsed.reply || '').trim().slice(0, 200);
      return reply ? { action: 'clarify', reply } : { action: 'fallback' };
    }
    return parsed;
  } catch {
    return { action: 'fallback' };
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isRateLimited(req)) return jsonResponse(origin, 429, { error: 'Zu viele Anfragen. Bitte kurz warten.' });

  let parsed: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (!raw || raw.length > MAX_BODY_CHARS) return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' });
  }

  const messages = sanitizeMessages(parsed.messages);
  if (!messages.length || messages.at(-1)?.role !== 'user') {
    return jsonResponse(origin, 400, { error: 'Es fehlt eine gültige Nutzernachricht.' });
  }
  if (messages.some(message => message.role === 'user' && containsSensitiveData(message.content))) {
    return jsonResponse(origin, 422, { blocked: true, error: 'Mögliche Echtdaten erkannt. Die Anfrage wurde nicht weiterverarbeitet.' });
  }

  let guides: GuideRecord[];
  try {
    guides = await loadApprovedGuides();
  } catch {
    return jsonResponse(origin, 503, { error: 'Die freigegebene Wissensbasis ist gerade nicht erreichbar.' });
  }

  const text = latestUser(messages);
  const alternatives = sanitizeStrings(parsed.speechAlternatives);
  const activeGuide = guides.find(guide => guide.slug === String(parsed.guideSlug || '')) || null;
  const selectedSlug = String(parsed.selectedGuideSlug || '');
  if (selectedSlug) return startGuide(origin, guides, selectedSlug);

  const vitalMode = detectVitalMode(messages, alternatives, activeGuide);
  const suppliedStep = Number(parsed.guideStep);
  const vitalAreaAlreadyOpen = activeGuide?.slug === 'vitalwerte'
    || (Boolean(activeGuide?.slug.startsWith('vitalwerte')) && Number.isInteger(suppliedStep) && suppliedStep >= 2)
    || (/\bvitalwerte\b/.test(normalize(previousAssistant(messages)))
      && /\b(geoffnet|offen)\b/.test(normalize(previousAssistant(messages))));

  if (!activeGuide && vitalMode) {
    if (vitalMode === 'single') return startGuide(origin, guides, 'vitalwerte-einzelwert');
    if (vitalMode === 'batch') return startGuide(origin, guides, 'vitalwerte-sammelerfassung');
    return vitalChoiceResponse(origin, guides, false);
  }

  if (activeGuide?.slug === 'vitalwerte' && vitalMode) {
    if (vitalMode === 'single') return startGuide(origin, guides, 'vitalwerte-einzelwert-fortsetzen');
    if (vitalMode === 'batch') return startGuide(origin, guides, 'vitalwerte-sammelerfassung-fortsetzen');
    return vitalChoiceResponse(origin, guides, true);
  }

  if (activeGuide?.slug === 'vitalwerte-erfassen' && vitalMode) {
    if (vitalMode === 'single') return startGuide(origin, guides, vitalAreaAlreadyOpen ? 'vitalwerte-einzelwert-fortsetzen' : 'vitalwerte-einzelwert');
    if (vitalMode === 'batch') return startGuide(origin, guides, vitalAreaAlreadyOpen ? 'vitalwerte-sammelerfassung-fortsetzen' : 'vitalwerte-sammelerfassung');
    return vitalChoiceResponse(origin, guides, vitalAreaAlreadyOpen);
  }

  if (activeGuide?.slug.includes('sammelerfassung') && vitalMode === 'single') {
    return startGuide(
      origin,
      guides,
      vitalAreaAlreadyOpen ? 'vitalwerte-einzelwert-fortsetzen' : 'vitalwerte-einzelwert',
      'Verstanden – du möchtest einen einzelnen Wert erfassen. ',
    );
  }

  if ((activeGuide?.slug.includes('einzelwert') || activeGuide?.slug === 'vitalwerte-erfassen') && vitalMode === 'batch') {
    return startGuide(
      origin,
      guides,
      vitalAreaAlreadyOpen ? 'vitalwerte-sammelerfassung-fortsetzen' : 'vitalwerte-sammelerfassung',
      'Verstanden – du möchtest mehrere Werte gleichzeitig erfassen. ',
    );
  }

  if (activeGuide?.slug.endsWith('-fortsetzen') && saysNothingIsOpen(text)) {
    const fullSlug = activeGuide.slug.includes('sammelerfassung')
      ? 'vitalwerte-sammelerfassung'
      : 'vitalwerte-einzelwert';
    return startGuide(origin, guides, fullSlug, 'Stimmt – dann starten wir ganz vorne. ');
  }

  if (!activeGuide && /^(albert|allwert|vital wert) erfassen$/.test(normalize(text))) {
    const item = optionFor(
      guides,
      'vitalwerte-erfassen',
      'Vitalwerte erfassen',
      'Danach wählst du Einzelwert oder Sammelerfassung.',
    );
    return jsonResponse(origin, 200, {
      reply: 'Ich habe „Albert erfassen“ verstanden. Meinst du Vitalwerte erfassen?',
      guideSlug: null,
      source: 'speech-recognition-clarification',
      choiceTitle: 'Meintest du Vitalwerte?',
      options: item ? [item] : [],
    });
  }

  if (!activeGuide && /^(erfassen|neu erfassen|eingeben|eintragen|nachsehen|ansehen|verlauf)$/.test(normalize(text))) {
    return jsonResponse(origin, 200, {
      reply: 'Was möchtest du erfassen oder ansehen? Nenne bitte den Bereich, zum Beispiel Vitalwerte oder Berichte.',
      guideSlug: null,
      source: 'context-required-clarification',
      options: [],
    });
  }

  if (isCorrectionAmbiguous(text)) {
    return jsonResponse(origin, 200, {
      reply: 'Was möchtest du korrigieren: einen Bericht oder eine Durchführung?',
      guideSlug: null,
      source: 'structured-clarification',
      choiceTitle: 'Was soll korrigiert werden?',
      options: correctionOptions(guides),
    });
  }

  if (activeGuide) {
    if (isBack(text)) return runGuideCommand(origin, parsed, messages, activeGuide, 'zurück');
    if (isRepeat(text)) return runGuideCommand(origin, parsed, messages, activeGuide, 'nochmal');
    if (isExplicitStuck(text)) return stuckHelp(origin, parsed, messages, activeGuide);
    if (isPositiveConfirmation(messages)) return runGuideCommand(origin, parsed, messages, activeGuide, 'weiter');

    const currentIndex = currentGuideIndex(parsed, messages, activeGuide);
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (apiKey) {
      const decision = await interpretGuideReply(
        apiKey,
        guides,
        activeGuide,
        currentIndex + 1,
        messages,
        alternatives,
      );
      if (decision.action === 'continue') return runGuideCommand(origin, parsed, messages, activeGuide, 'weiter');
      if (decision.action === 'repeat') return runGuideCommand(origin, parsed, messages, activeGuide, 'nochmal');
      if (decision.action === 'back') return runGuideCommand(origin, parsed, messages, activeGuide, 'zurück');
      if (decision.action === 'restart_current') return startGuide(origin, guides, activeGuide.slug, 'Okay, wir beginnen diesen Ablauf noch einmal von vorne. ');
      if (decision.action === 'start_guide' && decision.guideSlug) return startGuide(origin, guides, decision.guideSlug, 'Verstanden. Ich wechsle zum passenden Ablauf. ');
      if (decision.action === 'cancel') {
        return jsonResponse(origin, 200, {
          reply: 'Okay, ich stoppe diesen Ablauf. Was möchtest du stattdessen erledigen?',
          guideSlug: null,
          source: 'ai-dialogue-cancel',
        });
      }
      if (decision.action === 'clarify' && decision.reply) {
        return jsonResponse(origin, 200, {
          reply: decision.reply,
          guideSlug: activeGuide.slug,
          guideTitle: activeGuide.title,
          guideStep: currentIndex + 1,
          guideStepCount: activeGuide.steps.length,
          source: 'ai-dialogue-clarification',
        });
      }
    }

    return jsonResponse(origin, 200, {
      reply: 'Ich bleibe beim aktuellen Schritt. Ist er erledigt, soll ich ihn wiederholen oder brauchst du Hilfe dabei?',
      guideSlug: activeGuide.slug,
      guideTitle: activeGuide.title,
      guideStep: currentIndex + 1,
      guideStepCount: activeGuide.steps.length,
      source: 'guide-context-clarification',
    });
  }

  const result = await forwardToCore(parsed);
  const routedSlug = typeof result.payload.guideSlug === 'string' ? result.payload.guideSlug : '';
  const routedGuide = guides.find(guide => guide.slug === routedSlug);
  if (routedGuide) return renderGuideStep(origin, routedGuide, 0, 'approved-guide-core-routed');
  return jsonResponse(origin, result.status, result.payload);
});
