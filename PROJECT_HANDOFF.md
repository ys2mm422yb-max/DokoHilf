# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 8. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260808-29`  
**Release-PR:** `#93` auf `agent/v29-smart-help-voice-ui`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Bedarf Supabase live geprüft. Veränderliche Zustände werden niemals nur aus dieser Datei abgeleitet.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere Repositories oder Supabase-Projekte niemals verändern oder mit DokoHilf verbinden.
- DokoHilf ist ausschließlich eine **erklärende Schritt-für-Schritt-Bedienhilfe**.
- Die App besitzt keinerlei Konten oder Anmeldung – einschließlich Redaktions-, Mitarbeiter- oder Administrationskonten –, keine Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken. Solche Funktionen werden nicht eingeplant.
- Bewohner-, Mitarbeiter- und sonstige Personendaten werden nicht in DokoHilf eingegeben oder gespeichert.
- Dauerhaft keine realen Bewohner-, Klienten-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in Repository, Supabase, App, Tests oder Artefakten.
- Automatisierte Tests verwenden ausschließlich synthetische UI-Zustände, neutrale Platzhalter und erfundene Werte; **keine reale Person und kein realer Fall werden nachgebildet**.
- Öffentlich sichtbare Projektinhalte enthalten ausschließlich **selbst formulierte**, **anonymisierte** und **veröffentlichungsfähige** Ergebnisse. **Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert**.
- Allgemeine Guide-Inhalte werden nur über geprüfte Repository-Änderungen und nachvollziehbare Migrationen gepflegt, niemals über einen App-Login.

## 2. Verbindlicher GitHub-Ablauf

1. Vor Eingriffen `main`, offene Pull Requests, Actions und `gh-pages` prüfen; Supabase zusätzlich prüfen, wenn der Block Supabase betrifft.
2. Nie direkt auf `main` arbeiten.
3. Änderungen über Branch und Pull Request integrieren.
4. Relevante Entscheidungen, Tests, Fehlerursachen und den Arbeitsstand dauerhaft dokumentieren.
5. Nur einen vollständig geprüften **exakten PR-Head** manuell mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages`, öffentlichen Build und relevante Supabase-Komponenten erneut prüfen.
8. Gegenüber dem Nutzer keine Preview-, Branch- oder Cache-URL als Hauptzugang nennen.

Für PR #93 existiert zusätzlich `.github/workflows/exact-pr-head.yml`. Dieser Workflow checkt ausdrücklich `github.event.pull_request.head.sha` aus und beweist vor der Freigabe, dass die Kernregressionen wirklich auf dem PR-Head laufen. Der normale Pages-Workflow prüft zusätzlich die Integration mit `main`.

## 3. Mobile Freigabe

„Mobil geprüft“ bedeutet immer mindestens:

- iOS `393 × 852`
- Android `412 × 915`

Geprüft werden je nach Änderung insbesondere horizontaler Overflow, Überlagerungen, Safe Areas, Touch-Ziele, Chat, Voice, Zustandsanimationen und PWA-Updateverhalten.

## 4. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die verbindliche Quelle für bestätigte Klickwege. Niemals fehlende Feldnamen, alternative Menüs oder Klickwege ergänzen, nur weil sie plausibel erscheinen.

Besonders harte Regeln:

- Visite/Sprechstunde: Status **durchgeführt**, niemals „abgeschlossen“.
- Berichte werden bei Korrekturen **durchgestrichen**, nicht gelöscht.
- Falsch bestätigte Durchführung wird **storniert**.
- Medikation ist ausschließlich **Nur-Lese**.
- An-/Abwesenheit: `Von` immer mit Datum/Uhrzeit; `Bis` nur, wenn der Endzeitpunkt sicher feststeht. Nie schätzen.
- Bericht-Sonderfall: nur `Kontakt – alles außer Arzt` erzeugt das verknüpfte Fallgespräch und nur `Sturzereignis` das verknüpfte Sturzprotokoll. Die zugehörigen Protokollschritte gelten nur für diese zwei Kategorien.

## 5. v29 – smarte Hilfe und Chatlogik

PR #93 führt den v29-Releaseblock zusammen:

- sichtbare Version `KI · v29`, Build `20260808-29`;
- freie Hilferufe wie „ich weiß nicht weiter“, „wo bin ich“ oder „das gibt es bei mir nicht“ verwenden im aktiven Guide denselben bestätigten Kontexthilfe-Pfad wie der Hilfe-Button;
- kurze Navigationsfragen starten oder halten den passenden bestätigten Guide statt generische Übersichten zu erzeugen;
- die Supabase-Guide-Daten bleiben die Quelle der Klickwege; `smart-help-v29.js` enthält keine eigenen erfundenen Schrittfolgen;
- Hauptmenü, Schreib-Chat und Sprachmodus wurden visuell überarbeitet;
- ältere Chatantworten werden bei aktivem Guide zurückgenommen, während aktueller Schritt und aktuelle Antwort sichtbar im Vordergrund bleiben;
- die Zustände `idle`, `listening`, `thinking`, `speaking` und `error` sind im Sprachmodus eigenständig dargestellt;
- mobile Render-QA prüft iOS und Android einschließlich echter v29-Zustandsanimationen.

Der produktive Supabase-Endpunkt `dokohilf-chat-router` wurde am 8. August live als ACTIVE v4 geprüft. Repo und Live-Funktion verwenden den v29-Vertrag `context-aware-v29-4` / `approved-guide-context-help-v29-4` und den Smart-Start `approved-guide-smart-start-v29-1`.

## 6. v29 – kostenlose Voice-Architektur

**Supertonic F1 ist die einzige reguläre DokoHilf-Stimme.**

Aktueller Aufbau:

1. Der öffentliche GitHub-Releasebuild erzeugt **160 bestätigte statische Supertonic-F1-Sätze**: 93 Guide-Sätze + 18 feste Dialogsätze + 49 v29-Guide-/Hilfesätze.
2. Bestätigte Sätze werden statisch abgespielt und müssen auf iPhone oder Android nicht lokal inferiert werden.
3. Ein noch nicht vorbereiteter freier Satz darf als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden.
4. Auf iOS ist diese lokale Notinferenz auf **8 Sekunden** begrenzt, damit die Oberfläche nicht endlos im Sprachzustand hängen bleibt.
5. System-/Gerätestimmen bleiben als regulärer Fallback blockiert.
6. Cloud-TTS ist vollständig stillgelegt; der aktive Browser-Sprachpfad ruft keine Cloud-TTS-API auf.
7. Freie erzeugte Audios und Gesprächsinhalte werden nicht dauerhaft gespeichert.
8. Der PWA-Cache für statische Audios ist `dokohilf-static-supertonic-audio-v29-1`; alte v28-Audiocaches werden entfernt.

Die frühere `voice-diagnostics.js`-Kompatibilitätsdatei darf im Repository verbleiben, wird im v29-Release aber weder aus `index.html` geladen noch vom Service Worker vorab gecacht. Der alte Gacrux-/Guide-Audio-Pfad bleibt ausschließlich stillgelegte Kompatibilität.

## 7. Stillgelegte Cloud-/Account-Infrastruktur

- `dokohilf-tts` ist ein nicht-generierender Ruhestandsendpunkt.
- `dokohilf-guide-audio-build` ist ein nicht-generierender Ruhestandsendpunkt.
- `dokohilf-guide-audio` liefert keine alten Gacrux-Audios mehr aus.
- Diese Ruhestandspfade sind JWT-geschützt.
- Der alte DokoHilf-Audio-Cron ist entfernt; am 8. August live wurden **0 DokoHilf-Cronjobs** gefunden.
- `public.dokohilf_internal_build_control.enabled` ist live `false`.
- Supabase Auth enthält live **0 Nutzer**.
- Der frühere Editor ist stillgelegt; es gibt keine veröffentlichte Editor-Seite, keine App-Konten und keine App-Rollenprofile.
- Restriktive RLS-Regeln sperren App-Rollen vom direkten Zugriff auf Guide- und Versionsdaten aus.

## 8. Supabase-Stand v29

Am 8. August 2026 live geprüft:

- `public.dokohilf_guides`: 25 allgemeine Guides, RLS aktiv;
- `public.dokohilf_topics`: 14 allgemeine Themen, RLS aktiv;
- `public.dokohilf_guide_versions`: technischer personenfreier Versionsverlauf, RLS aktiv;
- `public.dokohilf_static_guide_audio`: alte Registry, RLS aktiv, kein aktiver v29-Sprachpfad;
- `auth.users`: 0;
- DokoHilf-Cronjobs: 0;
- interner Build-Schalter: `false`;
- Security Advisor: **0 Hinweise**;
- Performance Advisor: ein reiner `INFO`-Hinweis zu einem bislang ungenutzten Index auf `dokohilf_guide_versions`; kein Release-Blocker.

Die Migration `natural_presence_and_form_save_v29` ist in Supabase live eingetragen. Vor dem Einspielen waren die Zielinhalte bereits korrekt vorhanden. Die Migration wurde deshalb idempotent gemacht und anschließend als No-op angewendet: `anwesenheit` blieb Version 4 mit 8 Schritten, `formulare-anlegen` Version 2 mit 7 Schritten und der technische Versionsverlauf blieb bei 42 Einträgen. Es wurde keine zusätzliche Guide-Version erzeugt.

## 9. v29-QA und bekannte behobene Releaseblocker

Im Releaseblock wurden drei konkrete CI-/Runtime-Probleme nachvollziehbar behoben:

1. Ein altes Diagnose-Skript rief noch den stillgelegten `dokohilf-guide-audio`-Pfad auf und erzeugte im Render-Test HTTP 401. Der v29-Release lädt bzw. precacht diesen Pfad nicht mehr.
2. Der Chat-Render-Test las nach dem Senden kurzzeitig die bereits vorhandene Begrüßungsblase statt der neuen gemockten Antwort. Die QA wartet jetzt ausdrücklich auf eine **neue** Assistant-Antwort.
3. Die Voice-Zustands-QA verglich einen übergangsabhängigen `box-shadow`. Sie prüft nun atomar die tatsächlich vorgesehene `thinking`-Animation `v29ThinkSpin` sowie die anderen v29-Zustände.

Der separat eingeführte Exact-Head-Workflow war auf dem geprüften Code-Head vor diesem Handoff-Update grün. Da jede Dokumentationsänderung einen neuen PR-Head erzeugt, muss **der endgültige Head nach diesem Commit erneut vollständig grün sein**, bevor gemergt wird.

## 10. Datenschutz- und Sicherheitsgrenzen

- dauerhaft keine Echtdaten, auch nicht nach späterer organisatorischer Freigabe;
- keinerlei App-Konten, Anmeldung, Rollen- oder Personenprofile in DokoHilf;
- keine produktiven Exporte oder Kopien in DokoHilf;
- keine Nutzerstimmen, Diktate oder freien Gesprächsinhalte dauerhaft speichern;
- keine Secrets im Browser, Repository oder öffentlich sichtbaren Projekttext;
- keine fremden Handbücher oder geschützten Inhalte kopieren;
- keine erfundenen Fach- oder Klickwege;
- öffentliche Projekttexte nur selbst formuliert, anonymisiert und veröffentlichungsfähig.

`PROJECT_RULES.md` bleibt hierfür verbindlich.

## 11. Nächster ausführbarer Schritt

Für PR #93 gilt:

1. aktuellen PR-Head erneut live lesen;
2. sicherstellen, dass **alle** für diesen Head gestarteten Pflichtprüfungen erfolgreich abgeschlossen sind – insbesondere Exact-Head, Deploy, iOS/Android-Voice, Detailhilfe, Bericht-Sonderfall, Kontext-Hilfe und Dark-Mobile-UI;
3. Mergeability und unveränderten Head nochmals prüfen;
4. PR #93 manuell mit `expected_head_sha` mergen; kein Auto-Merge, Branch nicht löschen;
5. danach `main`, den `gh-pages`-Stand und den öffentlichen Hauptlink prüfen;
6. live bestätigen, dass `KI · v29` / Build `20260808-29` ausgeliefert wird und die veröffentlichte Voice-/Chatlogik keine alten Cloud-/Diagnosepfade aufruft;
7. Supabase Security Advisor und relevante Live-Komponenten abschließend kontrollieren.

## 12. Pflicht für jeden neuen Chat

1. `README.md` lesen.
2. `PROJECT_RULES.md` lesen.
3. `CONFIRMED_WORKFLOWS.md` lesen.
4. `PROJECT_HANDOFF.md` lesen.
5. alle `ACTIVE_WORK_*.md` prüfen.
6. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
7. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
8. Bei Audioarbeit den aktiven Sprachpfad und Build-Schalter live prüfen.
9. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
10. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
