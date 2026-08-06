-- Private registry for general, approved DokoHilf guide audio only.
-- Never store user voices, dictation, names, case details, health data or conversations here.

create table if not exists public.dokohilf_static_guide_audio (
  index_no smallint primary key check (index_no between 0 and 92),
  build_id text not null check (build_id = '20260806-27'),
  file_path text not null unique,
  text_key text not null unique,
  spoken_text text not null,
  byte_length integer not null check (byte_length > 44),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  voice text not null check (voice = 'Gacrux'),
  model text not null,
  api_path text not null,
  parser text not null,
  style text not null,
  built_at timestamptz not null default now()
);

alter table public.dokohilf_static_guide_audio enable row level security;
revoke all on table public.dokohilf_static_guide_audio from public, anon, authenticated;
grant all on table public.dokohilf_static_guide_audio to service_role, postgres;

comment on table public.dokohilf_static_guide_audio is
  'Registry only for general approved DokoHilf guide audio. No user, resident, case, health or conversation data.';
