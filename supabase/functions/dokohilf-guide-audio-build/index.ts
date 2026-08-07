const RETIREMENT_CODE = 'legacy_cloud_audio_builder_retired_v28';
const RETIREMENT_MESSAGE = 'Der alte Cloud-Audio-Builder ist dauerhaft deaktiviert. Statische DokoHilf-Audios entstehen ausschließlich im geprüften GitHub-Releasebuild.';

function retiredResponse(): Response {
  return new Response(JSON.stringify({
    error: RETIREMENT_MESSAGE,
    code: RETIREMENT_CODE,
  }), {
    status: 410,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-DokoHilf-Builder-Mode': 'retired-cloud-audio-builder-v28',
    },
  });
}

Deno.serve(() => retiredResponse());
