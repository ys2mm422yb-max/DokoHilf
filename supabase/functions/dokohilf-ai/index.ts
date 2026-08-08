const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const MODEL = 'gemini-3.6-flash';
const CORE_VERSION = 'approved-knowledge-core-v14';
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 14;
const MAX_BODY_CHARS = 16_000;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 350;
const CACHE_MS = 20_000;

const requestWindows = new Map<string, { startedAt: number; count: number }>();

type ChatMessage = { role: 'user' | 'assistant'; content: string };
type GuideStep = { text?: string; check?: string; stuck?: string };
type GuideRecord = {
  slug: string;
  title: string;
  aliases: string[];
  steps: GuideStep[];
  troubleshooting?: Record<string, string>;
  version?: number;
};
type TopicRecord = {
  slug: string;
  title: string;
  aliases: string[];
  overview: string;
  capabilities: string[];
  approved_guide_slugs: string[];
  unconfirmed_actions: string[];
  variant_note?: string;
};
type Knowledge = { guides: GuideRecord[]; topics: TopicRecord[] };
type RouteDecision =
  | { kind: 'guide'; slug: string }
  | { kind: 'topic'; slug: string }
  | { kind: 'basic'; reply: string }
  | { kind: 'clarify'; reply: string };

let knowledgeCache: { loadedAt: number; value: Knowledge | null } = { loadedAt: 0, value: null };

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
    'Access-Control-Expose-Headers': 'X-DokoHilf-Core',
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
      'X-DokoHilf-Core': CORE_VERSION,
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
  return value
    .slice(-MAX_MESSAGES)
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== 'object') return null;
      const role = (item as Record<string, unknown>).role;
      const content = (item as Record<string, unknown>).content;
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
      const clean = content.replace(/\u0000/g, '').trim().slice(0, MAX_MESSAGE_CHARS);
      return clean ? { role, content: clean } : null;
    })
    .filter((item): item is ChatMessage => Boolean(item));
}

function containsSensitiveData(text: string): boolean {
  const raw = String(text || '').trim();
  const n = normalize(raw);
  const direct = [
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
    /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
    /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[a-zäöüß-]{2,}/i,
    /\b(?:straße|strasse|weg|platz|allee)\s*\d+/i,
    /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer|bewohnernummer)\b/i,
    /\b\d{5}\s+[a-zäöüß-]{3,}/i,
    /\b\d{6,}\b/,
  ];
  if (direct.some((pattern) => pattern.test(raw))) return true;
  const health = /\b(diagnose|blutdruck|puls|temperatur|medikament|dosis|insulin|schmerz|wunde|berichtstext|ubergabeinhalt|mg|ml)\b/i.test(n);
  const caseLanguage = /\b(hat|bekommt|nimmt|leidet|war heute|ist gesturzt|verweigert|bewohner|klient|patient)\b/i.test(n);
  return health && (caseLanguage || /\d/.test(raw));
}

async function loadKnowledge(): Promise<Knowledge> {
  if (knowledgeCache.value && Date.now() - knowledgeCache.loadedAt < CACHE_MS) return knowledgeCache.value;
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('knowledge_unavailable');
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
  const [guideResponse, topicResponse] = await Promise.all([
    fetch(`${url}/rest/v1/dokohilf_guides?select=slug,title,aliases,steps,troubleshooting,version&status=eq.approved`, { headers }),
    fetch(`${url}/rest/v1/dokohilf_topics?select=slug,title,aliases,overview,capabilities,approved_guide_slugs,unconfirmed_actions,variant_note&status=eq.approved`, { headers }),
  ]);
  if (!guideResponse.ok || !topicResponse.ok) throw new Error('knowledge_unavailable');
  const guides = await guideResponse.json();
  const topics = await topicResponse.json();
  const value: Knowledge = {
    guides: Array.isArray(guides) ? guides : [],
    topics: Array.isArray(topics) ? topics : [],
  };
  knowledgeCache = { loadedAt: Date.now(), value };
  return value;
}

function words(value: string): string[] {
  const stop = new Set(['wie','wo','was','wer','wann','warum','ich','du','der','die','das','den','dem','ein','eine','einen','und','oder','zu','zur','zum','in','im','am','auf','mit','fur','bitte','mir','machen','offnen','finden','gehen','zeigen','soll','nicht','habe','hab']);
  return normalize(value).split(' ').filter((word) => word.length >= 3 && !stop.has(word));
}

function scoreCandidate(text: string, candidate: string): number {
  const n = normalize(text);
  const c = normalize(candidate);
  if (!c) return 0;
  let score = 0;
  if (n === c) score += 100;
  else if (c.length >= 5 && (n.includes(c) || c.includes(n))) score += 50;
  const inputWords = new Set(words(text));
  for (const word of words(candidate)) if (inputWords.has(word)) score += word.length >= 8 ? 11 : 7;
  return score;
}

function scoreEntity(text: string, entity: { title: string; aliases?: string[] }): number {
  return [entity.title, ...(entity.aliases || [])].reduce((best, candidate) => Math.max(best, scoreCandidate(text, candidate)), 0);
}

function bestMatch<T extends { title: string; aliases?: string[] }>(items: T[], text: string, minScore = 14): T | null {
  const ranked = items.map((item) => ({ item, score: scoreEntity(text, item) })).sort((a, b) => b.score - a.score);
  const first = ranked[0];
  const second = ranked[1];
  if (!first || first.score < minScore) return null;
  if (second && first.score < 50 && first.score - second.score < 6) return null;
  return first.item;
}

function quickBasicReply(text: string): { reply: string; clearGuide?: boolean } | null {
  const n = normalize(text);
  if (/^(hallo|hi|hey|servus|guten morgen|guten tag|guten abend)(\s|$)/.test(n)) {
    return { reply: 'Hallo! Sag oder schreib einfach, wobei du in der Dokumentation Hilfe brauchst.' };
  }
  if (/\b(warum sprichst du nicht|sprichst du nicht|ich hore nichts|kein ton|keine stimme|stimme hangt|stimme verzogert)\b/.test(n)) {
    return { reply: 'Entschuldige. Die Sprachausgabe verwendet die kostenlose DokoHilf-Stimme Supertonic F1. Du kannst deine Bedienfrage sofort erneut sagen.' };
  }
  if (/\b(ich habe dich doch gar nichts gefragt|ich hab dich doch gar nichts gefragt|das habe ich nicht gefragt|das hab ich nicht gefragt|du hast mich falsch verstanden|falsch verstanden)\b/.test(n)) {
    return { reply: 'Stimmt. Ich habe fälschlich einen Ablauf gestartet. Sag mir bitte erst, wobei du tatsächlich Hilfe brauchst.', clearGuide: true };
  }
  if (/\b(kannst du mir helfen|hilf mir|ich brauche hilfe|ich brauch hilfe)\b/.test(n)) {
    return { reply: 'Klar. Sag einfach in deinen eigenen Worten, was du öffnen oder erledigen möchtest.' };
  }
  if (/\b(wie geht es dir|wie gehts|alles gut bei dir)\b/.test(n)) {
    return { reply: 'Danke, mir geht es gut. Wobei kann ich dir in der Dokumentation helfen?' };
  }
  if (/\b(danke|vielen dank|dankeschon)\b/.test(n)) {
    return { reply: 'Gern. Sag einfach, wobei du als Nächstes Hilfe brauchst.' };
  }
  if (/^(tschuss|ciao|bis dann|auf wiedersehen)/.test(n)) {
    return { reply: 'Bis bald. Dein Gespräch wird nicht gespeichert.', clearGuide: true };
  }
  if (/\b(was kannst du|wobei kannst du helfen|was machst du|wer bist du)\b/.test(n)) {
    return { reply: 'Ich bin DokoHilf. Ich verstehe allgemeine Bedienfragen und führe nur durch bestätigte Klickwege. Echte Namen, Berichte oder Gesundheitsdaten dürfen niemals eingegeben werden.' };
  }
  return null;
}

function actionMatch(text: string, actions: string[]): string | null {
  const n = normalize(text);
  const stems = ['storn','durchstreich','ander','verander','anleg','dokumentier','abschliess','ungultig','export','konfigurier','abzeich','erfass','losch','verknupf','setz'];
  let best = 0;
  let matched: string | null = null;
  for (const action of actions || []) {
    const normalizedAction = normalize(action);
    if (!stems.some((stem) => n.includes(stem) && normalizedAction.includes(stem))) continue;
    const score = scoreCandidate(text, action);
    if (score > best) {
      best = score;
      matched = action;
    }
  }
  return best >= 7 ? matched : null;
}

function topicReply(topic: TopicRecord, guides: GuideRecord[], text: string): Record<string, unknown> {
  const unconfirmed = actionMatch(text, topic.unconfirmed_actions || []);
  if (unconfirmed) {
    const entry = (topic.approved_guide_slugs || []).map((slug) => guides.find((guide) => guide.slug === slug)).find(Boolean);
    return {
      reply: `Das gehört zum Bereich „${topic.title}“. Für diese konkrete Aktion liegt noch kein bestätigter Klickweg vor.${entry ? ` Bestätigt ist der Einstieg „${entry.title}“.` : ''}`,
      guideSlug: null,
      topicSlug: topic.slug,
      source: 'verified-topic-boundary-v14',
    };
  }
  const capabilities = (topic.capabilities || []).slice(0, 5).join(', ');
  return {
    reply: `${topic.overview}${capabilities ? ` Typische Möglichkeiten sind: ${capabilities}.` : ''} ${topic.variant_note || ''}`.trim(),
    guideSlug: null,
    topicSlug: topic.slug,
    source: 'verified-topic-context-v14',
  };
}

function isRepeat(text: string): boolean { return /^(nochmal|erneut|wiederholen|noch einmal|schritt wiederholen)$/.test(normalize(text)); }
function isBack(text: string): boolean { return /^(zuruck|einen schritt zuruck|schritt zuruck)$/.test(normalize(text)); }
function isContinue(text: string): boolean { return /^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ist offen|ist geoffnet)$/.test(normalize(text)); }
function isStuck(text: string): boolean {
  const n = normalize(text);
  return /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(n)
    || /\b(kann|konnte)\b.*\b(nicht finden|nicht sehen|nicht offnen)\b/.test(n)
    || /^(geht|klappt|funktioniert) nicht\b/.test(n)
    || /^(ich komme|komme) nicht weiter\b/.test(n)
    || /^(ich finde es nicht|ich finde das nicht|finde ich nicht|sehe ich nicht)$/.test(n);
}

function renderGuideStep(origin: string | null, guide: GuideRecord, index: number, source: string): Response {
  const safeIndex = Math.max(0, Math.min(index, guide.steps.length));
  if (safeIndex >= guide.steps.length) {
    return jsonResponse(origin, 200, {
      reply: 'Der Ablauf ist erledigt. Kontrolliere zum Schluss, ob der Eintrag in der vorgesehenen Übersicht sichtbar ist.',
      spokenText: 'Der Ablauf ist erledigt. Kontrolliere zum Schluss den Eintrag.',
      guideSlug: null,
      guideTitle: guide.title,
      guideStep: guide.steps.length,
      guideStepCount: guide.steps.length,
      completed: true,
      source,
    });
  }
  const step = guide.steps[safeIndex] || {};
  const instruction = String(step.text || '').trim();
  const check = String(step.check || 'Ist dieser Schritt erledigt?').trim();
  return jsonResponse(origin, 200, {
    reply: `${instruction}\n\n${check}`.trim(),
    spokenText: instruction,
    guideSlug: guide.slug,
    guideTitle: guide.title,
    guideVersion: guide.version || 1,
    guideStep: safeIndex + 1,
    guideStepCount: guide.steps.length,
    completed: false,
    source,
  });
}

function activeGuideReply(origin: string | null, parsed: Record<string, unknown>, messages: ChatMessage[], guide: GuideRecord): Response | null {
  const last = messages.at(-1)?.content || '';
  const supplied = Number(parsed.guideStep);
  const current = Number.isInteger(supplied) && supplied >= 1 ? Math.min(supplied - 1, Math.max(0, guide.steps.length - 1)) : 0;
  if (isBack(last)) return renderGuideStep(origin, guide, Math.max(0, current - 1), 'approved-guide-core-back-v14');
  if (isRepeat(last)) return renderGuideStep(origin, guide, current, 'approved-guide-core-repeat-v14');
  if (isContinue(last)) return renderGuideStep(origin, guide, current + 1, 'approved-guide-core-continue-v14');
  if (isStuck(last)) {
    const step = guide.steps[current] || guide.steps[0] || {};
    const fallback = Object.values(guide.troubleshooting || {})[0] || `Bleibe beim aktuellen Schritt und suche genau nach der genannten Stelle: ${step.text || ''}`;
    const help = String(step.stuck || fallback).trim();
    return jsonResponse(origin, 200, {
      reply: `${help}\n\nKlappt es so?`,
      spokenText: help,
      guideSlug: guide.slug,
      guideTitle: guide.title,
      guideStep: current + 1,
      guideStepCount: guide.steps.length,
      source: 'approved-guide-core-stuck-v14',
    });
  }
  return null;
}

function extractModelText(payload: Record<string, unknown>): string {
  const candidates = payload.candidates;
  if (!Array.isArray(candidates)) return '';
  const first = candidates[0] as Record<string, unknown> | undefined;
  const content = first?.content as Record<string, unknown> | undefined;
  const parts = content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((part) => {
    if (!part || typeof part !== 'object') return '';
    const text = (part as Record<string, unknown>).text;
    return typeof text === 'string' ? text : '';
  }).join('').trim();
}

async function intelligentRoute(apiKey: string, knowledge: Knowledge, messages: ChatMessage[]): Promise<RouteDecision> {
  const guideCatalog = knowledge.guides.map((guide) => ({ slug: guide.slug, title: guide.title, aliases: guide.aliases }));
  const topicCatalog = knowledge.topics.map((topic) => ({ slug: topic.slug, title: topic.title, aliases: topic.aliases, overview: topic.overview }));
  const system = [
    'Du routest ausschließlich die letzte Nachricht für DokoHilf.',
    'DokoHilf ist nur eine erklärende Bedienhilfe und verarbeitet keine echten Personen-, Gesundheits-, Mitarbeiter- oder Falldaten.',
    'Erfinde niemals Klickwege. Nutze nur die angegebenen bestätigten Guides und Themen.',
    'Antworte ausschließlich als kompaktes JSON ohne Markdown.',
    'Erlaubte Ergebnisse: {"kind":"guide","slug":"..."}, {"kind":"topic","slug":"..."}, {"kind":"basic","reply":"..."}, {"kind":"clarify","reply":"..."}.',
    'Bei basic oder clarify maximal 45 Wörter.',
    `Bestätigte Guides: ${JSON.stringify(guideCatalog)}`,
    `Geprüfte Themen: ${JSON.stringify(topicCatalog)}`,
  ].join('\n');
  const contents = messages.slice(-4).map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    signal: AbortSignal.timeout(5_000),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 180, responseMimeType: 'application/json', thinkingConfig: { thinkingLevel: 'minimal' } },
    }),
  }).catch(() => null);
  if (!response?.ok) return { kind: 'clarify', reply: 'Ich habe dich noch nicht sicher verstanden. Was möchtest du in der Dokumentation öffnen oder erledigen?' };
  const payload = await response.json().catch(() => ({}));
  try {
    const parsed = JSON.parse(extractModelText(payload as Record<string, unknown>)) as RouteDecision;
    if (parsed.kind === 'guide' && knowledge.guides.some((guide) => guide.slug === parsed.slug)) return parsed;
    if (parsed.kind === 'topic' && knowledge.topics.some((topic) => topic.slug === parsed.slug)) return parsed;
    if ((parsed.kind === 'basic' || parsed.kind === 'clarify') && typeof parsed.reply === 'string' && parsed.reply.trim()) {
      return { ...parsed, reply: parsed.reply.trim().slice(0, 240) } as RouteDecision;
    }
  } catch { /* fall through */ }
  return { kind: 'clarify', reply: 'Ich habe dich noch nicht sicher verstanden. Was möchtest du in der Dokumentation öffnen oder erledigen?' };
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
  if (!messages.length || messages.at(-1)?.role !== 'user') return jsonResponse(origin, 400, { error: 'Es fehlt eine gültige Nutzernachricht.' });
  if (messages.some((message) => message.role === 'user' && containsSensitiveData(message.content))) {
    return jsonResponse(origin, 422, { blocked: true, error: 'Mögliche Echtdaten erkannt. Die Anfrage wurde nicht an Gemini übertragen.' });
  }

  let knowledge: Knowledge;
  try {
    knowledge = await loadKnowledge();
  } catch {
    return jsonResponse(origin, 503, { error: 'Die freigegebene Wissensbasis ist gerade nicht erreichbar.' });
  }

  const lastText = messages.at(-1)?.content || '';
  const activeGuide = knowledge.guides.find((guide) => guide.slug === String(parsed.guideSlug || '')) || null;
  if (activeGuide) {
    const activeResponse = activeGuideReply(origin, parsed, messages, activeGuide);
    if (activeResponse) return activeResponse;
  }

  const basic = quickBasicReply(lastText);
  if (basic) {
    return jsonResponse(origin, 200, {
      reply: basic.reply,
      guideSlug: basic.clearGuide ? null : (activeGuide?.slug || null),
      source: 'basic-conversation-v14',
    });
  }

  const guide = bestMatch(knowledge.guides, lastText);
  if (guide) return renderGuideStep(origin, guide, 0, 'approved-guide-core-match-v14');

  const topic = bestMatch(knowledge.topics, lastText);
  if (topic) return jsonResponse(origin, 200, topicReply(topic, knowledge.guides, lastText));

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist noch nicht eingerichtet.' });
  const decision = await intelligentRoute(apiKey, knowledge, messages);

  if (decision.kind === 'guide') {
    const routedGuide = knowledge.guides.find((item) => item.slug === decision.slug);
    if (routedGuide) return renderGuideStep(origin, routedGuide, 0, 'approved-guide-core-ai-routed-v14');
  }
  if (decision.kind === 'topic') {
    const routedTopic = knowledge.topics.find((item) => item.slug === decision.slug);
    if (routedTopic) return jsonResponse(origin, 200, topicReply(routedTopic, knowledge.guides, lastText));
  }
  return jsonResponse(origin, 200, {
    reply: decision.reply,
    guideSlug: null,
    source: decision.kind === 'basic' ? 'basic-conversation-ai-v14' : 'clarification-v14',
  });
});
