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
type GuideRecord = { slug: string; title: string; aliases: string[]; steps: GuideStep[] };
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
      'X-DokoHilf-Router': 'conversational-guide-router-v3',
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
    `${url}/rest/v1/dokohilf_guides?select=slug,title,aliases,steps&status=eq.approved`,
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

function inferSpokenSelection(messages: ChatMessage[]): string | null {
  const lastUser = [...messages].reverse().find(message => message.role === 'user')?.content || '';
  const assistant = normalize(previousAssistant(messages));
  const n = normalize(lastUser);

  const asksVitalChoice = /vitalwert/.test(assistant)
    && /erfass/.test(assistant)
    && /(ansehen|nachsehen|verlauf|vorhandene werte)/.test(assistant);
  if (asksVitalChoice && /^(erfassen|neu erfassen|neuen wert erfassen)$/.test(n)) {
    return 'vitalwerte-erfassen-fortsetzen';
  }

  if (/was mochtest du korrigieren/.test(assistant)) {
    if (/\b(bericht|berichtseintrag|pflegebericht)\b/.test(n)) return 'bericht-durchstreichen';
    if (/\b(durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme)\b/.test(n)) return 'durchfuehrung-storno';
  }
  return null;
}

function isBareVitalChoice(text: string): boolean {
  return /^(erfassen|neu erfassen|nachsehen|ansehen|verlauf)$/.test(normalize(text));
}

function saysNothingIsOpen(text: string): boolean {
  const n = normalize(text);
  return /\b(nichts|nix|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\b(hab|habe)\b.*\b(nichts|noch nichts)\b.*\b(geoffnet|offen)\b/.test(n)
    || /\bwelches\b.*\b(fenster|bereich)\b/.test(n)
    || /\bich bin noch nicht\b.*\b(vitalwert|doku|bereich|fenster)\b/.test(n);
}

function isSimpleGuideCommand(text: string): boolean {
  const n = normalize(text);
  return /^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|nochmal|erneut|wiederholen|noch einmal|zuruck|einen schritt zuruck|ich finde das nicht|finde ich nicht|sehe ich nicht)$/.test(n);
}

function looksLikeVitalwert(text: string): boolean {
  const n = normalize(text);
  return /\b(vitalwert|vitalwerte|blutdruck|puls|temperatur|gewicht)\b/.test(n);
}

function looksLikeAlbertMisrecognition(text: string): boolean {
  const n = normalize(text);
  return /^(albert|allwert|vital wert) erfassen$/.test(n) || /\balbert\b.*\berfass/.test(n);
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

function replaceLastUser(messages: ChatMessage[], content: string): ChatMessage[] {
  const copy = messages.map(message => ({ ...message }));
  for (let index = copy.length - 1; index >= 0; index -= 1) {
    if (copy[index].role === 'user') {
      copy[index] = { role: 'user', content };
      return copy;
    }
  }
  copy.push({ role: 'user', content });
  return copy;
}

async function startGuide(
  origin: string | null,
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  guides: GuideRecord[],
  slug: string,
  prefix = '',
): Promise<Response> {
  const guide = guides.find(item => item.slug === slug);
  if (!guide) return jsonResponse(origin, 400, { error: 'Diese Anleitung ist nicht freigegeben.' });
  const result = await forwardToCore({
    ...parsed,
    messages: replaceLastUser(messages, guide.title),
    guideSlug: null,
    selectedGuideSlug: undefined,
  });
  if (prefix && typeof result.payload.reply === 'string') {
    result.payload.reply = `${prefix}${result.payload.reply}`;
    result.payload.source = 'ai-context-recovery';
  }
  return jsonResponse(origin, result.status, result.payload);
}

async function runGuideCommand(
  origin: string | null,
  parsed: Record<string, unknown>,
  messages: ChatMessage[],
  activeGuide: GuideRecord,
  command: 'weiter' | 'nochmal' | 'zurück',
): Promise<Response> {
  const result = await forwardToCore({
    ...parsed,
    messages: replaceLastUser(messages, command),
    guideSlug: activeGuide.slug,
  });
  return jsonResponse(origin, result.status, result.payload);
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
  messages: ChatMessage[],
  alternatives: string[],
): Promise<DialogueDecision> {
  const catalog = guides.map(guide => ({ slug: guide.slug, title: guide.title, aliases: guide.aliases }));
  const lastAssistant = previousAssistant(messages);
  const lastUser = [...messages].reverse().find(message => message.role === 'user')?.content || '';
  const prompt = [
    'Du bist der Dialogmanager von DokoHilf. Du interpretierst nur, was die Person im laufenden Bedienablauf meint.',
    'Du darfst niemals neue Klickwege, Menünamen oder Schritte erfinden. Die eigentliche Anleitung kommt anschließend ausschließlich aus einem freigegebenen Guide.',
    'Antworte ausschließlich als kompaktes JSON ohne Markdown.',
    'Erlaubte action-Werte: continue, repeat, back, restart_current, start_guide, cancel, clarify, fallback.',
    'Bei start_guide muss guideSlug exakt aus dem Katalog stammen.',
    'Wenn die Person widerspricht, eine falsche Voraussetzung nennt oder sagt, dass noch nichts geöffnet ist, darfst du das nicht ignorieren und nicht einfach denselben Schritt wiederholen.',
    'Bei clarify darf reply höchstens 35 Wörter enthalten und nur natürlich nachfragen oder den Irrtum anerkennen, aber keinen neuen Klickweg formulieren.',
    `Aktiver Guide: ${JSON.stringify({ slug: activeGuide.slug, title: activeGuide.title })}`,
    `Letzte Anweisung: ${JSON.stringify(lastAssistant)}`,
    `Nutzeraussage: ${JSON.stringify(lastUser)}`,
    `Mögliche Spracherkennungs-Alternativen: ${JSON.stringify(alternatives)}`,
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
  const raw = extractModelText(payload as Record<string, unknown>);
  try {
    const parsed = JSON.parse(raw) as DialogueDecision;
    const actions = new Set(['continue','repeat','back','restart_current','start_guide','cancel','clarify','fallback']);
    if (!actions.has(parsed.action)) return { action: 'fallback' };
    if (parsed.action === 'start_guide' && !guides.some(guide => guide.slug === parsed.guideSlug)) {
      return { action: 'fallback' };
    }
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

  const lastText = messages[messages.length - 1].content;
  const alternatives = sanitizeStrings(parsed.speechAlternatives);
  const activeGuideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug : '';
  const activeGuide = guides.find(guide => guide.slug === activeGuideSlug) || null;
  const explicitSelection = typeof parsed.selectedGuideSlug === 'string' ? parsed.selectedGuideSlug : '';
  const spokenSelection = inferSpokenSelection(messages);
  const selectedSlug = explicitSelection || spokenSelection;

  if (selectedSlug) {
    return startGuide(origin, parsed, messages, guides, selectedSlug);
  }

  if (activeGuide?.slug === 'vitalwerte-erfassen-fortsetzen' && saysNothingIsOpen(lastText)) {
    return startGuide(
      origin,
      parsed,
      messages,
      guides,
      'vitalwerte-erfassen',
      'Stimmt – dann war die Annahme falsch. Wir starten ganz vorne. ',
    );
  }

  const allSpeechCandidates = [lastText, ...alternatives];
  const hasVitalAlternative = allSpeechCandidates.some(looksLikeVitalwert);
  if (!activeGuide && hasVitalAlternative && allSpeechCandidates.some(text => /\berfass/.test(normalize(text)))) {
    return startGuide(origin, parsed, messages, guides, 'vitalwerte-erfassen');
  }

  if (!activeGuide && looksLikeAlbertMisrecognition(lastText)) {
    const option = optionFor(guides, 'vitalwerte-erfassen', 'Vitalwerte erfassen');
    return jsonResponse(origin, 200, {
      reply: 'Ich habe „Albert erfassen“ verstanden. Meinst du einen Vitalwert erfassen?',
      guideSlug: null,
      source: 'speech-recognition-clarification',
      options: option ? [option] : [],
    });
  }

  if (isBareVitalChoice(lastText)) {
    return jsonResponse(origin, 200, {
      reply: 'Möchtest du einen Vitalwert erfassen oder vorhandene Werte beziehungsweise den Verlauf ansehen?',
      guideSlug: null,
      source: 'context-required-clarification',
    });
  }

  if (isCorrectionAmbiguous(lastText)) {
    const options = correctionOptions(guides);
    return jsonResponse(origin, 200, {
      reply: 'Was möchtest du korrigieren: einen Bericht oder eine Durchführung? Tippe auf eine Auswahl oder sage den Namen.',
      guideSlug: null,
      source: 'structured-clarification',
      options,
    });
  }

  if (activeGuide && !isSimpleGuideCommand(lastText)) {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (apiKey) {
      const decision = await interpretGuideReply(apiKey, guides, activeGuide, messages, alternatives);
      if (decision.action === 'continue') return runGuideCommand(origin, parsed, messages, activeGuide, 'weiter');
      if (decision.action === 'repeat') return runGuideCommand(origin, parsed, messages, activeGuide, 'nochmal');
      if (decision.action === 'back') return runGuideCommand(origin, parsed, messages, activeGuide, 'zurück');
      if (decision.action === 'restart_current') {
        return startGuide(origin, parsed, messages, guides, activeGuide.slug, 'Okay, wir beginnen diesen Ablauf noch einmal von vorne. ');
      }
      if (decision.action === 'start_guide' && decision.guideSlug) {
        return startGuide(origin, parsed, messages, guides, decision.guideSlug, 'Verstanden. Ich wechsle zum passenden Ablauf. ');
      }
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
          source: 'ai-dialogue-clarification',
        });
      }
    }
  }

  const result = await forwardToCore(parsed);
  return jsonResponse(origin, result.status, result.payload);
});
