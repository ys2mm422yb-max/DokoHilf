#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260806-27"
SITE_DIR="${1:-_site}"

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/assets"

cp index.html editor.html manifest.webmanifest icon.svg service-worker.js version.json "$SITE_DIR/"
cp -R assets/. "$SITE_DIR/assets/"
touch "$SITE_DIR/.nojekyll"

test -s "$SITE_DIR/index.html"
test -s "$SITE_DIR/version.json"
test -s "$SITE_DIR/service-worker.js"
test -s "$SITE_DIR/assets/premium-ui-v27.css"
test -s "$SITE_DIR/assets/ux-v27.css"
test -s "$SITE_DIR/assets/experience-v27.js"
test -s "$SITE_DIR/assets/ux-v27.js"
test -s "$SITE_DIR/assets/guide-audio-catalog.json"
test -s "$SITE_DIR/assets/guide-audio-manifest.json"

audio_count="$(find "$SITE_DIR/assets/audio/guides" -maxdepth 1 -type f -name '*.wav' | wc -l | tr -d ' ')"
test "$audio_count" = "93"

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v27' "$SITE_DIR/index.html"
grep -q "premium-ui-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "experience-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q '"entryCount": 93' "$SITE_DIR/assets/guide-audio-manifest.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q 'cacheApprovedGuideAudio' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_PREBUILT_GUIDE_AUDIO_V1__' "$SITE_DIR/assets/experience-v27.js"

if find "$SITE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) | grep -q .; then
  echo "Nicht freigegebene Rasterbilder im öffentlichen Build gefunden." >&2
  exit 1
fi

echo "DokoHilf $BUILD_ID mit $audio_count statischen Guide-Audios gebaut."
