-- Follow-up for projects where the account-retirement migration was applied
-- before its trigger functions moved out of the exposed public schema.

lock table auth.users in share row exclusive mode;

do $$
begin
  if exists (select 1 from auth.users) then
    raise exception 'Function relocation requires auth.users to stay empty.';
  end if;
end
$$;

create schema if not exists dokohilf_internal;
revoke all on schema dokohilf_internal
  from public, anon, authenticated, service_role;
grant usage on schema dokohilf_internal to supabase_auth_admin;

comment on schema dokohilf_internal is
  'Nicht exponierte technische DokoHilf-Funktionen; keine Konten-, Rollen- oder Personendaten.';

drop trigger if exists dokohilf_block_all_user_creation on auth.users;
drop trigger if exists dokohilf_guides_archive_version
  on public.dokohilf_guides;

create or replace function dokohilf_internal.block_auth_user_insert()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'DokoHilf is permanently account-free.';
end
$$;

revoke all on function dokohilf_internal.block_auth_user_insert()
  from public, anon, authenticated, service_role, supabase_auth_admin;
grant execute on function dokohilf_internal.block_auth_user_insert()
  to supabase_auth_admin;

create or replace function dokohilf_internal.archive_guide_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.dokohilf_guide_versions (
    guide_id, slug, title, aliases, steps, troubleshooting, status, version,
    reviewed_at, reviewed_role, review_interval_days, review_due_at,
    change_note
  ) values (
    old.id, old.slug, old.title, old.aliases, old.steps, old.troubleshooting,
    old.status, old.version, old.reviewed_at, old.reviewed_role,
    old.review_interval_days, old.review_due_at, old.change_note
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  if row(
    new.slug, new.title, new.aliases, new.steps, new.troubleshooting,
    new.status, new.review_interval_days
  ) is distinct from row(
    old.slug, old.title, old.aliases, old.steps, old.troubleshooting,
    old.status, old.review_interval_days
  ) then
    new.version := old.version + 1;
  end if;

  new.updated_at := now();

  if new.reviewed_at is distinct from old.reviewed_at
     or new.review_interval_days is distinct from old.review_interval_days then
    new.review_due_at := case
      when new.reviewed_at is null then null
      else new.reviewed_at + make_interval(days => new.review_interval_days)
    end;
  end if;

  if new.status = 'approved' and old.status is distinct from 'approved' then
    new.approved_at := now();
  elsif new.status is distinct from 'approved' then
    new.approved_at := null;
  end if;

  return new;
end
$$;

revoke all on function dokohilf_internal.archive_guide_version()
  from public, anon, authenticated, service_role, supabase_auth_admin;

create trigger dokohilf_block_all_user_creation
before insert on auth.users
for each row execute function dokohilf_internal.block_auth_user_insert();

create trigger dokohilf_guides_archive_version
before update or delete on public.dokohilf_guides
for each row execute function dokohilf_internal.archive_guide_version();

drop function if exists public.dokohilf_block_auth_user_insert();
drop function if exists public.dokohilf_archive_guide_version();

comment on function dokohilf_internal.block_auth_user_insert() is
  'Permanent server-side invariant: DokoHilf never creates application accounts.';
comment on function dokohilf_internal.archive_guide_version() is
  'Personenfreier technischer Versionsverlauf allgemeiner DokoHilf-Guides.';
