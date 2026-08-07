# DokoHilf – Sprachlatenz und iPhone-Sprachlayout

**Status:** Client- und Layoutfix veröffentlicht; statische Gacrux-Bibliothek wird serverseitig fertiggestellt  
**Stand:** 7. August 2026  
**Erster Produkt-PR:** #64  
**Aktueller Folgebranch:** `fix/static-gacrux-builder-20260807`

## Nutzerbeobachtung

Im veröffentlichten Build 27 war das dunkle Sprachdesign deutlich verbessert, auf dem iPhone traten aber noch zwei konkrete Probleme auf:

1. Elemente der Sprachansicht konnten sich im oberen Bereich überlagern beziehungsweise unter die feste Kopfzeile rutschen.
2. Nach einer gesprochenen Nutzereingabe blieb die Oberfläche teilweise mehrere Sekunden auf dem Startzustand der Stimme stehen; vereinzelt begann anschließend überhaupt keine hörbare Sprachausgabe.

Die vom Nutzer zur Beurteilung gezeigte Oberfläche bleibt gemäß Projektregel ausschließlich im Chat. Dieses Dokument enthält nur anonymisierte technische Erkenntnisse.

## Live-Diagnose

Am 7. August 2026 wurden die aktuellen Supabase-Edge-Function-Logs des ausschließlich für DokoHilf freigegebenen Projekts geprüft.

Ergebnis:

- `dokohilf-ai-router` antwortete bei den beobachteten Aufrufen typischerweise innerhalb weniger hundert Millisekunden.
- `dokohilf-guide-audio` lieferte vorhandene statische Audios beziehungsweise das Manifest im Bereich von grob 0,2 bis 1,1 Sekunden.
- `dokohilf-tts` v20 benötigte bei erfolgreichen aktuellen Aufrufen unter anderem etwa 6,5 Sekunden, 8,7 Sekunden und 13,5 Sekunden.
- Zusätzlich traten aktuelle HTTP-429-Antworten des TTS-Pfads auf.
- In `public.dokohilf_static_guide_audio` waren bei der Diagnose für Build `20260806-27` erst 4 von 93 vorgesehenen statischen Audios registriert. Daher fielen die meisten freigegebenen Schritte weiterhin auf Live-TTS zurück.
- Der vorhandene interne Builder erzeugte ursprünglich nur einen Eintrag pro Stunde. Für eine feste Bibliothek mit 93 allgemeinen Guide-Texten war das unnötig langsam.

Damit war die wahrgenommene Wartezeit real und nicht nur eine irreführende Ladeanimation.

## Produktfix PR #64

### Client-Sprachstart

`assets/ux-v27.js`:

- harter Sprachfallback von 1900 ms auf 1200 ms verkürzt
- langsame TTS-Anfrage wird beim Fallback über `AbortController` abgebrochen
- natürliche Gacrux-Stimme bleibt bevorzugt, wenn statisches oder dynamisches Audio rechtzeitig verfügbar ist
- iOS-`speechSynthesis` erhält einen Resume-Watchdog mit mehreren kurzen Wiederholungen, damit die Sofortstimme nach dem Fallback tatsächlich startet
- Statushinweis erklärt die automatische Sofortstimme klarer
- keine neue persistente Speicherung

### iPhone-Layout

`assets/ux-v27.css`:

- allgemeiner Versionsstatus wird im fokussierten Sprachmodus ausgeblendet
- Sprachfläche beginnt Safe-Area-abhängig unterhalb der festen Kopfzeile
- Abstand zwischen Anweisung und Mikrofon vergrößert
- auf niedrigen Displays bleibt eine verdichtete Variante erhalten

### Render- und Vertragstests

- `tests/fast-voice-v27.test.mjs` prüft 1200-ms-Fallback, AbortController und iOS-Resume-Watchdog
- `tests/voice-layout-v26.test.mjs` prüft Safe-Area-Inset, ausgeblendeten Versionsstatus und getrennte Sprachbereiche
- `scripts/mobile-render-v27.mjs` prüft auf iPhone-Größe die reale Geometrie von Kopfzeile und Sprachfläche sowie den ausgeblendeten Versionsstatus
- der Render-Test behandelt PWA-Neuladungen robust und setzt seinen unpersönlichen Datenschutz-Erststartzustand deterministisch

### Finaler CI- und Merge-Stand PR #64

Finaler exakter Head: `6ddc93f7f1e22258132b741b80866c9615a2ea91`

- separate `Validate dark iPhone UI v27` Prüfung vollständig erfolgreich
- `Deploy DokoHilf` Validierung vollständig erfolgreich
- 165/165 Routingfälle bestanden
- 3/3 Gesprächssequenzen bestanden
- 12/12 bestätigte Workflow-Marker vorhanden
- 120/120 deterministische Tests bestanden
- iPhone-Render erfolgreich
- Live-Router erfolgreich
- dynamischer Voice-Fallback erfolgreich
- vorhandenes privates Guide-Audio erfolgreich geprüft
- exakter statischer Site-Build erfolgreich

PR #64 wurde ausschließlich auf diesem vollständig grünen Head manuell gemergt.

Merge-Commit: `d3f8d16956defeefa7d9a4d5cbbd76c63d03db9a`

Kein Auto-Merge und keine automatische Branch-Löschung.

## Statische Gacrux-Bibliothek: nachgelagerter Blocker

PR #64 enthielt zusätzlich die Migration `20260807093000_accelerate_static_guide_audio_builder.sql`, die den vorhandenen Builder vorübergehend von einmal pro Stunde auf einmal pro Minute beschleunigt. Nach dem Merge wurde diese Migration im freigegebenen DokoHilf-Supabase-Projekt angewendet und ein erster Builderlauf sofort angestoßen.

Dabei wurde ein weiterer, zuvor nicht sichtbarer serverseitiger Konflikt entdeckt:

- Index 4 der freigegebenen Bibliothek enthält den allgemeinen Guide-Text „Bestätige mit OK und kontrolliere, ob der Folgebericht beim Bewohner sichtbar ist.“
- Der öffentliche TTS-Datenschutzfilter bewertet bestimmte generische Rollenbegriffe absichtlich konservativ.
- Deshalb wurde dieser fest freigegebene Buildertext mit HTTP 422 blockiert, obwohl er keine konkreten Personendaten enthält.
- Der beschleunigte Cron wurde unmittelbar wieder deaktiviert, damit nicht jede Minute derselbe fehlgeschlagene Builderlauf erzeugt wird.

Wichtig: Der öffentliche Datenschutzfilter wird **nicht** gelockert.

## Sicherer Folgefix auf `fix/static-gacrux-builder-20260807`

### `supabase/functions/dokohilf-guide-audio-build/index.ts`

- der bereits serverseitig geschützte Builder reicht seinen vorhandenen internen Build-Token nun auch an `dokohilf-tts` weiter
- der Tokenwert selbst bleibt ausschließlich in der geschützten Datenbanktabelle und wird nicht in GitHub, Browsercode oder Dokumentation gespeichert

### `supabase/functions/dokohilf-tts/index.ts`

- neue Funktion `isTrustedStaticAudioBuilder()`
- ein interner Builderrequest gilt nur dann als vertrauenswürdig, wenn ein formal gültiger 64-stelliger Token vorliegt und dieser serverseitig gegen `dokohilf_internal_build_control` mit Service-Role-Zugriff und konstantzeitlichem Vergleich geprüft wurde
- nur dieser authentifizierte interne Builder darf den heuristischen Nutzertext-Filter und den öffentlichen Request-Rate-Limiter für die **bereits fachlich freigegebenen statischen Guide-Texte** umgehen
- alle normalen Browser-, Sprach- und Chat-TTS-Anfragen behalten den bisherigen Datenschutzfilter vollständig bei
- ein falscher, fehlender oder nicht mehr aktivierter Token erhält keinerlei Sonderbehandlung

### Neue Wiederanlauf-Migration

`supabase/migrations/20260807095000_resume_static_guide_audio_builder.sql`:

- aktiviert den Builder nur, solange weniger als 93 freigegebene Audios vorhanden sind
- entfernt einen eventuell noch vorhandenen alten Cronjob idempotent
- startet anschließend wieder genau einen Builderlauf pro Minute
- sobald 93/93 erreicht sind, deaktiviert der vorhandene Builder seine Steuerung selbst und entfernt den Cronjob

### Tests

`tests/prebuilt-guide-audio.test.mjs` prüft zusätzlich:

- Builder sendet nur den serverseitig gelesenen Token
- TTS validiert den Token serverseitig und konstantzeitlich
- Datenschutz- und Rate-Limit-Ausnahme hängt ausschließlich an `trustedStaticBuilder`
- keine Tokenkonstante landet in GitHub
- Wiederanlaufmigration enthält keinen geheimen Token

## Sicherheits- und Datenschutzgrenze

- keine Nutzerstimmen oder freien Sprachantworten werden gespeichert
- keine neuen Browser-Speicher eingeführt
- keine Nutzerbilder oder Screenshots übernommen
- Gacrux bleibt die bevorzugte natürliche Stimme
- statische Audios bleiben ausschließlich auf allgemeine fachlich freigegebene Guide-Texte begrenzt
- der öffentliche TTS-Datenschutzfilter bleibt unverändert streng
- interner Builder-Token bleibt ausschließlich serverseitig und wird weder in GitHub noch im Browser dokumentiert oder ausgegeben

## Nächste Veröffentlichungsschritte

1. Folge-PR gegen `main`
2. vollständige Prüfung des exakten Folge-PR-Heads
3. nur bei vollständig grünem exakten Head manueller Merge
4. danach `dokohilf-tts` und `dokohilf-guide-audio-build` aus exakt diesem gemergten Stand deployen
5. Wiederanlaufmigration im ausschließlich freigegebenen DokoHilf-Supabase-Projekt anwenden
6. mindestens einen zuvor blockierten allgemeinen Guide-Text erfolgreich als Gacrux-WAV aufbauen und Registry-Zuwachs nachweisen
7. `main`, `gh-pages` und öffentlichen Hauptlink prüfen
8. Abschlussstand erneut dauerhaft dokumentieren

Kein Auto-Merge und keine automatische Branch-Löschung.
