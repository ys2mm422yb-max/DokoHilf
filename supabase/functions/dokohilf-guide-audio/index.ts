import { createClient } from 'jsr:@supabase/supabase-js@2';

const BUILD_ID = '20260806-27';
const BUCKET = 'dokohilf-guide-audio';
const PUBLIC_ORIGIN = 'https://ys2mm422yb-max.github.io';

function cors(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin === PUBLIC_ORIGIN ? origin : PUBLIC_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Expose-Headers': 'Content-Length, ETag, X-DokoHilf-Audio-Index, X-DokoHilf-Audio-SHA256',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
  };
}

function json(origin: string | null, body: unknown, status = 200, cache = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': cache },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  if (!['GET', 'HEAD'].includes(req.method)) return json(origin, { error: 'GET only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRole) return json(origin, { error: 'missing server configuration' }, 503);
  const client = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });
  const url = new URL(req.url);

  if (url.searchParams.get('manifest') === '1') {
    const result = await client
      .from('dokohilf_static_guide_audio')
      .select('index_no,text_key,spoken_text,file_path,byte_length,sha256,voice,model,api_path,parser,style,built_at')
      .eq('build_id', BUILD_ID)
      .order('index_no');
    if (result.error) return json(origin, { error: 'manifest_unavailable' }, 502);
    const entries = (result.data || []).map(row => ({
      index: row.index_no,
      key: row.text_key,
      text: row.spoken_text,
      file: `${supabaseUrl}/functions/v1/dokohilf-guide-audio?index=${String(row.index_no).padStart(3, '0')}&build=${BUILD_ID}`,
      bytes: row.byte_length,
      sha256: row.sha256,
      voice: row.voice,
      model: row.model,
      api: row.api_path,
      parser: row.parser,
      style: row.style,
      builtAt: row.built_at,
    }));
    return json(origin, {
      schemaVersion: 2,
      buildId: BUILD_ID,
      source: 'supabase-private-static-guide-audio',
      voice: 'Gacrux',
      entryCount: entries.length,
      complete: entries.length === 93,
      entries,
    }, 200, 'public, max-age=300, stale-while-revalidate=3600');
  }

  const rawIndex = url.searchParams.get('index') || '';
  if (!/^\d{1,3}$/.test(rawIndex)) return json(origin, { error: 'invalid index' }, 400);
  const index = Number(rawIndex);
  if (!Number.isInteger(index) || index < 0 || index > 92) return json(origin, { error: 'invalid index' }, 400);

  const registry = await client
    .from('dokohilf_static_guide_audio')
    .select('file_path,byte_length,sha256')
    .eq('build_id', BUILD_ID)
    .eq('index_no', index)
    .maybeSingle();
  if (registry.error || !registry.data) return json(origin, { error: 'audio not built' }, 404);

  if (req.method === 'HEAD') {
    return new Response(null, {
      status: 200,
      headers: {
        ...cors(origin),
        'Content-Type': 'audio/wav',
        'Content-Length': String(registry.data.byte_length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: `"${registry.data.sha256}"`,
        'X-DokoHilf-Audio-Index': String(index),
        'X-DokoHilf-Audio-SHA256': registry.data.sha256,
      },
    });
  }

  const object = await client.storage.from(BUCKET).download(registry.data.file_path);
  if (object.error || !object.data) return json(origin, { error: 'audio object unavailable' }, 502);
  return new Response(object.data, {
    status: 200,
    headers: {
      ...cors(origin),
      'Content-Type': 'audio/wav',
      'Content-Length': String(registry.data.byte_length),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ETag: `"${registry.data.sha256}"`,
      'X-DokoHilf-Audio-Index': String(index),
      'X-DokoHilf-Audio-SHA256': registry.data.sha256,
    },
  });
});
