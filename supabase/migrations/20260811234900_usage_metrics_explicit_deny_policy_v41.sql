create policy "deny_public_usage_counter_access_v41"
on public.dokohilf_usage_counters
for all
to anon, authenticated
using (false)
with check (false);
