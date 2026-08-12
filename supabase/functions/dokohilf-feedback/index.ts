const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const FUNCTION_VERSION = 'anonymous-structured-feedback-v43-1';
const MAX_BODY_CHARS = 2_048;
const MAX_GLOBAL_REQUESTS_PER_MINUTE = 180;

const ISSUE_TYPES = new Set([
  'missing_information',
  'instruction_unclear',
  'cannot_find',
  'app_unresponsive',
  'display_problem',
  'voice_problem',
  'other_technical',
]);
const IMPACTS = new Set(['blocking', 'annoying', 'note']);
const CONTEXT_KINDS = new Set(['start', 'chat', 'voice', 'library', 'guide', 'unknown']);
const APP_MODES = new Set(['start', 'chat', 'voice', 'unknown']);
const TOP_LEVEL_KEYS = new Set(['issueType', 'impact', 'context']);
const CONTEXT_KEYS = new Set(['kind', 'guideSlug', 'guideStep', 'guideStepCount', 'buildId', 'appMode']);

let requestWindowStartedAt = Date.now();
let requestWindowCount = 0;

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Expose-Headers': 'X-DokoHilf-Feedback',
    'Cache-Control': 'no-store',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(origin: string, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'X-DokoHilf-Feedback': FUNCTION_VERSION,
    },
  });
}

function isGloballyRateLimited(): boolean {
  const now = Date.now();
  if (now - requestWindowStartedAt >= 60_000) {
    requestWindowStartedAt = now;
    requestWindowCount = 1;
    return false;
  }
  requestWindowCount += 1;
  return requestWindowCount > MAX_GLOBAL_REQUESTS_PER_MINUTE;
}

function onlyAllowedKeys(value: Record<string, unknown>, allowed: Set<string>): boolean {
  return Object.keys(value).every(key => allowed.has(key));
}

function finiteInteger(value: unknown, min: number, max: number): number | null {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= min && numeric <= max ? numeric : null;
}

function sanitizePayload(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const parsed = value as Record<string, unknown>;
  if (!onlyAllowedKeys(parsed, TOP_LEVEL_KEYS)) return null;

  const issueType = typeof parsed.issueType === 'string' ? parsed.issueType : '';
  const impact = typeof parsed.impact === 'string' ? parsed.impact : '';
  if (!ISSUE_TYPES.has(issueType) || !IMPACTS.has(impact)) return null;

  const rawContext = parsed.context;
  if (!rawContext || typeof rawContext !== 'object' || Array.isArray(rawContext)) return null;
  const context = rawContext as Record<string, unknown>;
  if (!onlyAllowedKeys(context, CONTEXT_KEYS)) return null;

  const kind = typeof context.kind === 'string' ? context.kind : 'unknown';
  const appMode = typeof context.appMode === 'string' ? context.appMode : 'unknown';
  const buildId = typeof context.buildId === 'string' ? context.buildId : '';
  if (!CONTEXT_KINDS.has(kind) || !APP_MODES.has(appMode) || !/^\d{8}-\d{2}$/.test(buildId)) return null;

  let guideSlug: string | null = null;
  let guideStep: number | null = null;
  let guideStepCount: number | null = null;

  if (kind === 'guide') {
    guideSlug = typeof context.guideSlug === 'string' && /^[a-z0-9-]{1,80}$/.test(context.guideSlug)
      ? context.guideSlug
      : null;
    guideStep = finiteInteger(context.guideStep, 1, 100);
    guideStepCount = finiteInteger(context.guideStepCount, 1, 100);
    if (!guideSlug || guideStep === null || guideStepCount === null || guideStep > guideStepCount) return null;
  }

  return {
    issue_type: issueType,
    impact,
    context_kind: kind,
    guide_slug: guideSlug,
    guide_step: guideStep,
    guide_step_count: guideStepCount,
    build_id: buildId,
    app_mode: appMode,
  };
}

async function storeFeedback(payload: Record<string, unknown>): Promise<string | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;

  const response = await fetch(`${url}/rest/v1/dokohilf_feedback?select=report_code`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!response?.ok) return null;
  const rows = await response.json().catch(() => []);
  const code = Array.isArray(rows) && rows[0] && typeof rows[0].report_code === 'string'
    ? rows[0].report_code
    : '';
  return /^DH-[A-F0-9]{12}$/.test(code) ? code : null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  if (!ALLOWED_ORIGINS.has(origin)) {
    return new Response(JSON.stringify({ error: 'origin_not_allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== 'POST') return jsonResponse(origin, 405, { error: 'method_not_allowed' });
  if (isGloballyRateLimited()) return jsonResponse(origin, 429, { error: 'try_again_later' });

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return jsonResponse(origin, 415, { error: 'content_type_required' });
  }

  let raw = '';
  try {
    raw = await req.text();
  } catch {
    return jsonResponse(origin, 400, { error: 'invalid_request' });
  }
  if (!raw || raw.length > MAX_BODY_CHARS) return jsonResponse(origin, 400, { error: 'invalid_request' });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse(origin, 400, { error: 'invalid_json' });
  }

  const payload = sanitizePayload(parsed);
  if (!payload) return jsonResponse(origin, 400, { error: 'invalid_feedback' });

  const reportCode = await storeFeedback(payload);
  if (!reportCode) return jsonResponse(origin, 503, { error: 'feedback_unavailable' });

  return jsonResponse(origin, 201, { ok: true, reportCode });
});
