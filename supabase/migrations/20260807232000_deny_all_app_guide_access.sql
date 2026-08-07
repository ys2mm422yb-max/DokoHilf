-- DokoHilf has no application accounts. Keep the general guide tables behind
-- explicit deny policies so their account-free, service-only status is visible
-- to both Postgres and the Supabase Security Advisor.

drop policy if exists dokohilf_guides_deny_all_app_access
  on public.dokohilf_guides;
create policy dokohilf_guides_deny_all_app_access
on public.dokohilf_guides
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

drop policy if exists dokohilf_guide_versions_deny_all_app_access
  on public.dokohilf_guide_versions;
create policy dokohilf_guide_versions_deny_all_app_access
on public.dokohilf_guide_versions
as restrictive
for all
to anon, authenticated
using (false)
with check (false);
