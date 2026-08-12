-- DokoHilf v43: anonymous structured feedback only.
-- No free text, names, chat content, device identifiers, IPs or user profiles are stored.

create table public.dokohilf_feedback (
  id uuid primary key default gen_random_uuid(),
  report_code text not null unique default ('DH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  created_at timestamptz not null default now(),
  issue_type text not null check (issue_type in (
    'missing_information',
    'instruction_unclear',
    'cannot_find',
    'app_unresponsive',
    'display_problem',
    'voice_problem',
    'other_technical'
  )),
  impact text not null check (impact in ('blocking', 'annoying', 'note')),
  context_kind text not null check (context_kind in ('start', 'chat', 'voice', 'library', 'guide', 'unknown')),
  guide_slug text check (guide_slug is null or guide_slug ~ '^[a-z0-9-]{1,80}$'),
  guide_step smallint check (guide_step is null or guide_step between 1 and 100),
  guide_step_count smallint check (guide_step_count is null or guide_step_count between 1 and 100),
  build_id text not null check (build_id ~ '^[0-9]{8}-[0-9]{2}$'),
  app_mode text not null check (app_mode in ('start', 'chat', 'voice', 'unknown')),
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved', 'dismissed')),
  resolved_at timestamptz,
  constraint dokohilf_feedback_step_pair check (
    (guide_step is null and guide_step_count is null)
    or (guide_step is not null and guide_step_count is not null and guide_step <= guide_step_count)
  ),
  constraint dokohilf_feedback_resolved_pair check (
    (status in ('new', 'reviewing') and resolved_at is null)
    or (status in ('resolved', 'dismissed'))
  )
);

comment on table public.dokohilf_feedback is
  'Private anonymous DokoHilf product feedback. Structured technical fields only; no free text or person data.';

alter table public.dokohilf_feedback enable row level security;

revoke all on table public.dokohilf_feedback from public, anon, authenticated;
grant all on table public.dokohilf_feedback to service_role;

create policy "deny client feedback access"
on public.dokohilf_feedback
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create function public.dokohilf_feedback_cleanup_v43()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.dokohilf_feedback
  where created_at < now() - interval '90 days';
  return new;
end;
$$;

revoke all on function public.dokohilf_feedback_cleanup_v43() from public, anon, authenticated;
grant execute on function public.dokohilf_feedback_cleanup_v43() to service_role;

create trigger dokohilf_feedback_cleanup_v43_trigger
after insert on public.dokohilf_feedback
for each statement
execute function public.dokohilf_feedback_cleanup_v43();

create index dokohilf_feedback_created_at_idx
  on public.dokohilf_feedback (created_at desc);

create index dokohilf_feedback_status_idx
  on public.dokohilf_feedback (status, created_at desc);
