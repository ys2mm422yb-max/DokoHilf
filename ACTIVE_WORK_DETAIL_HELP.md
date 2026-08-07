# Aktiver Arbeitsstand – Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

**Stand:** 7. August 2026  
**Status:** auf Branch `feature/detail-help-orientation-20260807` umgesetzt; PR-/CI-Abschluss ausstehend  
**Ausgangsbuild:** `20260806-27`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

## Aktuelles Nutzerfeedback

Der Nutzer hat die veröffentlichte Chatführung erneut praktisch getestet. Beim Satz sinngemäß **„Ich finde die Vitalwerte nicht, wo sind die?“** startete DokoHilf zwar den richtigen Vitalwerte-Guide, behandelte die Situation danach aber noch zu sehr wie einen normalen Ablauf: Schrittkarte plus `Weiter` statt einer echten Fehlersuche.

Die neue verbindliche Produktentscheidung lautet daher:

- Sobald DokoHilf erkennt, dass der Nutzer **einen Klickweg oder Menüpunkt nicht findet**, wechselt die laufende Führung in einen eigenen Orientierungs-/Detailhilfemodus.
- Dieser Modus stellt zuerst Rückfragen zum sichtbaren Bildschirmzustand.
- Er erklärt den aktuellen bestätigten Klickweg deutlich genauer.
- `Weiter` darf während dieser Fehlersuche nicht angeboten werden.
- Erst nach einer echten Bestätigung, dass der gesuchte Punkt gefunden wurde, darf der normale Guide weitergehen.

Die zugrunde liegenden Nutzerbilder bleiben ausschließlich im Chat. Sie werden nicht in GitHub, Supabase, Tests, Issues, PRs oder Artefakte übernommen.

## Verbindliches Verhalten

- Aktuelle Absicht und aktueller Guide bleiben erhalten.
- Ein Problemhinweis markiert den aktuellen Schritt **nicht** als erledigt.
- Erkannt werden unter anderem Aussagen wie:
  - `Ich finde das nicht`
  - `Ich sehe den Menüpunkt nicht`
  - `Wo sind die Vitalwerte?`
  - `Wo muss ich klicken?`
  - `Bei mir heißt das anders`
  - `Ich bin auf einer anderen Seite / in einem anderen Reiter`
  - `Ich weiß nicht, wo ich bin`
  - `Ich brauche Hilfe`
- Danach wird zuerst der sichtbare Zustand geklärt.
- Hilfetexte verwenden ausschließlich bestätigte lokale Bezeichnungen und bestätigte sichere Rückwege.
- DokoHilf darf keinen Vivendi-Klickweg, Feldnamen oder eine alternative Funktion erfinden.
- Fehlt ein Menüpunkt an der bestätigten Stelle wirklich, stoppt DokoHilf und sagt ausdrücklich, dass kein bestätigter Alternativweg vorliegt.
- In diesem Fall wird zum letzten sicheren Einstieg zurückgeführt oder menschliche Unterstützung empfohlen.
- Sprachmodus und Schreibmodus nutzen dieselbe Logik.
- Die Detailhilfe bleibt vollständig flüchtig im Arbeitsspeicher; keine Gesprächs- oder Hilfesitzung wird dauerhaft gespeichert.

## Konkreter Vitalwerte-Fall

Für die aktuell vom Nutzer gezeigte Situation ist die neue Führung bewusst detaillierter:

1. DokoHilf sagt ausdrücklich, dass jetzt **nur die richtige Stelle gesucht** und noch kein Schritt abgeschlossen wird.
2. Orientierung auf den bestätigten Einstieg **Doku-Erweitert**.
3. Strukturierte Rückfrage, z. B.:
   - `Doku-Erweitert ist offen`
   - `Ich bin in Doku / einem anderen Reiter`
   - `Doku-Erweitert fehlt`
   - `Ich weiß nicht, wo ich bin`
4. Erst nach bestätigtem `Doku-Erweitert ist offen` wird genauer erklärt:
   - `Vitalwerte` und `Vitalwerte Sammelerf.` sind zwei getrennte Einträge.
   - Für einen einzelnen Vitalwert wird `Vitalwerte` benötigt.
5. Zweite Rückfrage:
   - `Vitalwerte sehe ich`
   - `Ich sehe nur Vitalwerte Sammelerf.`
   - `Vitalwerte fehlt`
   - `Ich bin mir nicht sicher`
6. Nur bei `Vitalwerte sehe ich` endet der Hilfemodus und der normale Guide darf weitergehen.
7. Bei fehlendem Eintrag wird **nicht** geraten. DokoHilf nennt die Fachgrenze und empfiehlt bei weiterhin fehlendem Menüpunkt menschliche Unterstützung.

## Technische Umsetzung

### `assets/detail-help-v27.js`

Neue kontrollierte Client-Hilfelogik vor dem normalen KI-Router:

- erkennt Problem-/Orientierungsformulierungen;
- übernimmt bei bereits laufendem Guide dessen Slug und Schritt;
- kann bei klar benanntem bestätigtem Ziel wie Vitalwerte den passenden sicheren Einstieg initialisieren;
- hält eine ausschließlich flüchtige Hilfesitzung im RAM;
- erzeugt strukturierte Hilfefragen und Antwortschaltflächen;
- hält `guideStep` während der Fehlersuche stabil;
- blendet die normale `Weiter`-Zeile während `helpMode` aus;
- beendet den Hilfemodus erst nach bestätigtem Fund oder bewusster Übergabe an menschliche Unterstützung;
- stellt dieselben Hilfefragen im Chat und in der fokussierten Voice-Oberfläche bereit;
- enthält keine Zugriffe auf `localStorage`, `sessionStorage` oder `indexedDB`.

Die bestehende serverseitige Routerlogik bleibt als zweite Sicherheitsebene erhalten. Der neue Clientmodus greift bewusst früher, damit eine offensichtliche Orientierungsfrage nicht erst durch einen normalen Guide-Schritt läuft.

### Release-Einbindung

`scripts/apply-detail-help-v27.mjs` aktiviert die neue Datei ausschließlich im gebauten Release-Artefakt direkt nach `conversation-intelligence.js` und vor den bestehenden Clarification-/Guide-Progress-Schichten.

Der gebaute Service Worker erhält:

- `assets/detail-help-v27.js?v=20260806-27` im Core-Cache;
- Revision `20260807-detail-help-cross-platform-1`.

Damit erhalten installierte PWAs trotz unveränderter Build-ID einen neuen Service-Worker-Zyklus.

## Cross-Platform-QA

Die seit PR #71 verbindliche Regel gilt auch für diesen Block: **iOS und Android** werden gleichwertig geprüft.

Neue separate Workflow-Datei `.github/workflows/detail-help-mobile.yml` prüft den exakt gebauten Release-Stand auf:

- iOS-Profil: 393 × 852
- Android-/Pixel-Profil: 412 × 915

Der reale Render-Test `scripts/detail-help-render-v27.mjs` prüft auf beiden Profilen:

1. freie Frage `Hallo ich finde die Vitalwerte nicht wo sind die?`;
2. Detailhilfe startet statt normalem Weiter-Schritt;
3. vier strukturierte Orientierungsantworten erscheinen;
4. Guide bleibt zunächst bei Schritt 1 von 2;
5. `Weiter` ist im Hilfemodus verborgen;
6. nach `Doku-Erweitert ist offen` wird Schritt 2 detailliert erklärt;
7. `Vitalwerte Sammelerf.` wird als separater Eintrag erklärt;
8. bei `Vitalwerte fehlt` wird kein Alternativweg erfunden;
9. der Guide bleibt am aktuellen Schritt und wird nicht als erledigt markiert;
10. keine horizontale Überlagerung/kein Overflow;
11. dieselbe Hilfelogik erscheint im Voice-Modus;
12. die lokale Detailhilfe benötigt für diesen klaren Fall keinen unnötigen AI-Router-Roundtrip.

## Tests

`tests/detail-help-v27.test.mjs` prüft zusätzlich deterministisch:

- Erkennung typischer Problemformulierungen;
- Vitalwerte-Orientierung nur mit bestätigten Begriffen;
- keine erfundenen Alternativen;
- gemeinsame Chat-/Voice-Logik;
- `Weiter` bleibt während Hilfe verborgen;
- keine dauerhafte Speicherung;
- Release-Injektion und neue PWA-Revision.

## Datenschutz

Keine vom Nutzer hochgeladenen Bilder, Echtdaten, Namen, Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten wurden in die Umsetzung übernommen. Die UI-Tests verwenden ausschließlich künstliche Bedienfragen.

## Noch erforderlich

1. Pull Request gegen den aktuellen `main` öffnen.
2. Exakten PR-Head über `Deploy DokoHilf` und `Validate detailed help iOS Android` vollständig prüfen.
3. Auftretende Fehler nur auf diesem Branch korrigieren.
4. Nur vollständig grünen exakten Head manuell mergen.
5. Branch nicht automatisch löschen.
6. Nach Merge `main`, Pages-Build, Service-Worker-Revision und festen Hauptlink prüfen.
7. Finalen Merge-/Live-Stand anschließend zusätzlich in `PROJECT_HANDOFF.md` dokumentieren.

## Dauerhafte Dokumentationsregel

Jeder zukünftige DokoHilf-Arbeitsblock hinterlässt seinen echten Stand dauerhaft im Repository: Entscheidung, betroffene Dateien/Komponenten, Tests, Fehler, Blocker, aktueller PR/Head sowie der nächste ausführbare Schritt. Ein neuer Chat soll die Arbeit aus GitHub fortsetzen können, ohne alte Chats rekonstruieren zu müssen.
