# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36`  
**Aktiver Arbeitsbranch:** `docs/github-maintenance-20260810`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug ausschließlich das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere GitHub- oder Supabase-Projekte werden nicht geöffnet, verändert, verbunden oder als Deployment-Ziel genutzt.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe; es gibt keinerlei App-Konten oder Anmeldung.
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
9. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo eine konkrete Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.
10. Überholte PRs werden nach eindeutigem Ersatz sauber kommentiert und geschlossen, nicht unbegründet offen gelassen.

## 3. Aktueller GitHub-Stand nach Wartung am 10. August 2026

- Aktueller `main`: `5182aaf641222ca83b9d2c4e3e71f543afe0acb7` – Merge von PR #120.
- PR #120 **„Fix static short greeting catalog key on current main“** ist gemergt. Exakter geprüfter Head: `120707c06df10372e0b622bbb431480d4dbff86d`.
- Für PR #120 waren alle acht etablierten DokoHilf-Pflichtworkflows auf dem exakten Head erfolgreich.
- PR #119 ist gemergt und enthält die bestätigte Pfeil-Anleitung für **„Maßnahmen ohne Zeitangabe“** über Direktguide, Finden-/Orientierungshilfe, statische Sprache und Supabase.
- PR #118 ist gemergt und enthält den mobilen Voice-Fokusbildschirm für Build 36.
- PR #117 ist gemergt und enthält die gegliederte Anleitungsbibliothek und mobile Icon-Überarbeitung.
- PR #116 ist gemergt und synchronisiert den statischen Basis-Sprachbestand mit 40 freigegebenen Guides / 129 eindeutigen Schritttexten.
- Der alte PR #110 **„Fix static short greeting catalog key“** wurde am 10. August 2026 ausdrücklich als durch PR #120 ersetzt dokumentiert und **geschlossen, nicht gemergt**. Sein veralteter Branch wird gemäß Projektregel nicht automatisch gelöscht.
- Nach Schließen von #110 gibt es **keinen offenen Pull Request**.
- Offenes Fach-Issue #103 bleibt bewusst offen: Die Berichtssuche ist noch nicht final bestätigt und darf nicht erfunden oder vorzeitig als fertiger Guide veröffentlicht werden.

## 4. Live-Status Build 36

Live geprüft am 10. August 2026:

- `main/version.json` und `gh-pages/version.json` stehen auf Build `20260809-36`.
- `gh-pages/assets/guide-audio-catalog.json` veröffentlicht für den Begrüßungseintrag jetzt exakt **„Hey! Wobei brauchst du Hilfe?“**.
- Die zugehörige statische WAV bleibt `assets/audio/guides/000.wav`.
- Damit sind der sichtbare Sprachstart, der veröffentlichte Manifest-Schlüssel und die vom Release erzeugte Supertonic-WAV wieder auf demselben kanonischen Satz.
- Der alte lange Begrüßungsschlüssel ist für den aktuellen Release nicht mehr der veröffentlichte Startschlüssel.
- Der Greeting-Fix aus PR #120 benötigt keine Supabase-Migration und kein Edge-Function-Deploy.

## 5. Verbindliche Spracharchitektur

`STATIC_VOICE_POLICY.md` ist verbindlich.

- **Jeder hörbar ausgegebene Satz kommt aus einer vorab im Release erzeugten Supertonic-3/F1-WAV-Datei.**
- Keine Supertonic-Inferenz auf iPhone, Android oder im Browser.
- Kein WebGPU-/WASM-TTS im Endgerät.
- Keine System-/Gerätestimme als regulärer Fallback.
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

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → **kleiner Pfeil links neben Bedarfsmedikation** → gewünschtes Medikament rechts anhaken → Pop-up-Fenster: tatsächliche Uhrzeit prüfen/ergänzen → Anlass dokumentieren → bei tatsächlich geringerer Gabe die tatsächlich verwendete Bedarfsmenge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → **kleiner Pfeil links neben „Maßnahmen ohne Zeitangabe“** → gewünschte Maßnahme wählen, zum Beispiel Klienten-Team Sitzung oder Krise → Pop-up-Fenster: Datum/Uhrzeit prüfen → Kategorie wählen → im großen Textfeld dokumentieren → optionale zusätzliche Zeitangabe oben rechts → unten OK.

Dieser Pfeilschritt ist aktuell konsistent in:
- direktem Komplettguide,
- lokaler Finden-/Orientierungshilfe,
- statischem Durchführung-Sprachkatalog,
- statischem Navigation-Sprachkatalog,
- produktivem Supabase-Guide `massnahmen-ohne-zeitangabe`,
- produktivem Finden-Guide `massnahmen-ohne-zeitangabe-finden`.

## 8. Aktueller Supabase-Stand

Live geprüft am 10. August 2026 für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projektstatus: `ACTIVE_HEALTHY`.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- Security Advisor: keine offenen Lints beim letzten vollständigen Check.
- Performance Advisor: ein reiner INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; kein akuter Fehler und deshalb nicht ungeprüft entfernen.
- Aktuelle Edge-Function-Logs zeigten beim letzten vollständigen Check erfolgreiche `200`-Antworten von `dokohilf-ai-router` und `dokohilf-chat-router`.
- `massnahmen-ohne-zeitangabe` ist produktiv freigegeben und enthält den bestätigten kleinen Pfeil links zum Öffnen.
- `massnahmen-ohne-zeitangabe-finden` ist produktiv freigegeben und enthält denselben bestätigten Pfeilschritt.

## 9. Aktueller Wartungszustand und nächster ausführbarer Schritt

- Offene PRs: **0**.
- Bewusst offenes Fach-Issue: **#103 Berichtssuche später fachlich überarbeiten**.
- PR #110: **geschlossen / superseded durch #120 / nicht gemergt**.
- PR #120: **gemergt / 8 von 8 Pflichtworkflows grün auf exaktem Head / Greeting-Fix auf aktuellem Main**.
- `gh-pages`: aktueller Greeting-Katalogschlüssel live geprüft.
- Alte Branches werden nicht automatisch gelöscht; das entspricht ausdrücklich der Projektregel.
- Neue technische Änderungen starten immer von aktuellem `main` auf einem frischen Branch.
- Nächster fachlicher Ausbau erfolgt nur mit neuen bestätigten Informationen. Issue #103 bleibt bis dahin offen.

## 10. Empfohlene reale iPhone-Tests

- Sprechmodus starten → muss kurz **„Hey! Wobei brauchst du Hilfe?“** sprechen.
- „Ich finde Doku-Erweitert nicht.“
- „Wo finde ich Vitalwerte?“
- „Wo ist Planung?“
- „Wo finde ich Bedarfsmedikation?“
- „Wie dokumentiere ich eine Bedarfsmedikation?“
- „Wie dokumentiere ich die Wirksamkeitskontrolle?“
- „Maßnahmen ohne Zeitangabe dokumentieren.“ → muss den **kleinen Pfeil links daneben** nennen.
- Update-Hinweis auf Sichtdauer prüfen.
- Version nur dezent ganz unten prüfen.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
