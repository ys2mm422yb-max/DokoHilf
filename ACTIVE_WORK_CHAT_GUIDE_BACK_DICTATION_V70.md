# Aktiver Arbeitsstand – Chat-Kontext, Schritt zurück und Diktat v70

**Stand:** 5. September 2026  
**Status:** PR #191 offen; noch nicht gemergt oder veröffentlicht  
**Branch:** `feature/chat-guide-back-dictation-v70-20260905`  
**PR:** #191 – Fix guide context, step back and chat dictation v70  
**Basis:** `main` `7b40bfcc4572cac9b7f78fd1aa63f394ccea641c`  
**Release-Ziel:** App-Version `v36`, Build `20260905-44`, Release `chat-guide-back-dictation-v70`

## Anlass

Im laufenden Direktguide konnte eine freie Ortsfrage wie **„Wo ist Doku erweitert“** durch die generische Schritthilfe abgefangen werden. Dadurch wurde der aktuelle Guide-Schritt wiederholt, obwohl für `Doku-Erweitert` bereits bestätigtes Orientierungswissen vorhanden ist. Zusätzlich war die sichtbare Aktion **„Hilfe zum Schritt“** redundant, während ein direkter Schritt-zurück-Weg hilfreicher ist. Das Mikrofon im normalen Schreibchat besaß zwar bereits eine einfache Browser-Diktat-Anbindung, gab bei Start-, Berechtigungs- oder Erkennungsproblemen aber praktisch keine sichtbare Rückmeldung.

## Technische Ursache

- `orientation-help-v29.js` besitzt den bestätigten Ortstext für `Doku-Erweitert` bereits.
- Bei aktivem Guide delegierte die bestehende Schicht eine hilfeartige Eingabe jedoch zuerst an die generische Smart-Help-Logik.
- `step-help-v54.js` erzeugt die sichtbare Aktion **„Hilfe zum Schritt“** und sendet dafür den generischen Befehl `ich finde das nicht`.
- `app.js` besitzt für `smallMicButton` eine einfache `SpeechRecognition`-/`webkitSpeechRecognition`-Anbindung, aber ohne sichtbaren Hörstatus und ohne verständliche Fehlerbehandlung.

## Umsetzung

Die neue, rein clientseitige Schicht `assets/chat-guide-ux-v70.js`:

1. priorisiert bei aktivem Guide ausschließlich **bestätigte Ortsfragen**, die `DokoHilfOrientationHelpV29` bereits beantworten kann;
2. erhält dabei Guide-Slug, Schritt und Schrittanzahl und markiert den Guide nicht als abgeschlossen;
3. verändert normale Schrittantworten nicht und erfindet keinen neuen Vivendi-Weg;
4. ersetzt die sichtbare alte Schritthilfe durch **„Schritt zurück“** und nutzt dafür den bestehenden bestätigten `zurück`-Befehl;
5. deaktiviert Schritt zurück beim ersten Schritt;
6. fängt das kleine Mikrofon im Schreibchat ab und schreibt erkannten Text nur in das Eingabefeld;
7. sendet Diktat niemals automatisch und wechselt nicht in den Sprachchat;
8. zeigt sichtbare Zustände für Zuhören, Übernahme und typische Fehler;
9. entfernt unmittelbar aufeinanderfolgende, wortgleiche Assistenten-Doppelblasen, ohne Wiederholungen nach einer neuen Benutzereingabe zu unterdrücken.

## PR-Regression und Ursachenbehebung

Auf einem früheren PR-Head scheiterte ausschließlich der mobile Feedback-Renderlauf mit einem `networkidle`-Timeout. Die Feedback-Vertragstests, Privacy-Prüfung und der Supabase-Typecheck waren dabei erfolgreich. Die Ursache lag in v70 selbst: Der versteckte alte Schritthilfe-Button wurde bei jedem DOM-Mutationsereignis erneut per `textContent` auf **„Schritt zurück“** gesetzt. Diese Textänderung erzeugte wiederum ein neues Mutationsereignis und konnte so eine Observer-Schleife auslösen.

Die Behebung setzt die Beschriftung jetzt **idempotent** nur dann, wenn sie tatsächlich noch abweicht. Der CI-Render-Test wurde nicht abgeschwächt oder umgangen.

## Fachliche und Datenschutz-Grenzen

- Keine neuen Vivendi-Menüs, Felder, Statuswerte oder Klickwege.
- Die Antwort auf **„Wo ist Doku erweitert“** stammt wortgleich aus der bestehenden bestätigten Orientierung.
- Der hörbare Ortstext liegt bereits im statischen `Supertonic-F1`-Navigationskatalog.
- Keine neue Sprachsynthese, keine System-/Browserstimme, kein Cloud-TTS und kein Bezahl-TTS.
- Die neue Mikrofonfunktion betrifft ausschließlich **Spracheingabe → Text** im Schreibchat und nutzt dieselbe Browser-Spracherkennungs-Schnittstelle, die DokoHilf bereits für Spracheingaben verwendet.
- Keine dauerhafte Browser-Speicherung durch v70.
- Keine Konten und keine realen Bewohner-, Mitarbeiter-, Personen-, Fall- oder Gesundheitsdaten.

## Tests

Neu beziehungsweise angepasst:

- `tests/chat-guide-back-dictation-v70.test.mjs`
  - aktiver Visite-Guide, Schritt 2/11 + `Wo ist Doku erweitert` → bestätigte Orientierung, Schritt bleibt 2;
  - normale Schrittantwort bleibt im bestehenden Routing;
  - ohne aktiven Guide keine ungewollte v70-Übernahme;
  - sichtbare Aktion `Schritt zurück` nutzt bestehenden `zurück`-Befehl;
  - Diktat schreibt in das Textfeld, sendet nicht automatisch und nutzt keine TTS-Ausgabe;
  - verständliche Diktat-Fehlerzustände;
  - v36/v70-Version und Offline-Einbindung.
- `tests/chat-guide-static-voice-v70.test.mjs`
  - bestätigter Doku-Erweitert-Ortstext ist im `Supertonic-F1`-Navigationskatalog vorhanden.
- `tests/chat-guide-observer-idempotence-v70.test.mjs`
  - wiederholte Synchronisierung von **„Schritt zurück“** darf `textContent` nicht erneut schreiben und damit keine MutationObserver-Schleife erzeugen.
- `tests/v69-install-full-qa.test.mjs`
  - bestehende v69-PWA-Funktion bleibt als Regression im neuen Build erhalten.

## Release-Prozess

Erledigt:

1. PR #191 wurde aus dem eigenen Branch gegen `main` eröffnet.
2. Ein erster roter mobiler Feedback-Renderlauf wurde nicht übergangen, sondern auf die v70-Observer-Schleife zurückgeführt und mit eigener Regression behoben.

Noch offen und verpflichtend:

1. Alle tatsächlich ausgelösten Pflichtprüfungen auf exakt demselben finalen PR-Head erfolgreich abschließen, einschließlich iOS-/Android-Prüfungen und statischer Sprache.
2. Erst danach manueller Merge mit erwartetem Head-SHA; kein Auto-Merge und keine Branch-Löschung.
3. Keine Supabase-Migration und kein Edge-Function-Deploy vorgesehen, solange die Prüfungen keinen serverseitigen Änderungsbedarf zeigen.
4. Nach Merge den exakten Main-Deploy, `gh-pages`, GitHub Pages und die öffentliche App prüfen.
5. Erst nach dieser Prüfung den Release als veröffentlicht/fertig dokumentieren.
