const RETIREMENT_CODE = 'app_accounts_retired_v28';
const RETIREMENT_MESSAGE = 'DokoHilf bleibt dauerhaft kontenfrei. Der frühere Redaktionszugang ist stillgelegt.';

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
      'X-DokoHilf-Account-Mode': 'permanently-account-free-v28',
    },
  });
}

Deno.serve(() => retiredResponse());
