create schema if not exists private;

revoke all on schema private from public;
revoke all on schema private from anon, authenticated;

create table if not exists private.dokohilf_feedback_reports (
  id uuid primary key,
  report_number text not null unique,
  category text not null,
  description text not null,
  include_context boolean not null default false,
  build_id text,
  guide_slug text,
  guide_step integer,
  created_at timestamptz not null default now(),
  constraint dokohilf_feedback_report_number_format check (report_number ~ '^DH-[A-F0-9]{12}$'),
  constraint dokohilf_feedback_category_allowed check (
    category in (
      'fehler',
      'fehlende-information',
      'falsche-information',
      'bedienung-darstellung',
      'sonstiger-hinweis'
    )
  ),
  constraint dokohilf_feedback_description_length check (char_length(description) between 5 and 700),
  constraint dokohilf_feedback_build_id_length check (build_id is null or char_length(build_id) between 1 and 64),
  constraint dokohilf_feedback_guide_slug_length check (guide_slug is null or char_length(guide_slug) between 1 and 120),
  constraint dokohilf_feedback_guide_step_range check (guide_step is null or guide_step between 1 and 999),
  constraint dokohilf_feedback_context_consistent check (
    (include_context = true and build_id is not null)
    or
    (include_context = false and build_id is null and guide_slug is null and guide_step is null)
  )
);

alter table private.dokohilf_feedback_reports enable row level security;
revoke all on table private.dokohilf_feedback_reports from public, anon, authenticated;

create index if not exists dokohilf_feedback_created_at_idx
  on private.dokohilf_feedback_reports (created_at desc);

comment on table private.dokohilf_feedback_reports is
  'Private DokoHilf test-phase feedback. No IP, device, cookie, session, user identifier or chat transcript columns.';
