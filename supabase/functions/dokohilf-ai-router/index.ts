const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 18;
const MAX_BODY_CHARS = 16_000;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GuideOption = { label: string; guideSlug: string };
type GuideRecord = { slug: string; title: string; aliases: string[] };

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
      'X-DokoHilf-Router': 'structured-clarification-v2',
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
    `${url}/rest/v1/dokohilf_guides?select=slug,title,aliases&status=eq.approved`,
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

function inferSpokenSelection(messages: ChatMessage[]): string | null {
  const lastUser = [...messages].reverse().find(message => message.role === 'user')?.content || '';
  const previousAssistant = [...messages].reverse().find(message => message.role === 'assistant')?.content || '';
  const n = normalize(lastUser);
  const assistant = normalize(previousAssistant);

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

async function forwardToCore(origin: string | null, body: Record<string, unknown>): Promise<Response> {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' });
  const response = await fetch(`${url}/functions/v1/dokohilf-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  const safePayload = payload && typeof payload === 'object'
    ? neutralizeInternalText(payload as Record<string, unknown>)
    : payload;
  return jsonResponse(origin, response.status, safePayload);
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

  const explicitSelection = typeof parsed.selectedGuideSlug === 'string' ? parsed.selectedGuideSlug : '';
  const spokenSelection = inferSpokenSelection(messages);
  const selectedSlug = explicitSelection || spokenSelection;
  if (selectedSlug) {
    const selected = guides.find(guide => guide.slug === selectedSlug);
    if (!selected) return jsonResponse(origin, 400, { error: 'Diese Auswahl ist nicht als Anleitung freigegeben.' });
    const routedMessages = messages.map(message => ({ ...message }));
    routedMessages[routedMessages.length - 1] = { role: 'user', content: selected.title };
    return forwardToCore(origin, { ...parsed, messages: routedMessages, guideSlug: null, selectedGuideSlug: undefined });
  }

  const lastText = messages[messages.length - 1].content;
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

  return forwardToCore(origin, parsed);
});
