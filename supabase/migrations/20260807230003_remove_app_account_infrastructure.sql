-- DokoHilf is permanently account-free. Preserve general guide content and its
-- technical version history, but remove every application-account dependency.

-- Keep account creation from racing the empty-state assertions below. The
-- migration installs a permanent BEFORE INSERT blocker before releasing this
-- lock.
lock table auth.users in share row exclusive mode;

do $$
begin
  if exists (select 1 from auth.users) then
    raise exception 'Account retirement requires auth.users to stay empty.';
  end if;

  if exists (select 1 from public.dokohilf_user_roles) then
    raise exception 'Account retirement requires dokohilf_user_roles to stay empty.';
  end if;

  if exists (select 1 from public.dokohilf_editor_audit) then
    raise exception 'Account retirement requires dokohilf_editor_audit to stay empty.';
  end if;

  if exists (
    select 1
    from public.dokohilf_guides
    where reviewed_by is not null or approved_by is not null
  ) then
    raise exception 'Account retirement found guide rows with user references.';
  end if;

  if exists (
    select 1
    from public.dokohilf_guide_versions
    where changed_by is not null
  ) then
    raise exception 'Account retirement found guide versions with user references.';
  end if;
end
$$;

create or replace function public.dokohilf_block_auth_user_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception using
    errcode = '42501',
    message = 'DokoHilf is permanently account-free.';
end
$$;

revoke all on function public.dokohilf_block_auth_user_insert()
  from public, anon, authenticated, service_role, supabase_auth_admin;

drop trigger if exists dokohilf_block_all_user_creation on auth.users;
create trigger dokohilf_block_all_user_creation
before insert on auth.users
for each row execute function public.dokohilf_block_auth_user_insert();

comment on function public.dokohilf_block_auth_user_insert() is
  'Permanent server-side invariant: DokoHilf never creates application accounts.';

drop policy if exists dokohilf_roles_select_authorized
  on public.dokohilf_user_roles;
drop policy if exists dokohilf_guides_select_editor
  on public.dokohilf_guides;
drop policy if exists dokohilf_guides_insert_editor
  on public.dokohilf_guides;
drop policy if exists dokohilf_guides_update_editor
  on public.dokohilf_guides;
drop policy if exists dokohilf_guides_delete_admin
  on public.dokohilf_guides;
drop policy if exists dokohilf_guide_versions_select_editor
  on public.dokohilf_guide_versions;
drop policy if exists dokohilf_editor_audit_deny_anon
  on public.dokohilf_editor_audit;
drop policy if exists dokohilf_editor_audit_deny_authenticated
  on public.dokohilf_editor_audit;

drop view if exists public.dokohilf_editor_guides;
drop trigger if exists dokohilf_guides_archive_version
  on public.dokohilf_guides;
drop function if exists public.dokohilf_archive_guide_version();

drop function if exists dokohilf_private.can_write_guide_status(text);
drop function if exists dokohilf_private.has_role(text[]);
drop function if exists dokohilf_private.role_for(uuid);
drop schema if exists dokohilf_private;

drop function if exists public.dokohilf_reject_public_signup(jsonb);
drop table if exists public.dokohilf_editor_audit;
drop table if exists public.dokohilf_user_roles;

alter table public.dokohilf_guides
  drop column if exists reviewed_by,
  drop column if exists approved_by;

alter table public.dokohilf_guide_versions
  drop column if exists changed_by;

revoke all on table public.dokohilf_guides
  from anon, authenticated, service_role;
revoke all on table public.dokohilf_guide_versions
  from anon, authenticated, service_role;
grant select on table public.dokohilf_guides,
  public.dokohilf_guide_versions to service_role;

create or replace function public.dokohilf_archive_guide_version()
returns trigger
language plpgsql
security definer
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

revoke all on function public.dokohilf_archive_guide_version()
  from public, anon, authenticated, service_role;

create trigger dokohilf_guides_archive_version
before update or delete on public.dokohilf_guides
for each row execute function public.dokohilf_archive_guide_version();

comment on table public.dokohilf_guides is
  'Allgemeine, unpersoenliche DokoHilf-Anleitungen; keine Konten, Profile oder Falldaten.';
comment on table public.dokohilf_guide_versions is
  'Technischer Versionsverlauf allgemeiner DokoHilf-Anleitungen ohne Personenbezug.';
