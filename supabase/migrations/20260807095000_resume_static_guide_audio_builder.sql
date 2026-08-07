-- Resume the approved static Gacrux library only after the TTS endpoint validates the internal builder token.
-- No build token is stored in this migration; it remains only in the protected server-side control table.

update public.dokohilf_internal_build_control
set enabled = true, updated_at = now()
where id = true
  and (select count(*) from public.dokohilf_static_guide_audio where build_id = '20260806-27') < 93;

select cron.unschedule(jobid)
from cron.job
where jobname = 'dokohilf-static-guide-audio-v27';

select cron.schedule(
  'dokohilf-static-guide-audio-v27',
  '* * * * *',
  'select public.dokohilf_build_next_static_guide_audio();'
)
where (select count(*) from public.dokohilf_static_guide_audio where build_id = '20260806-27') < 93;
