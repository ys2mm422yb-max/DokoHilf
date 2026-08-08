#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="20260808-29"
SITE_DIR="${1:-_site}"
REQUIRE_STATIC_SUPERTONIC="${DOKOHILF_REQUIRE_STATIC_SUPERTONIC:-0}"

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR/assets"

cp index.html manifest.webmanifest icon.svg icon-v3.svg service-worker.js version.json "$SITE_DIR/"
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
test -s "$SITE_DIR/assets/voice-release-catalog-v29.json"
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
test -s "$SITE_DIR/assets/direct-guide-copy-v29.js"
test -s "$SITE_DIR/assets/detail-help-v27.js"
test -s "$SITE_DIR/assets/detail-help-polish-v27.js"
test -s "$SITE_DIR/assets/detail-help-render-sync-v27.js"
test ! -e "$SITE_DIR/editor.html"
test ! -e "$SITE_DIR/assets/editor.js"
test ! -e "$SITE_DIR/assets/editor.css"

if grep -R -E -n 'auth/v1|grant_type=password|sb_publishable_' "$SITE_DIR"; then
  echo "Der öffentliche Build darf keine Konto- oder Anmeldeoberfläche enthalten." >&2
  exit 1
fi

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v29' "$SITE_DIR/index.html"
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
grep -q "direct-guide-copy-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-polish-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-render-sync-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q "HOTFIX_REVISION = '20260808-context-voice-v29-1'" "$SITE_DIR/service-worker.js"
grep -q "STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-1'" "$SITE_DIR/service-worker.js"
grep -q "guide-audio-catalog.json?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "vendor/supertonic-web-v28.mjs?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "direct-guide-copy-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q 'LOCAL_VOICE_MODEL_CACHE' "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_LOCAL_VOICE_V28__' "$SITE_DIR/assets/local-voice-v28.js"
grep -q 'if (voiceEntry) arm();' "$SITE_DIR/assets/local-voice-v28.js"
grep -q 'const IOS_TOTAL_STEPS = 2;' "$SITE_DIR/assets/local-voice-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_GATE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_STATIC_SUPERTONIC_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'static-supertonic-guide-v29' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q "STATIC_AUDIO_MANIFEST = './assets/guide-audio-catalog.json?v=$BUILD_ID'" "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q "STATIC_VOICE = 'Supertonic-F1'" "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'IOS_LOCAL_TIMEOUT_MS = 8000' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'payload.spokenText' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Sonderfall · nur bei 2 Kategorien' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Sturzprotokoll' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Schritte 6–9 überspringen' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_ONLY_V28__' "$SITE_DIR/assets/ux-v27.js"
grep -q 'window.__DOKOHILF_LOCAL_VOICE_V28__ === true' "$SITE_DIR/assets/app.js"
grep -q 'window.__DOKOHILF_LOCAL_VOICE_V28__ !== true' "$SITE_DIR/assets/experience-v27.js"
grep -q '__DOKOHILF_DIRECT_GUIDES_V27__' "$SITE_DIR/assets/direct-guides-v27.js"
grep -q '__DOKOHILF_DIRECT_GUIDE_COPY_V29__' "$SITE_DIR/assets/direct-guide-copy-v29.js"
grep -q '__DOKOHILF_DETAIL_HELP_V27__' "$SITE_DIR/assets/detail-help-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_POLISH_V27__' "$SITE_DIR/assets/detail-help-polish-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__' "$SITE_DIR/assets/detail-help-render-sync-v27.js"

if grep -q 'voice-diagnostics.js' "$SITE_DIR/index.html"; then
  echo "v29 darf die alte Cloud-/Gerätestimmen-Diagnostik nicht laden." >&2
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
  if [[ "$expected_count" != 160 ]]; then
    echo "Der statische Sprachkatalog muss in v29 exakt 160 Supertonic-F1-Sätze enthalten: $expected_count" >&2
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
  grep -q '"releaseSpeechCount": 49' "$audio_dir/build-summary.json"
  grep -q '"staticSpeechCount": 160' "$audio_dir/build-summary.json"
  grep -q '"count": 160' "$audio_dir/build-summary.json"
  grep -q '"voice": "Supertonic-F1"' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"releaseSpeechCount": 49' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"staticSpeechCount": 160' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste' "$SITE_DIR/assets/guide-audio-catalog.json"
fi

if [[ "$REQUIRE_STATIC_SUPERTONIC" == "1" ]]; then
  echo "DokoHilf $BUILD_ID als v29 mit 160 statischen Supertonic-F1-WAVs, kontextbewusster Guide-Hilfe, natürlicheren Formulierungen und kurzem iPhone-Notfalltimeout gebaut."
else
  echo "DokoHilf $BUILD_ID als lokale v29-QA-Site gebaut; der vollständige Releasebuild verlangt separat exakt 160 Supertonic-F1-WAVs."
fi
