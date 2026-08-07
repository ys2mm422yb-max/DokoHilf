# DokoHilf – Sprachlatenz und iPhone-Sprachlayout

**Status:** In Umsetzung  
**Stand:** 7. August 2026  
**Branch:** `fix/voice-latency-layout-20260807`

## Nutzerbeobachtung

Im veröffentlichten Build 27 ist das dunkle Sprachdesign deutlich verbessert, auf dem iPhone treten aber noch zwei konkrete Probleme auf:

1. Elemente der Sprachansicht können sich im oberen Bereich überlagern beziehungsweise unter die feste Kopfzeile rutschen.
2. Nach einer gesprochenen Nutzereingabe bleibt die Oberfläche teilweise mehrere Sekunden auf dem Startzustand der Stimme stehen; vereinzelt beginnt anschließend überhaupt keine hörbare Sprachausgabe.

Die vom Nutzer zur Beurteilung gezeigte Oberfläche bleibt gemäß Projektregel ausschließlich im Chat. Dieses Dokument enthält nur anonymisierte technische Erkenntnisse.

## Live-Diagnose

Am 7. August 2026 wurden die aktuellen Supabase-Edge-Function-Logs des ausschließlich für DokoHilf freigegebenen Projekts geprüft.

Ergebnis:

- `dokohilf-ai-router` antwortet bei den beobachteten Aufrufen typischerweise innerhalb weniger hundert Millisekunden.
- `dokohilf-guide-audio` liefert vorhandene statische Audios beziehungsweise das Manifest im Bereich von grob 0,2 bis 1,1 Sekunden.
- `dokohilf-tts` v20 benötigte bei erfolgreichen aktuellen Aufrufen unter anderem etwa 6,5 Sekunden, 8,7 Sekunden und 13,5 Sekunden.
- Zusätzlich traten aktuelle HTTP-429-Antworten des TTS-Pfads auf.
- In `public.dokohilf_static_guide_audio` sind für Build `20260806-27` derzeit 4 von 93 vorgesehenen statischen Audios registriert. Daher fallen die meisten freigegebenen Schritte weiterhin auf Live-TTS zurück.

Damit ist die wahrgenommene Wartezeit real und nicht nur eine irreführende Ladeanimation.

## Technische Ursachen

### Sprachstart

`assets/app.js` wartet auf den vollständigen WAV-Response der natürlichen Gacrux-Stimme. Die Build-27-Schichten besitzen bereits einen Fallback, dieser lag aber bei 1,9 Sekunden und die iOS-Systemstimme kann nach dem Fallback selbst in einem pausierten `speechSynthesis`-Zustand hängen bleiben.

### Layout

Die feste Kopfzeile berücksichtigt `env(safe-area-inset-top)`, die feste `voice-focus-stage` begann dagegen mit einem statischen oberen Inset. Dadurch konnte die Sprachfläche unter der Kopfzeile beginnen. Zusätzlich blieb der allgemeine Versionsstatus im Sprachmodus sichtbar und konnte in den oberen iOS-Bereich rutschen. Der Abstand zwischen Anweisung und Mikrofon war für die außenliegenden Mikrofonringe zu knapp.

## Umgesetzte Änderungen auf dem Arbeitsbranch

### `assets/ux-v27.js`

- harter Sprachfallback von 1900 ms auf 1200 ms verkürzt
- langsame TTS-Anfrage wird beim Fallback über `AbortController` abgebrochen
- natürliche Gacrux-Stimme bleibt bevorzugt, wenn statisches oder dynamisches Audio rechtzeitig verfügbar ist
- iOS-`speechSynthesis` erhält einen Resume-Watchdog mit mehreren kurzen Wiederholungen, damit die Sofortstimme nach dem Fallback tatsächlich startet
- Statushinweis erklärt die automatische Sofortstimme klarer
- keine neue persistente Speicherung

### `assets/ux-v27.css`

- allgemeiner Versionsstatus wird im fokussierten Sprachmodus ausgeblendet
- Sprachfläche beginnt Safe-Area-abhängig unterhalb der festen Kopfzeile
- Abstand zwischen Anweisung und Mikrofon vergrößert
- auf niedrigen Displays bleibt eine verdichtete Variante erhalten

### Tests

- `tests/fast-voice-v27.test.mjs` prüft 1200-ms-Fallback, AbortController und iOS-Resume-Watchdog
- `tests/voice-layout-v26.test.mjs` prüft Safe-Area-Inset, ausgeblendeten Versionsstatus und getrennte Sprachbereiche

## Sicherheits- und Datenschutzgrenze

- keine Nutzerstimmen oder freien Sprachantworten werden gespeichert
- keine neuen Browser-Speicher eingeführt
- keine Nutzerbilder oder Screenshots übernommen
- Gacrux bleibt die bevorzugte natürliche Stimme
- statische Audios bleiben ausschließlich auf allgemeine freigegebene Guide-Texte begrenzt

## Veröffentlichung

Noch nicht veröffentlicht. Vor Merge erforderlich:

1. Pull Request gegen `main`
2. vollständige Prüfung des exakten PR-Heads einschließlich mobiler Renderprüfung
3. nur bei vollständig grünem exakten Head manueller Merge
4. danach `main`, `gh-pages` und festen öffentlichen Hauptlink prüfen

Kein Auto-Merge und keine automatische Branch-Löschung.
