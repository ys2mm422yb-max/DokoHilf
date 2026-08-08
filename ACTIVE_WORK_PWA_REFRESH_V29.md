# DokoHilf – Active Work: v29 PWA refresh

**Status:** aktiv / Releaseblock nicht fertig  
**Stand:** 9. August 2026, ca. 00:56 CEST  
**PR:** #105 `Force installed PWA to refresh to guide library`  
**Branch:** `fix/v29-force-pwa-refresh-20260809`  
**Base:** `main` nach Merge von PR #104 (`8b5048bff4a40a74f05cfae45b949d91d1d30bbe`)

> Diese Datei beschreibt den aktuell offenen Releaseblock. Vor Arbeit immer den tatsächlichen PR-Head und die aktuellen Actions live prüfen; SHA-Angaben hier sind nur Übergabestand.

## 1. Warum PR #105 existiert

Nach PR #104 waren die neue Guide-Bibliothek und die fachlichen Änderungen im Repository bzw. in Supabase vorhanden, auf einem real installierten iPhone erschien aber weiterhin die alte Startsektion `HÄUFIGE ABLÄUFE · DIREKT ÖFFNEN`.

Die öffentliche Build-ID war über mehrere UI-Releases unverändert `20260808-29`. Eine bereits installierte iOS-PWA konnte deshalb den alten Shell-/Service-Worker-Zustand weiterhin als aktuell behandeln, obwohl neue Dateien bereits auf `gh-pages` lagen.

Ziel von PR #105 ist deshalb ein **echter PWA-Versionswechsel** auf Build `20260809-29`, so dass ein alter installierter Client den Unterschied erkennt, alte DokoHilf-Shell-Caches verlässt und die neue Guide-Bibliothek lädt.

## 2. Erwarteter Zielzustand

Nach erfolgreichem Merge und Publish müssen konsistent sein:

- `version.json`: `buildId = 20260809-29`
- `index.html`: Meta-Build-ID `20260809-29`
- `service-worker.js`: `BUILD_ID = '20260809-29'`
- aktive Asset-URLs: aktuelle Build-ID als Querystring
- neuer Shell-Cache / neue Cache-Revision
- Guide-Bibliotheksassets im veröffentlichten Shell
- bestehende Voice-, Detailhilfe- und Icon-Hotfixes bleiben erhalten

Das reale iPhone muss danach statt der alten starren Startkarten die neue Struktur zeigen:

- `Häufig genutzt`
- lokale nutzungsabhängige Sortierung
- passende unterschiedliche SVG-Icons
- `Alle Anleitungen anzeigen`
- vollständige Guide-Bibliothek für alle fertigen Guides
- Berichtssuche weiterhin nur Draft / später zu überarbeiten

## 3. Bereits erledigte Teile innerhalb von #105

Auf dem PR-Branch sind bereits mehrere alte Build-ID-Abhängigkeiten auf den deklarierten Build umgestellt:

- `version.json` steht auf `20260809-29`
- `scripts/apply-detail-help-v27.mjs` liest `buildId` dynamisch aus `version.json`
- `scripts/apply-local-voice-v28.mjs` liest `buildId` dynamisch aus `version.json`
- `scripts/build-static-site-v27.sh` liest `buildId` dynamisch aus `version.json`
- mehrere alte Tests wurden auf die aktuelle bzw. deklarierte Build-ID umgestellt
- `tests/pwa-build-id-sync.test.mjs` sichert die Synchronität von Index, `version.json` und Service Worker ab

Der Exact-Head-Workflow war auf dem zuletzt geprüften PR-Head erfolgreich.

## 4. Aktuell noch offene technische Blocker

Beim letzten Live-Check des PR-Heads `4baa6ba5c7c0280b474ab6d756cc82e7b6e64820` waren 3 von 8 Workflows grün und 5 rot:

**grün:**
- Validate exact PR head
- Context and Voice Hotfix v28
- Validate context-aware guide help v28

**rot:**
- Deploy DokoHilf
- Validate dark iPhone UI v27
- Validate detailed help iOS Android
- Validate local voice v28 iOS Android
- Validate report conditional iOS Android

Die roten mobilen Workflows sind Folge des noch inkonsistenten Release-/Buildpfads, nicht eine Freigabe zum Mergen.

### 4.1 `.github/workflows/pages.yml`

Die Release-Pipeline enthält aktuell noch alte hart kodierte Prüfungen auf `20260808-29`, unter anderem:

- `grep -q "BUILD_ID = '20260808-29'" assets/local-voice-v28.js`
- `grep -q '20260808-29' version.json`

Diese Checks müssen gegen die deklarierte aktuelle Build-ID laufen, idealerweise aus `version.json` ermittelt. Künftige Buildwechsel dürfen nicht wieder manuell viele Workflow-Greps brechen.

### 4.2 `assets/local-voice-v28.js`

Aktuell steht dort noch:

`const BUILD_ID = '20260808-29';`

Das muss mit dem neuen Release synchronisiert werden. Die lokale Supertonic-Logik und der bestehende Modellcache dürfen dabei nicht beschädigt werden.

### 4.3 `assets/local-voice-gate-v28.js`

Aktuell steht dort noch:

`const STATIC_AUDIO_MANIFEST = './assets/guide-audio-catalog.json?v=20260808-29';`

Auch diese Manifest-Referenz muss auf den aktuellen Release abgestimmt werden, damit neuer Textkatalog und statische WAVs nicht mit einer alten Asset-Revision vermischt werden.

### 4.4 Gesamtrepository nach alter Build-ID prüfen

Vor dem finalen Head das gesamte aktive Releasepfad-Repository nach `20260808-29` durchsuchen und jeden Treffer klassifizieren:

- historische Dokumentation: darf ggf. bleiben
- aktiver Code/Asset-URL: auf aktuelle Build-ID umstellen
- Test: möglichst dynamisch gegen `version.json`
- Workflow: dynamisch gegen `version.json`
- Buildscript: dynamisch

Ziel ist nicht nur #105 grün zu machen, sondern den Build-ID-Wechsel dauerhaft wartbar zu machen.

## 5. Aktueller Live-Zustand

`gh-pages/version.json` wurde am 9. August 2026 erneut geprüft und liefert **noch**:

- `buildId = 20260808-29`
- Release `smart-help-voice-ui-v29`

Das Update `20260809-29` ist daher **noch nicht live**. Dem Nutzer darf bis zur erneuten Live-Verifikation nicht gesagt werden, die neue Guide-Bibliothek sei auf dem realen iPhone ausgeliefert.

## 6. Fachlicher Stand aus PR #104 / Supabase

PR #104 ist bereits gemergt. Die zugehörigen fachlichen Supabase-Änderungen sind produktiv und sollen durch #105 nicht neu erfunden oder zurückgebaut werden.

Am 9. August 2026 live in Supabase geprüft:

- `bericht-durchstreichen`: approved, Version 7
- `bericht-folgebericht`: approved, Version 4
- `visite-anlegen`: approved, Version 8
- `vitalwerte-einzelwert`: approved, Version 4
- `vitalwerte-sammelerfassung`: approved, Version 4
- `berichtssuche`: **draft**, Version 4

Fachliche Regeln:

### Bericht korrigieren
Ein falsch formulierter / verschriebener bestehender Bericht wird durchgestrichen. Ein Folgebericht korrigiert den Text nicht. Bei Bedarf wird danach ein neuer korrekter Bericht angelegt.

### Folgebericht
Ein neuer Bericht mit Bezug auf ein bereits dokumentiertes Geschehen; ergänzt oder führt dieses fort, verändert den ursprünglichen Bericht aber nicht.

### Visite
Normaler Schritt: beim Bewohner hinterlegten durchführenden Arzt auswählen. Nur wenn dieser dort fehlt, das kleine Filtersymbol rechts neben der Arztauswahl aktivieren und aus allen systemweit hinterlegten Ärzten wählen. Dieser Fall ist als visueller **Sonderfall** darzustellen. Ortsoptionen: Einrichtung, beim Arzt, telefonisch, per Mail.

### Vitalwerte
Bestätigte Beispiele: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz, Atemalkohol. Bei Blutdruck Systole und Diastole. Je nach Vitalwert erscheinen passende Eingabefelder. Keine nicht bestätigten Einheiten oder Zusatzfelder erfinden.

### Berichtssuche
Issue #103 bleibt offen. Die Anleitung `Analyse → Abfrage` ist nicht final bestätigt und bleibt Draft / `kommt später`. Keine zusätzliche Fachlogik oder Sprache dafür veröffentlichen, bis der Ablauf gemeinsam neu geprüft wurde.

## 7. Guide-Bibliothek / UI-Ziel aus #104

Die neue Bibliothek soll enthalten:

1. `Häufig genutzt` statt nur einer starren Liste; Sortierung lokal anhand anonymer Guide-Nutzungszähler.
2. `Alle Anleitungen anzeigen` für die vollständige Übersicht aller fertigen Guides.
3. Eigene fachlich passende Icons je Guide, z. B. Visite = Stethoskop, Vitalwerte = Herz/Puls, Bericht = Dokument, Korrektur = Dokument/Korrektur, Folgebericht = Dokument/Verknüpfung, Medikation = Medikament, Formular = Formular/Liste, Übergabe = Pfeile/Übergabe.
4. Dasselbe Guide-Icon muss in `Häufig genutzt` und `Alle Anleitungen` identisch sein.
5. Direktguide-Header/Safe-Area darf auf iPhone und Android Titel, Zurück-Pfeil oder Schritte nicht überdecken.

## 8. Voice / kostenlose Ausgabe

- Supertonic F1 bleibt die einzige reguläre DokoHilf-Stimme.
- 160 bestätigte statische Sätze werden im vollständigen Release gebaut.
- Keine kostenpflichtige Cloud-TTS-Lösung einführen.
- Kein Rückfall auf alte System-/Gerätestimme als normalen Pfad.
- Bestehende Live-Voice-/Detailhilfe-Hotfixes beim Publish nicht blind überschreiben.
- Sichtbarer Text und gesprochener Text müssen fachlich identisch und natürlich formuliert sein.

## 9. Nächster ausführbarer Schritt

1. aktuellen PR #105 / aktuellen Head live lesen; niemals von einer alten SHA ausgehen.
2. alle aktiven `20260808-29`-Treffer im Releasepfad klassifizieren.
3. `.github/workflows/pages.yml` build-dynamisch machen.
4. `assets/local-voice-v28.js` mit dem neuen Build synchronisieren.
5. `assets/local-voice-gate-v28.js` Manifest-Revision synchronisieren.
6. relevante Render-/Release-Workflows ebenfalls von alten festen Build-ID-Greps befreien.
7. neuen exakten PR-Head erzeugen.
8. **alle 8 Workflows auf genau diesem Head** vollständig grün bekommen.
9. erst dann PR #105 mit erwartetem Head mergen.
10. Main-Publish beobachten.
11. `gh-pages` live prüfen: `version.json`, `index.html`, Service Worker, Guide-Bibliothek, Icons, Voice-Assets.
12. reale Geräteabnahme: installiertes iPhone muss die neue Bibliothek tatsächlich anzeigen.

## 10. Merge-/Live-Regel

- Kein Merge, solange auch nur ein Pflichtworkflow rot oder laufend ist.
- Tests nicht schwächen, um grün zu werden; Ursache beheben.
- Nach jeder Codeänderung zählt nur der neue exakte Head.
- PR-Publish ist nicht mit realem `gh-pages`-Livezustand gleichzusetzen.
- Nicht `live` behaupten, solange `gh-pages` nicht konkret den neuen Build ausliefert.
- Wenn automatischer Publish hängt, nur gezielt nachziehen und bestehende Live-Hotfixes erhalten.
