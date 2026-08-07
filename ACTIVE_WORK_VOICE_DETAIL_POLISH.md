# DokoHilf – Voice-Folgeantworten und kompakte Detailhilfe

**Stand:** 7. August 2026  
**Status:** Produktänderung abgeschlossen, PR #76 gemergt, gh-pages aktualisiert  
**Build:** `20260806-27`  
**PWA-Hotfixrevision:** `20260807-voice-followup-detail-polish-1`

## Reproduziertes Produktproblem

Im praktischen Mobiltest wurden drei Probleme bestätigt:

- Die Begrüßung im Sprachmodus wird gesprochen, spätere Antworten bleiben jedoch stumm oder starten erst sehr spät.
- Die Detailhilfe bei `Ich finde das nicht` war mobil zu voll, enthielt interne Zustandsformulierungen und konkurrierende Aktionen.
- Lange Antwortkarten, vier große Auswahlkarten, großes Mikrofon und zusätzliche Aktionen überluden die Sprachansicht.

## Umgesetztes Verhalten

- Gacrux bleibt bevorzugt, blockiert Folgeantworten aber nicht mehr.
- Im Voice-Modus erhält dynamisches TTS nur ein sehr kurzes Fenster von **160 ms**.
- Ist Gacrux dann nicht bereit, liefert die TTS-Fetchschicht bewusst einen normalen 503-Fallback an die bestehende Sprachlogik; dadurch startet die lokale Gerätestimme statt auf einen AbortError zu laufen oder lange zu warten.
- Die kurze Begrüßung kann weiterhin aus vorbereiteten/statischen Gacrux-Audios kommen.
- Detailhilfe-Texte wurden auf nutzernahe Fragen gekürzt, z. B. `Okay. Schau oben in die grüne Reiterleiste. Siehst du Doku-Erweitert?`.
- Interne Prozesssätze wie `wir tun nicht so, als wäre alles erledigt` oder `ich markiere noch keinen Schritt als erledigt` werden nicht mehr an Nutzer ausgegeben.
- Bereits gerenderte Detailhilfe-Buttons werden auf kurze Labels synchronisiert, z. B. `Doku-Erweitert offen`, `Anderer Reiter / andere Seite`, `Vitalwerte fehlt`.
- Die Label-Synchronisierung ist **idempotent** und erzeugt keinen Mutation-Loop mehr.
- Voice-Detailhilfe nutzt eine kompakte **2×2-Auswahl**, ein kleineres Mikrofon und blendet konkurrierende `Weiter / Nochmal / Hilfe / Zurück`-Aktionen während der Detailfrage aus.
- Keine unbestätigten Vivendi-Klickwege wurden ergänzt.

## Wichtige Dateien

- `assets/detail-help-polish-v27.js`
- `assets/detail-help-render-sync-v27.js`
- `assets/detail-help-v27.js`
- `assets/voice-focus-mode.js`
- `scripts/detail-help-render-v27.mjs`
- `scripts/apply-detail-help-v27.mjs`
- `scripts/build-static-site-v27.sh`
- `tests/detail-help-polish-v27.test.mjs`
- `.github/workflows/detail-help-mobile.yml`

## GitHub / Merge

- PR: **#76 – Mache Folgeantworten hörbar und Detailhilfe kompakt**
- final geprüfter Head: `bb94d20f7248fa3fb419176d8936730390eb3180`
- Merge-Commit auf `main`: `e87af33d74c26e353f42c7b85d909ac3bba3ce53`
- Branch `fix/voice-followup-compact-detail-help` wurde gemäß Projektregel **nicht gelöscht**.

## Pflicht-QA des exakten finalen Heads

Alle drei relevanten Checks waren vor dem Merge grün:

- `Deploy DokoHilf` Run **#309** – success
- `Validate dark iPhone UI v27` Run **#57** – success
- `Validate detailed help iOS Android` Run **#20** – success

Der Cross-Platform-Test prüft:

- iOS-orientiert: `393 × 852`
- Android/Pixel-orientiert: `412 × 915`
- kein horizontaler Overflow
- keine Überlappung von Frage, Auswahlkarten und Mikrofon
- kompakte 2×2-Auswahl im Voice-Modus
- ausgeblendete konkurrierende Voice-Aktionen während der Detailhilfe
- kurze sichtbare Detailhilfe-Texte ohne interne Zustandsformulierungen
- simuliert langsames TTS (450 ms) fällt in die lokale Gerätestimme
- die Folgeantwort wird im Test tatsächlich an `speechSynthesis` übergeben

## Fehlerhistorie dieses Arbeitsblocks

1. Erster PR-Head: alter Render-Test erwartete noch alte Button-Bezeichnungen.
2. Danach wurde erkannt, dass die neue Polish-Schicht zwar Payload-Texte kürzte, aber bereits gerenderte Auswahlbuttons noch die langen Labels behielten. Dafür kam `detail-help-render-sync-v27.js` hinzu.
3. Die erste Synchronisierung schrieb dieselben Labels bei jeder Mutation erneut und konnte dadurch einen Mutation-Loop erzeugen; der E2E-Test sah selbst `Senden` nicht mehr als stabil.
4. Final wurde die Synchronisierung idempotent gemacht: DOM/Text/Dataset werden nur geändert, wenn sich der Wert wirklich unterscheidet. Der exakte Head danach war vollständig grün.

## Live-Prüfung nach Merge

- `main` zeigt Merge-Commit `e87af33d74c26e353f42c7b85d909ac3bba3ce53` als aktuellen PR-#76-Merge.
- `gh-pages/service-worker.js` enthält `HOTFIX_REVISION = '20260807-voice-followup-detail-polish-1'`.
- `gh-pages/index.html` lädt in der veröffentlichten Ausgabe:
  - `detail-help-v27.js`
  - `detail-help-polish-v27.js`
  - `detail-help-render-sync-v27.js`
- Supabase-Projekt `efifbuqctylsujiauabg` wurde nach dem Merge als `ACTIVE_HEALTHY` geprüft.
- Dieser Arbeitsblock erforderte **keine Supabase-Schreibänderung**.

## Datenschutz

DokoHilf enthält ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte sowie vollständig synthetische Testdaten. Reale Personen-, Gesundheits-, Mitarbeiter-, Fall- und Zugangsdaten sind dauerhaft ausgeschlossen.

## Nächster realer Praxistest

Nach vollständigem Schließen und Neustart der installierten PWA im Sprachmodus prüfen:

1. Begrüßung hören.
2. Eine freie Bedienfrage stellen.
3. Sicherstellen, dass die Folgeantwort ohne mehrsekündiges Warten hörbar startet.
4. `Ich finde das nicht` auslösen und prüfen, ob die kompakte 2×2-Orientierung ohne Überlagerungen erscheint.

Wenn die Folgeantwort auf einem realen Gerät weiterhin stumm bleibt, nicht erneut nur Zeitlimits verändern: dann muss ein gerätespezifischer Runtime-Nachweis für iOS/Android-Sprachausgabe ergänzt werden.
