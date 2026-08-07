#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260806-27"
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
test -s "$SITE_DIR/assets/experience-v27.js"
test -s "$SITE_DIR/assets/voice-diagnostics.js"
test -s "$SITE_DIR/assets/ux-v27.js"
test -s "$SITE_DIR/assets/direct-guides-v27.js"
test -s "$SITE_DIR/assets/detail-help-v27.js"
test -s "$SITE_DIR/assets/detail-help-polish-v27.js"
test -s "$SITE_DIR/assets/detail-help-render-sync-v27.js"
test -s "$SITE_DIR/assets/guide-audio-catalog.json"

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v27' "$SITE_DIR/index.html"
grep -q 'rel="icon" href="icon-v3.svg"' "$SITE_DIR/index.html"
grep -q 'rel="apple-touch-icon" sizes="180x180" href="icon-touch-180-v3.png"' "$SITE_DIR/index.html"
grep -q '<img src="icon-v3.svg" alt="" width="48" height="48">' "$SITE_DIR/index.html"
grep -q '"src":"icon-192-v3.png","sizes":"192x192"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-512-v3.png","sizes":"512x512"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-maskable-512-v3.png","sizes":"512x512".*"purpose":"maskable"' "$SITE_DIR/manifest.webmanifest"
grep -q "premium-ui-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "experience-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "voice-diagnostics.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "voice-stage-balance-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "direct-guides-chat-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "direct-guides-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-polish-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-render-sync-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q "HOTFIX_REVISION = '20260807-voice-followup-detail-polish-1'" "$SITE_DIR/service-worker.js"
grep -q 'voice-stage-balance-v27.css?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'direct-guides-chat-v27.css?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'direct-guides-v27.js?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'detail-help-v27.js?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'detail-help-polish-v27.js?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'detail-help-render-sync-v27.js?v=20260806-27' "$SITE_DIR/service-worker.js"
grep -q './icon-touch-180-v3.png' "$SITE_DIR/service-worker.js"
grep -q './icon-192-v3.png' "$SITE_DIR/service-worker.js"
grep -q './icon-512-v3.png' "$SITE_DIR/service-worker.js"
grep -q './icon-maskable-512-v3.png' "$SITE_DIR/service-worker.js"
grep -q 'dokohilf-guide-audio?manifest=1&build=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'cacheApprovedGuideAudio' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__' "$SITE_DIR/assets/experience-v27.js"
grep -q '__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__' "$SITE_DIR/assets/voice-diagnostics.js"
grep -q '__DOKOHILF_DIRECT_GUIDES_V27__' "$SITE_DIR/assets/direct-guides-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_V27__' "$SITE_DIR/assets/detail-help-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_POLISH_V27__' "$SITE_DIR/assets/detail-help-polish-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__' "$SITE_DIR/assets/detail-help-render-sync-v27.js"

unexpected_raster="$(find "$SITE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  | grep -Ev '/(icon-touch-180-v3|icon-192-v3|icon-512-v3|icon-maskable-512-v3)\.png$' || true)"
if [[ -n "$unexpected_raster" ]]; then
  echo "Nicht freigegebene Rasterbilder im öffentlichen Build gefunden:" >&2
  echo "$unexpected_raster" >&2
  exit 1
fi

if find "$SITE_DIR" -type f -iname '*.wav' | grep -q .; then
  echo "Statische Guide-Audios dürfen nicht als Binärdateien im öffentlichen Pages-Build liegen." >&2
  exit 1
fi

echo "DokoHilf $BUILD_ID mit kompakter Detailhilfe, sofortigem Voice-Fallback, privaten Gacrux-Guide-Audios, iOS-/Android-PWA-Icons, balancierter Sprachbühne und direkten mobilen Anleitungen gebaut."
