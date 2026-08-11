create table public.dokohilf_usage_counters (
  bucket text primary key,
  page_views bigint not null default 0 check (page_views >= 0),
  constraint dokohilf_usage_counters_bucket_check
    check (bucket = 'all' or bucket ~ '^\d{4}-\d{2}-\d{2}$')
);

comment on table public.dokohilf_usage_counters is
  'Anonymous aggregate DokoHilf page-view counters only. No IP, device, session, referrer, user-agent, account, person, case, health or conversation data.';
comment on column public.dokohilf_usage_counters.bucket is
  'Aggregate bucket: all or Europe/Berlin calendar date YYYY-MM-DD.';
comment on column public.dokohilf_usage_counters.page_views is
  'Aggregate number of page loads in this bucket.';

alter table public.dokohilf_usage_counters enable row level security;
revoke all on table public.dokohilf_usage_counters from public, anon, authenticated;
grant select, insert, update, delete on table public.dokohilf_usage_counters to service_role;

create or replace function public.dokohilf_increment_page_view()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  berlin_today date := timezone('Europe/Berlin', now())::date;
  day_bucket text := to_char(berlin_today, 'YYYY-MM-DD');
  oldest_kept_bucket text := to_char(berlin_today - 399, 'YYYY-MM-DD');
begin
  insert into public.dokohilf_usage_counters (bucket, page_views)
  values ('all', 1)
  on conflict (bucket) do update
    set page_views = public.dokohilf_usage_counters.page_views + 1;

  insert into public.dokohilf_usage_counters (bucket, page_views)
  values (day_bucket, 1)
  on conflict (bucket) do update
    set page_views = public.dokohilf_usage_counters.page_views + 1;

  delete from public.dokohilf_usage_counters
  where bucket <> 'all'
    and bucket < oldest_kept_bucket;
end;
$$;

comment on function public.dokohilf_increment_page_view() is
  'Atomically increments only anonymous aggregate DokoHilf page-view counters and removes daily buckets older than 400 calendar days; callable only with service_role.';
revoke all on function public.dokohilf_increment_page_view() from public, anon, authenticated;
grant execute on function public.dokohilf_increment_page_view() to service_role;

create or replace view public.dokohilf_usage_summary
with (security_invoker = true)
as
select
  coalesce((select page_views from public.dokohilf_usage_counters where bucket = 'all'), 0)::bigint as total_views,
  coalesce((select page_views from public.dokohilf_usage_counters where bucket = to_char(timezone('Europe/Berlin', now()), 'YYYY-MM-DD')), 0)::bigint as today_views,
  coalesce(sum(page_views) filter (
    where bucket <> 'all'
      and bucket >= to_char((timezone('Europe/Berlin', now())::date - 6), 'YYYY-MM-DD')
  ), 0)::bigint as last_7_days_views,
  coalesce(sum(page_views) filter (
    where bucket <> 'all'
      and bucket >= to_char((timezone('Europe/Berlin', now())::date - 29), 'YYYY-MM-DD')
  ), 0)::bigint as last_30_days_views
from public.dokohilf_usage_counters;

comment on view public.dokohilf_usage_summary is
  'Private aggregate DokoHilf usage summary: today, last 7 days, last 30 days and all-time page views.';
revoke all on table public.dokohilf_usage_summary from public, anon, authenticated;
grant select on table public.dokohilf_usage_summary to service_role;