import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Supabase server environment is incomplete");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
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
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
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

  if (!buildId || !/^[A-Za-z0-9._-]{1,64}$/.test(buildId)) throw new Error("INVALID_CONTEXT");
  if (guideSlug && !/^[A-Za-z0-9ÄÖÜäöüß._/-]{1,120}$/.test(guideSlug)) throw new Error("INVALID_CONTEXT");

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

  let raw = "";
  try {
    raw = await req.text();
  } catch {
    return json(origin, 400, { error: "INVALID_BODY" });
  }
  if (new TextEncoder().encode(raw).byteLength > 4096) return json(origin, 413, { error: "REQUEST_TOO_LARGE" });

  let input: FeedbackInput;
  try {
    input = JSON.parse(raw || "{}");
  } catch {
    return json(origin, 400, { error: "INVALID_JSON" });
  }

  // Honeypot only; the value is intentionally never stored.
  if (cleanString(input.website, 80)) return json(origin, 400, { error: "INVALID_SUBMISSION" });

  const category = cleanString(input.category, 40);
  const description = cleanString(input.description, 700);
  if (!ALLOWED_CATEGORIES.has(category)) return json(origin, 400, { error: "INVALID_CATEGORY" });
  if (description.length < 5 || description.length > 700) return json(origin, 400, { error: "INVALID_DESCRIPTION" });

  let context: ReturnType<typeof cleanContext>;
  try {
    context = cleanContext(input);
  } catch {
    return json(origin, 400, { error: "INVALID_CONTEXT" });
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = crypto.randomUUID();
    const reportNumber = reportNumberFromId(id);
    const { data, error } = await admin.rpc("dokohilf_store_feedback", {
      p_id: id,
      p_report_number: reportNumber,
      p_category: category,
      p_description: description,
      p_include_context: context.includeContext,
      p_build_id: context.buildId,
      p_guide_slug: context.guideSlug,
      p_guide_step: context.guideStep,
    });

    if (!error && data === reportNumber) return json(origin, 201, { ok: true, reportNumber });
    if (error?.message?.includes("TOO_MANY_REPORTS")) return json(origin, 429, { error: "TOO_MANY_REPORTS" });
    if (error?.code === "23505" && attempt < 2) continue;

    console.error("DokoHilf feedback store failed", error?.code || "unknown");
    return json(origin, 500, { error: "STORE_FAILED" });
  }

  return json(origin, 500, { error: "STORE_FAILED" });
});
