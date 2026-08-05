const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 350;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
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

function stripLeadingGreeting(value: unknown): string {
  const text = normalize(value);
  const greetings = ['guten morgen', 'guten abend', 'guten tag', 'hallo', 'servus', 'moin', 'hey', 'hi'];
  for (const greeting of greetings) {
    if (text.startsWith(`${greeting} `)) return text.slice(greeting.length).trim();
  }
  return text;
}

function words(value: unknown): string[] {
  const stop = new Set([
    'wie','wo','was','ich','du','der','die','das','den','dem','ein','eine','einen','einer','und','oder',
    'zu','zur','zum','in','im','am','auf','mit','fur','bitte','mochte','muss','kann','mir','machen',
    'hallo','hi','hey','servus','moin','guten','morgen','tag','abend',
  ]);
  return stripLeadingGreeting(value).split(' ').filter(word => word.length >= 3 && !stop.has(word));
}

function scoreCandidate(text: string, candidate: string): number {
  const input = stripLeadingGreeting(text);
  const target = normalize(candidate);
  if (!target) return 0;
  let score = 0;
  if (input === target) score += 100;
  else if (target.length >= 5 && (input.includes(target) || target.includes(input))) score += 50;
  const inputWords = new Set(words(input));
  for (const word of words(target)) {
    if (inputWords.has(word)) score += word.length >= 8 ? 11 : 7;
  }
  return score;
}

function scoreGuide(text: string, guide: Record<string, unknown>): number {
  const candidates = [guide.title, ...(Array.isArray(guide.aliases) ? guide.aliases : [])]
    .filter((value): value is string => typeof value === 'string');
  return candidates.reduce((best, candidate) => Math.max(best, scoreCandidate(text, candidate)), 0);
}

function isPositiveContinuation(text: string): boolean {
  return /^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ich bin bei|ich bin im|ich bin in)(\s|$)/.test(normalize(text));
}

function isBack(text: string): boolean {
  return /^(zuruck|einen schritt zuruck)(\s|$)/.test(normalize(text));
}

function isRepeatOrStuck(text: string): boolean {
  const value = normalize(text);
  return /^(nochmal|erneut|wiederholen|noch einmal)(\s|$)/.test(value)
    || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(value)
    || /^(ich komme|komme) nicht weiter\b/.test(value);
}

function sanitizeMessages(value: unknown): Array<{ role: string; content: string }> {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_MESSAGES).map(item => {
    if (!item || typeof item !== 'object') return null;
    const role = (item as Record<string, unknown>).role;
    const content = (item as Record<string, unknown>).content;
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
    const clean = content.replace(/\u0000/g, '').trim().slice(0, MAX_MESSAGE_CHARS);
    return clean ? { role, content: clean } : null;
  }).filter((item): item is { role: string; content: string } => Boolean(item));
}

function findGuideStart(messages: Array<{ role: string; content: string }>, guide: Record<string, unknown>): number {
  const users = messages.filter(message => message.role === 'user');
  let bestIndex = -1;
  let bestScore = 0;
  users.forEach((message, index) => {
    if (isPositiveContinuation(message.content) || isBack(message.content) || isRepeatOrStuck(message.content)) return;
    const score = scoreGuide(message.content, guide);
    if (score >= 14 && score >= bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  });
  return bestIndex;
}

function calculateStep(messages: Array<{ role: string; content: string }>, guide: Record<string, unknown>): number {
  const users = messages.filter(message => message.role === 'user');
  const start = findGuideStart(messages, guide);
  let index = 0;
  for (const message of users.slice(start >= 0 ? start + 1 : 0)) {
    if (isBack(message.content)) index -= 1;
    else if (isPositiveContinuation(message.content)) index += 1;
  }
  const count = Array.isArray(guide.steps) ? guide.steps.length : 0;
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
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

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isRateLimited(req)) return jsonResponse(origin, 429, { error: 'Zu viele Anfragen. Bitte kurz warten.' });

  let parsed: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (!raw || raw.length > 16000) return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' });
  }

  const guideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug.trim().slice(0, 100) : '';
  const messages = sanitizeMessages(parsed.messages);
  if (!guideSlug) return jsonResponse(origin, 400, { error: 'Es fehlt ein gültiger Ablauf.' });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return jsonResponse(origin, 503, { error: 'Die Wissensbasis ist nicht verfügbar.' });

  const response = await fetch(
    `${url}/rest/v1/dokohilf_guides?select=slug,title,aliases,steps,version&slug=eq.${encodeURIComponent(guideSlug)}&status=eq.approved&limit=1`,
    { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
  );
  if (!response.ok) return jsonResponse(origin, 503, { error: 'Der Ablaufstatus konnte nicht geladen werden.' });

  const guides = await response.json();
  const guide = Array.isArray(guides) ? guides[0] : null;
  if (!guide || !Array.isArray(guide.steps) || !guide.steps.length) {
    return jsonResponse(origin, 404, { error: 'Dieser freigegebene Ablauf wurde nicht gefunden.' });
  }

  const stepIndex = calculateStep(messages, guide);
  return jsonResponse(origin, 200, {
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version,
    guideStep: stepIndex + 1,
    guideStepCount: guide.steps.length,
  });
});
