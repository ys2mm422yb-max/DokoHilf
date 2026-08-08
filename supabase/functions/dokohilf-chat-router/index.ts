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
type GuideRecord = {
  slug: string;
  title: string;
  steps: GuideStep[];
  troubleshooting?: Record<string, string>;
  version?: number;
};
type Evidence = {
  kind: 'step' | 'troubleshooting';
  text: string;
  score: number;
  stepIndex?: number;
};

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
      'X-DokoHilf-Chat-Router': 'context-aware-v28-2',
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

function isControlOrConfirmation(text: string): boolean {
  const n = normalize(text);
  if (/^(weiter|nochmal|noch einmal|erneut|wiederholen|zuruck|einen schritt zuruck|abbrechen|stop|stopp|beenden)$/.test(n)) return true;
  return /^(ja|jap|jo|genau|okay|ok|passt|fertig|erledigt|gefunden|hab ich|habe ich|bin da|ist offen|offen|gemacht|geschafft|bin drin|bin dort)$/.test(n);
}

function isExplicitHelp(text: string): boolean {
  const n = normalize(text);
  return /\b(wo ist|wo sind|wo finde ich|wie finde ich|wie komme ich|wo muss ich|wo genau|wo soll ich|welcher bereich|welche leiste|welcher reiter|welches menu)\b/.test(n)
    || /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
    || /\b(komme nicht weiter|weiss nicht weiter|weiss nicht wo|keine ahnung wo|nicht zurecht|brauche hilfe|hilf mir)\b/.test(n)
    || /\b(was jetzt|was dann|wie geht es weiter|was muss ich|was soll ich|wo klicken|wo drucken|welchen button|welche taste|was anklicken)\b/.test(n)
    || /\b(bei mir heisst|bei mir steht|sieht anders aus|ist anders|andere ansicht|anderer reiter|anderes menu)\b/.test(n)
    || /\b(ich sehe nur|ich habe nur|da steht nur|bei mir sehe ich)\b/.test(n);
}

function looksLikeQuestion(text: string): boolean {
  const raw = String(text || '').trim();
  const n = normalize(raw);
  return raw.includes('?')
    || /^(wo|wie|was|welche|welcher|welches|warum|muss|soll|kann|darf|ist|sind|kommt)\b/.test(n);
}

function questionTerms(text: string): string[] {
  const stop = new Set([
    'wo','ist','sind','finde','finden','ich','wie','komme','kommt','zum','zur','dem','den','der','die','das','hin','genau','soll','muss','kann','darf','welcher','welche','welches','bereich','menu','reiter','leiste','nicht','weiss','keine','ahnung','bin','mich','zurecht','jetzt','dann','weiter','bitte','hilfe','druecken','drucken','klicken','anklicken','button','taste','steht','sehe','sieht','anders','heisst','heist','nur',
  ]);
  return normalize(text)
    .split(' ')
    .filter(word => word.length >= 4 && !stop.has(word));
}

function currentStepIndex(guide: GuideRecord, suppliedStep: unknown): number {
  if (!Array.isArray(guide.steps) || !guide.steps.length) return 0;
  const numeric = Number(suppliedStep);
  return Number.isInteger(numeric) && numeric >= 1
    ? Math.min(numeric - 1, guide.steps.length - 1)
    : 0;
}

function guideCorpus(guide: GuideRecord): string {
  return normalize([
    guide.slug,
    guide.title,
    ...guide.steps.flatMap(step => [step.text || '', step.check || '', step.stuck || '']),
    ...Object.values(guide.troubleshooting || {}),
  ].join(' '));
}

function explicitDifferentGoal(text: string, guide: GuideRecord): boolean {
  const n = normalize(text);
  if (/\b(neuer ablauf|anderer ablauf|anderes thema|stattdessen|wechseln zu|jetzt lieber)\b/.test(n)) return true;
  if (!/\b(ich mochte|ich will|wie lege ich|wie erfasse ich|wie offne ich|wie kann ich)\b/.test(n)) return false;

  const domains = [
    'bericht', 'visite', 'vital', 'medikation', 'formular', 'ubergabe', 'anwesenheit',
    'notfallblatt', 'stammdaten', 'easy plan', 'durchfuhrung', 'aufgaben',
  ];
  const corpus = guideCorpus(guide);
  return domains.some(domain => n.includes(domain) && !corpus.includes(domain));
}

function scoreAgainst(haystack: string, terms: string[], bonus = 0): number {
  let score = bonus;
  for (const term of terms) {
    if (haystack.includes(term)) score += term.length >= 9 ? 5 : term.length >= 6 ? 4 : 3;
  }
  return score;
}

function bestEvidence(guide: GuideRecord, text: string, currentIndex: number): Evidence | null {
  const terms = questionTerms(text);
  const candidates: Evidence[] = [];

  guide.steps.forEach((step, index) => {
    const haystack = normalize(`${step.text || ''} ${step.check || ''} ${step.stuck || ''}`);
    const score = scoreAgainst(haystack, terms, index === currentIndex ? 2 : 0);
    candidates.push({ kind: 'step', text: step.text || '', score, stepIndex: index });
  });

  for (const value of Object.values(guide.troubleshooting || {})) {
    const haystack = normalize(value);
    const score = scoreAgainst(haystack, terms, 0);
    candidates.push({ kind: 'troubleshooting', text: value, score });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || null;
}

function shouldUseContextHelp(text: string, guide: GuideRecord, currentIndex: number): boolean {
  if (isControlOrConfirmation(text) || explicitDifferentGoal(text, guide)) return false;
  if (isExplicitHelp(text)) return true;

  const evidence = bestEvidence(guide, text, currentIndex);
  if (evidence && evidence.score >= 5) return true;
  return looksLikeQuestion(text);
}

function contextHelpResponse(
  origin: string | null,
  guide: GuideRecord,
  text: string,
  suppliedStep: unknown,
): Response {
  const currentIndex = currentStepIndex(guide, suppliedStep);
  const currentStep = guide.steps[currentIndex] || guide.steps[0] || {};
  const evidence = bestEvidence(guide, text, currentIndex);
  const helpIntent = isExplicitHelp(text);
  const n = normalize(text);
  const asksDifferentLabel = /\b(bei mir heisst|bei mir steht|sieht anders aus|ist anders|andere ansicht|anderer reiter|anderes menu)\b/.test(n);

  let instruction = '';
  let check = String(currentStep.check || 'Bist du an dieser Stelle?').trim();
  let evidenceStep: number | null = null;

  if (evidence?.kind === 'troubleshooting' && evidence.score >= 4) {
    instruction = evidence.text.trim();
  } else if (evidence?.kind === 'step' && typeof evidence.stepIndex === 'number' && (evidence.score >= 4 || helpIntent)) {
    const matched = guide.steps[evidence.stepIndex] || currentStep;
    evidenceStep = evidence.stepIndex + 1;
    const useStuck = helpIntent && Boolean(matched.stuck);
    instruction = String((useStuck ? matched.stuck : matched.text) || matched.stuck || '').trim();
    if (evidence.stepIndex === currentIndex && matched.check) check = String(matched.check).trim();
  }

  if (!instruction) {
    instruction = String((helpIntent ? currentStep.stuck : '') || currentStep.text || currentStep.stuck || '').trim();
    evidenceStep = currentIndex + 1;
  }

  if (asksDifferentLabel) {
    instruction = `${instruction} Wenn die Bezeichnung bei dir abweicht, nenne mir nur die sichtbaren Menü- oder Buttonbezeichnungen; dann gleiche ich sie mit dem bestätigten Ablauf ab.`.trim();
  }

  if (!instruction) {
    instruction = `Bleib im Ablauf „${guide.title}“. Der aktuell bestätigte Schritt ist noch nicht eindeutig genug beschrieben.`;
  }

  return jsonResponse(origin, 200, {
    reply: `${instruction}\n\n${check}`,
    spokenText: instruction,
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: currentIndex + 1,
    guideStepCount: guide.steps.length,
    completed: false,
    source: 'approved-guide-context-help-v28-2',
    contextEvidenceStep: evidenceStep,
  });
}

async function loadGuide(slug: string): Promise<GuideRecord | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  const endpoint = `${url}/rest/v1/dokohilf_guides?select=slug,title,steps,troubleshooting,version&status=eq.approved&slug=eq.${encodeURIComponent(slug)}&limit=1`;
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

  if (guideSlug) {
    const guide = await loadGuide(guideSlug);
    const index = guide ? currentStepIndex(guide, parsed.guideStep) : 0;
    if (guide && shouldUseContextHelp(lastText, guide, index)) {
      return contextHelpResponse(origin, guide, lastText, parsed.guideStep);
    }
  }

  return forwardToExistingRouter(rawBody, origin);
});
