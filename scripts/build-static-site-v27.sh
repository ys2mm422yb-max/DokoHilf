#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260807-28"
SITE_DIR="${1:-_site}"

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/assets"

cp index.html editor.html manifest.webmanifest icon.svg icon-v3.svg service-worker.js version.json "$SITE_DIR/"
cp -R assets/. "$SITE_DIR/assets/"
rm -rf "$SITE_DIR/assets/audio"
rm -f "$SITE_DIR/assets/guide-audio-manifest.json"
node scripts/generate-pwa-icons-v27.mjs "$SITE_DIR"
node scripts/apply-pwa-icons-v27.mjs "$SITE_DIR"
node scripts/apply-detail-help-v27.mjs "$SITE_DIR"
touch "$SITE_DIR/.nojekyll"

test -s "$SITE_DIR/index.html"
test -s "$SITE_DIR/version.json"
test -s "$SITE_DIR/service-worker.js"
test -s "$SITE_DIR/icon-v3.svg"
test -s "$SITE_DIR/icon-touch-180-v3.png"
test -s "$SITE_DIR/icon-192-v3.png"
test -s "$SITE_DIR/icon-512-v3.png"
test -s "$SITE_DIR/icon-maskable-512-v3.png"
test -s "$SITE_DIR/assets/premium-ui-v27.css"
test -s "$SITE_DIR/assets/ux-v27.css"
test -s "$SITE_DIR/assets/voice-stage-balance-v27.css"
test -s "$SITE_DIR/assets/direct-guides-chat-v27.css"
test -s "$SITE_DIR/assets/local-voice-v28.js"
test -s "$SITE_DIR/assets/local-voice-gate-v28.js"
test -s "$SITE_DIR/assets/vendor/supertonic-web-v28.mjs"
test -s "$SITE_DIR/assets/experience-v27.js"
test -s "$SITE_DIR/assets/ux-v27.js"
test -s "$SITE_DIR/assets/direct-guides-v27.js"
test -s "$SITE_DIR/assets/detail-help-v27.js"
test -s "$SITE_DIR/assets/detail-help-polish-v27.js"
test -s "$SITE_DIR/assets/detail-help-render-sync-v27.js"

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v28' "$SITE_DIR/index.html"
grep -q 'rel="icon" href="icon-v3.svg"' "$SITE_DIR/index.html"
grep -q 'rel="apple-touch-icon" sizes="180x180" href="icon-touch-180-v3.png"' "$SITE_DIR/index.html"
grep -q '<img src="icon-v3.svg" alt="" width="48" height="48">' "$SITE_DIR/index.html"
grep -q '"src":"icon-192-v3.png","sizes":"192x192"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-512-v3.png","sizes":"512x512"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-maskable-512-v3.png","sizes":"512x512".*"purpose":"maskable"' "$SITE_DIR/manifest.webmanifest"
grep -q "premium-ui-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "local-voice-v28.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "experience-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-polish-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-render-sync-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q "HOTFIX_REVISION = '20260807-local-natural-voice-v28-1'" "$SITE_DIR/service-worker.js"
grep -q "local-voice-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "vendor/supertonic-web-v28.mjs?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q 'LOCAL_VOICE_MODEL_CACHE' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_LOCAL_VOICE_V28__' "$SITE_DIR/assets/local-voice-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_GATE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_ONLY_V28__' "$SITE_DIR/assets/ux-v27.js"
grep -q '__DOKOHILF_DIRECT_GUIDES_V27__' "$SITE_DIR/assets/direct-guides-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_V27__' "$SITE_DIR/assets/detail-help-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_POLISH_V27__' "$SITE_DIR/assets/detail-help-polish-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__' "$SITE_DIR/assets/detail-help-render-sync-v27.js"

if grep -q 'dokohilf-guide-audio?manifest=' "$SITE_DIR/service-worker.js"; then
  echo "v28 darf keine Gacrux-Guide-Audios mehr im Service Worker vorladen." >&2
  exit 1
fi

unexpected_raster="$(find "$SITE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  | grep -Ev '/(icon-touch-180-v3|icon-192-v3|icon-512-v3|icon-maskable-512-v3)\.png$' || true)"
if [[ -n "$unexpected_raster" ]]; then
  echo "Nicht freigegebene Rasterbilder im öffentlichen Build gefunden:" >&2
  echo "$unexpected_raster" >&2
  exit 1
fi

if find "$SITE_DIR" -type f -iname '*.wav' | grep -q .; then
  echo "Generierte Sprachdateien dürfen nicht im öffentlichen Pages-Build liegen." >&2
  exit 1
fi

echo "DokoHilf $BUILD_ID mit lokaler natürlicher Supertonic-Stimme, ohne Cloud-TTS/Systemstimme, iOS-/Android-QA, Detailhilfe und direkten Anleitungen gebaut."
