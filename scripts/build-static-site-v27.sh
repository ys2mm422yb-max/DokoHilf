#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260807-28"
SITE_DIR="${1:-_site}"
REQUIRE_STATIC_SUPERTONIC="${DOKOHILF_REQUIRE_STATIC_SUPERTONIC:-0}"

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/assets"

cp index.html editor.html manifest.webmanifest icon.svg icon-v3.svg service-worker.js version.json "$SITE_DIR/"
cp -R assets/. "$SITE_DIR/assets/"
rm -f "$SITE_DIR/assets/guide-audio-manifest.json"
node scripts/generate-pwa-icons-v27.mjs "$SITE_DIR"
node scripts/apply-pwa-icons-v27.mjs "$SITE_DIR"
node scripts/apply-detail-help-v27.mjs "$SITE_DIR"
node scripts/apply-local-voice-v28.mjs "$SITE_DIR"
touch "$SITE_DIR/.nojekyll"

test -s "$SITE_DIR/index.html"
test -s "$SITE_DIR/version.json"
test -s "$SITE_DIR/service-worker.js"
test -s "$SITE_DIR/icon-v3.svg"
test -s "$SITE_DIR/icon-touch-180-v3.png"
test -s "$SITE_DIR/icon-192-v3.png"
test -s "$SITE_DIR/icon-512-v3.png"
test -s "$SITE_DIR/icon-maskable-512-v3.png"
test -s "$SITE_DIR/assets/guide-audio-catalog.json"
test -s "$SITE_DIR/assets/voice-extra-catalog-v28.json"
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
grep -q "HOTFIX_REVISION = '20260807-static-supertonic-guides-v28-4'" "$SITE_DIR/service-worker.js"
grep -q "STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v28-1'" "$SITE_DIR/service-worker.js"
grep -q "guide-audio-catalog.json?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "vendor/supertonic-web-v28.mjs?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q 'LOCAL_VOICE_MODEL_CACHE' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_LOCAL_VOICE_V28__' "$SITE_DIR/assets/local-voice-v28.js"
grep -q 'if (voiceEntry) arm();' "$SITE_DIR/assets/local-voice-v28.js"
grep -q 'const IOS_TOTAL_STEPS = 2;' "$SITE_DIR/assets/local-voice-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_GATE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_STATIC_SUPERTONIC_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'static-supertonic-guide-v28' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q "STATIC_AUDIO_MANIFEST = './assets/guide-audio-catalog.json?v=$BUILD_ID'" "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q "STATIC_VOICE = 'Supertonic-F1'" "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'IOS_LOCAL_TIMEOUT_MS = 20000' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'payload.spokenText' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Sonderfall · nur bei 2 Kategorien' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Sturzprotokoll' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Schritte 6–9 überspringen' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_ONLY_V28__' "$SITE_DIR/assets/ux-v27.js"
grep -q 'window.__DOKOHILF_LOCAL_VOICE_V28__ === true' "$SITE_DIR/assets/app.js"
grep -q 'window.__DOKOHILF_LOCAL_VOICE_V28__ !== true' "$SITE_DIR/assets/experience-v27.js"
grep -q '__DOKOHILF_DIRECT_GUIDES_V27__' "$SITE_DIR/assets/direct-guides-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_V27__' "$SITE_DIR/assets/detail-help-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_POLISH_V27__' "$SITE_DIR/assets/detail-help-polish-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__' "$SITE_DIR/assets/detail-help-render-sync-v27.js"

if grep -q 'voice-diagnostics.js' "$SITE_DIR/index.html"; then
  echo "v28 darf die alte Cloud-/Gerätestimmen-Diagnostik nicht laden." >&2
  exit 1
fi

unexpected_raster="$(find "$SITE_DIR" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) \
  | grep -Ev '/(icon-touch-180-v3|icon-192-v3|icon-512-v3|icon-maskable-512-v3)\.png$' || true)"
if [[ -n "$unexpected_raster" ]]; then
  echo "Nicht freigegebene Rasterbilder im öffentlichen Build gefunden:" >&2
  echo "$unexpected_raster" >&2
  exit 1
fi

if [[ "$REQUIRE_STATIC_SUPERTONIC" == "1" ]]; then
  audio_dir="$SITE_DIR/assets/audio/guides"
  test -s "$audio_dir/build-summary.json"
  expected_count="$(python -c "import json; print(len(json.load(open('$SITE_DIR/assets/guide-audio-catalog.json', encoding='utf-8'))['entries']))")"
  wav_count="$(find "$audio_dir" -maxdepth 1 -type f -name '*.wav' | wc -l | tr -d ' ')"
  if [[ "$expected_count" != 111 ]]; then
    echo "Der statische Sprachkatalog muss exakt 93 Guide-Sätze und 18 feste Dialogsätze enthalten: $expected_count" >&2
    exit 1
  fi
  if [[ "$wav_count" != "$expected_count" ]]; then
    echo "Statischer Supertonic-Sprachbestand unvollständig: erwartet $expected_count, gefunden $wav_count" >&2
    exit 1
  fi
  grep -q '"engine": "Supertonic 3"' "$audio_dir/build-summary.json"
  grep -q '"voice": "F1"' "$audio_dir/build-summary.json"
  grep -q '"baseGuideCount": 93' "$audio_dir/build-summary.json"
  grep -q '"extraSpeechCount": 18' "$audio_dir/build-summary.json"
  grep -q '"staticSpeechCount": 111' "$audio_dir/build-summary.json"
  grep -q '"count": 111' "$audio_dir/build-summary.json"
  grep -q '"voice": "Supertonic-F1"' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"baseGuideCount": 93' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"extraSpeechCount": 18' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"staticSpeechCount": 111' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Okay. Schau oben in die grüne Reiterleiste' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Die Medikation darf hier nur angesehen werden' "$SITE_DIR/assets/guide-audio-catalog.json"
fi

if [[ "$REQUIRE_STATIC_SUPERTONIC" == "1" ]]; then
  echo "DokoHilf $BUILD_ID mit v28-4, exakt 93 statischen Guide-Sätzen plus 18 festen Dialogsätzen (111 Supertonic-F1-WAVs), Router-spokenText, lokaler Supertonic-F1-Notinferenz ohne Systemstimme, iOS-/Android-QA und Bericht-Sonderfall gebaut."
else
  echo "DokoHilf $BUILD_ID als lokale QA-Site gebaut; der vollständige Releasebuild verlangt separat exakt 111 Supertonic-F1-WAVs."
fi
