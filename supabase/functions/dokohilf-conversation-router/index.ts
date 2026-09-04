import {
  COMPLETION_REVISION,
  completionForGuide,
  inferCompletionContinuation,
} from './guide-completion-contract.mjs';

const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const ROUTER_VERSION = 'voice-chat-parity-v66';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 24;
const MAX_BODY_CHARS = 16_000;
const MAX_SPEECH_ALTERNATIVES = 4;
const VAGUE_HELP_REPLY = 'Wobei brauchst du Hilfe? Nenne bitte den Bereich oder die Funktion, zum Beispiel Vitalwerte, Berichte, Visiten, Formulare oder An-/Abwesenheiten.';
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GuideStep = { text?: string; check?: string; stuck?: string };
type GuideRecord = {
  slug: string;
  title: string;
  steps: GuideStep[];
  version?: number;
};
type Continuation =
  | { kind: 'reply'; reply: string; spokenText?: string }
  | { kind: 'start'; guideSlug: string; stepIndex?: number };

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

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Conversation-Router',
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
      'X-DokoHilf-Conversation-Router': ROUTER_VERSION,
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

function sanitizeSpeechAlternatives(value: unknown, primary: string): string[] {
  if (!Array.isArray(value)) return [];
  const primaryKey = normalize(primary);
  const seen = new Set<string>();
  const safe: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const text = item.replace(/\u0000/g, '').trim().slice(0, 350);
    const key = normalize(text);
    if (!text || !key || key === primaryKey || seen.has(key) || containsSensitiveData(text)) continue;
    seen.add(key);
    safe.push(text);
    if (safe.length >= MAX_SPEECH_ALTERNATIVES) break;
  }
  return safe;
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

function isPositiveConfirmation(text: string): boolean {
  const n = normalize(text);
  if (!n || /\b(nicht|nichts|nix|noch nicht|falsch|keine|kein|geht nicht|klappt nicht)\b/.test(n)) return false;
  if (/^(weiter|mach weiter|weiter bitte|nachster schritt|ja|jap|jo|genau|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ist offen|ist geoffnet|gefunden|geschafft|bin drin)$/.test(n)) return true;
  return /\b(geoffnet|ausgewahlt|angeklickt|geklickt|eingetragen|erfasst|eingegeben|ausgefullt|gespeichert|bestatigt|sichtbar|durchgefuhrt|entfernt|gefunden)\b/.test(n)
    && /\b(ich|habe|hab|ist|sind|wurde|wurden|jetzt)\b/.test(n);
}

function isVagueHelpRequest(text: string): boolean {
  const n = normalize(text);
  return /^(ich mochte bitte|ich mochte|mochte bitte|ich brauche hilfe|brauche hilfe|hilfe|hilf mir|bitte hilf mir|kannst du mir helfen|bitte)$/.test(n);
}

async function loadGuide(slug: string): Promise<GuideRecord | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey || !slug) return null;
  const endpoint = `${url}/rest/v1/dokohilf_guides?select=slug,title,steps,version&status=eq.approved&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const response = await fetch(endpoint, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    signal: AbortSignal.timeout(4_000),
  }).catch(() => null);
  if (!response?.ok) return null;
  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) && rows[0] ? rows[0] as GuideRecord : null;
}

function currentGuideIndex(guide: GuideRecord, suppliedStep: unknown, assistantText: string): number {
  if (!guide.steps?.length) return 0;
  const numeric = Number(suppliedStep);
  if (Number.isInteger(numeric) && numeric >= 1 && numeric <= guide.steps.length) return numeric - 1;

  const assistant = normalize(assistantText);
  let bestIndex = 0;
  let bestScore = 0;
  guide.steps.forEach((step, index) => {
    const check = normalize(step.check || '');
    const instruction = normalize(step.text || '');
    let score = 0;
    if (check && assistant.includes(check)) score += 100;
    if (instruction && assistant.includes(instruction)) score += 80;
    const anchor = instruction.split(' ').slice(0, 8).join(' ');
    if (anchor.length >= 18 && assistant.includes(anchor)) score += 30;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function spokenStep(step: GuideStep | undefined): string {
  return String(step?.text || '').replace(/\s+/g, ' ').trim();
}

function renderGuideStep(origin: string | null, guide: GuideRecord, index: number, source: string): Response {
  const safeIndex = Math.max(0, Math.min(Number(index) || 0, Math.max(0, guide.steps.length - 1)));
  const step = guide.steps[safeIndex] || {};
  const next = guide.steps[safeIndex + 1];
  const instruction = String(step.text || '').trim();
  const check = String(step.check || 'Ist dieser Schritt erledigt?').trim();
  return jsonResponse(origin, 200, {
    reply: `${instruction}\n\n${check}`.trim(),
    spokenText: spokenStep(step),
    nextSpokenText: spokenStep(next),
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: safeIndex + 1,
    guideStepCount: guide.steps.length,
    completed: false,
    model: 'approved-guide-stateful-v44',
    completionRevision: COMPLETION_REVISION,
    source,
  });
}

function renderCompletion(origin: string | null, guide: GuideRecord): Response {
  const completion = completionForGuide(guide.slug);
  const fallback = 'Alles klar. Wenn du noch etwas brauchst, sag einfach Bescheid.';
  const reply = String(completion?.reply || fallback).trim();
  const spokenText = String(completion?.spokenText || reply).trim();
  return jsonResponse(origin, 200, {
    reply,
    spokenText,
    guideSlug: null,
    guideTitle: guide.title,
    guideStep: guide.steps.length,
    guideStepCount: guide.steps.length,
    completed: true,
    completionRevision: COMPLETION_REVISION,
    source: 'approved-guide-natural-completion-v44',
  });
}

async function renderContinuation(origin: string | null, continuation: Continuation): Promise<Response | null> {
  if (continuation.kind === 'reply') {
    return jsonResponse(origin, 200, {
      reply: continuation.reply,
      spokenText: continuation.spokenText || continuation.reply,
      guideSlug: null,
      completed: true,
      completionRevision: COMPLETION_REVISION,
      source: 'approved-guide-completion-followup-v44',
    });
  }
  const guide = await loadGuide(String(continuation.guideSlug || ''));
  if (!guide?.steps?.length) return null;
  return renderGuideStep(origin, guide, Number(continuation.stepIndex) || 0, 'approved-guide-completion-followup-v44');
}

async function forwardToChatRouter(body: string, origin: string | null): Promise<Response> {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (origin) headers.Origin = origin;
  const response = await fetch(`${url}/functions/v1/dokohilf-chat-router`, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(15_000),
  }).catch(() => null);
  if (!response) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist gerade nicht verfügbar.' });
  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('X-DokoHilf-Conversation-Router', ROUTER_VERSION);
  responseHeaders.set('Cache-Control', 'no-store');
  return new Response(response.body, { status: response.status, headers: responseHeaders });
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
  if (!messages.length || messages.at(-1)?.role !== 'user') return forwardToChatRouter(rawBody, origin);

  const userText = latestUser(messages);
  const speechAlternatives = sanitizeSpeechAlternatives(parsed.speechAlternatives, userText);
  const safeBody = JSON.stringify({
    ...parsed,
    messages,
    ...(speechAlternatives.length ? { speechAlternatives } : { speechAlternatives: [] }),
  });

  if (messages.some(message => message.role === 'user' && containsSensitiveData(message.content))) {
    return forwardToChatRouter(safeBody, origin);
  }

  const assistantText = previousAssistant(messages);
  const guideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug.trim() : '';
  const selectedGuideSlug = typeof parsed.selectedGuideSlug === 'string' ? parsed.selectedGuideSlug.trim() : '';

  if (!guideSlug && !selectedGuideSlug && isVagueHelpRequest(userText)) {
    return jsonResponse(origin, 200, {
      reply: VAGUE_HELP_REPLY,
      spokenText: VAGUE_HELP_REPLY,
      guideSlug: null,
      completed: false,
      completionRevision: COMPLETION_REVISION,
      source: 'vague-help-clarification-v66',
    });
  }

  const continuation = inferCompletionContinuation(assistantText, userText) as Continuation | null;
  if (continuation) {
    const response = await renderContinuation(origin, continuation);
    if (response) return response;
  }

  if (guideSlug && isPositiveConfirmation(userText)) {
    const guide = await loadGuide(guideSlug);
    if (guide?.steps?.length) {
      const currentIndex = currentGuideIndex(guide, parsed.guideStep, assistantText);
      if (currentIndex >= guide.steps.length - 1) return renderCompletion(origin, guide);
      return renderGuideStep(origin, guide, currentIndex + 1, 'approved-guide-positive-advance-v44');
    }
  }

  return forwardToChatRouter(safeBody, origin);
});
