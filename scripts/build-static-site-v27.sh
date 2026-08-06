#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260806-27"
SITE_DIR="${1:-_site}"

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/assets"

cp index.html editor.html manifest.webmanifest icon.svg service-worker.js version.json "$SITE_DIR/"
cp -R assets/. "$SITE_DIR/assets/"
rm -rf "$SITE_DIR/assets/audio"
rm -f "$SITE_DIR/assets/guide-audio-manifest.json"
touch "$SITE_DIR/.nojekyll"

test -s "$SITE_DIR/index.html"
test -s "$SITE_DIR/version.json"
test -s "$SITE_DIR/service-worker.js"
test -s "$SITE_DIR/assets/premium-ui-v27.css"
test -s "$SITE_DIR/assets/ux-v27.css"
test -s "$SITE_DIR/assets/experience-v27.js"
test -s "$SITE_DIR/assets/voice-diagnostics.js"
test -s "$SITE_DIR/assets/ux-v27.js"
test -s "$SITE_DIR/assets/guide-audio-catalog.json"

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v27' "$SITE_DIR/index.html"
grep -q "premium-ui-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "experience-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "voice-diagnostics.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q 'dokohilf-guide-audio?manifest=1&build=20260806-27' "$SITE_DIR/service-worker.js"
grep -q 'cacheApprovedGuideAudio' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__' "$SITE_DIR/assets/experience-v27.js"
grep -q '__DOKOHILF_REMOTE_GUIDE_AUDIO_V27__' "$SITE_DIR/assets/voice-diagnostics.js"

if find "$SITE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | grep -q .; then
  echo "Nicht freigegebene Rasterbilder im öffentlichen Build gefunden." >&2
  exit 1
fi

if find "$SITE_DIR" -type f -iname '*.wav' | grep -q .; then
  echo "Statische Guide-Audios dürfen nicht als Binärdateien im öffentlichen Pages-Build liegen." >&2
  exit 1
fi

echo "DokoHilf $BUILD_ID mit privatem, cachebarem Gacrux-Guide-Audioendpunkt gebaut."
