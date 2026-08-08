const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 24;
const MAX_BODY_CHARS = 16_000;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GuideStep = { text?: string; check?: string; stuck?: string };
type GuideRecord = { slug: string; title: string; steps: GuideStep[]; version?: number };

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
    'Access-Control-Expose-Headers': 'X-DokoHilf-Chat-Router',
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
      'X-DokoHilf-Chat-Router': 'context-aware-v28',
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

function isContextHelpQuestion(text: string): boolean {
  const n = normalize(text);
  return /\b(wo ist|wo sind|wo finde ich|wie finde ich|wie komme ich zu|wie komme ich zum|wie komme ich zur|wo muss ich hin|wo genau|wo soll ich|welcher bereich|welche leiste|welcher reiter|welches menu)\b/.test(n)
    || /\b(ich weiss nicht wo ich bin|keine ahnung wo ich bin|ich weiss nicht wo|ich finde mich nicht zurecht)\b/.test(n);
}

function questionTerms(text: string): string[] {
  const stop = new Set([
    'wo','ist','sind','finde','ich','wie','komme','zum','zur','dem','den','der','die','das','hin','genau','soll','muss','welcher','welche','welches','bereich','menu','reiter','leiste','nicht','weiss','keine','ahnung','bin','mich','zurecht',
  ]);
  return normalize(text).split(' ').filter(word => word.length >= 4 && !stop.has(word));
}

function chooseStep(guide: GuideRecord, text: string, suppliedStep: unknown): { step: GuideStep; index: number } | null {
  if (!Array.isArray(guide.steps) || !guide.steps.length) return null;
  const numeric = Number(suppliedStep);
  const current = Number.isInteger(numeric) && numeric >= 1
    ? Math.min(numeric - 1, guide.steps.length - 1)
    : 0;
  const terms = questionTerms(text);
  if (!terms.length) return { step: guide.steps[current] || guide.steps[0], index: current };

  let bestIndex = current;
  let bestScore = -1;
  guide.steps.forEach((step, index) => {
    const haystack = normalize(`${step.text || ''} ${step.check || ''} ${step.stuck || ''}`);
    let score = index === current ? 1 : 0;
    for (const term of terms) if (haystack.includes(term)) score += term.length >= 8 ? 4 : 3;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return { step: guide.steps[bestIndex], index: bestIndex };
}

async function loadGuide(slug: string): Promise<GuideRecord | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  const endpoint = `${url}/rest/v1/dokohilf_guides?select=slug,title,steps,version&status=eq.approved&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const response = await fetch(endpoint, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    signal: AbortSignal.timeout(4_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] as GuideRecord : null;
}

async function forwardToExistingRouter(rawBody: string, origin: string | null): Promise<Response> {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  const response = await fetch(`${url}/functions/v1/dokohilf-ai-router`, {
    method: 'POST',
    headers,
    body: rawBody,
    signal: AbortSignal.timeout(12_000),
  }).catch(() => null);
  if (!response) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' });
  return response;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isRateLimited(req)) return jsonResponse(origin, 429, { error: 'Zu viele Anfragen. Bitte kurz warten.' });

  const rawBody = await req.text();
  if (!rawBody || rawBody.length > MAX_BODY_CHARS) return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(rawBody); }
  catch { return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' }); }

  const messages = sanitizeMessages(parsed.messages);
  const lastText = [...messages].reverse().find(message => message.role === 'user')?.content || '';
  const guideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug : '';

  if (!messages.length || !lastText) return forwardToExistingRouter(rawBody, origin);
  if (messages.some(message => message.role === 'user' && containsSensitiveData(message.content))) {
    return forwardToExistingRouter(rawBody, origin);
  }

  if (guideSlug && isContextHelpQuestion(lastText)) {
    const guide = await loadGuide(guideSlug);
    const selected = guide ? chooseStep(guide, lastText, parsed.guideStep) : null;
    if (guide && selected) {
      const instruction = String(selected.step.stuck || selected.step.text || '').trim();
      const check = String(selected.step.check || 'Hast du die Stelle gefunden?').trim();
      if (instruction) {
        return jsonResponse(origin, 200, {
          reply: `${instruction}\n\n${check}`,
          spokenText: instruction,
          guideSlug: guide.slug,
          guideTitle: guide.title,
          guideVersion: guide.version || 1,
          guideStep: selected.index + 1,
          guideStepCount: guide.steps.length,
          completed: false,
          source: 'approved-guide-context-help-v28',
        });
      }
    }
  }

  return forwardToExistingRouter(rawBody, origin);
});
