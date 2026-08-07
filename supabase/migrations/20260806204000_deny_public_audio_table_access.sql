-- Defense in depth for internal audio registry and builder control.
-- Service-role and postgres access remain available through their privileged roles.

create policy "deny_public_static_guide_audio"
on public.dokohilf_static_guide_audio
for all
to anon, authenticated
using (false)
with check (false);

create policy "deny_public_internal_build_control"
on public.dokohilf_internal_build_control
for all
to anon, authenticated
using (false)
with check (false);
