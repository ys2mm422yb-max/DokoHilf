# DokoHilf – Sprachlatenz und iPhone-Sprachlayout

**Status:** Abgeschlossen und veröffentlicht; statische Gacrux-Bibliothek baut sich kontrolliert weiter auf  
**Stand:** 7. August 2026  
**Erster Client-/Layout-Fix:** PR #64  
**Server-/Builder-Fix:** PR #65  
**Aktueller Client-/Layout-Hotfix:** PR #67

## Aktuell verbindlicher Stand

PR #67 ersetzt den bisherigen 1,2-Sekunden-Client-Fallback aus PR #64 als aktuellen Produktstand.

Finaler exakter PR-#67-Head: `f19290cb75fe0a11d918f9dec2a9eeab3641d187`  
Merge-Commit: `98a8718027bfc520a9ccba03db3b38152b852c2b`

Vollständig grün auf dem exakten Head:

- `Deploy DokoHilf` Run #264
- `Validate dark iPhone UI v27` Run #28
- deterministische Fach-, Datenschutz-, Sicherheits- und UI-Verträge
- 165/165 Routingfälle
- Gesprächssequenzen und bestätigte Workflow-Marker
- echter iPhone-Render
- Live-Router
- Live-TTS-Fallback
- privates Guide-Audio
- exakter statischer Site-Build

Nach Merge live auf `gh-pages` geprüft:

- `assets/ux-v27.js`: `HARD_FALLBACK_MS = 180`
- `assets/ux-v27.css`: neue überlappungsfreie Flex-Stapelung und Safe-Area-Trennung
- `service-worker.js`: `HOTFIX_REVISION = '20260807-fluid-voice-layout-1'`

Kein Auto-Merge; Branch nicht automatisch gelöscht.

## Nutzerbeobachtung und Ursache

Im veröffentlichten Build 27 war das dunkle Sprachdesign deutlich verbessert, auf dem iPhone traten aber zwei konkrete Probleme auf:

1. Elemente der Sprachansicht konnten sich im oberen Bereich überlagern beziehungsweise unter die feste Kopfzeile rutschen.
2. Nach einer gesprochenen Nutzereingabe blieb die Oberfläche teilweise mehrere Sekunden auf dem Startzustand der Stimme stehen; vereinzelt begann anschließend überhaupt keine hörbare Sprachausgabe.

Ein erneuter Nutzertest nach PR #64/#65 bestätigte, dass 1,2 Sekunden als Fallback für einen flüssigen Sprachdialog weiterhin zu langsam wirkten und die Voice-Geometrie noch nicht robust genug war.

Die vom Nutzer zur Beurteilung gezeigten Oberflächen bleiben gemäß Projektregel ausschließlich im Chat. Dieses Dokument enthält nur anonymisierte technische Erkenntnisse.

Live-Diagnose:

- `dokohilf-ai-router` antwortete typischerweise innerhalb weniger hundert Millisekunden.
- vorhandenes statisches Guide-Audio beziehungsweise Manifest war wesentlich schneller als eine neue TTS-Erzeugung.
- dynamisches Gacrux-TTS benötigte bei beobachteten erfolgreichen Aufrufen unter anderem etwa 6,5, 8,7 und 13,5 Sekunden.
- zusätzlich traten echte HTTP 429 des Providers auf.

Die Wartezeit war damit real und durfte nicht länger vor der lokalen Antwort stehen.

## PR #67 – flüssiger Sprachstart

`assets/ux-v27.js`:

- harter dynamischer TTS-Fallback jetzt **180 ms** statt 1200 ms
- langsame TTS-Anfrage wird beim Fallback über `AbortController` beendet
- bereits fertiges beziehungsweise praktisch sofort verfügbares Gacrux-Audio darf weiterhin zuerst gewinnen
- ist Gacrux nicht praktisch sofort verfügbar, übernimmt die lokale Sofortstimme
- iOS-`speechSynthesis`-Resume-Watchdog reagiert nach 60/140/280/520 ms
- Status zeigt `Antwort startet …` statt eines lang wirkenden Ladeversprechens
- keine zusätzliche persistente Speicherung

Aktuelle Client-Reihenfolge:

1. vorhandenes statisches freigegebenes Gacrux-Audio
2. dynamisches Gacrux nur, wenn es praktisch sofort innerhalb des 180-ms-Fensters verfügbar ist
3. danach lokale Sofortstimme
4. iOS-Resume-Watchdog stellt sicher, dass der lokale Fallback nicht stumm pausiert bleibt

Damit ist Gacrux ein Qualitätsgewinn, aber **kein Latenz-Blocker** mehr.

## PR #67 – iPhone-Layout

`assets/ux-v27.css`:

- im Sprachmodus bleibt als Workspace-Inhalt ausschließlich `.voice-focus-stage` sichtbar
- Voice-Bühne beginnt Safe-Area-abhängig unter der festen Kopfzeile
- `.voice-focus-inner` und `.voice-focus-main` verwenden eine eindeutige vertikale Flex-Stapelung
- Anweisung, Console-Slot und Aktionen besitzen getrennte Bereiche
- Mikrofon ist auf kleinen und niedrigen iPhones stärker begrenzt
- Voice-Engine-Badge wird in der fokussierten Ansicht ausgeblendet
- normaler `Version … Aktuell`-Status wird ausgeblendet; Update- und Fehlerzustände dürfen weiterhin erscheinen

Der erste PR-#67-Lauf scheiterte ausschließlich an drei veralteten Testverträgen, die noch 1200 ms beziehungsweise die alte Watchdog-Zeitfolge erwarteten. Produktlogik, Routing und die übrigen Verträge waren bereits grün. Die Erwartungen wurden auf den neuen tatsächlich gewollten Vertrag aktualisiert; der danach exakte Head bestand die vollständige Prüfung.

## PWA-Hotfix-Auslieferung

`service-worker.js` enthält den Revisionsmarker:

`20260807-fluid-voice-layout-1`

Die Build-ID bleibt `20260806-27`. Der geänderte Service Worker erzwingt dennoch einen neuen Install-/Aktivierungszyklus und schreibt die bestehenden Build-27-Core-Dateien neu in den Cache. Dadurch soll eine installierte iPhone-PWA nicht am vorherigen 1,2-Sekunden-Stand hängen bleiben.

## Sicherer statischer Gacrux-Builder – PR #65

Finaler exakter Head: `affff5b53b0ae1a5f0b97688b5a6b49d78bd94a1`  
Merge-Commit: `6afc9267756b5fa1617b8b067f246598a44bd90a`

Aktiv im ausschließlich freigegebenen Supabase-Projekt `efifbuqctylsujiauabg`:

- `dokohilf-tts` v21
- `dokohilf-guide-audio-build` v3

Sicherheitsmodell:

- Builder liest den internen Token ausschließlich serverseitig
- TTS prüft ihn serverseitig gegen `dokohilf_internal_build_control`
- nur der authentifizierte Builder darf bereits freigegebene allgemeine Guide-Texte am Nutzertext-Heuristikfilter vorbei erzeugen
- Browser-, Chat- und normale Sprach-TTS-Anfragen behalten den strengen öffentlichen Datenschutzfilter
- keine Nutzerstimmen, Diktate, freien Antworten oder Gesprächsverläufe werden vorgebaut

Cron `dokohilf-static-guide-audio-v27` läuft kontrolliert mit höchstens einem allgemeinen Text pro Minute und entfernt sich bei 93/93 selbst.

Letzter Live-Bestand bei Dokumentationsprüfung am 7. August 2026: **7/93**, Indizes `0,1,2,3,4,5,33`. Diese Zahl ist veränderlich und muss vor Audioarbeit immer live in Supabase geprüft werden.

Index 33 ist der bereits vorbereitete Visiten-Schritt:

`Öffne „Doku-Erweitert“ und wähle „Visiten“.`

## Sicherheits- und Datenschutzgrenze

- keine Nutzerstimmen oder freien Sprachantworten speichern
- keine neuen Browser-Speicher außer der bereits erlaubten Datenschutzbestätigung
- keine Nutzerbilder oder Screenshots übernehmen
- Gacrux bleibt die bevorzugte natürliche Stimme für fertige freigegebene Guide-Texte
- statische Audios bleiben ausschließlich auf allgemeine fachlich freigegebene Guide-Texte begrenzt
- öffentlicher TTS-Datenschutzfilter bleibt unverändert streng
- interner Builder-Token bleibt ausschließlich serverseitig

## Nächster Produktblock

Die akute Sprach-/Layout-Stabilisierung ist nach PR #67 abgeschlossen.

Als Nächstes sind bereits vom Nutzer bestätigt:

1. Detailhilfe hinter **„Ich brauche Hilfe / Ich finde das nicht“** gemäß `ACTIVE_WORK_DETAIL_HELP.md`.
2. Häufige Abläufe im Hauptmenü sollen bei direkter Auswahl **sofort die vollständige Schritt-für-Schritt-Anleitung** öffnen, statt zuerst einen normalen Chat zu erzeugen.
3. Der Schreibmodus darf visuell weiter als klarer eigenständiger Chat verdichtet werden; PR #67 enthält dafür bereits eine erste Aufräumstufe.

Vor Beginn immer GitHub, Actions, `gh-pages`, Supabase und bei Audioarbeit den veränderlichen Audio-Bestand live prüfen.
