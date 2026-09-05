# ACTIVE WORK – Kontext-Hilfe-Verfügbarkeit v71

Stand: 5. September 2026

## Ausgangslage

Ein iPhone-Screenshot aus dem Schreibchat zeigte bei einer laufenden Anleitung zwei unterschiedliche Hilfsaktionen:

- oben in der Fortschrittsleiste korrekt `Schritt zurück`,
- unten neben `Erledigt, weiter` weiterhin `Hilfe zum Schritt`.

Der untere Button ist **nicht** derselbe Button wie `Schritt zurück`. Er gehört zur bestehenden Schnellantwort `data-command="ich finde das nicht"`.

Bestätigte Ursache: `assets/mobile-polish-v29.js` überschreibt den sichtbaren Text dieser Schnellantwort pauschal auf `Hilfe zum Schritt`, unabhängig davon, ob für den aktuellen Guide-Schritt überhaupt eine zusätzliche bestätigte Hilfe vorhanden ist.

## Ziel

Die untere Schnellantwort soll verständlich `Ich finde es nicht` heißen und nur dann bedienbar sein, wenn für **genau den aktuellen bestätigten Guide-Schritt** eine zusätzliche bestätigte `stuck`-Erklärung vorhanden ist.

Wenn keine solche Erklärung existiert, bleibt die Aktion sichtbar, ist aber deaktiviert und löst keine nutzlose Wiederholung aus.

`Schritt zurück` bleibt davon vollständig getrennt.

## Bestätigte Datenbasis

Vor der Umsetzung wurde das produktive Supabase-Projekt ausschließlich lesend geprüft:

- Projekt: `efifbuqctylsujiauabg`
- Zustand: `ACTIVE_HEALTHY`
- Quelle: `public.dokohilf_guides`
- berücksichtigt werden ausschließlich Guides mit `status = 'approved'`
- eine Hilfe gilt nur dann als vorhanden, wenn `steps[].stuck` für den konkreten 1-basierten Schritt nicht leer ist.

Die daraus ermittelte Verfügbarkeitsmenge ist in `assets/context-help-availability-v71.js` als statische UI-Zuordnung hinterlegt. Sie enthält **keinen Hilfetext** und keinen neuen fachlichen Klickweg; sie steuert ausschließlich den Aktiv-/Deaktiviert-Zustand des vorhandenen Buttons.

Für den gemeldeten Screenshot ist bestätigt:

- Guide `berichte-finden`
- Schritt `1 von 1`
- normaler Schritttext und zusätzliche `stuck`-Erklärung sind in Supabase getrennt vorhanden.

Daher muss `Ich finde es nicht` bei diesem Schritt aktiv sein.

Beispiel für einen bewusst deaktivierten Zustand:

- `bericht-neu`, Schritt 3: keine bestätigte `stuck`-Erklärung → Button deaktiviert.

## Umsetzung

Neue Schicht:

- `assets/context-help-availability-v71.js`

Verhalten:

- Ziel ist ausschließlich `#commandRow [data-command="ich finde das nicht"]`.
- Der Nutzer sieht `Ich finde es nicht`.
- `disabled` wird nativ gesetzt, wenn keine bestätigte Zusatzhilfe für Guide + Schritt existiert.
- `aria-disabled`, `aria-label` und `title` folgen demselben Zustand.
- Die Verfügbarkeit wird bei `dokohilf:guide-state` und `pageshow` neu synchronisiert.
- Die vorhandene Backend-/Guide-Hilfelogik bleibt unverändert; v71 dupliziert keine `stuck`-Texte.
- Die Beschriftung wird über die v71-Darstellung gesetzt, ohne `textContent` fortlaufend gegen `mobile-polish-v29.js` umzuschreiben. Dadurch entsteht keine MutationObserver-Schleife.

Integration:

- v71 wird in `assets/release-polish-v29.js` nach v70 geladen.
- Service Worker cached die neue Datei offline.
- Build wird auf `20260905-45` erhöht.
- öffentliche App-Version bleibt gemäß `VERSIONING_POLICY.md` bei `v36`, da dies ein begrenzter UI-/Verfügbarkeitsfix ist.
- Release-Kennung: `context-help-availability-v71`.

## Tests

Neu:

- `tests/context-help-availability-v71.test.mjs`

Abgedeckt wird:

- `berichte-finden`, Schritt 1 → Zusatzhilfe vorhanden → aktiv.
- `bericht-neu`, Schritt 3 → keine Zusatzhilfe → deaktiviert.
- `bericht-neu`, Schritt 4 → Zusatzhilfe vorhanden → aktiv.
- `vitalwerte-einzelwert-fortsetzen`, Schritt 1 → keine Zusatzhilfe → deaktiviert.
- Zustandswechsel erfolgt anhand des aktuellen Guide-Schritts, nicht nur anhand des Guide-Slugs.
- v71 verändert weder `Schritt zurück` noch fachliche Anleitungsinhalte.
- keine Browser-/System-/Cloud-TTS-Ausgabe und keine Browser-Datenspeicherung werden ergänzt.
- v71 ist nach v70 geladen und im Offline-Cache enthalten.

Zusätzlich:

- `tests/chat-guide-back-dictation-v70.test.mjs` bleibt als v70-Regressionsschutz im Build 45 erhalten.
- `tests/v69-install-full-qa.test.mjs` bleibt als v69-PWA-Regressionsschutz im Build 45 erhalten.
- der bestehende Workflow `Validate help registry self-test v54` prüft nun zusätzlich Syntax und v71-Verfügbarkeitsverträge.
- die bestehenden iOS-/Android-Render- und Produktworkflows bleiben unverändert verpflichtend.

## Fachliche und technische Grenzen

- keine neue Vivendi-Bezeichnung, kein neuer Menüpunkt, kein neuer Klickweg.
- keine Änderung an bestätigten Guide-Schritten oder `stuck`-Texten.
- keine medizinische/pflegerische Entscheidung.
- keine Konten und keine personenbezogenen Testdaten.
- keine Supabase-Migration und kein Edge-Function-Deploy vorgesehen.
- statische Sprachausgabe bleibt ausschließlich Supertonic 3 / F1.

## Arbeitszweig und Freigabe

Branch:

`fix/context-help-availability-v71-20260905`

Basis bei Branch-Erstellung:

`85b16a6f84b7f6262775fd679520b1d81effc46d`

Zielstand:

- App `v36`
- Build `20260905-45`
- Release `context-help-availability-v71`

Status beim Anlegen dieses Dokuments:

- Umsetzung auf Feature-Branch vorhanden.
- noch nicht in `main`.
- noch nicht auf `gh-pages` veröffentlicht.
- Merge erst nach allen tatsächlich ausgelösten Pflichtprüfungen auf demselben finalen PR-Head.
- danach Main-Deploy, `gh-pages` und öffentliche App erneut verifizieren.

Hinweis für spätere Änderungen an bestätigten Guides: Wenn `steps[].stuck` in Supabase ergänzt oder entfernt wird, muss die reine Verfügbarkeitszuordnung in v71 synchron mit dieser bestätigten Änderung aktualisiert und erneut getestet werden.
