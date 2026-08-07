const RETIREMENT_CODE = 'legacy_gacrux_audio_delivery_retired_v28';
const RETIREMENT_MESSAGE = 'Die alte Gacrux-Audioauslieferung ist dauerhaft deaktiviert. DokoHilf verwendet ausschließlich Supertonic-F1.';

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
      'X-DokoHilf-Voice-Mode': 'retired-gacrux-audio-delivery-v28',
    },
  });
}

Deno.serve(() => retiredResponse());
