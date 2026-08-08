const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 24;
const MAX_BODY_CHARS = 16_000;
const ROUTER_CONTRACT_MARKERS = ['approved-guide-context-help-v28', 'approved-guide-context-help-v29-4'] as const;
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
      'X-DokoHilf-Chat-Router': 'context-aware-v29-4',
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
    || /\b(komme nicht weiter|weiss nicht weiter|weiss nicht wo|ich weiss nicht|weiss nicht|keine ahnung wo|keine ahnung|nicht zurecht|brauche hilfe|hilf mir|checke nicht|check nicht|verstehe nicht|versteh nicht|was meinst du|welches davon|und jetzt|was jetzt|hae)\b/.test(n)
    || /\b(was dann|wie geht es weiter|was muss ich|was soll ich|wo klicken|wo drucken|welchen button|welche taste|was anklicken)\b/.test(n)
    || /\b(bei mir heisst|bei mir steht|sieht anders aus|ist anders|andere ansicht|anderer reiter|anderes menu)\b/.test(n)
    || /\b(ich sehe nur|ich habe nur|da steht nur|bei mir sehe ich)\b/.test(n);
}

function looksLikeQuestion(text: string): boolean {
  const raw = String(text || '').trim();
  const n = normalize(raw);
  return raw.includes('?')
    || /^(wo|wie|was|welche|welcher|welches|warum|muss|soll|kann|darf|ist|sind|kommt)\b/.test(n);
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
  const active = normalize(`${guide.slug} ${guide.title}`);
  if (/\b(neuer ablauf|anderer ablauf|anderes thema|stattdessen|wechseln zu|jetzt lieber)\b/.test(n)) return true;

  const relatedGuideSwitches: Array<[RegExp, RegExp]> = [
    [/\b(durchstreichen|bericht loschen|bericht korrigieren)\b/, /bericht-durchstreichen|durchstreichen/],
    [/\bfolgebericht\b/, /bericht-folgebericht|folgebericht/],
    [/\b(berichtssuche|berichte suchen|bericht suchen|nach berichten suchen)\b/, /berichtssuche|berichte suchen/],
    [/\b(neuen bericht|bericht anlegen|bericht schreiben|bericht erfassen)\b/, /bericht-neu|neuen bericht/],
    [/\b(sammelerfassung|mehrere vitalwerte|vitalwerte zusammen)\b/, /sammelerfassung/],
    [/\b(einzelwert|einzelnen vitalwert|einen vitalwert)\b/, /einzelwert/],
  ];
  if (relatedGuideSwitches.some(([intent, target]) => intent.test(n) && !target.test(active))) return true;

  if (!/\b(ich mochte|ich will|wie lege ich|wie erfasse ich|wie offne ich|wie kann ich)\b/.test(n)) return false;
  const domains = [
    'bericht', 'visite', 'vital', 'medikation', 'formular', 'ubergabe', 'anwesenheit',
    'notfallblatt', 'stammdaten', 'easy plan', 'durchfuhrung', 'aufgaben',
  ];
  const corpus = guideCorpus(guide);
  return domains.some(domain => n.includes(domain) && !corpus.includes(domain));
}

function hasEntryAction(text: string): boolean {
  const n = normalize(text);
  return /\b(erfassen|eintragen|eingeben|anlegen|erstellen|schreiben|dokumentieren|neu machen|neu erfassen|korrigieren|durchstreichen|stornieren)\b/.test(n);
}

function hasNavigationIntent(text: string): boolean {
  const n = normalize(text);
  return /\b(suche|such|finde|finden|wo ist|wo sind|wo finde|wie komme|ich will zu|ich mochte zu|offnen|oeffnen|aufrufen|ansehen|anschauen|zeigen)\b/.test(n)
    || n.split(' ').length <= 5;
}

function inferNavigationGuide(text: string): string {
  const n = normalize(text);
  if (!hasNavigationIntent(n) || hasEntryAction(n)) return '';
  if (/\b(berichtssuche|berichte auswerten|berichte suchen|nach berichten suchen|abfrage)\b/.test(n)) return 'berichtssuche';
  if (/\b(blutdruck|puls|temperatur|blutzucker|sauerstoff|spo2|vitalwert|vitalwerte)\b/.test(n)) return 'vitalwerte-einzelwert';
  if (/\b(bericht|berichte|berichtseintrag)\b/.test(n)) return 'bericht-neu';
  if (/\b(visite|visiten|sprechstunde)\b/.test(n)) return 'visiten-oeffnen';
  if (/\b(medikation|medikament|medikamente|medikationsplan)\b/.test(n)) return 'medikation-ansehen';
  if (/\b(formular|formulare|anfallsprotokoll|fallgesprach|gesprachsprotokoll|sturzprotokoll)\b/.test(n)) return 'formulare-anlegen';
  if (/\b(anwesenheit|abwesenheit|an- und abwesenheit)\b/.test(n)) return 'anwesenheit';
  if (/\b(ubergabe|uebergabe|was war los)\b/.test(n)) return 'uebergabeformular';
  if (/\b(notfallblatt|notfallbogen)\b/.test(n)) return 'notfallblatt';
  if (/\b(durchfuhrungsnachweis|durchfuehrungsnachweis|durchfuhrung|durchfuehrung)\b/.test(n)) return 'durchfuehrungsnachweis-oeffnen';
  if (/\b(aufgaben|aktuelles)\b/.test(n)) return 'aufgaben-aktuelles';
  if (/\b(easy plan|easy-plan|easyplan)\b/.test(n)) return 'easyplan';
  if (/\b(stammdaten)\b/.test(n)) return 'stammdaten';
  return '';
}

function stepResponse(
  origin: string | null,
  guide: GuideRecord,
  index: number,
  source: string,
  useStuck = false,
  extra = '',
): Response {
  const step = guide.steps[index] || guide.steps[0] || {};
  let instruction = String((useStuck ? step.stuck : step.text) || step.text || step.stuck || '').trim();
  if (extra) instruction = `${instruction} ${extra}`.trim();
  if (!instruction) instruction = `Bleib im Ablauf „${guide.title}“ beim aktuellen Schritt.`;
  const check = String(step.check || 'Bist du an dieser Stelle?').trim();
  return jsonResponse(origin, 200, {
    reply: `${instruction}\n\n${check}`,
    spokenText: instruction,
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: index + 1,
    guideStepCount: guide.steps.length,
    completed: false,
    source,
  });
}

function contextHelpResponse(
  origin: string | null,
  guide: GuideRecord,
  text: string,
  suppliedStep: unknown,
): Response {
  const currentIndex = currentStepIndex(guide, suppliedStep);
  const n = normalize(text);
  const asksDifferentLabel = /\b(bei mir heisst|bei mir steht|sieht anders aus|ist anders|andere ansicht|anderer reiter|anderes menu)\b/.test(n);
  const extra = asksDifferentLabel
    ? 'Wenn die Bezeichnung bei dir abweicht, nenne mir nur die sichtbaren Menü- oder Buttonbezeichnungen; ich erfinde keinen alternativen Klickweg.'
    : '';
  return stepResponse(origin, guide, currentIndex, ROUTER_CONTRACT_MARKERS[1], true, extra);
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
  const guideSlug = typeof parsed.guideSlug === 'string' ? parsed.guideSlug.trim() : '';
  const selectedGuideSlug = typeof parsed.selectedGuideSlug === 'string' ? parsed.selectedGuideSlug.trim() : '';
  const smartHelpIntent = parsed.smartHelpIntent === true;

  if (!messages.length || !lastText) return forwardToExistingRouter(rawBody, origin);
  if (messages.some(message => message.role === 'user' && containsSensitiveData(message.content))) {
    return forwardToExistingRouter(rawBody, origin);
  }

  if (guideSlug) {
    const guide = await loadGuide(guideSlug);
    if (guide && !isControlOrConfirmation(lastText) && !explicitDifferentGoal(lastText, guide)
      && (smartHelpIntent || isExplicitHelp(lastText) || looksLikeQuestion(lastText))) {
      return contextHelpResponse(origin, guide, lastText, parsed.guideStep);
    }
  }

  if (!guideSlug) {
    const requestedSlug = selectedGuideSlug || inferNavigationGuide(lastText);
    if (requestedSlug) {
      const guide = await loadGuide(requestedSlug);
      if (guide?.steps?.length) {
        return stepResponse(origin, guide, 0, 'approved-guide-smart-start-v29-1');
      }
    }
  }

  return forwardToExistingRouter(rawBody, origin);
});
