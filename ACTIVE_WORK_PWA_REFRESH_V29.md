# DokoHilf – Active Work: v29 PWA refresh

**Status:** aktiv / Freigabe erst nach 8 grünen Pflichtworkflows  
**Stand:** 9. August 2026  
**PR:** #105 `Force installed PWA to refresh to guide library`  
**Branch:** `fix/v29-force-pwa-refresh-20260809`  
**Base:** `main` nach Merge von PR #104 (`8b5048bff4a40a74f05cfae45b949d91d1d30bbe`)

> Vor jeder Fortsetzung tatsächlichen PR-Head, Actions, `main` und `gh-pages` live prüfen. SHA- und CI-Angaben in dieser Datei sind nur der zuletzt dokumentierte Stand.

## 1. Ursache und Ziel

Nach PR #104 waren Guide-Bibliothek und fachliche Änderungen in Repository/Supabase vorhanden, ein real installiertes iPhone zeigte aber weiterhin die alte Startsektion `HÄUFIGE ABLÄUFE · DIREKT ÖFFNEN`.

Die öffentliche Build-ID war über mehrere UI-Releases unverändert `20260808-29`. Dadurch konnte die installierte iOS-PWA ihren alten Shell-/Service-Worker-Zustand weiterhin als aktuell behandeln.

PR #105 erzwingt deshalb den echten Versionswechsel auf `20260809-29`.

Erwarteter veröffentlichter Zustand:

- `version.json`: `20260809-29`
- `index.html`: Meta-Build-ID `20260809-29`
- `service-worker.js`: `BUILD_ID = '20260809-29'`
- aktive Asset-URLs auf derselben Build-ID
- neue Shell-/Cache-Revision
- Guide-Bibliothek samt Icons im veröffentlichten Build
- Voice-, Detailhilfe- und bestehende Hotfixes bleiben erhalten

## 2. Dauerhafte Build-ID-Reparatur in #105

Der aktuelle Reparaturstand beseitigt nicht nur die eine alte ID, sondern die aktive Mehrfachpflege derselben Datumskonstante:

- `scripts/apply-detail-help-v27.mjs` liest `buildId` aus `version.json`.
- `scripts/apply-local-voice-v28.mjs` liest `buildId` aus `version.json`.
- `scripts/build-static-site-v27.sh` liest `buildId` aus `version.json`.
- `.github/workflows/pages.yml` liest die Build-ID aus `version.json` und prüft Index + Service Worker dagegen.
- `.github/workflows/ui-validation-v27.yml` prüft die gebaute Meta-Build-ID dynamisch.
- `.github/workflows/detail-help-mobile.yml` prüft die Release-Asset-URLs dynamisch.
- `.github/workflows/local-voice-v28-mobile.yml` prüft die Voice-Asset-URLs dynamisch.
- `.github/workflows/report-conditional-mobile-v28.yml` prüft das gebaute `version.json` dynamisch.
- `assets/local-voice-v28.js` liest seine Build-ID aus dem ausgelieferten `dokohilf-build`-Meta-Tag.
- `assets/local-voice-gate-v28.js` bildet die Revision des statischen Audio-Manifests aus derselben Build-ID.
- `tests/local-voice-v28.test.mjs` prüft den dynamischen Vertrag, nicht ein festes Release-Datum.
- `tests/pwa-build-id-sync.test.mjs` sichert die Synchronität von Index, `version.json`, Service Worker und Guide-Library-Revision ab.

Historische Erwähnungen von `20260808-29` in Fehler-/Übergabedokumentation dürfen bleiben. Revisionsnamen wie `20260808-context-voice-v29-1` und `20260808-smart-help-voice-ui-v29-1` sind eigenständige Hotfix-Revisionskennungen und keine aktuelle Build-ID.

## 3. Letzter analysierter Fehlerstand vor dieser Reparatur

Auf Head `79cca12c5fb1c813c01678c7170e9628a39ece26` waren nur zwei der acht Pflichtworkflows grün:

**grün:**
- Context and Voice Hotfix v28
- Validate context-aware guide help v28

**rot:**
- Validate exact PR head
- Deploy DokoHilf
- Validate dark iPhone UI v27
- Validate detailed help iOS Android
- Validate local voice v28 iOS Android
- Validate report conditional iOS Android

Die roten Render-/Releasejobs brachen an alten festen `20260808-29`-Prüfungen ab, obwohl der statische Site-Build bereits `20260809-29` erzeugte.

Der Exact-Head-Workflow hatte zusätzlich drei Dokumentationsregressionen: etablierte Account-/Test-/Publikationsformulierungen waren beim Handoff-Umbau verkürzt worden. Die Formulierungen wurden wiederhergestellt; die Tests werden dafür nicht abgeschwächt.

## 4. Live-/Supabase-Stand vor Merge

`gh-pages/version.json` lieferte beim letzten Check weiterhin `20260808-29`. Daher ist `20260809-29` vor erfolgreichem Merge/Publish ausdrücklich **nicht live**.

Supabase-Projekt `efifbuqctylsujiauabg` ist fachlich bereits auf dem Stand von PR #104:

- `bericht-durchstreichen`: approved v7
- `bericht-folgebericht`: approved v4
- `visite-anlegen`: approved v8
- `vitalwerte-einzelwert`: approved v4
- `vitalwerte-sammelerfassung`: approved v4
- `berichtssuche`: draft v4

Für den PWA-Refresh selbst ist keine neue Supabase-Migration erforderlich.

## 5. Fachliche Grenzen für die Abnahme

- Bericht korrigieren = vorhandenen falschen Bericht durchstreichen; Folgebericht ist keine Korrektur.
- Folgebericht = neuer ergänzender/fortführender Bericht zu bestehendem Geschehen.
- Visite Schritt 8: hinterlegten Arzt normal auswählen; Filtersymbol nur als Sonderfall, wenn der Arzt dort fehlt.
- Visite Schritt 12: Einrichtung / beim Arzt / telefonisch / per Mail.
- Vitalwerte: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz, Atemalkohol; Blutdruck mit Systole + Diastole; keine unbestätigten Einheiten erfinden.
- Berichtssuche / Issue #103 bleibt Draft und wird nicht fachlich ausgebaut.
- Guide-Header darf auf iOS/Android nicht vom DokoHilf-Header überdeckt werden.

## 6. Guide-Bibliothek / reales Ziel

Nach Publish muss die Startansicht enthalten:

- `Häufig genutzt`
- lokale anonyme Nutzungssortierung
- individuelle SVG-Icons
- `Alle Anleitungen anzeigen`
- vollständige Liste aller fertigen Guides
- gleiche Anleitung = gleiches Icon in beiden Ansichten

Das reale installierte iPhone ist das abschließende Geräte-Endkriterium. CI und `gh-pages` müssen vorher technisch nachweisen, dass der neue Build tatsächlich ausgeliefert wird.

## 7. Voice

- Supertonic F1 bleibt die reguläre kostenlose Stimme.
- vollständiger Releasebuild: 160 bestätigte statische Sprachsätze
- kein kostenpflichtiges Cloud-TTS
- keine System-/Gerätestimme als regulärer Fallback
- bestehende Live-Voice-/Detailhilfe-Hotfixes beim Publish nicht blind überschreiben

## 8. Nächste Freigabeschritte

1. den Reparatur-Commit als neuen exakten PR-Head setzen.
2. alle acht Pflichtworkflows exakt auf diesem Head prüfen.
3. jeden Fehler an der Ursache beheben und danach wieder einen vollständig neuen Head prüfen.
4. erst bei 8/8 grün mit `expected_head_sha` mergen.
5. Main-Workflow vollständig prüfen.
6. `gh-pages` live verifizieren: `version.json`, Index, Service Worker, Guide-Library-Dateien, Icons, Voice-Assets und relevante Guide-Inhalte.
7. nur falls automatischer Publish hängt gezielt nachziehen; vorhandene Live-Hotfixes erhalten.
8. Nutzer danach am real installierten iPhone die neue Startansicht abnehmen lassen.

## 9. Merge-/Live-Regel

- kein Merge bei rot/laufend
- Tests nicht schwächen
- nur derselbe exakte grüne Head zählt
- PR-Build ist nicht `gh-pages`-Livezustand
- `live` erst nach konkreter `gh-pages`-Verifikation behaupten
