#!/usr/bin/env bash
set -euo pipefail

BUILD_ID="$(python -c 'import json; print(json.load(open("version.json", encoding="utf-8"))["buildId"])')"
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
python - "$SITE_DIR/assets/app.js" <<'PY'
from pathlib import Path
import sys
path = Path(sys.argv[1])
text = path.read_text(encoding='utf-8')
old = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.'
new = 'Hey! Wobei brauchst du Hilfe?'
if old in text:
    text = text.replace(old, new, 1)
if new not in text:
    raise SystemExit('Kurzer Hey-Sprachstart konnte nicht in app.js gesetzt werden.')
path.write_text(text, encoding='utf-8')
PY
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
test -s "$SITE_DIR/assets/voice-durchfuehrung-catalog-v29.json"
test -s "$SITE_DIR/assets/voice-ui-catalog-v29.json"
test -s "$SITE_DIR/assets/premium-ui-v27.css"
test -s "$SITE_DIR/assets/ux-v27.css"
test -s "$SITE_DIR/assets/voice-stage-balance-v27.css"
test -s "$SITE_DIR/assets/direct-guides-chat-v27.css"
test -s "$SITE_DIR/assets/v29-ui.css"
test -s "$SITE_DIR/assets/v29-ui.js"
test -s "$SITE_DIR/assets/smart-help-v29.js"
test -s "$SITE_DIR/assets/orientation-help-v29.js"
test -s "$SITE_DIR/assets/release-polish-v29.js"
test -s "$SITE_DIR/assets/durchfuehrungs-workflows-v29.js"
test -s "$SITE_DIR/assets/local-voice-v28.js"
test -s "$SITE_DIR/assets/local-voice-gate-v28.js"
test -s "$SITE_DIR/assets/experience-v27.js"
test -s "$SITE_DIR/assets/ux-v27.js"
test -s "$SITE_DIR/assets/direct-guides-v27.js"
test -s "$SITE_DIR/assets/direct-guide-copy-v29.js"
test -s "$SITE_DIR/assets/detail-help-v27.js"
test -s "$SITE_DIR/assets/detail-help-polish-v27.js"
test -s "$SITE_DIR/assets/detail-help-render-sync-v27.js"
test -s "$SITE_DIR/assets/context-voice-hotfix-v28.js"
test ! -e "$SITE_DIR/editor.html"
test ! -e "$SITE_DIR/assets/editor.js"
test ! -e "$SITE_DIR/assets/editor.css"

if grep -R -E -n 'auth/v1|grant_type=password|sb_publishable_' "$SITE_DIR"; then
  echo "Der öffentliche Build darf keine Konto- oder Anmeldeoberfläche enthalten." >&2
  exit 1
fi

grep -q "dokohilf-build\" content=\"$BUILD_ID" "$SITE_DIR/index.html"
grep -q 'KI · v29' "$SITE_DIR/index.html"
grep -q 'id="buildPill" type="button" hidden' "$SITE_DIR/index.html"
grep -q 'footer-version-button' "$SITE_DIR/assets/release-polish-v29.js"
grep -q 'UPDATE_NOTICE_MS = 10000' "$SITE_DIR/assets/release-polish-v29.js"
grep -q 'rel="icon" href="icon-v3.svg"' "$SITE_DIR/index.html"
grep -q 'rel="apple-touch-icon" sizes="180x180" href="icon-touch-180-v3.png"' "$SITE_DIR/index.html"
grep -q '<img src="icon-v3.svg" alt="" width="48" height="48">' "$SITE_DIR/index.html"
grep -q '"src":"icon-192-v3.png","sizes":"192x192"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-512-v3.png","sizes":"512x512"' "$SITE_DIR/manifest.webmanifest"
grep -q '"src":"icon-maskable-512-v3.png","sizes":"512x512".*"purpose":"maskable"' "$SITE_DIR/manifest.webmanifest"
grep -q "premium-ui-v27.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "v29-ui.css?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "smart-help-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "orientation-help-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "release-polish-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "durchfuehrungs-workflows-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "local-voice-v28.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "experience-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "ux-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "v29-ui.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "direct-guide-copy-v29.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-polish-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "detail-help-render-sync-v27.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "context-voice-hotfix-v28.js?v=$BUILD_ID" "$SITE_DIR/index.html"
grep -q "\"buildId\": \"$BUILD_ID\"" "$SITE_DIR/version.json"
grep -q "BUILD_ID = '$BUILD_ID'" "$SITE_DIR/service-worker.js"
grep -q "HOTFIX_REVISION = '20260809-static-supertonic-orientation-ui-v29-3'" "$SITE_DIR/service-worker.js"
grep -q "STATIC_AUDIO_CACHE = 'dokohilf-static-supertonic-audio-v29-2'" "$SITE_DIR/service-worker.js"
grep -q "guide-audio-catalog.json?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "smart-help-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "orientation-help-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "release-polish-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "durchfuehrungs-workflows-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "v29-ui.css?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "v29-ui.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "local-voice-gate-v28.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q "direct-guide-copy-v29.js?v=$BUILD_ID" "$SITE_DIR/service-worker.js"
grep -q '__DOKOHILF_LOCAL_VOICE_RETIRED_V29__' "$SITE_DIR/assets/local-voice-v28.js"
grep -q '__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__' "$SITE_DIR/assets/local-voice-v28.js"
grep -q '__DOKOHILF_LOCAL_VOICE_GATE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_STATIC_SUPERTONIC_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_STATIC_SUPERTONIC_ONLY_V29__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'static-supertonic-only-v29' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -Fq 'meta[name="dokohilf-build"]' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -Fq 'encodeURIComponent(BUILD_ID)' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q "STATIC_VOICE = 'Supertonic-F1'" "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'Ich habe die Antwort im Chat angezeigt' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_BLOCK_SYSTEM_VOICE_V28__' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q 'spokenText' "$SITE_DIR/assets/local-voice-gate-v28.js"
grep -q '__DOKOHILF_ORIENTATION_HELP_V29__' "$SITE_DIR/assets/orientation-help-v29.js"
grep -q 'Doku-Erweitert ist ein Hauptbereich in der festen Leiste' "$SITE_DIR/assets/orientation-help-v29.js"
grep -q 'Bedarfsmedikation' "$SITE_DIR/assets/orientation-help-v29.js"
grep -q 'Maßnahmen ohne Zeitangabe' "$SITE_DIR/assets/orientation-help-v29.js"
grep -q '__DOKOHILF_RELEASE_POLISH_V29__' "$SITE_DIR/assets/release-polish-v29.js"
grep -q '__DOKOHILF_DURCHFUEHRUNGS_WORKFLOWS_V29__' "$SITE_DIR/assets/durchfuehrungs-workflows-v29.js"
grep -q 'Wirksamkeitskontrolle' "$SITE_DIR/assets/durchfuehrungs-workflows-v29.js"
grep -q 'Maßnahmen ohne Zeitangabe' "$SITE_DIR/assets/durchfuehrungs-workflows-v29.js"
grep -q 'Hey! Wobei brauchst du Hilfe?' "$SITE_DIR/assets/app.js"
grep -q '__DOKOHILF_LOCAL_VOICE_ONLY_V28__' "$SITE_DIR/assets/ux-v27.js"
grep -q 'window.__DOKOHILF_LOCAL_VOICE_V28__ !== true' "$SITE_DIR/assets/experience-v27.js"
grep -q '__DOKOHILF_SMART_HELP_V29__' "$SITE_DIR/assets/smart-help-v29.js"
grep -q 'bedarfsmedikation-gabe' "$SITE_DIR/assets/smart-help-v29.js"
grep -q 'massnahmen-ohne-zeitangabe' "$SITE_DIR/assets/smart-help-v29.js"
grep -q '__DOKOHILF_UI_V29__' "$SITE_DIR/assets/v29-ui.js"
grep -q 'data-voice-state="thinking"' "$SITE_DIR/assets/v29-ui.css"
grep -q 'data-voice-state="speaking"' "$SITE_DIR/assets/v29-ui.css"
grep -q '__DOKOHILF_DIRECT_GUIDES_V27__' "$SITE_DIR/assets/direct-guides-v27.js"
grep -q '__DOKOHILF_DIRECT_GUIDE_COPY_V29__' "$SITE_DIR/assets/direct-guide-copy-v29.js"
grep -q '__DOKOHILF_DETAIL_HELP_V27__' "$SITE_DIR/assets/detail-help-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_POLISH_V27__' "$SITE_DIR/assets/detail-help-polish-v27.js"
grep -q '__DOKOHILF_DETAIL_HELP_RENDER_SYNC_V27__' "$SITE_DIR/assets/detail-help-render-sync-v27.js"

if grep -q 'voice-diagnostics.js' "$SITE_DIR/index.html"; then
  echo "v29 darf die alte Cloud-/Gerätestimmen-Diagnostik nicht laden." >&2
  exit 1
fi

if grep -q 'Supertone/supertonic-3/resolve/main' "$SITE_DIR/assets/local-voice-v28.js"; then
  echo "Der Browser darf keine Supertonic-Modellgewichte mehr für lokale Inferenz laden." >&2
  exit 1
fi
if grep -q 'loadTextToSpeech\|loadVoiceStyle\|navigator.gpu\|localFallback' "$SITE_DIR/assets/local-voice-v28.js" "$SITE_DIR/assets/local-voice-gate-v28.js"; then
  echo "On-Device-Spracherzeugung ist im Release verboten." >&2
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
  if [[ "$expected_count" != 216 ]]; then
    echo "Der statische Sprachkatalog muss in v29 exakt 216 Supertonic-F1-Sätze enthalten: $expected_count" >&2
    exit 1
  fi
  if [[ "$wav_count" != "$expected_count" ]]; then
    echo "Statischer Supertonic-Sprachbestand unvollständig: erwartet $expected_count, gefunden $wav_count" >&2
    exit 1
  fi
  grep -q '"engine": "Supertonic 3"' "$audio_dir/build-summary.json"
  grep -q '"voice": "F1"' "$audio_dir/build-summary.json"
  grep -q '"baseGuideCount": 93' "$audio_dir/build-summary.json"
  grep -q '"extraSpeechCount": 33' "$audio_dir/build-summary.json"
  grep -q '"releaseSpeechCount": 49' "$audio_dir/build-summary.json"
  grep -q '"workflowSpeechCount": 40' "$audio_dir/build-summary.json"
  grep -q '"uiSpeechCount": 1' "$audio_dir/build-summary.json"
  grep -q '"staticSpeechCount": 216' "$audio_dir/build-summary.json"
  grep -q '"count": 216' "$audio_dir/build-summary.json"
  grep -q '"voice": "Supertonic-F1"' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"extraSpeechCount": 33' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"releaseSpeechCount": 49' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"workflowSpeechCount": 40' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"uiSpeechCount": 1' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q '"staticSpeechCount": 216' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Hey! Wobei brauchst du Hilfe?' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Ich habe die Antwort im Chat angezeigt.' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Bedarfsmedikation' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Wirksamkeitskontrolle' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Maßnahmen ohne Zeitangabe' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Doku-Erweitert ist ein Hauptbereich in der festen Leiste' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Öffne beim gewünschten Bewohner zuerst Doku-Erweitert in der festen Leiste. Innerhalb von Doku-Erweitert findest du Vitalwerte.' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“' "$SITE_DIR/assets/guide-audio-catalog.json"
  grep -q 'Wenn du das Formular fertig bearbeitet hast, speicherst du es oben links in der Leiste' "$SITE_DIR/assets/guide-audio-catalog.json"
fi

if [[ "$REQUIRE_STATIC_SUPERTONIC" == "1" ]]; then
  echo "DokoHilf $BUILD_ID als v29 mit 216 statischen Supertonic-F1-WAVs, verschachtelter Orientierungshilfe, Durchführung-Workflows, kurzem Hey-Sprachstart und dezenter Versionsanzeige gebaut."
else
  echo "DokoHilf $BUILD_ID als v29-QA-Site gebaut; der vollständige Releasebuild verlangt separat exakt 216 statische Supertonic-F1-WAVs."
fi
