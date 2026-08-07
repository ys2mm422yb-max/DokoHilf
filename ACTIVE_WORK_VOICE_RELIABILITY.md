# DokoHilf – Sprachlatenz und iPhone-Sprachlayout

**Status:** Abgeschlossen und veröffentlicht; statische Gacrux-Bibliothek baut sich kontrolliert weiter auf  
**Stand:** 7. August 2026  
**Client-/Layout-PR:** #64  
**Server-/Builder-PR:** #65

## Nutzerbeobachtung

Im veröffentlichten Build 27 war das dunkle Sprachdesign deutlich verbessert, auf dem iPhone traten aber noch zwei konkrete Probleme auf:

1. Elemente der Sprachansicht konnten sich im oberen Bereich überlagern beziehungsweise unter die feste Kopfzeile rutschen.
2. Nach einer gesprochenen Nutzereingabe blieb die Oberfläche teilweise mehrere Sekunden auf dem Startzustand der Stimme stehen; vereinzelt begann anschließend überhaupt keine hörbare Sprachausgabe.

Die vom Nutzer zur Beurteilung gezeigte Oberfläche bleibt gemäß Projektregel ausschließlich im Chat. Dieses Dokument enthält nur anonymisierte technische Erkenntnisse.

## Live-Diagnose vom 7. August 2026

- `dokohilf-ai-router` antwortete bei den beobachteten Aufrufen typischerweise innerhalb weniger hundert Millisekunden.
- `dokohilf-guide-audio` lieferte vorhandene statische Audios beziehungsweise das Manifest grob im Bereich 0,2 bis 1,1 Sekunden.
- `dokohilf-tts` v20 benötigte bei erfolgreichen aktuellen Aufrufen unter anderem etwa 6,5 Sekunden, 8,7 Sekunden und 13,5 Sekunden.
- Zusätzlich traten echte HTTP-429-Antworten des TTS-Providers auf.
- Die statische Gacrux-Bibliothek stand bei Beginn der Diagnose erst bei 4/93 Einträgen.

Die wahrgenommene Wartezeit war damit real und nicht nur eine Ladeanimation.

## Produktfix PR #64 – Client und iPhone-Layout

Finaler exakter Head: `6ddc93f7f1e22258132b741b80866c9615a2ea91`  
Merge-Commit: `d3f8d16956defeefa7d9a4d5cbbd76c63d03db9a`

### Sprachstart

`assets/ux-v27.js`:

- harter dynamischer TTS-Fallback von 1900 ms auf **1200 ms** verkürzt
- langsame dynamische TTS-Anfrage wird beim Fallback mit `AbortController` abgebrochen
- Gacrux bleibt bevorzugt, wenn statisches oder dynamisches Audio rechtzeitig verfügbar ist
- iOS-`speechSynthesis` erhält einen Resume-Watchdog, damit die lokale Sofortstimme nach dem Fallback nicht stumm in einem pausierten Zustand hängen bleibt
- Statushinweis erklärt die automatische Sofortstimme klarer
- keine neue persistente Speicherung

### iPhone-Layout

`assets/ux-v27.css`:

- allgemeiner Versionsstatus im fokussierten Sprachmodus ausgeblendet
- Sprachfläche beginnt Safe-Area-abhängig unterhalb der festen Kopfzeile
- Abstand zwischen Anweisung und Mikrofon vergrößert
- verdichtete Variante für niedrige Displays bleibt erhalten

### Tests und Veröffentlichung

Finaler PR-Head war vollständig grün:

- separate `Validate dark iPhone UI v27` Prüfung erfolgreich
- `Deploy DokoHilf` Validierung erfolgreich
- 165/165 Routingfälle bestanden
- 3/3 Gesprächssequenzen bestanden
- 12/12 bestätigte Workflow-Marker vorhanden
- 120/120 deterministische Tests bestanden
- iPhone-Render erfolgreich
- Live-Router erfolgreich
- dynamischer Voice-Fallback erfolgreich
- privates Guide-Audio erfolgreich geprüft
- exakter statischer Site-Build erfolgreich

`gh-pages/assets/ux-v27.js` wurde nach Merge mit `HARD_FALLBACK_MS = 1200` geprüft.  
`gh-pages/assets/ux-v27.css` wurde mit ausgeblendeter `.build-status`, Safe-Area-Inset und getrenntem Sprachlayout geprüft.

Kein Auto-Merge; Branch nicht automatisch gelöscht.

## Nachgelagerter statischer Audio-Blocker

PR #64 beschleunigte den vorhandenen statischen Builder zunächst von einmal pro Stunde auf einmal pro Minute. Beim ersten Live-Lauf blieb Index 4 mit HTTP 422 hängen.

Grund:

- Index 4 ist ein allgemeiner, fachlich freigegebener Guide-Text.
- Der öffentliche TTS-Datenschutzheuristikfilter erkennt bestimmte Rollenbegriffe absichtlich konservativ.
- Der Builder nutzte denselben öffentlichen Filterpfad wie freie Nutzertexte.

Der Minuten-Cron wurde sofort wieder deaktiviert, bis ein sicherer serverseitiger Sonderpfad vorlag. Der öffentliche Datenschutzfilter wurde **nicht** gelockert.

## Produktfix PR #65 – sicherer Gacrux-Builder

Finaler exakter Head: `affff5b53b0ae1a5f0b97688b5a6b49d78bd94a1`  
Merge-Commit: `6afc9267756b5fa1617b8b067f246598a44bd90a`

`Deploy DokoHilf` Run #256 war auf diesem exakten Head vollständig erfolgreich.

### `dokohilf-guide-audio-build`

- Builder reicht seinen bereits vorhandenen **serverseitig gelesenen** internen Build-Token an `dokohilf-tts` weiter
- kein Tokenwert liegt im Repository, Browsercode oder in dieser Dokumentation

### `dokohilf-tts`

- neue Funktion `isTrustedStaticAudioBuilder()`
- Sonderbehandlung nur bei formal gültigem 64-stelligem Token
- Token wird serverseitig mit Service-Role-Zugriff gegen `dokohilf_internal_build_control` geprüft
- Vergleich erfolgt konstantzeitlich
- nur dieser authentifizierte interne Builder darf für bereits freigegebene statische Guide-Texte den Nutzertext-Heuristikfilter und den öffentlichen Request-Rate-Limiter umgehen
- Browser-, Chat- und normale Sprach-TTS-Anfragen behalten den bestehenden Datenschutzfilter unverändert

### Live-Deployment

Nach Merge wurden exakt die gemergten Funktionen veröffentlicht:

- `dokohilf-tts` **v21**
- `dokohilf-guide-audio-build` **v3**

Beide sind im ausschließlich freigegebenen Projekt `efifbuqctylsujiauabg` aktiv.

### Wiederanlaufmigration

`supabase/migrations/20260807095000_resume_static_guide_audio_builder.sql` wurde live angewendet.

Aktive Regel:

- ein allgemeiner freigegebener Gacrux-Text pro Minute
- nur solange weniger als 93 Einträge existieren
- bei 93/93 deaktiviert der bestehende Builder seine Steuerung und entfernt den Cron selbst
- keine Nutzerstimmen, Diktate oder freien Antworten werden vorgebaut

Live geprüft: Cronjob `dokohilf-static-guide-audio-v27` ist aktiv mit `* * * * *`.

## Live-Nachweis des sicheren Builders

Der zuvor blockierte Index 4 wurde nach Deployment erneut angestoßen:

- HTTP 200
- Status `created`
- Registry-Zuwachs von 4 auf 5

Damit ist nachgewiesen, dass der authentifizierte Builder den freigegebenen allgemeinen Text erzeugen kann, ohne den öffentlichen Datenschutzfilter zu lockern.

Zusätzlich wurde der vom Nutzer aktuell gezeigte Visiten-Schritt priorisiert:

- Katalogindex 33: `Öffne „Doku-Erweitert“ und wähle „Visiten“.`
- erster unmittelbarer Versuch traf einen echten Provider-429
- späterer kontrollierter Versuch war erfolgreich
- Index 33 ist als statisches Gacrux-Audio registriert

Letzter Live-Bestand bei Abschlussprüfung: **7/93** mit den Indizes `0,1,2,3,4,5,33`. Diese Zahl ist veränderlich und muss künftig live geprüft werden, weil der Builder weiterläuft.

## Warum die Nutzererfahrung jetzt besser ist

Für bekannte Schritte gibt es drei Ebenen:

1. Bereits vorhandenes statisches Gacrux-Audio startet ohne erneute Live-TTS-Erzeugung.
2. Falls ein Text noch nicht statisch vorhanden ist, darf dynamisches Gacrux nur kurz auf sich warten lassen.
3. Nach 1,2 Sekunden übernimmt die lokale Sofortstimme; der iOS-Watchdog sorgt dafür, dass sie tatsächlich startet.

Damit blockiert eine 6–13 Sekunden langsame oder rate-limitierte Live-TTS-Anfrage den Sprachdialog nicht mehr minutenlang oder stumm.

## Sicherheits- und Datenschutzgrenze

- keine Nutzerstimmen oder freien Sprachantworten werden gespeichert
- keine neuen Browser-Speicher eingeführt
- keine Nutzerbilder oder Screenshots übernommen
- Gacrux bleibt die bevorzugte natürliche Stimme
- statische Audios bleiben ausschließlich auf allgemeine fachlich freigegebene Guide-Texte begrenzt
- öffentlicher TTS-Datenschutzfilter bleibt unverändert streng
- interner Builder-Token bleibt ausschließlich serverseitig

## Nächster Produktblock

Dieser Sprach-/Layout-Arbeitsblock ist abgeschlossen. Der nächste bereits dokumentierte Produktblock bleibt:

`ACTIVE_WORK_DETAIL_HELP.md` – detaillierte Hilfeschleife für **„Ich brauche Hilfe / Ich finde das nicht“**.

Vor Beginn trotzdem immer den aktuellen GitHub-, Actions-, Pages-, Supabase- und statischen Audio-Bestand live prüfen.
