-- Build the fixed, approved Gacrux guide library progressively without making users wait for live TTS.
-- One item per minute keeps requests serialized and automatically stops once all 93 entries exist.

select cron.unschedule('dokohilf-static-guide-audio-v27');

select cron.schedule(
  'dokohilf-static-guide-audio-v27',
  '* * * * *',
  'select public.dokohilf_build_next_static_guide_audio();'
);
