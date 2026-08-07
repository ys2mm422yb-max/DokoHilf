# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260807-28`  
**Sichtbare Version:** `v28`  
**Veröffentlichter Release:** `local-natural-voice`  
**Aktuelle PWA-Hotfixrevision:** `20260807-local-natural-voice-v28-2`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Bedarf Supabase live geprüft. Veränderte Zustände werden niemals nur aus dieser Datei abgeleitet.

## 1. Harte Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Region: Frankfurt, `eu-central-1`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Supabase-Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Verbindung zur Dokumentationssoftware, kein Scraping und keine nicht dokumentierten Schnittstellen.
- Dauerhaft keine realen Bewohner-, Klienten-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in Repository, Supabase, App, Tests oder Artefakten.
- Das Echtdatenverbot gilt dauerhaft und wird auch durch spätere betriebliche, technische oder datenschutzrechtliche Freigaben nicht aufgehoben.
- Öffentlich sichtbare Projektinhalte enthalten ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Ergebnisse. Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert.

## 2. Verbindlicher GitHub-Ablauf

1. Vor Eingriffen `main`, offene Pull Requests, Actions und `gh-pages` prüfen; Supabase zusätzlich prüfen, wenn der Block Supabase betrifft.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen und Arbeitsstand dauerhaft dokumentieren.
5. Nur einen vollständig geprüften **exakten PR-Head** manuell mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages` und relevante Live-Komponenten prüfen.
8. Gegenüber dem Nutzer keine alternativen Preview-/Branch-/Cache-Links als Hauptzugang nennen.

## 3. Dauerhafte GitHub-Dokumentationspflicht

Nach jedem relevanten Arbeitsblock dauerhaft dokumentieren:

- neue Nutzerentscheidungen und fachliche Bestätigungen
- betroffene Dateien, Komponenten und Supabase-Bereiche
- tatsächliche Tests und Ergebnisse
- Fehler, Ursachen und offene Blocker
- Branch, Pull Request und exakten Head
- Merge- und Veröffentlichungsstand
- nächsten ausführbaren Schritt

Bestätigte Klickwege gehören nach `CONFIRMED_WORKFLOWS.md`. Größere Arbeitsblöcke erhalten eine `ACTIVE_WORK_*.md`.

Öffentliche Dokumentation beschreibt nur anonymisierte Fachinhalte, technische Entscheidungen und Ergebnisse. Keine Herkunfts- oder Prüfmaterialhinweise veröffentlichen.

## 4. Mobile Grundregel – iOS UND Android

Seit PR #71 gilt dauerhaft: **„mobil geprüft“ bedeutet immer iOS und Android.**

Mindest-QA:

- iOS: `393 × 852`
- Android: `412 × 915`

Bei jeder mobilen Änderung werden mindestens geprüft:

- kein horizontaler Overflow
- keine Überlagerungen oder abgeschnittenen Inhalte
- Header/Footer/Safe Areas
- Touch-Ziele
- Chat und Voice, sofern betroffen
- PWA-/Updateverhalten, sofern betroffen

Plattformspezifische Änderungen dürfen die andere Plattform nicht ungeprüft lassen.

Details: `ACTIVE_WORK_MOBILE_CROSS_PLATFORM.md`.

## 5. Aktueller veröffentlichter Produktstand – v28

### Direkte häufige Abläufe

PR #72 ist gemergt und veröffentlicht.

`Häufige Abläufe` öffnet direkt vollständige bestätigte Anleitungen für:

- Bericht anlegen
- Visite anlegen
- Vitalwerte erfassen
- An-/Abwesenheit
- Medikation ansehen
- Formular anlegen
- Übergabe anzeigen

Vitalwerte verzweigt nur in die bestätigten Varianten Einzelwert und Sammelerfassung.

Details: `ACTIVE_WORK_DIRECT_GUIDES_CHAT.md`.

### PWA-Installationssymbol

PR #73 ist gemergt und veröffentlicht.

- `icon-v3.svg`
- iOS `icon-touch-180-v3.png`
- Android `icon-192-v3.png`
- Android `icon-512-v3.png`
- Android maskable `icon-maskable-512-v3.png`

Die Installationsdateien werden deterministisch aus eigenem Code erzeugt.

Details: `ACTIVE_WORK_PWA_ICONS_CROSS_PLATFORM.md`.

### Detailhilfe bei Klickproblemen

PR #74 ist gemergt und veröffentlicht.

Problemformulierungen wie `Ich finde das nicht`, `Wo ist ...?`, `Wo muss ich klicken?`, `Bei mir heißt es anders`, `Ich bin auf einer anderen Seite` oder `Ich brauche Hilfe` öffnen einen Orientierungs-/Detailhilfemodus.

Verbindlich:

- aktueller Guide und aktueller Schritt bleiben erhalten
- `Weiter` wird während der Fehlersuche ausgeblendet
- DokoHilf fragt zuerst, was der Nutzer tatsächlich sieht
- erst nach bestätigtem Fund wird der normale Guide fortgesetzt
- keine alternativen Klickwege oder Feldnamen erfinden
- Chat und Voice verwenden dieselbe Fachlogik
- Hilfesitzung bleibt flüchtig im RAM

Details: `ACTIVE_WORK_DETAIL_HELP.md`.

### Voice-/Detailhilfe-Polish

PR #76 ist gemergt und veröffentlicht.

- kürzere nutzernahe Detailhilfe-Texte
- kompaktere Auswahl im Voice-Modus
- konkurrierende Aktionen während der Detailhilfe ausgeblendet
- Mutation-Loop bei Button-Synchronisierung beseitigt
- iOS- und Android-Interaktion als Pflicht-QA

## 6. v28 – lokale natürliche Stimme und iPhone-Hotfix

### Ausgangsrelease PR #78

PR #78 wurde auf exaktem grünem Head `591f945d68675aa323090143ca2934957e5c093c` manuell gemergt.

Veröffentlicht wurden:

- Build `20260807-28`
- sichtbare Version `KI · v28`
- Release `local-natural-voice`
- lokale Browser-TTS mit Supertonic 3
- Sprache Deutsch
- Android bevorzugt WebGPU, WASM als lokaler Fallback
- iOS WASM
- keine hörbare System-/Gerätestimme als v28-Fallback
- generierte freie Audios werden nicht dauerhaft gespeichert
- Modellressourcen dürfen lokal gecacht werden

Ein realer iPhone-Praxistest zeigte danach, dass das große lokale Modell beim Sprachstart zu früh initialisiert wurde und die App bei der Begrüßung hängen konnte.

### Hotfix PR #80 – veröffentlicht

PR #80 wurde auf exaktem grünem Head `d10be14fee6a6e2389f57b203379d05f541e5e60` manuell gemergt.

Merge-Commit:

`725fbbab510ff2af300b1074577420c74ca9f477`

Aktueller Sprachweg:

1. zuerst freigegebenes statisches Guide-Audio prüfen,
2. vorhandenes bestätigtes Audio direkt abspielen,
3. Supertonic nur für nicht statisch vorhandene freie Antworten starten,
4. beim bloßen Voice-Einstieg das große Modell nicht vorab initialisieren,
5. iOS verwendet 2 Denoising-Schritte,
6. lokale Inferenzgrenze: iOS 20 Sekunden, andere Plattformen 35 Sekunden,
7. System-/Gerätestimme bleibt blockiert,
8. generierte freie Audios werden nicht dauerhaft gespeichert.

Finale Pflicht-QA auf exakt diesem Head:

- `Deploy DokoHilf` Run #355 – success
- `Validate local voice v28 iOS Android` Run #43 – success
- `Validate detailed help iOS Android` Run #66 – success
- `Validate dark iPhone UI v27` Run #98 – success

Nach Merge verifiziert:

- `main` enthält Merge-Commit `725fbbab510ff2af300b1074577420c74ca9f477`,
- `gh-pages/service-worker.js` liefert `HOTFIX_REVISION = '20260807-local-natural-voice-v28-2'`,
- `gh-pages/assets/local-voice-gate-v28.js` nutzt den freigegebenen statischen Audiopfad vor lokaler Supertonic-Inferenz,
- lokaler Modellcache und freigegebener Audio-Cache bleiben beim normalen Service-Worker-Aktivierer erhalten.

Details: `ACTIVE_WORK_LOCAL_VOICE_V28.md` und `ACTIVE_WORK_IOS_VOICE_HOTFIX_V28.md`.

## 7. Öffentliche Inhalts- und Datenschutzgrenze

Am 7. August 2026 wurden die öffentlichen Kernunterlagen und editierbaren Projektbeschreibungen auf eine neutrale Veröffentlichungsgrenze vereinheitlicht.

Verbindlich:

- öffentliche DokoHilf-Inhalte sind ausschließlich selbst formuliert, anonymisiert und veröffentlichungsfähig,
- öffentlich dokumentiert werden Regeln, technische Entscheidungen, Ergebnisse und anonymisierte Fachinhalte,
- Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert,
- Testoberflächen und Testdaten sind vollständig synthetisch,
- das Echtdatenverbot ist dauerhaft, ohne Ausnahme und nicht durch spätere organisatorische Freigaben aufhebbar.

`PROJECT_RULES.md` ist hierfür die verbindliche Quelle.

## 8. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die verbindliche Quelle für bestätigte lokale Klickwege. Router, Supabase-Guides, direkte Anleitungen, Detailhilfe und Tests müssen damit übereinstimmen.

Bestätigt sind insbesondere:

- Bericht anlegen einschließlich Kategorieauswahl und automatisch verknüpfter Protokolle
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite/Sprechstunde mit vorgeschalteter Klientenauswahl und Status **durchgeführt**
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt öffnen
- Übergabe über `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

Nie fehlende Feldnamen, alternative Menüs oder Klickwege ergänzen, nur weil sie plausibel erscheinen.

## 9. Supabase-Grundstand

Vor veränderlichen Aussagen immer live prüfen.

Zuletzt bekannte Kernkomponenten:

- `dokohilf-ai-router` v11
- `dokohilf-tts` v21
- `dokohilf-guide-audio` v1
- `dokohilf-guide-audio-build` v3
- `dokohilf-editor` v1
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`

Keine andere Supabase-Instanz verwenden.

Der zuletzt während PR #80 live geprüfte statische Audio-Bestand für Build `20260806-27` lag bei 9 Einträgen. Dieser Wert ist veränderlich und muss bei Audioarbeit erneut live geprüft werden.

## 10. Dauerhafte Datenschutz- und Sicherheitsgrenzen

- dauerhaft keine Echtdaten, auch nicht nach einer späteren organisatorischen Freigabe
- Testkonten und Testdaten vollständig synthetisch
- keine produktiven Exporte oder Kopien in DokoHilf
- keine Nutzerstimmen, Diktate oder freien Gesprächsinhalte dauerhaft speichern
- keine Secrets im Browser, Repository oder öffentlich sichtbaren Projekttext
- keine fremden Handbücher oder geschützten Inhalte kopieren
- keine erfundenen Fach- oder Klickwege
- öffentliche Projekttexte enthalten nur selbst formulierte, anonymisierte und veröffentlichungsfähige Inhalte

`PROJECT_RULES.md` ist hierfür verbindlich.

## 11. Nächster ausführbarer Schritt

Der technische v28-2-Hotfix ist veröffentlicht. Nächster Schritt ist ein realer iPhone-Praxistest:

1. DokoHilf vollständig schließen und neu öffnen.
2. Prüfen, dass `KI · v28` sichtbar ist.
3. Sprachmodus öffnen und die Begrüßung testen.
4. Danach eine freie Folgefrage stellen und Antwortzeit sowie Klang bewerten.

Wenn eine freie Folgeantwort auf realem iOS weiterhin zu langsam oder stumm bleibt, nicht auf die Systemstimme zurückfallen. Dann die lokale Freitext-Engine gesondert neu bewerten.

## 12. Pflicht für jeden neuen Chat

1. `README.md` lesen.
2. `PROJECT_RULES.md` lesen.
3. `CONFIRMED_WORKFLOWS.md` lesen.
4. `PROJECT_HANDOFF.md` lesen.
5. alle `ACTIVE_WORK_*.md` prüfen.
6. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
7. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
8. Bei Audioarbeit den veränderlichen statischen Audio-Bestand live prüfen.
9. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
10. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
