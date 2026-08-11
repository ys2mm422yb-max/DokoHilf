const ALLOWED_ORIGIN = 'https://ys2mm422yb-max.github.io';
const MAX_REQUESTS_PER_WINDOW = 300;
const WINDOW_MS = 60_000;
const MAX_BODY_CHARS = 128;

let windowStartedAt = Date.now();
let requestCount = 0;

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(),
      'Content-Type': 'application/json; charset=utf-8',
      'X-DokoHilf-Usage-Metrics': 'anonymous-aggregate-v41',
    },
  });
}

function isGloballyRateLimited(): boolean {
  const now = Date.now();
  if (now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    requestCount = 0;
  }
  requestCount += 1;
  return requestCount > MAX_REQUESTS_PER_WINDOW;
}

async function serviceRequest(path: string, init: RequestInit): Promise<Response | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return null;
  return fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(4_000),
  }).catch(() => null);
}

async function healthCheck(): Promise<boolean> {
  const response = await serviceRequest('/rest/v1/dokohilf_usage_summary?select=total_views&limit=1', {
    method: 'GET',
  });
  return Boolean(response?.ok);
}

async function incrementPageView(): Promise<boolean> {
  const response = await serviceRequest('/rest/v1/rpc/dokohilf_increment_page_view', {
    method: 'POST',
    body: '{}',
  });
  return Boolean(response?.ok);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Nur POST ist erlaubt.' });
  if (origin !== ALLOWED_ORIGIN) return jsonResponse(403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isGloballyRateLimited()) return jsonResponse(429, { error: 'Zu viele Anfragen.' });

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_CHARS) return jsonResponse(400, { error: 'Die Anfrage ist zu groß.' });

  let health = false;
  if (rawBody.trim()) {
    try { health = JSON.parse(rawBody)?.health === true; }
    catch { return jsonResponse(400, { error: 'Ungültige Anfrage.' }); }
  }

  if (health) {
    if (!(await healthCheck())) return jsonResponse(503, { ok: false });
    return jsonResponse(200, { ok: true });
  }

  if (!(await incrementPageView())) return jsonResponse(503, { ok: false });
  return jsonResponse(200, { ok: true });
});
