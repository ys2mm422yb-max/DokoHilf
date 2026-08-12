import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.7";

const ALLOWED_ORIGINS = new Set([
  "https://ys2mm422yb-max.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const ALLOWED_CATEGORIES = new Set([
  "fehler",
  "fehlende-information",
  "falsche-information",
  "bedienung-darstellung",
  "sonstiger-hinweis",
]);

const DATABASE_URL = Deno.env.get("SUPABASE_DB_URL");
if (!DATABASE_URL) throw new Error("SUPABASE_DB_URL is not configured");

const sql = postgres(DATABASE_URL, {
  max: 1,
  prepare: false,
  idle_timeout: 20,
  connect_timeout: 10,
});

type FeedbackInput = {
  category?: unknown;
  description?: unknown;
  includeContext?: unknown;
  context?: {
    buildId?: unknown;
    guideSlug?: unknown;
    guideStep?: unknown;
  } | null;
  website?: unknown;
};

function corsHeaders(origin: string | null) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "content-type");
    headers.set("Access-Control-Max-Age", "600");
  }
  return headers;
}

function json(origin: string | null, status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function cleanString(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\r\n?/g, "\n").slice(0, max);
}

function cleanContext(input: FeedbackInput) {
  const includeContext = input.includeContext === true;
  if (!includeContext) {
    return { includeContext: false, buildId: null, guideSlug: null, guideStep: null };
  }

  const buildId = cleanString(input.context?.buildId, 64);
  const guideSlug = cleanString(input.context?.guideSlug, 120) || null;
  const rawStep = Number(input.context?.guideStep);
  const guideStep = Number.isInteger(rawStep) && rawStep >= 1 && rawStep <= 999 ? rawStep : null;

  if (!buildId || !/^[A-Za-z0-9._-]{1,64}$/.test(buildId)) {
    throw new Error("INVALID_CONTEXT");
  }
  if (guideSlug && !/^[A-Za-z0-9ÄÖÜäöüß._/-]{1,120}$/.test(guideSlug)) {
    throw new Error("INVALID_CONTEXT");
  }

  return { includeContext: true, buildId, guideSlug, guideStep };
}

function reportNumberFromId(id: string) {
  return `DH-${id.replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (!origin || !ALLOWED_ORIGINS.has(origin)) return new Response(null, { status: 403 });
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") return json(origin, 405, { error: "METHOD_NOT_ALLOWED" });
  if (!origin || !ALLOWED_ORIGINS.has(origin)) return json(origin, 403, { error: "ORIGIN_NOT_ALLOWED" });

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > 4096) {
    return json(origin, 413, { error: "REQUEST_TOO_LARGE" });
  }

  let input: FeedbackInput;
  try {
    input = await req.json();
  } catch {
    return json(origin, 400, { error: "INVALID_JSON" });
  }

  // Simple honeypot. It is intentionally never stored.
  if (cleanString(input.website, 80)) return json(origin, 400, { error: "INVALID_SUBMISSION" });

  const category = cleanString(input.category, 40);
  const description = cleanString(input.description, 700);
  if (!ALLOWED_CATEGORIES.has(category)) return json(origin, 400, { error: "INVALID_CATEGORY" });
  if (description.length < 5 || description.length > 700) {
    return json(origin, 400, { error: "INVALID_DESCRIPTION" });
  }

  let context: ReturnType<typeof cleanContext>;
  try {
    context = cleanContext(input);
  } catch {
    return json(origin, 400, { error: "INVALID_CONTEXT" });
  }

  try {
    // Identifier-free global abuse guard: no IP, device, cookie, session or user key is read or stored.
    const recent = await sql<{ count: number }[]>`
      select count(*)::int as count
      from private.dokohilf_feedback_reports
      where created_at >= now() - interval '1 minute'
    `;
    if ((recent[0]?.count ?? 0) >= 30) {
      return json(origin, 429, { error: "TOO_MANY_REPORTS" });
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const id = crypto.randomUUID();
      const reportNumber = reportNumberFromId(id);
      try {
        await sql`
          insert into private.dokohilf_feedback_reports (
            id,
            report_number,
            category,
            description,
            include_context,
            build_id,
            guide_slug,
            guide_step
          ) values (
            ${id}::uuid,
            ${reportNumber},
            ${category},
            ${description},
            ${context.includeContext},
            ${context.buildId},
            ${context.guideSlug},
            ${context.guideStep}
          )
        `;
        return json(origin, 201, { ok: true, reportNumber });
      } catch (error) {
        if ((error as { code?: string })?.code === "23505" && attempt < 2) continue;
        throw error;
      }
    }
  } catch (error) {
    console.error("DokoHilf feedback insert failed", error instanceof Error ? error.message : "unknown");
    return json(origin, 500, { error: "STORE_FAILED" });
  }

  return json(origin, 500, { error: "STORE_FAILED" });
});
