# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 9. August 2026  
**Aktueller Releaseblock:** `v29` / geplanter Build `20260809-29`  
**Aktiver Release-PR:** `#105` auf `fix/v29-force-pwa-refresh-20260809`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Für den aktuell offenen Releaseblock ist insbesondere `ACTIVE_WORK_PWA_REFRESH_V29.md` verbindlich. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- DokoHilf ist ausschließlich eine erklärende Schritt-für-Schritt-Bedienhilfe.
- DokoHilf besitzt keinerlei Konten oder Anmeldung – einschließlich Redaktions-, Mitarbeiter- oder Administrationskonten –, keine Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
- Tests nur mit synthetischen UI-Zuständen, neutralen Platzhaltern und erfundenen Werten; keine reale Person und kein realer Fall werden nachgebildet.
- Öffentliche Inhalte nur selbst formuliert, anonymisiert und veröffentlichungsfähig; Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert.
- Keine erfundenen Klickwege oder Feldnamen. `CONFIRMED_WORKFLOWS.md` ist fachliche Source of Truth.
- Supertonic F1 bleibt die kostenlose reguläre Stimme. Keine kostenpflichtige Cloud-TTS-Lösung neu einführen.

## 2. Verbindlicher GitHub-Ablauf

1. Vor Eingriffen `main`, offene Pull Requests, aktuelle Actions und `gh-pages` live prüfen.
2. Nie direkt auf `main` arbeiten.
3. Änderungen über Branch + PR integrieren.
4. Relevante Entscheidungen, Fehlerursachen, Tests und Arbeitsstand dauerhaft dokumentieren.
5. Nur einen vollständig geprüften **exakten PR-Head** mergen.
6. Kein Auto-Merge.
7. Nach Merge `main`, `gh-pages` und öffentlichen Build erneut prüfen.
8. Bei Supabase-Änderungen zuerst sichere Dry-Run-/Rollback-Prüfung, dann produktive Migration.
9. Gegenüber dem Nutzer niemals `live` behaupten, solange der reale `gh-pages`-Stand nicht geprüft wurde.

## 3. Mobile Freigabe

`Mobil geprüft` bedeutet mindestens:

- iOS `393 × 852`
- Android `412 × 915`

Zu prüfen sind insbesondere Safe Areas, Überlagerungen, Touchziele, Startscreen, Direktguides, Chat, Voice, PWA-Updateverhalten und echte Navigation.

## 4. Fachlicher Stand nach PR #104

PR #104 wurde bereits gemergt (`8b5048bff4a40a74f05cfae45b949d91d1d30bbe`). Die zugehörigen Supabase-Änderungen sind produktiv.

Am 9. August 2026 live in Supabase geprüft:

- `bericht-durchstreichen`: approved, Version 7
- `bericht-folgebericht`: approved, Version 4
- `visite-anlegen`: approved, Version 8
- `vitalwerte-einzelwert`: approved, Version 4
- `vitalwerte-sammelerfassung`: approved, Version 4
- `berichtssuche`: **draft**, Version 4

### Bericht korrigieren

Ein falsch formulierter oder verschriebener bestehender Bericht wird **durchgestrichen**. Ein Folgebericht korrigiert den ursprünglichen Text nicht. Soll danach korrekt neu dokumentiert werden, wird ein neuer Bericht angelegt.

### Folgebericht

Ein Folgebericht ist ein neuer Bericht mit Bezug zu einem bereits dokumentierten Geschehen. Er ergänzt oder führt dieses fort und verändert den ursprünglichen Bericht nicht.

### Visite

Normalfall: beim Bewohner hinterlegten durchführenden Arzt auswählen. Nur wenn dieser dort fehlt, rechts neben der Arztauswahl das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen. Dieser Ausnahmefall ist als visueller **Sonderfall** darzustellen. Ortsoptionen: Einrichtung, beim Arzt, telefonisch, per Mail.

### Vitalwerte

Bestätigte Beispiele: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz und Atemalkohol. Bei Blutdruck Systole und Diastole. Je nach Vitalwert erscheinen passende Eingabefelder. Keine nicht bestätigten Einheiten oder Zusatzfelder erfinden.

### Berichtssuche

Issue #103 bleibt offen. `Analyse → Abfrage` ist nicht final fachlich bestätigt. Der Guide bleibt Draft / `kommt später` und darf nicht als fertige Anleitung oder neue Voice-Hilfe ausgebaut werden.

## 5. Neue Guide-Bibliothek aus #104

Der Zielzustand der Startseite ist:

- `Häufig genutzt`
- lokale anonyme Nutzungssortierung pro Guide
- `Alle Anleitungen anzeigen`
- vollständige Übersicht aller fertigen Guides
- individuelle, fachlich passende SVG-Icons je Guide
- dasselbe Icon für dieselbe Anleitung in `Häufig genutzt` und `Alle Anleitungen`

Beispiele: Visite = Stethoskop/Arzt, Vitalwerte = Herz/Puls, Bericht = Dokument, Bericht korrigieren = Dokument/Korrektur, Folgebericht = Dokument/Verknüpfung, Medikation = Medikament, Formular = Formular/Liste, Übergabe = Übergabe/Pfeile.

Der Direktguide-Header muss auf iPhone/Android ausreichend Safe-Area-Abstand haben und darf Titel, Zurück-Pfeil oder Schritte nicht überdecken.

## 6. Aktueller echter Live-Fehler

Nach PR #104 zeigte ein real installiertes iPhone weiterhin die **alte** Startsektion `HÄUFIGE ABLÄUFE · DIREKT ÖFFNEN` mit den statischen Karten.

Die neue Guide-Bibliothek war damit auf dem realen Gerät nicht aktiv.

Ursache: Die öffentliche Build-ID blieb über mehrere Releases `20260808-29`. Ein installierter iOS-PWA-Client konnte dadurch seinen alten Shell-/Service-Worker-Zustand als aktuell betrachten.

Darum existiert PR #105: `Force installed PWA to refresh to guide library`.

## 7. PR #105 – aktueller technischer Stand

Branch: `fix/v29-force-pwa-refresh-20260809`  
Ziel-Build: `20260809-29`

`version.json`, `index.html` und `service-worker.js` verwenden den neuen Build bereits.

Der aktive Releasepfad wurde am 9. August 2026 so repariert, dass künftige Buildwechsel nicht erneut an derselben Datumskonstante hängen:

- `.github/workflows/pages.yml` liest die deklarierte Build-ID aus `version.json` und prüft Index sowie Service Worker dagegen.
- `.github/workflows/ui-validation-v27.yml` prüft die gerenderte Meta-Build-ID dynamisch.
- `.github/workflows/detail-help-mobile.yml` prüft alle Release-Asset-URLs gegen die deklarierte Build-ID.
- `.github/workflows/local-voice-v28-mobile.yml` prüft Voice-Assets gegen die deklarierte Build-ID.
- `.github/workflows/report-conditional-mobile-v28.yml` prüft `version.json` dynamisch.
- `assets/local-voice-v28.js` übernimmt seine Build-ID aus dem ausgelieferten `dokohilf-build`-Meta-Tag.
- `assets/local-voice-gate-v28.js` erzeugt die Manifest-Revision aus derselben ausgelieferten Build-ID.
- `scripts/apply-detail-help-v27.mjs`, `scripts/apply-local-voice-v28.mjs` und `scripts/build-static-site-v27.sh` waren bereits auf `version.json` umgestellt und bleiben so erhalten.
- Die Build-/Voice-Regressionen prüfen den dynamischen Vertrag statt ein neues Datum fest einzubrennen.
- Die etablierten Account-/Datenschutzformulierungen im Handoff wurden wieder vollständig hergestellt; Tests wurden dafür nicht abgeschwächt.

`20260808-29` darf weiterhin in historischen Fehlerbeschreibungen stehen. Benannte Revisionen wie `20260808-context-voice-v29-1` oder `20260808-smart-help-voice-ui-v29-1` sind eigenständige Hotfix-Revisionskennungen und keine aktuelle Build-ID.

Die Freigabe bleibt blockiert, bis alle acht Pflichtworkflows auf demselben exakten PR-Head grün sind. Erst danach darf gemergt werden.

## 8. Aktueller `gh-pages`-Stand vor Freigabe von #105

Am 9. August 2026 vor der finalen Freigabe erneut live geprüft:

`gh-pages/version.json` liefert weiterhin:

- `buildId = 20260808-29`
- Release `smart-help-voice-ui-v29`

Damit ist der PWA-Refresh-Build `20260809-29` vor Merge von #105 **noch nicht live**.

Ein neuer Chat darf nicht behaupten, die neue Guide-Bibliothek sei ausgeliefert, bevor `gh-pages` konkret den neuen Build zeigt und die reale Geräteabnahme erfolgreich war.

## 9. Voice-Architektur

- Supertonic F1 ist die reguläre kostenlose Stimme.
- Vollständiger Releasebuild erzeugt 160 bestätigte statische Sätze.
- Noch nicht vorbereitete freie Sätze dürfen lokal mit derselben Stimme erzeugt werden.
- iOS-Notinferenz bleibt zeitlich begrenzt, damit die Oberfläche nicht hängen bleibt.
- System-/Gerätestimmen bleiben als regulärer Fallback blockiert.
- Cloud-TTS ist stillgelegt.
- Freie Audios und Gesprächsinhalte werden nicht dauerhaft gespeichert.
- Beim Publish bestehende Voice-/Detailhilfe-/Icon-Hotfixes auf `gh-pages` nicht blind überschreiben.

## 10. Stillgelegte Account-/Cloud-Infrastruktur

- keine App-Konten oder Anmeldung
- Supabase Auth enthält keine für DokoHilf vorgesehenen Nutzerkonten
- ehemaliger Editor ist stillgelegt
- Cloud-TTS-/alte Gacrux-Pfade sind Ruhestandspfade
- keine produktiven Personendaten in DokoHilf

`PROJECT_RULES.md` bleibt hierfür verbindlich.

## 11. Freigabeschritte für PR #105

1. aktuellen PR-Head nach der Build-ID-Reparatur bestimmen.
2. alle acht Pflichtworkflows genau auf diesem Head prüfen.
3. jeden verbleibenden Fehler an der Ursache beheben und anschließend einen neuen exakten Head vollständig neu prüfen.
4. erst bei acht grünen Pflichtworkflows PR #105 mit `expected_head_sha` mergen.
5. Main-Workflow vollständig prüfen.
6. `gh-pages` konkret verifizieren: `version.json`, Index, Service Worker, Guide-Bibliothek, Icons, Voice-Assets und relevante Guide-Inhalte.
7. nur bei hängendem Publish gezielt Live-Dateien nachziehen; bestehende Live-Hotfixes nicht blind überschreiben.
8. reales installiertes iPhone prüfen: neue `Häufig genutzt` / `Alle Anleitungen`-Ansicht muss tatsächlich erscheinen.

## 12. Pflicht für jeden neuen Chat

1. `README.md` lesen.
2. `PROJECT_RULES.md` lesen.
3. `CONFIRMED_WORKFLOWS.md` lesen.
4. `PROJECT_HANDOFF.md` lesen.
5. alle `ACTIVE_WORK_*.md` lesen, besonders `ACTIVE_WORK_PWA_REFRESH_V29.md`.
6. GitHub live prüfen: `main`, PR #105, aktueller Head, Actions, `gh-pages`.
7. Supabase live prüfen, wenn Guide-/Router-/Audio-/DB-Arbeit betroffen ist.
8. exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
9. nach eigener Arbeit die Repository-Dokumentation erneut aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
