const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const ALLOWED_STATUSES = new Set(['draft', 'reviewed', 'approved', 'blocked']);
const EDITOR_STATUSES = new Set(['draft', 'reviewed']);
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_BODY_CHARS = 50_000;
const requestWindows = new Map<string, { startedAt: number; count: number }>();

type EditorRole = 'staff' | 'editor' | 'admin';
type GuideStep = { text: string; check?: string; stuck?: string };

type GuideInput = {
  id?: string;
  slug: string;
  title: string;
  aliases: string[];
  steps: GuideStep[];
  troubleshooting?: Record<string, string>;
  status: string;
  reviewIntervalDays?: number;
  changeNote: string;
};

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin)
    ? origin
    : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

function decodeJwtSubject(authorization: string | null): string | null {
  const token = authorization?.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

function serviceHeaders(): Record<string, string> {
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) throw new Error('service_key_missing');
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
  };
}

function supabaseUrl(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) throw new Error('supabase_url_missing');
  return url;
}

async function rest(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${supabaseUrl()}${path}`, {
    ...init,
    headers: { ...serviceHeaders(), ...(init.headers || {}) },
  });
}

async function getRole(userId: string): Promise<EditorRole | null> {
  const response = await rest(
    `/rest/v1/dokohilf_user_roles?select=role&user_id=eq.${encodeURIComponent(userId)}&active=eq.true&limit=1`,
  );
  if (!response.ok) throw new Error('role_lookup_failed');
  const rows = await response.json();
  const role = rows?.[0]?.role;
  return role === 'staff' || role === 'editor' || role === 'admin' ? role : null;
}

function requireEditor(role: EditorRole | null): role is 'editor' | 'admin' {
  return role === 'editor' || role === 'admin';
}

function sanitizeString(value: unknown, max: number): string {
  return String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
}

function containsSensitiveData(text: string): boolean {
  const direct = [
    /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i,
    /\b(?:\+49|0)[\d\s/()-]{7,}\b/,
    /\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/,
    /\b(?:herr|frau|bewohner(?:in)?|klient(?:in)?|patient(?:in)?)\s+[A-ZÄÖÜ][a-zäöüß-]{2,}/,
    /\b(?:geburtsdatum|telefonnummer|adresse|aktenzeichen|versichertennummer|bewohnernummer)\b/i,
    /\b\d{6,}\b/,
  ];
  return direct.some(pattern => pattern.test(text));
}

function sanitizeAliases(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(item => sanitizeString(item, 80)).filter(Boolean))].slice(0, 50);
}

function sanitizeSteps(value: unknown): GuideStep[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((item): GuideStep | null => {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    const text = sanitizeString(row.text, 500);
    if (!text) return null;
    const check = sanitizeString(row.check, 220);
    const stuck = sanitizeString(row.stuck, 500);
    return { text, ...(check ? { check } : {}), ...(stuck ? { stuck } : {}) };
  }).filter((item): item is GuideStep => Boolean(item));
}

function sanitizeTroubleshooting(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const entries = Object.entries(value as Record<string, unknown>)
    .slice(0, 20)
    .map(([key, raw]) => [sanitizeString(key, 80), sanitizeString(raw, 500)] as const)
    .filter(([key, val]) => key && val);
  return Object.fromEntries(entries);
}

function validateGuide(value: unknown, role: EditorRole): GuideInput {
  if (!value || typeof value !== 'object') throw new Error('guide_missing');
  const raw = value as Record<string, unknown>;
  const id = sanitizeString(raw.id, 40);
  const slug = sanitizeString(raw.slug, 100).toLowerCase();
  const title = sanitizeString(raw.title, 120);
  const status = sanitizeString(raw.status, 20);
  const aliases = sanitizeAliases(raw.aliases);
  const steps = sanitizeSteps(raw.steps);
  const troubleshooting = sanitizeTroubleshooting(raw.troubleshooting);
  const changeNote = sanitizeString(raw.changeNote, 300);
  const reviewIntervalDays = Math.min(730, Math.max(30, Number(raw.reviewIntervalDays) || 180));

  if (id && !/^[0-9a-f-]{36}$/i.test(id)) throw new Error('guide_id_invalid');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('guide_slug_invalid');
  if (title.length < 3) throw new Error('guide_title_invalid');
  if (!ALLOWED_STATUSES.has(status)) throw new Error('guide_status_invalid');
  if (role === 'editor' && !EDITOR_STATUSES.has(status)) throw new Error('guide_status_forbidden');
  if (!steps.length) throw new Error('guide_steps_missing');
  if (changeNote.length < 3) throw new Error('change_note_required');

  const safetyText = JSON.stringify({ title, aliases, steps, troubleshooting, changeNote });
  if (containsSensitiveData(safetyText)) throw new Error('possible_real_data');

  return {
    ...(id ? { id } : {}),
    slug,
    title,
    aliases,
    steps,
    troubleshooting,
    status,
    reviewIntervalDays,
    changeNote,
  };
}

async function audit(userId: string, action: string, guide: Record<string, unknown>): Promise<void> {
  const metadata = {
    status: guide.status || null,
    version: guide.version || null,
  };
  await rest('/rest/v1/dokohilf_editor_audit', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      actor_id: userId,
      action,
      guide_id: guide.id || null,
      guide_slug: guide.slug || null,
      metadata,
    }),
  }).catch(() => {});
}

async function listGuides(): Promise<unknown[]> {
  const response = await rest(
    '/rest/v1/dokohilf_editor_guides?select=id,slug,title,aliases,steps,troubleshooting,status,version,reviewed_at,reviewed_role,review_interval_days,review_due_at,approved_at,change_note,updated_at,is_overdue&order=title.asc',
  );
  if (!response.ok) throw new Error('guide_list_failed');
  return response.json();
}

async function guideHistory(guideId: string): Promise<unknown[]> {
  if (!/^[0-9a-f-]{36}$/i.test(guideId)) throw new Error('guide_id_invalid');
  const response = await rest(
    `/rest/v1/dokohilf_guide_versions?select=id,guide_id,slug,title,aliases,steps,troubleshooting,status,version,reviewed_at,reviewed_role,review_interval_days,review_due_at,change_note,changed_by,archived_at&guide_id=eq.${encodeURIComponent(guideId)}&order=version.desc,archived_at.desc&limit=50`,
  );
  if (!response.ok) throw new Error('history_failed');
  return response.json();
}

async function existingGuide(id: string): Promise<Record<string, unknown> | null> {
  const response = await rest(
    `/rest/v1/dokohilf_guides?select=id,slug,status,version&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  if (!response.ok) throw new Error('guide_lookup_failed');
  const rows = await response.json();
  return rows?.[0] || null;
}

async function saveGuide(input: GuideInput, userId: string, role: EditorRole): Promise<Record<string, unknown>> {
  const existing = input.id ? await existingGuide(input.id) : null;
  if (input.id && !existing) throw new Error('guide_not_found');
  if (existing && existing.slug !== input.slug) throw new Error('guide_slug_immutable');

  const now = new Date().toISOString();
  const reviewed = input.status === 'reviewed' || input.status === 'approved';
  const payload = {
    slug: input.slug,
    title: input.title,
    aliases: input.aliases,
    steps: input.steps,
    troubleshooting: input.troubleshooting || {},
    status: input.status,
    review_interval_days: input.reviewIntervalDays || 180,
    change_note: input.changeNote,
    ...(reviewed ? {
      reviewed_at: now,
      reviewed_by: userId,
      reviewed_role: role === 'admin' ? 'Administration' : 'Redaktion',
    } : {}),
  };

  const action = existing
    ? (input.status === 'approved' ? 'approve' : input.status === 'blocked' ? 'block' : input.status === 'reviewed' ? 'review' : 'update')
    : 'create';

  const response = await rest(
    existing
      ? `/rest/v1/dokohilf_guides?id=eq.${encodeURIComponent(String(existing.id))}`
      : '/rest/v1/dokohilf_guides',
    {
      method: existing ? 'PATCH' : 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(payload),
    },
  );
  const rows = await response.json().catch(() => []);
  if (!response.ok || !rows?.[0]) throw new Error('guide_save_failed');
  await audit(userId, action, rows[0]);
  return rows[0];
}

function errorMessage(error: unknown): { status: number; message: string } {
  const code = error instanceof Error ? error.message : 'unknown';
  const known: Record<string, [number, string]> = {
    guide_missing: [400, 'Die Anleitung fehlt.'],
    guide_id_invalid: [400, 'Die Anleitungs-ID ist ungültig.'],
    guide_slug_invalid: [400, 'Der technische Name ist ungültig.'],
    guide_slug_immutable: [400, 'Der technische Name einer bestehenden Anleitung darf nicht verändert werden.'],
    guide_title_invalid: [400, 'Der Titel ist zu kurz.'],
    guide_status_invalid: [400, 'Der Status ist ungültig.'],
    guide_status_forbidden: [403, 'Dieser Status darf nur durch die Administration gesetzt werden.'],
    guide_steps_missing: [400, 'Mindestens ein Schritt ist erforderlich.'],
    change_note_required: [400, 'Eine kurze Änderungsbegründung ist erforderlich.'],
    possible_real_data: [422, 'Mögliche Echtdaten erkannt. Verwende ausschließlich Fantasie- und Platzhalterdaten.'],
    guide_not_found: [404, 'Die Anleitung wurde nicht gefunden.'],
  };
  const [status, message] = known[code] || [500, 'Die Redaktionsfunktion konnte die Anfrage gerade nicht verarbeiten.'];
  return { status, message };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (origin && !ALLOWED_ORIGINS.has(origin)) return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  if (isRateLimited(req)) return jsonResponse(origin, 429, { error: 'Zu viele Anfragen. Bitte kurz warten.' });

  const userId = decodeJwtSubject(req.headers.get('authorization'));
  if (!userId) return jsonResponse(origin, 401, { error: 'Anmeldung erforderlich.' });

  let role: EditorRole | null;
  try {
    role = await getRole(userId);
  } catch {
    return jsonResponse(origin, 503, { error: 'Die Rollenprüfung ist gerade nicht möglich.' });
  }
  if (!role) return jsonResponse(origin, 403, { error: 'Dieses Konto besitzt keine aktive DokoHilf-Rolle.' });

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || '';

  try {
    if (req.method === 'GET' && action === 'profile') {
      return jsonResponse(origin, 200, { role, canEdit: requireEditor(role), canApprove: role === 'admin' });
    }

    if (!requireEditor(role)) {
      return jsonResponse(origin, 403, { error: 'Für die Redaktion ist die Rolle Redaktion oder Administration erforderlich.' });
    }

    if (req.method === 'GET' && action === 'list') {
      return jsonResponse(origin, 200, { guides: await listGuides(), role, canApprove: role === 'admin' });
    }

    if (req.method === 'GET' && action === 'history') {
      const guideId = url.searchParams.get('guideId') || '';
      return jsonResponse(origin, 200, { history: await guideHistory(guideId) });
    }

    if (req.method === 'POST' && action === 'save') {
      const raw = await req.text();
      if (!raw || raw.length > MAX_BODY_CHARS) return jsonResponse(origin, 400, { error: 'Die Anfrage ist leer oder zu groß.' });
      const parsed = JSON.parse(raw);
      const guide = validateGuide(parsed?.guide, role);
      return jsonResponse(origin, 200, { guide: await saveGuide(guide, userId, role) });
    }

    return jsonResponse(origin, 404, { error: 'Unbekannte Redaktionsaktion.' });
  } catch (error) {
    const mapped = errorMessage(error);
    return jsonResponse(origin, mapped.status, { error: mapped.message });
  }
});
