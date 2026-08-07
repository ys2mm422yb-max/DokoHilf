-- PR #86 moves all regular DokoHilf speech to the static/local Supertonic-F1 path.
-- Keep the legacy cloud builder disabled and remove its recurring invocation.
update public.dokohilf_internal_build_control
set enabled = false,
    updated_at = now()
where id = true
  and enabled is distinct from false;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dokohilf-static-guide-audio-v27';
