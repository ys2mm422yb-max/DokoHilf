# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36`  
**Aktiver Arbeitsbranch:** `fix/static-short-greeting-build36-20260810`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug ausschließlich das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere GitHub- oder Supabase-Projekte werden nicht geöffnet, verändert, verbunden oder als Deployment-Ziel genutzt.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe; es gibt keinerlei Konten oder Anmeldung.
- Keine Bewohner-/Mitarbeiterkonten, keine Fallakten, keine personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
- Öffentliche Projekttexte und Testzustände sind selbst formuliert, anonymisiert und veröffentlichungsfähig; keine reale Person und kein realer Fall werden nachgebildet.
- Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert; veröffentlicht werden nur bestätigte DokoHilf-Ergebnisse und Regeln.
- Keine erfundenen Klickwege oder Feldnamen. `CONFIRMED_WORKFLOWS.md` ist fachliche Source of Truth.
- Berichtssuche bleibt fachlich offen / Draft. Issue #103 nicht durch erfundene Details schließen.

## 2. Verbindlicher GitHub-Ablauf

1. Nie direkt auf `main` arbeiten.
2. Änderungen über Branch + PR integrieren.
3. Nur einen vollständig geprüften **exakten PR-Head** mergen.
4. Alle acht etablierten Pflichtworkflows müssen auf genau diesem Head grün sein.
5. Kein Auto-Merge und keine automatische Branch-Löschung.
6. Bei Supabase-Änderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge.
7. Nach Merge `main`, `gh-pages` und öffentlichen Build konkret prüfen.
8. Gegenüber dem Nutzer nie `live` behaupten, solange `gh-pages` und der feste öffentliche Hauptlink nicht real verifiziert wurden.
9. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Live geprüfter Ausgangsstand am 10. August 2026

- `main` vor dem aktuellen Arbeitsbranch: `be510d67463f23c3b6559940c670abb347188f3e` – Merge von PR #119.
- `main/version.json` und `gh-pages/version.json` zeigen beide Build `20260809-36`.
- PR #119 ist gemergt und enthält die bestätigte Pfeil-Anleitung für „Maßnahmen ohne Zeitangabe“ über Guide-, Finden-, Sprach- und Supabase-Schichten.
- PR #118 ist gemergt und enthält den mobilen Voice-Fokusbildschirm für Build 36.
- PR #117 ist gemergt und enthält die gegliederte Anleitungsbibliothek und mobile Icon-Überarbeitung.
- PR #116 ist gemergt und synchronisiert den statischen Basis-Sprachbestand mit 40 freigegebenen Guides / 129 eindeutigen Schritttexten.
- Ein alter PR #110 (`fix/v29-short-greeting-static-catalog-20260809`) ist fachlich relevant, aber technisch überholt: sein Branch liegt 76 Commits hinter dem aktuellen `main`. Er darf nicht blind gemergt werden. Der noch benötigte Greeting-Fix wird deshalb auf dem aktuellen Hauptstand neu umgesetzt.
- Offenes Fach-Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final bestätigt.

## 4. Aktiver Arbeitsblock: kurzer Sprachstart / statischer Katalogschlüssel

Bestätigter Fehler auf dem aktuellen Build-36-Stand:

- Die sichtbare und angeforderte Begrüßung lautet bereits **„Hey! Wobei brauchst du Hilfe?“**.
- Der Supertonic-Builder wandelte den alten langen Begrüßungstext nur für die Synthese in den kurzen Satz um.
- Im veröffentlichten Katalogschlüssel konnte dadurch weiterhin der alte lange Text stehen, obwohl die zugehörige WAV-Datei den kurzen Satz spricht.
- `assets/local-voice-gate-v28.js` indexiert statische WAVs anhand des veröffentlichten `entry.text`. Dadurch kann die kurze Begrüßungsanfrage den vorhandenen Begrüßungseintrag verfehlen und die Sprachausgabe stumm beziehungsweise auf den neutralen Fallback laufen.

Aktueller Fix auf `fix/static-short-greeting-build36-20260810`:

- `scripts/build-supertonic-guide-audio-v28.py` verwendet für Zusammenführung, Normalisierung, Synthese und veröffentlichten Manifesttext denselben kanonischen Begrüßungstext.
- Der Builder bricht ab, wenn die kurze Begrüßung im veröffentlichten statischen Katalog fehlt oder der alte lange Begrüßungstext als veröffentlichter Schlüssel übrig bleibt.
- `tests/local-voice-v28.test.mjs` sichert diesen Vertrag als Regressionstest ab.
- Keine fachlichen Klickwege werden verändert.
- Keine Supabase-Migration und kein Edge-Function-Deploy sind für diesen Fix erforderlich.

## 5. Verbindliche Spracharchitektur

`STATIC_VOICE_POLICY.md` ist verbindlich.

- **Jeder hörbar ausgegebene Satz kommt aus einer vorab im Release erzeugten Supertonic-3/F1-WAV-Datei.**
- Keine Supertonic-Inferenz auf iPhone, Android oder im Browser.
- Kein WebGPU-/WASM-TTS im Endgerät.
- Keine System-/Gerätestimme als Fallback.
- Keine Cloud-/Bezahl-TTS.
- `assets/local-voice-v28.js` ist nur ein stillgelegter Kompatibilitätspfad und darf nicht synthetisieren.
- `assets/local-voice-gate-v28.js` bedient ausschließlich den statischen Katalog.
- Für freie Texte ohne exakte Audiodatei darf nur ein ebenfalls vorab erzeugter neutraler Supertonic-F1-Satz verwendet werden; der vollständige Text bleibt sichtbar.
- Sprachstart im Sprechmodus: **„Hey! Wobei brauchst du Hilfe?“**
- Der Supertonic-Build leitet die Gesamtzahl der WAV-Dateien aus allen kontrollierten Sprachkatalogen ab. Katalogzahl, WAV-Zahl und Build-Summary müssen exakt übereinstimmen.

Kontrollierte Sprachquellen:
- Basis-Katalog
- feste Dialogsätze
- Release-Sätze
- Bedarfsmedikation / Wirksamkeitskontrolle / Maßnahmen ohne Zeitangabe
- UI-Startsatz
- grüne Navigationshierarchie
- kontextuelle `stuck`-Hilfe

## 6. Bestätigte Navigationshierarchie

- Ganz oben befindet sich die **feste grüne Hauptleiste**.
- Bestätigte Hauptbereiche dort: **Berichte, Doku, Doku-Erweitert, Planung, Analyse**.
- Nach Auswahl eines Hauptbereichs erscheinen direkt darunter die zugehörigen Symbole/Funktionen.
- Unter **Doku-Erweitert**: Vitalwerte, Visiten, Medikation, Formulare, An-/Abwesenheiten.
- Unter **Doku**: Durchführungsnachweis.
- Unter **Analyse**: Was war los? für die Übergabe.
- **Planung** als Hauptbereich ist bestätigt; der genaue Easy-Plan-Ablauf bleibt offen.
- Orientierung muss bei „Ich finde X nicht“ eine Ebene zurück erklären und darf nicht nur denselben Schritt wiederholen.

## 7. Bestätigte Durchführung-Abläufe

### Bedarfsmedikation dokumentieren

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → kleiner Pfeil links neben Bedarfsmedikation → gewünschtes Medikament rechts anhaken → Pop-up-Fenster: tatsächliche Uhrzeit prüfen/ergänzen → Anlass dokumentieren → bei tatsächlich geringerer Gabe die tatsächlich verwendete Bedarfsmenge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → **kleiner Pfeil links neben „Maßnahmen ohne Zeitangabe“** → gewünschte Maßnahme wählen, zum Beispiel Klienten-Team Sitzung oder Krise → Pop-up-Fenster: Datum/Uhrzeit prüfen → Kategorie wählen → im großen Textfeld dokumentieren → optionale zusätzliche Zeitangabe oben rechts → unten OK.

## 8. Aktueller Supabase-Stand

Live geprüft am 10. August 2026 für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projektstatus: `ACTIVE_HEALTHY`.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- Security Advisor: keine offenen Lints.
- Performance Advisor: ein reiner INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; kein akuter Fehler und deshalb nicht ungeprüft entfernen.
- Aktuelle Edge-Function-Logs zeigen erfolgreiche `200`-Antworten von `dokohilf-ai-router` und `dokohilf-chat-router`.
- Für den aktuellen Greeting-Fix ist **keine** Datenbankmigration und **kein** Funktionsdeploy erforderlich.

## 9. Freigabeschritte für den aktuellen Greeting-Fix

1. Frischen Branch auf Basis des aktuellen `main` verwenden; keine Übernahme des 76 Commits alten PR-#110-Branches.
2. Builder- und Regressionsteständerung in PR gegen `main` prüfen.
3. Exakten finalen PR-Head bestimmen.
4. Alle acht Pflichtworkflows auf genau diesem Head grün bekommen.
5. Erst dann mit `expected_head_sha` manuell mergen.
6. Der Main-Deploy muss die statischen Supertonic-F1-Dateien neu erzeugen und denselben exakten Release-Stand auf `gh-pages` veröffentlichen.
7. Danach `main`, `gh-pages`, `version.json`, Service Worker und den veröffentlichten `guide-audio-catalog.json` prüfen.
8. Der veröffentlichte Katalog muss **„Hey! Wobei brauchst du Hilfe?“** als Greeting-Schlüssel enthalten und darf den alten langen Greeting-Schlüssel nicht mehr enthalten.
9. Erst nach realer `gh-pages`-/Hauptlink-Verifikation den Fix als live melden.
10. Den alten PR #110 danach als durch den aktuellen Main-basierten Fix ersetzt schließen; Branch nicht automatisch löschen.

## 10. Empfohlene reale iPhone-Tests nach Live-Freigabe

- Sprechmodus starten → muss kurz **„Hey! Wobei brauchst du Hilfe?“** sprechen.
- „Ich finde Doku-Erweitert nicht.“
- „Wo finde ich Vitalwerte?“
- „Wo ist Planung?“
- „Wo finde ich Bedarfsmedikation?“
- „Wie dokumentiere ich eine Bedarfsmedikation?“
- „Wie dokumentiere ich die Wirksamkeitskontrolle?“
- „Maßnahmen ohne Zeitangabe dokumentieren.“
- Update-Hinweis auf Sichtdauer prüfen.
- Version nur dezent ganz unten prüfen.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
