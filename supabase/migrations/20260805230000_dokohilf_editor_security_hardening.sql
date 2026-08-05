-- Nachschärfung nach Supabase Security Advisor.
-- Rollenfunktionen liegen außerhalb des exponierten public-Schemas.

create schema if not exists dokohilf_private;
revoke all on schema dokohilf_private from public, anon, authenticated;
grant usage on schema dokohilf_private to authenticated, service_role;

create or replace function dokohilf_private.role_for(target_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select role
  from public.dokohilf_user_roles
  where user_id = target_user
    and active = true
  limit 1
$$;

create or replace function dokohilf_private.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(dokohilf_private.role_for(auth.uid()) = any(allowed_roles), false)
$$;

create or replace function dokohilf_private.can_write_guide_status(target_status text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case dokohilf_private.role_for(auth.uid())
    when 'admin' then target_status in ('draft', 'reviewed', 'approved', 'blocked')
    when 'editor' then target_status in ('draft', 'reviewed')
    else false
  end
$$;

revoke all on function dokohilf_private.role_for(uuid) from public, anon;
revoke all on function dokohilf_private.has_role(text[]) from public, anon;
revoke all on function dokohilf_private.can_write_guide_status(text) from public, anon;
grant execute on function dokohilf_private.role_for(uuid) to authenticated, service_role;
grant execute on function dokohilf_private.has_role(text[]) to authenticated, service_role;
grant execute on function dokohilf_private.can_write_guide_status(text) to authenticated, service_role;

drop policy if exists dokohilf_roles_select_authorized on public.dokohilf_user_roles;
create policy dokohilf_roles_select_authorized
on public.dokohilf_user_roles
for select to authenticated
using (
  user_id = auth.uid()
  or dokohilf_private.has_role(array['admin'])
);

drop policy if exists dokohilf_guides_select_editor on public.dokohilf_guides;
drop policy if exists dokohilf_guides_insert_editor on public.dokohilf_guides;
drop policy if exists dokohilf_guides_update_editor on public.dokohilf_guides;
drop policy if exists dokohilf_guides_delete_admin on public.dokohilf_guides;

create policy dokohilf_guides_select_editor
on public.dokohilf_guides
for select to authenticated
using (dokohilf_private.has_role(array['editor', 'admin']));

create policy dokohilf_guides_insert_editor
on public.dokohilf_guides
for insert to authenticated
with check (dokohilf_private.can_write_guide_status(status));

create policy dokohilf_guides_update_editor
on public.dokohilf_guides
for update to authenticated
using (dokohilf_private.has_role(array['editor', 'admin']))
with check (dokohilf_private.can_write_guide_status(status));

create policy dokohilf_guides_delete_admin
on public.dokohilf_guides
for delete to authenticated
using (dokohilf_private.has_role(array['admin']));

drop policy if exists dokohilf_guide_versions_select_editor on public.dokohilf_guide_versions;
create policy dokohilf_guide_versions_select_editor
on public.dokohilf_guide_versions
for select to authenticated
using (dokohilf_private.has_role(array['editor', 'admin']));

drop policy if exists dokohilf_editor_audit_deny_anon on public.dokohilf_editor_audit;
drop policy if exists dokohilf_editor_audit_deny_authenticated on public.dokohilf_editor_audit;
create policy dokohilf_editor_audit_deny_anon
on public.dokohilf_editor_audit
for all to anon
using (false)
with check (false);
create policy dokohilf_editor_audit_deny_authenticated
on public.dokohilf_editor_audit
for all to authenticated
using (false)
with check (false);

revoke all on function public.dokohilf_role_for(uuid) from public, anon, authenticated, service_role;
revoke all on function public.dokohilf_has_role(text[]) from public, anon, authenticated, service_role;
revoke all on function public.dokohilf_can_write_guide_status(text) from public, anon, authenticated, service_role;

drop function if exists public.dokohilf_can_write_guide_status(text);
drop function if exists public.dokohilf_has_role(text[]);
drop function if exists public.dokohilf_role_for(uuid);
