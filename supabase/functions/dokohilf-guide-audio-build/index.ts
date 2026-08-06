import { createClient } from 'jsr:@supabase/supabase-js@2';

const BUILD_ID = '20260806-27';
const BUCKET = 'dokohilf-guide-audio';
const CATALOG_URL = 'https://raw.githubusercontent.com/ys2mm422yb-max/DokoHilf/b5e693f712a2519aaa6d3a703a3685496d4127b8/assets/guide-audio-catalog.json';
const TTS_ENDPOINT = 'https://efifbuqctylsujiauabg.supabase.co/functions/v1/dokohilf-tts';
const MAX_BATCH = 6;
const REQUEST_GAP_MS = 3200;

type CatalogEntry = { file: string; text: string };
type BuildResult = {
  index: number;
  file: string;
  status: 'created' | 'existing' | 'failed';
  error?: string;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function constantTimeEqual(left: string, right: string): boolean {
  if (!left || !right || left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function stripExerciseNotice(value: string): string {
  return value
    .replace(/\s*In Übungen ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*In Übungen nur Fantasiewerte verwenden\.?/gi, '')
    .replace(/\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?/gi, '')
    .replace(/\s*Im öffentlichen Test nur vollständig erfundene Personen verwenden\.?/gi, '')
    .replace(/\s*Verwende in Übungen ausschließlich Fantasiedaten\.?/gi, '')
    .replace(/\s*Verwende dabei nur Fantasiedaten\.?/gi, '')
    .replace(/\s+([,.!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function optimizeSpokenText(value: string): string {
  const raw = stripExerciseNotice(String(value || '').replace(/\*\*/g, '').trim());
  const first = (raw.split(/\n\s*\n/)[0] || raw).replace(/\s+/g, ' ').trim();
  if (!first || first.length <= 185) return first;
  const sentences = first.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(part => part.trim()).filter(Boolean) || [first];
  const short = sentences.slice(0, 2).join(' ').trim();
  if (short.length <= 220) return short;
  const clipped = short.slice(0, 215).replace(/\s+\S*$/, '').trim();
  return clipped ? `${clipped}.` : short.slice(0, 215);
}

function normalizeKey(value: string): string {
  return String(value || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[„“”"']/g, '')
    .replace(/[^a-z0-9äöü\s./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isWave(bytes: Uint8Array): boolean {
  return bytes.length > 44
    && bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70
    && bytes[8] === 87 && bytes[9] === 65 && bytes[10] === 86 && bytes[11] === 69;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

async function ensureBucket(client: ReturnType<typeof createClient>): Promise<void> {
  const { data, error } = await client.storage.getBucket(BUCKET);
  if (data && !error) return;
  const created = await client.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['audio/wav'],
  });
  if (created.error && !/already exists/i.test(created.error.message)) {
    throw new Error(`bucket_create_failed:${created.error.message}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'GET') return json({ error: 'GET only' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRole) return json({ error: 'missing server configuration' }, 503);
  const client = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } });

  const control = await client
    .from('dokohilf_internal_build_control')
    .select('build_token,enabled')
    .eq('id', true)
    .maybeSingle();
  if (control.error || !control.data?.build_token || control.data.enabled !== true) {
    return json({ error: 'builder disabled' }, 410);
  }
  const suppliedToken = req.headers.get('x-dokohilf-build-token') || '';
  if (!constantTimeEqual(suppliedToken, control.data.build_token)) {
    return json({ error: 'forbidden' }, 403);
  }

  const url = new URL(req.url);
  const start = Number(url.searchParams.get('start') || '0');
  const count = Math.min(MAX_BATCH, Math.max(1, Number(url.searchParams.get('count') || '1')));
  const force = url.searchParams.get('force') === '1';
  if (!Number.isInteger(start) || start < 0 || start > 92) return json({ error: 'invalid start' }, 400);

  await ensureBucket(client);
  const catalogResponse = await fetch(CATALOG_URL, { cache: 'no-store', signal: AbortSignal.timeout(15_000) });
  if (!catalogResponse.ok) return json({ error: `catalog_${catalogResponse.status}` }, 502);
  const catalog = await catalogResponse.json();
  const entries = Array.isArray(catalog?.entries) ? catalog.entries as CatalogEntry[] : [];
  if (entries.length !== 93) return json({ error: `catalog_count_${entries.length}` }, 502);

  const selected = entries.slice(start, Math.min(entries.length, start + count));
  const results: BuildResult[] = [];

  for (let offset = 0; offset < selected.length; offset += 1) {
    const index = start + offset;
    const entry = selected[offset];
    const spokenText = optimizeSpokenText(entry.text);
    const textKey = normalizeKey(spokenText);
    const fileName = `${String(index).padStart(3, '0')}.wav`;
    const storagePath = `${BUILD_ID}/${fileName}`;

    if (!force) {
      const existing = await client
        .from('dokohilf_static_guide_audio')
        .select('index_no')
        .eq('index_no', index)
        .eq('build_id', BUILD_ID)
        .maybeSingle();
      if (existing.data && !existing.error) {
        results.push({ index, file: storagePath, status: 'existing' });
        continue;
      }
    }

    try {
      const response = await fetch(TTS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Origin: 'https://ys2mm422yb-max.github.io' },
        body: JSON.stringify({ text: spokenText }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) {
        const message = await response.text().catch(() => '');
        results.push({ index, file: storagePath, status: 'failed', error: `tts_${response.status}:${message.slice(0, 120)}` });
        if (response.status === 429) break;
        continue;
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      if (!isWave(bytes)) throw new Error('invalid_wav');
      if (response.headers.get('x-dokohilf-voice') !== 'Gacrux') throw new Error('unexpected_voice');

      const upload = await client.storage.from(BUCKET).upload(storagePath, bytes, {
        contentType: 'audio/wav',
        cacheControl: '31536000',
        upsert: true,
      });
      if (upload.error) throw new Error(`upload:${upload.error.message}`);

      const registry = await client.from('dokohilf_static_guide_audio').upsert({
        index_no: index,
        build_id: BUILD_ID,
        file_path: storagePath,
        text_key: textKey,
        spoken_text: spokenText,
        byte_length: bytes.length,
        sha256: await sha256(bytes),
        voice: 'Gacrux',
        model: response.headers.get('x-dokohilf-tts-model') || 'unknown',
        api_path: response.headers.get('x-dokohilf-tts-api') || 'unknown',
        parser: response.headers.get('x-dokohilf-tts-parser') || 'unknown',
        style: response.headers.get('x-dokohilf-voice-style') || 'unknown',
        built_at: new Date().toISOString(),
      }, { onConflict: 'index_no' });
      if (registry.error) throw new Error(`registry:${registry.error.message}`);
      results.push({ index, file: storagePath, status: 'created' });
    } catch (error) {
      results.push({ index, file: storagePath, status: 'failed', error: error instanceof Error ? error.message : String(error) });
    }

    if (offset < selected.length - 1) await sleep(REQUEST_GAP_MS);
  }

  const countResult = await client.from('dokohilf_static_guide_audio').select('*', { count: 'exact', head: true }).eq('build_id', BUILD_ID);
  const storedCount = countResult.count || 0;
  if (storedCount === 93) {
    await client.from('dokohilf_internal_build_control').update({ enabled: false, updated_at: new Date().toISOString() }).eq('id', true);
  }
  const failed = results.filter(result => result.status === 'failed').length;
  return json({
    buildId: BUILD_ID,
    start,
    requested: selected.length,
    results,
    storedCount,
    complete: storedCount === 93,
  }, failed ? 207 : 200);
});
