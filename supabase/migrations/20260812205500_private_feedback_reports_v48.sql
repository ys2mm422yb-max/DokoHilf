-- DokoHilf v48: private, account-free feedback reports.
-- Public clients never receive direct table access. Inserts happen only through
-- the dokohilf-feedback Edge Function using the service role.

create table if not exists public.dokohilf_feedback_reports (
  id uuid primary key default gen_random_uuid(),
  report_number text not null unique,
  category text not null check (category in (
    'fehler',
    'fehlende_information',
    'unklare_anleitung',
    'sonstiger_hinweis'
  )),
  description text not null check (char_length(description) between 3 and 1500),
  context_included boolean not null default false,
  build_id text null check (build_id is null or char_length(build_id) between 1 and 64),
  guide_slug text null check (guide_slug is null or char_length(guide_slug) between 1 and 120),
  guide_step integer null check (guide_step is null or guide_step between 1 and 200),
  created_at timestamptz not null default now(),
  constraint dokohilf_feedback_context_consistent check (
    context_included
    or (build_id is null and guide_slug is null and guide_step is null)
  )
);

alter table public.dokohilf_feedback_reports enable row level security;
alter table public.dokohilf_feedback_reports force row level security;

revoke all on table public.dokohilf_feedback_reports from public;
revoke all on table public.dokohilf_feedback_reports from anon;
revoke all on table public.dokohilf_feedback_reports from authenticated;

grant insert, select on table public.dokohilf_feedback_reports to service_role;

comment on table public.dokohilf_feedback_reports is
  'Private DokoHilf test-phase feedback. No chat, IP, device, cookie, session or user identifiers are stored.';
comment on column public.dokohilf_feedback_reports.description is
  'User-entered short feedback text. UI warns not to enter names, resident/client or health data.';
