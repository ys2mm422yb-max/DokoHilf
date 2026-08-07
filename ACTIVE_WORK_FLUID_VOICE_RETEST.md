# Arbeitsstand – erneuter iPhone-Sprachtest und flüssige Sofortantwort

**Stand:** 7. August 2026  
**Status:** Abgeschlossen, vollständig geprüft, gemergt und auf `gh-pages` veröffentlicht  
**Build:** `20260806-27`  
**Produkt-Branch:** `fix/fluid-voice-mobile-layout-20260807`  
**Pull Request:** `#67`  
**Finaler exakter Head:** `f19290cb75fe0a11d918f9dec2a9eeab3641d187`  
**Merge-Commit:** `98a8718027bfc520a9ccba03db3b38152b852c2b`

## Nutzer-Retest

Der Nutzer hatte den veröffentlichten Stand nach PR #64/#65 erneut auf einem iPhone getestet und zwei reale Probleme bestätigt:

1. In der fokussierten Sprachansicht überschnitten beziehungsweise überlagerten sich Darstellungen noch teilweise.
2. Die Begrüßung startete schnell, aber nach einer gesprochenen Frage dauerte der Start der Antwort weiterhin zu lange.

Das Nutzerbild blieb ausschließlich im Chat. Es wurde weder ins Repository noch nach Supabase oder in Testartefakte übernommen.

## Ursache

- Die Begrüßung beziehungsweise vorbereitete Guide-Audios können sofort aus vorhandenem Audio starten.
- Für andere Antworten konnte dynamisches Gacrux-TTS nötig sein.
- Der Provider zeigte real mehrere Sekunden Latenz und HTTP 429.
- Der bisherige 1,2-Sekunden-Fallback war für einen echten Sprachdialog noch fühlbar zu langsam.
- Die Voice-Oberfläche kombinierte mehrere ältere Grid-/Sticky-Regeln, wodurch die mobile Geometrie trotz des ersten Fixes nicht robust genug war.

## Veröffentlichter Fix

### Sprache

`assets/ux-v27.js`:

- harter TTS-Fallback: **180 ms**
- langsame TTS-Anfrage wird mit `AbortController` beendet
- vorhandenes beziehungsweise praktisch sofort verfügbares Gacrux-Audio darf zuerst gewinnen
- sonst übernimmt die lokale Sofortstimme praktisch unmittelbar
- iOS-Resume-Watchdog: 60/140/280/520 ms
- Status: `Antwort startet …`

Gacrux bleibt damit die bevorzugte Qualität für fertige freigegebene Texte, ist aber kein Latenz-Blocker für freie beziehungsweise noch nicht vorgebaute Antworten.

### iPhone-Layout

`assets/ux-v27.css`:

- im Sprachmodus bleibt als Workspace-Inhalt nur `.voice-focus-stage` sichtbar
- feste Safe-Area-Trennung zur Kopfzeile
- eindeutige vertikale Flex-Stapelung
- getrennte Flächen für Schritttext, Voice-Console und Aktionen
- stärker begrenztes Mikrofon auf kleinen/niedrigen iPhones
- Voice-Engine-Badge im Fokus ausgeblendet
- normaler `Version … Aktuell`-Status ausgeblendet; Update-/Fehlerstatus bleibt möglich

### Chat-Aufräumstufe

Im selben Hotfix wurde der Schreibmodus bereits etwas bereinigt:

- klar abgegrenzte Gesprächsfläche
- kompaktere mobile Schnellaktionen
- redundanter aktueller Versionsstatus entfernt

Der größere vom Nutzer gewünschte Umbau des Chat-Erlebnisses und der häufigen Abläufe bleibt ein eigener nächster Produktblock.

### PWA-Auslieferung

`service-worker.js` enthält:

`HOTFIX_REVISION = '20260807-fluid-voice-layout-1'`

Dadurch wurde trotz unveränderter Build-ID ein neuer Service-Worker-Zyklus ausgelöst und der alte 1,2-Sekunden-PWA-Cache ersetzt.

## Validierung

Der erste PR-#67-Lauf #261 scheiterte an drei veralteten Testexpectations aus dem vorherigen 1,2-Sekunden-Stand. Die Produktlogik selbst war dort bereits weitgehend grün. Die Tests wurden auf den neuen ausdrücklich gewünschten Vertrag aktualisiert.

Finaler exakter Head `f19290cb75fe0a11d918f9dec2a9eeab3641d187`:

- `Deploy DokoHilf` Run #264: **success**
- `Validate dark iPhone UI v27` Run #28: **success**
- deterministische Fach-, Datenschutz-, Sicherheits- und UI-Verträge: grün
- iPhone-Render und Interaktion: grün
- Live-Router: grün
- Live dynamischer Voice-Fallback: grün
- privates Guide-Audio: grün
- exakter releasbarer statischer Site-Build: grün

## Veröffentlichung geprüft

Nach Merge wurden direkt geprüft:

- `main/assets/ux-v27.js`: `HARD_FALLBACK_MS = 180`
- `gh-pages/assets/ux-v27.js`: `HARD_FALLBACK_MS = 180`
- `gh-pages/assets/ux-v27.css`: neue Flex-/Safe-Area-Regeln vorhanden
- `gh-pages/service-worker.js`: Hotfixrevision vorhanden

Supabase wurde durch PR #67 nicht verändert. Letzter während des Abschlusses live abgefragter statischer Audiobestand: **7/93**, Indizes `0,1,2,3,4,5,33`. Dieser Bestand ist veränderlich.

## Nächster Produktblock

Nach diesem Stabilitätsfix sind die nächsten bereits bestätigten Nutzerwünsche:

1. **Detailhilfe** hinter `Ich brauche Hilfe / Ich finde das nicht`: gezielt nach sichtbarem Zustand fragen, ohne nicht bestätigte Klickwege zu erfinden.
2. **Häufige Abläufe** im Hauptmenü: ein Tipp soll direkt die komplette Schritt-für-Schritt-Anleitung öffnen, nicht erst einen normalen Chat erzeugen.
3. **Chatdesign weiter verbessern**: stärker als eigenständige, ruhige Gesprächsansicht statt als Formular-/Chat-Mischung.

Für Punkt 1 gilt `ACTIVE_WORK_DETAIL_HELP.md`. Für Punkt 2 dürfen nur bestätigte Guides aus `CONFIRMED_WORKFLOWS.md` beziehungsweise aktuell freigegebene Supabase-Guides verwendet werden.
