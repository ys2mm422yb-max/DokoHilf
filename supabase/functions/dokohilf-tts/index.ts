const RETIREMENT_CODE = 'cloud_tts_retired_v28';
const RETIREMENT_MESSAGE = 'Cloud-TTS ist dauerhaft deaktiviert. DokoHilf verwendet ausschließlich statische oder lokale Supertonic-F1-Audios.';

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
      'X-DokoHilf-Voice-Mode': 'retired-cloud-tts-v28',
    },
  });
}

Deno.serve(() => retiredResponse());
