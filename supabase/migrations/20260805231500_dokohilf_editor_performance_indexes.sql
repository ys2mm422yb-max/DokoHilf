-- Performance-Nachschärfung nach Supabase Advisor.

create index if not exists dokohilf_editor_audit_actor_id_idx
  on public.dokohilf_editor_audit (actor_id);

create index if not exists dokohilf_guide_versions_changed_by_idx
  on public.dokohilf_guide_versions (changed_by);

create index if not exists dokohilf_guides_reviewed_by_idx
  on public.dokohilf_guides (reviewed_by);

create index if not exists dokohilf_guides_approved_by_idx
  on public.dokohilf_guides (approved_by);

create index if not exists dokohilf_user_roles_assigned_by_idx
  on public.dokohilf_user_roles (assigned_by);

drop policy if exists dokohilf_roles_select_authorized on public.dokohilf_user_roles;
create policy dokohilf_roles_select_authorized
on public.dokohilf_user_roles
for select to authenticated
using (
  user_id = (select auth.uid())
  or dokohilf_private.has_role(array['admin'])
);
