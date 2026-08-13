# DokoHilf – aktive Arbeit: private Fehlermeldungen / v31

**Status:** IN ARBEIT  
**Stand:** 13. August 2026  
**Branch:** `feature/feedback-report-v49-v31`  
**Ausgangs-main:** `e4f8df9f6cfe8d08cde128c9c4f44811097c1b16` (Merge PR #152, v30 veröffentlicht)

## Warum ein neuer Branch

Die älteren Feedback-PRs #149 und #153 basieren auf inzwischen überholten Main-/Versionsständen. Sie dürfen nicht blind gemergt werden. Dieser Arbeitsblock wurde deshalb neu und sauber direkt vom veröffentlichten v30-Main gestartet.

PR #151 war ein paralleler, veralteter Versionsversuch und wurde ohne Merge geschlossen. Die kanonische Versionsregel stammt aus gemergtem PR #152 (`version.json.appVersion`, `VERSIONING_POLICY.md`, `PROJECT_RULES.md`, `Validate app version policy`).

## Nutzerentscheidung

Die Funktion wird exakt nach `FEEDBACK_POLICY.md` umgesetzt:

- dezenter Testphasen-Hinweis unten;
- Button `Fehler oder Hinweis melden`;
- Kategorie + kurze Beschreibung;
- optional `Aktuelle Stelle mitsenden`;
- optionaler Kontext besteht nur aus Build-ID, Guide und Schritt;
- keine Chatnachrichten, kein Audio, keine Screenshots;
- sichtbare Warnung gegen Namen, Bewohner-/Klienten- und Gesundheitsdaten;
- private Supabase-Speicherung ohne öffentliche Lesemöglichkeit;
- keine IP-, Geräte-, Cookie-, Session- oder Nutzerkennung durch die DokoHilf-Meldelogik;
- technische Meldungsnummer nach erfolgreichem Speichern.

## Aktuell im Branch umgesetzt

- `assets/feedback-report-v49.js` – UI und minimales Payload;
- `assets/ui-polish-v35.js` – lädt das Feedback-Modul;
- `service-worker.js` – Feedback-Revisionsmarker und PWA-Precache;
- `supabase/migrations/20260813083000_private_feedback_v49.sql` – private Tabelle + service-role-only Insert-RPC;
- `supabase/functions/dokohilf-feedback/index.ts` – öffentlicher kontenfreier, origin-beschränkter Endpunkt;
- `supabase/config.toml` – `dokohilf-feedback` mit `verify_jwt=false`;
- `tests/feedback-report-v49.test.mjs` – Datenschutz-/Storage-/Versionsverträge;
- `scripts/feedback-render-v49.mjs` – iOS-/Android-Renderprüfung;
- `.github/workflows/feedback-v49.yml` – eigener Pflichtgate;
- `FEEDBACK_POLICY.md` – verbindliche Produktspezifikation und Datenschutzgrenze;
- `version.json.appVersion = v31` und sichtbarer Footer `DokoHilf v31 · Build ...`.

## Sicherheitsdesign

Die private Tabelle enthält ausschließlich technische ID/Meldungsnummer, Kategorie, Beschreibung, Kontext-Schalter, optional Build/Guide/Schritt und Erstellzeitpunkt. Es existieren keine Spalten für IP, User-Agent, Gerät, Cookie, Session, Nutzer, Chat, Audio oder Screenshot.

`public`, `anon` und `authenticated` erhalten weder privaten Tabellenzugriff noch Ausführungsrecht auf den Insert-RPC. Nur `service_role` darf den RPC ausführen; der Service-Role-Key bleibt ausschließlich serverseitig in der Edge Function.

## Veröffentlichungsplan

1. Aktuellen Branch per PR gegen unveränderten Main öffnen.
2. PR #153 ausdrücklich als superseded schließen, sobald der neue PR existiert.
3. Issue #148 auf den neuen aktiven PR und diese Spezifikation aktualisieren.
4. Alle acht etablierten DokoHilf-Pflichtworkflows, `Validate app version policy` und `Validate private feedback v49` auf exakt demselben Head grün bekommen.
5. Erst danach Migration produktiv anwenden und Edge Function deployen.
6. Vollständig synthetische Ende-zu-Ende-Meldung absenden, gespeicherte Felder prüfen und Testzeile wieder löschen.
7. Nicht-Lesbarkeit für öffentliche Rollen und Service-Role-only-RPC erneut verifizieren.
8. `main` unmittelbar vor Merge erneut prüfen und nur mit Expected-Head-Schutz mergen.
9. Main-Deploy und `gh-pages` bis GitHub Pages `built` prüfen.
10. v31 und die Fehlermeldefunktion am festen öffentlichen Hauptlink prüfen.
11. Abschlussstatus in PR, Issue #148 und dauerhafter GitHub-Dokumentation nachziehen.

## Noch nicht produktiv

Zum Zeitpunkt dieses Dokuments sind die neue Feedback-Tabelle/RPC und die Edge Function **noch nicht produktiv aktiviert**. Der v31-Feedback-Code ist noch nicht gemergt oder live. Das ist absichtlich so, bis alle Freigabegates erfolgreich sind.
