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
type GuideOption = { label: string; guideSlug: string };
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
      'X-DokoHilf-Router': 'conversational-guide-router-v5',
    },
  });
}

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

function optionFor(guides: GuideRecord[], slug: string, fallbackLabel: string): GuideOption | null {
  const guide = guides.find(item => item.slug === slug);
  return guide ? { label: guide.title || fallbackLabel, guideSlug: guide.slug } : null;
}

function correctionOptions(guides: GuideRecord[]): GuideOption[] {
  return [
    optionFor(guides, 'bericht-durchstreichen', 'Bericht durchstreichen'),
    optionFor(guides, 'durchfuehrung-storno', 'Durchführung stornieren'),
  ].filter((item): item is GuideOption => Boolean(item));
}

function vitalEntryOptions(guides: GuideRecord[]): GuideOption[] {
  return [
    optionFor(guides, 'vitalwerte-einzelwert-fortsetzen', 'Einzelnen Vitalwert erfassen'),
    optionFor(guides, 'vitalwerte-sammelerfassung-fortsetzen', 'Mehrere Vitalwerte über Sammelerfassung'),
  ].filter((item): item is GuideOption => Boolean(item));
}

function isCorrectionAmbiguous(text: string): boolean {
  const n = normalize(text);
  const ambiguous = /\b(falsch dokumentiert|falsch eingetragen|falsch erfasst|etwas stornieren|etwas loschen|eintrag korrigieren|eintrag wegmachen|dokumentation ruckgangig|dokumentation zurucknehmen)\b/.test(n);
  const hasReport = /\b(bericht|berichtseintrag|pflegebericht)\b/.test(n);
  const hasExecution = /\b(durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme)\b/.test(n);
  return ambiguous && !hasReport && !hasExecution;
}

function previousAssistant(messages: ChatMessage[]): string {
  for (let index = messages.length - 2; index >= 0; index -= 1) {
    if (messages[index].role === 'assistant') return messages[index].content;
  }
  return '';
}

function latestUser(messages: ChatMessage[]): string {
  return [...messages].reverse().find(message => message.role === 'user')?.content || '';
}

function isSimpleGuideCommand(text: string): boolean {
  const n = normalize(text);
  return /^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|nochmal|erneut|wiederholen|noch einmal|zuruck|einen schritt zuruck|ich finde das nicht|finde ich nicht|sehe ich nicht)$/.test(n);
}

function isRepeat(text: string): boolean {
  return /^(nochmal|erneut|wiederholen|noch einmal)$/.test(normalize(text));
}

function isBack(text: string): boolean {
  return /^(zuruck|einen schritt zuruck)$/.test(normalize(text));
}

function isExplicitStuck(text: string): boolean {
  const n = normalize(text);
  return /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
    || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n)
    || /^(geht|klappt|funktioniert) nicht\b/.test(n)
    || /^(ich komme|komme) nicht weiter\b/.test(n)
    || /^(ich finde es nicht|ich finde das nicht|finde ich nicht|sehe ich nicht)$/.test(n);
}

function hasNegativeProgressSignal(text: string): boolean {
  const n = normalize(text);
  return /\b(nicht|nichts|nix|noch nicht|falsch|keine|kein|finde nicht|sehe nicht|geht nicht|klappt nicht|weiss nicht|weis nicht)\b/.test(n);
}

function isGuideProgressConfirmation(messages: ChatMessage[]): boolean {
  const user = normalize(latestUser(messages));
  const assistant = normalize(previousAssistant(messages));
  if (!user || hasNegativeProgressSignal(user)) return false;
  if (/^(ja|ok|okay|passt|fertig|gemacht|erledigt|weiter)$/.test(user)) return true;

  const completionVerb = /\b(geoffnet|ausgewahlt|angeklickt|geklickt|eingetragen|erfasst|eingegeben|ausgefullt|gespeichert|bestatigt|sichtbar|durchgefuhrt)\b/;
  const firstPersonOrState = /\b(ich|habe|hab|ist|sind|wurde|wurden|jetzt)\b/;
  if (completionVerb.test(user) && firstPersonOrState.test(user)) return true;

  const questionAboutSelection = /\b(richtig|vitalwert|ausgewahlt)\b/.test(assistant) && /\?/.test(previousAssistant(messages));
  if (questionAboutSelection
    && /\b(blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoff|vitalwert|set)\b/.test(user)
    && /\b(ausgewahlt|genommen|markiert|angeklickt)\b/.test(user)) return true;

  const questionAboutOpening = /\b(geoffnet|offen|eingabemaske|bereich|popup|pop up)\b/.test(assistant);
  return questionAboutOpening && /\b(offen|geoffnet|auf)\b/.test(user);
}

function saysNothingIsOpen(text: string): boolean {
  const n = normalize(text);
  return /\b(nichts|nix|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\b(hab|habe)\b.*\b(nichts|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\bwelches\b.*\b(fenster|bereich)\b/.test(n)
    || /\bich bin noch nicht\b.*\b(vitalwert|doku|bereich|fenster)\b/.test(n);
}

function looksLikeVitalwert(text: string): boolean {
  return /\b(vitalwert|vitalwerte|vital wert|blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoffsattigung|sauerstoff)\b/.test(normalize(text));
}

function wantsVitalEntry(text: string): boolean {
  const n = normalize(text);
  return looksLikeVitalwert(n) && /\b(eingeben|eintragen|erfassen|anlegen|dokumentieren|messen|neuer|neue|neu)\b/.test(n);
}

function wantsMultipleVitalwerte(text: string): boolean {
  const n = normalize(text);
  return /\b(sammelerfassung|mehrere|mehreren|gleichzeitig|alle werte|mehrere werte)\b/.test(n);
}

function wantsSingleVitalwert(text: string): boolean {
  const n = normalize(text);
  return /\b(einzelwert|einzelerfassung|einzeln|ein einzelner|einen einzelnen|einzelnen wert|ein wert|einen vitalwert|grunes plus)\b/.test(n)
    || /\b(blutdruck|puls|temperatur|gewicht|blutzucker|sauerstoffsattigung)\b/.test(n);
}

function looksLikeAlbertMisrecognition(text: string): boolean {
  const n = normalize(text);
  return /^(albert|allwert|vital wert) erfassen$/.test(n) || /\balbert\b.*\berfass/.test(n);
}

function currentGuideStep(parsed: Record<string, unknown>, messages: ChatMessage[], guide: GuideRecord): number {
  const explicit = Number(parsed.guideStep);
  if (Number.isInteger(explicit) && explicit >= 1 && explicit <= Math.max(1, guide.steps.length)) return explicit;

  const lastAssistant = normalize(previousAssistant(messages));
  for (let index = guide.steps.length - 1; index >= 0; index -= 1) {
    const text = normalize(guide.steps[index]?.text || '');
    if (text && (lastAssistant.includes(text) || text.includes(lastAssistant))) return index + 1;
    const prefix = text.slice(0, 55);
    if (prefix.length > 20 && lastAssistant.includes(prefix)) return index + 1;
  }
  return 1;
}

function stuckHint(guide: GuideRecord, step: GuideStep): string {
  if (step.stuck) return step.stuck;
  const hints = Object.values(guide.troubleshooting || {});
  return hints[0] || `Bleibe beim aktuellen Schritt und suche genau nach der genannten Stelle: ${step.text || ''}`;
}

function guidePayload(guide: GuideRecord, stepNumber: number, source = 'approved-guide-stateful'): Record<string, unknown> {
  const count = Math.max(1, guide.steps.length);
  if (stepNumber > count) {
    return {
      reply: 'Damit ist dieser Ablauf durchgeführt. Wobei brauchst du als Nächstes Hilfe?',
      guideSlug: null,
      completedGuideSlug: guide.slug,
      source: 'approved-guide-completed',
    };
  }

  const safeStep = Math.max(1, Math.min(stepNumber, count));
  const step = guide.steps[safeStep - 1] || {};
  return {
    reply: `${step.text || ''}\n\n${step.check || 'Bist du dort?'}`.trim(),
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: safeStep,
    guideStepCount: count,
    model: 'approved-guide-stateful',
    source,
  };
}

function choicePayload(origin: string | null, guides: GuideRecord[], guide: GuideRecord): Response {
  return jsonResponse(origin, 200, {
    ...guidePayload(guide, 3, 'vital-entry-choice'),
    options: vitalEntryOptions(guides),
  });
}

function startGuide(origin: string | null, guides: GuideRecord[], slug: string, prefix = ''): Response {
  const guide = guides.find(item => item.slug === slug);
  if (!guide) return jsonResponse(origin, 400, { error: 'Diese Anleitung ist nicht freigegeben.' });
  const payload = guidePayload(guide, 1);
  if (prefix && typeof payload.reply === 'string') payload.reply = `${prefix}${payload.reply}`;
  return jsonResponse(origin, 200, payload);
}

function runGuideCommand(
  origin: string | null,
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  guides: GuideRecord[],
  guide: GuideRecord,
  command: 'weiter' | 'nochmal' | 'zurück',
): Response {
  const current = currentGuideStep(parsed, messages, guide);
  if (guide.slug === 'vitalwerte-erfassen' && current === 3 && command === 'weiter') {
    return choicePayload(origin, guides, guide);
  }
  const next = command === 'weiter' ? current + 1 : command === 'zurück' ? Math.max(1, current - 1) : current;
  return jsonResponse(origin, 200, guidePayload(guide, next));
}

function repeatWithStuckHint(origin: string | null, parsed: Record<string, unknown>, messages: ChatMessage[], guide: GuideRecord): Response {
  const current = currentGuideStep(parsed, messages, guide);
  const step = guide.steps[Math.max(0, current - 1)] || {};
  return jsonResponse(origin, 200, {
    ...guidePayload(guide, current, 'approved-guide-stuck-help'),
    reply: `${stuckHint(guide, step)}\n\nKlappt es so?`,
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
  const safePayload = payload && typeof payload === 'object'
    ? neutralizeInternalText(payload as Record<string, unknown>)
    : {};
  return { status: response.status, payload: safePayload };
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
  const catalog = guides.map(guide => ({ slug: guide.slug, title: guide.title, aliases: guide.aliases }));
  const prompt = [
    'Du bist der Dialogmanager von DokoHilf. Du interpretierst ausschließlich die letzte Aussage im laufenden Bedienablauf.',
    'Die Klickschritte stammen nur aus freigegebenen Guides. Erfinde niemals Menüs, Felder oder Schritte.',
    'Bewahre das bereits genannte Ziel. Wenn jemand Vitalwerte eingeben will, frage später nicht erneut, ob er erfassen oder ansehen will.',
    'Antworte ausschließlich als kompaktes JSON ohne Markdown.',
    'Erlaubte action-Werte: continue, repeat, back, restart_current, start_guide, cancel, clarify, fallback.',
    'Bei start_guide muss guideSlug exakt aus dem Katalog stammen.',
    'Eine Bestätigung des aktuellen Schritts bedeutet continue. Ein Widerspruch oder eine fehlende Voraussetzung darf nicht ignoriert werden.',
    'Bei clarify darf reply höchstens 35 Wörter enthalten und nur natürlich nachfragen, ohne Klickwege zu erfinden.',
    `Aktiver Guide: ${JSON.stringify({ slug: activeGuide.slug, title: activeGuide.title, step: currentStep })}`,
    `Aktueller Schritt: ${JSON.stringify(activeGuide.steps[currentStep - 1] || {})}`,
    `Letzte Anweisung: ${JSON.stringify(previousAssistant(messages))}`,
    `Nutzeraussage: ${JSON.stringify(latestUser(messages))}`,
    `Spracherkennungs-Alternativen: ${JSON.stringify(alternatives)}`,
    `Freigegebene Guides: ${JSON.stringify(catalog)}`,
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
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) return { action: 'fallback' };
  try {
    const parsed = JSON.parse(extractModelText(payload as Record<string, unknown>)) as DialogueDecision;
    const actions = new Set(['continue','repeat','back','restart_current','start_guide','cancel','clarify','fallback']);
    if (!actions.has(parsed.action)) return { action: 'fallback' };
    if (parsed.action === 'start_guide' && !guides.some(guide => guide.slug === parsed.guideSlug)) return { action: 'fallback' };
    if (parsed.action === 'clarify') {
      const reply = typeof parsed.reply === 'string' ? parsed.reply.trim().slice(0, 220) : '';
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
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
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

  const lastText = latestUser(messages);
  const alternatives = sanitizeStrings(parsed.speechAlternatives);
  const candidates = [lastText, ...alternatives];
  const activeGuideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug : '';
  const activeGuide = guides.find(guide => guide.slug === activeGuideSlug) || null;
  const selectedSlug = typeof parsed.selectedGuideSlug === 'string' ? parsed.selectedGuideSlug : '';

  if (selectedSlug) return startGuide(origin, guides, selectedSlug);

  if (!activeGuide && candidates.some(looksLikeVitalwert) && candidates.some(wantsVitalEntry)) {
    if (candidates.some(wantsMultipleVitalwerte)) return startGuide(origin, guides, 'vitalwerte-sammelerfassung');
    if (candidates.some(wantsSingleVitalwert)) return startGuide(origin, guides, 'vitalwerte-einzelwert');
    return startGuide(origin, guides, 'vitalwerte-erfassen');
  }

  if (!activeGuide && looksLikeAlbertMisrecognition(lastText)) {
    const option = optionFor(guides, 'vitalwerte-erfassen', 'Vitalwerte erfassen');
    return jsonResponse(origin, 200, {
      reply: 'Ich habe „Albert erfassen“ verstanden. Meinst du Vitalwerte erfassen?',
      guideSlug: null,
      source: 'speech-recognition-clarification',
      options: option ? [option] : [],
    });
  }

  if (isCorrectionAmbiguous(lastText)) {
    return jsonResponse(origin, 200, {
      reply: 'Was möchtest du korrigieren: einen Bericht oder eine Durchführung?',
      guideSlug: null,
      source: 'structured-clarification',
      options: correctionOptions(guides),
    });
  }

  if (activeGuide) {
    const current = currentGuideStep(parsed, messages, activeGuide);

    if (activeGuide.slug === 'vitalwerte-erfassen' && current === 3) {
      if (wantsMultipleVitalwerte(lastText)) return startGuide(origin, guides, 'vitalwerte-sammelerfassung-fortsetzen');
      if (wantsSingleVitalwert(lastText)) return startGuide(origin, guides, 'vitalwerte-einzelwert-fortsetzen');
      if (/\b(erfassen|eingeben|eintragen|ja|weiter|ok|okay)\b/.test(normalize(lastText))) return choicePayload(origin, guides, activeGuide);
    }

    if (saysNothingIsOpen(lastText)) {
      if (activeGuide.slug === 'vitalwerte-einzelwert-fortsetzen') {
        return startGuide(origin, guides, 'vitalwerte-einzelwert', 'Stimmt – dann beginnen wir vorne. ');
      }
      if (activeGuide.slug === 'vitalwerte-sammelerfassung-fortsetzen') {
        return startGuide(origin, guides, 'vitalwerte-sammelerfassung', 'Stimmt – dann beginnen wir vorne. ');
      }
    }

    if (isRepeat(lastText)) return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'nochmal');
    if (isBack(lastText)) return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'zurück');
    if (isExplicitStuck(lastText)) return repeatWithStuckHint(origin, parsed, messages, activeGuide);
    if (isGuideProgressConfirmation(messages)) return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'weiter');

    if (!isSimpleGuideCommand(lastText)) {
      const apiKey = Deno.env.get('GEMINI_API_KEY');
      if (apiKey) {
        const decision = await interpretGuideReply(apiKey, guides, activeGuide, current, messages, alternatives);
        if (decision.action === 'continue') return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'weiter');
        if (decision.action === 'repeat') return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'nochmal');
        if (decision.action === 'back') return runGuideCommand(origin, parsed, messages, guides, activeGuide, 'zurück');
        if (decision.action === 'restart_current') return startGuide(origin, guides, activeGuide.slug, 'Okay, wir beginnen diesen Ablauf noch einmal. ');
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
            guideStep: current,
            guideStepCount: activeGuide.steps.length,
            source: 'ai-dialogue-clarification',
          });
        }
      }
      return jsonResponse(origin, 200, {
        reply: 'Ich bin nicht sicher, wie das zum aktuellen Schritt gehört. Ist der Schritt erledigt, oder brauchst du Hilfe dabei?',
        guideSlug: activeGuide.slug,
        guideTitle: activeGuide.title,
        guideStep: current,
        guideStepCount: activeGuide.steps.length,
        source: 'guide-context-clarification',
      });
    }
  }

  const result = await forwardToCore(parsed);
  const routedSlug = typeof result.payload.guideSlug === 'string' ? result.payload.guideSlug : '';
  if (routedSlug) {
    const routedGuide = guides.find(guide => guide.slug === routedSlug);
    if (routedGuide) return jsonResponse(origin, 200, guidePayload(routedGuide, 1, 'approved-guide-core-routed'));
  }
  return jsonResponse(origin, result.status, result.payload);
});
