-- Internal, resumable builder control. The generated token never enters GitHub or the browser.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.dokohilf_internal_build_control (
  id boolean primary key default true check (id),
  build_token text not null default encode(extensions.gen_random_bytes(32), 'hex'),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.dokohilf_internal_build_control (id)
values (true)
on conflict (id) do nothing;

alter table public.dokohilf_internal_build_control enable row level security;
revoke all on table public.dokohilf_internal_build_control from public, anon, authenticated;
grant all on table public.dokohilf_internal_build_control to service_role, postgres;

create or replace function public.dokohilf_build_next_static_guide_audio()
returns bigint
language plpgsql
security definer
set search_path = pg_catalog, public, net, cron
as $$
declare
  next_index integer;
  request_id bigint;
  internal_token text;
  builder_enabled boolean;
begin
  select build_token, enabled
  into internal_token, builder_enabled
  from public.dokohilf_internal_build_control
  where id = true;

  if internal_token is null or builder_enabled is distinct from true then
    return null;
  end if;

  select candidate.index_no
  into next_index
  from generate_series(0, 92) as candidate(index_no)
  left join public.dokohilf_static_guide_audio audio
    on audio.index_no = candidate.index_no
   and audio.build_id = '20260806-27'
  where audio.index_no is null
  order by candidate.index_no
  limit 1;

  if next_index is null then
    update public.dokohilf_internal_build_control
    set enabled = false, updated_at = now()
    where id = true;
    perform cron.unschedule('dokohilf-static-guide-audio-v27');
    return null;
  end if;

  select net.http_get(
    url := concat(
      'https://efifbuqctylsujiauabg.supabase.co',
      '/functions/v1/',
      'dokohilf-guide-audio-build',
      '?start=', next_index::text,
      '&count=1'
    ),
    params := '{}'::jsonb,
    headers := jsonb_build_object('x-dokohilf-build-token', internal_token),
    timeout_milliseconds := 45000
  ) into request_id;

  return request_id;
end;
$$;

revoke all on function public.dokohilf_build_next_static_guide_audio() from public, anon, authenticated;
grant execute on function public.dokohilf_build_next_static_guide_audio() to service_role, postgres;

select cron.schedule(
  'dokohilf-static-guide-audio-v27',
  '0 * * * *',
  'select public.dokohilf_build_next_static_guide_audio();'
);
