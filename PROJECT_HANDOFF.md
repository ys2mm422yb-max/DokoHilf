# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260807-28`  
**Sichtbare Version:** `v28`  
**Veröffentlichter Release:** `local-natural-voice`  
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

Der alte v27-Systemstimmen-Fallback wurde anschließend durch v28 ersetzt.

## 6. v28 – lokale natürliche Stimme

PR #78 wurde auf exaktem grünem Head `591f945d68675aa323090143ca2934957e5c093c` manuell gemergt.

Veröffentlicht:

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

Der erste v28-Release startete das große lokale Modell bereits beim Öffnen des Sprachmodus. Ein realer iPhone-Praxistest zeigte, dass die App dabei dauerhaft auf `Lokale Stimme erzeugt Antwort …` stehen bleiben konnte.

Details zum ursprünglichen v28-Release: `ACTIVE_WORK_LOCAL_VOICE_V28.md`.

## 7. Aktuell offener iPhone-Sprachhotfix – PR #80

Aktueller Arbeitsbranch:

`fix/ios-static-first-voice-v28-20260807`

Pull Request:

`#80` – **offen; vor Merge aktuellen exakten Head und alle Checks live prüfen**.

Zielarchitektur:

1. Für eine Sprachausgabe zuerst den bestehenden freigegebenen statischen Audio-Manifestpfad prüfen.
2. Ist ein passendes bestätigtes Audio vorhanden, direkt dieses abspielen.
3. Nur wenn kein statisches Audio existiert, Supertonic lokal starten.
4. Beim bloßen Öffnen des Sprachmodus das große Modell nicht vorab initialisieren.
5. iOS verwendet für freie lokale Sätze 2 Denoising-Schritte.
6. Lokale Inferenz erhält eine harte Obergrenze: iOS 20 Sekunden, andere Plattformen 35 Sekunden.
7. System-/Gerätestimme bleibt blockiert.
8. Generierte freie Audios werden nicht dauerhaft gespeichert.

Für Build `20260806-27` waren bei der letzten Live-Abfrage 9 statische Gacrux-Audios registriert. Dieser Bestand ist veränderlich und muss bei Audioarbeit live geprüft werden.

Details: `ACTIVE_WORK_IOS_VOICE_HOTFIX_V28.md`.

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

## 11. Pflicht für jeden neuen Chat

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
