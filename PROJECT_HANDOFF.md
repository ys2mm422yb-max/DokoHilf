# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36`  
**Letzter abgeschlossener Produkt-PR:** `#120`  
**Aktiver Produkt-Arbeitsbranch:** keiner  
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
4. Bei Produkt-/Releaseänderungen müssen alle acht etablierten Pflichtworkflows auf genau diesem Head grün sein. Bei einem reinen Docs-only-Abschluss müssen alle für diesen exakten Head durch die vorhandenen Workflow-Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün sein; nicht ausgelöste UI-Workflows werden nicht künstlich als fehlgeschlagen behandelt.
5. Kein Auto-Merge und keine automatische Branch-Löschung.
6. Bei Supabase-Änderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge.
7. Nach Merge `main`, `gh-pages` und öffentlichen Build konkret prüfen.
8. Gegenüber dem Nutzer nie `live` behaupten, solange `gh-pages` und der feste öffentliche Hauptlink nicht real verifiziert wurden.
9. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Aktueller GitHub-/Release-Stand

Live verifiziert am 10. August 2026:

- Produkt-PR #120 **„Fix static short greeting catalog key on current main“** ist gemergt.
- Exakter freigegebener PR-Head: `120707c06df10372e0b622bbb431480d4dbff86d`.
- Alle acht Pflichtworkflows waren auf genau diesem Head erfolgreich:
  - Context and Voice Hotfix v28
  - Validate exact PR head
  - Validate context-aware guide help v28
  - Validate detailed help iOS Android
  - Validate dark iPhone UI v27
  - Validate static voice iOS Android
  - Validate report conditional iOS Android
  - Deploy DokoHilf
- Merge-Commit auf `main`: `5182aaf641222ca83b9d2c4e3e71f543afe0acb7`.
- `gh-pages`-Publish-Commit: `2ea35851495d06fd5729c8ee3ac0d8417a4b7ce4` mit Nachricht `Publish DokoHilf 5182aaf641222ca83b9d2c4e3e71f543afe0acb7`.
- `main/version.json` und `gh-pages/version.json` zeigen beide Build `20260809-36`.
- Der ausgelieferte `gh-pages/assets/guide-audio-catalog.json` enthält als ersten statischen Sprachsatz **„Hey! Wobei brauchst du Hilfe?“** und verweist auf `assets/audio/guides/000.wav`.
- Der erfolgreiche Release-Build erzeugte für Eintrag 0 denselben Text und denselben synthetisierten Satz `Hey! Wobei brauchst du Hilfe?`.
- Der überholte PR #110 wurde nach erfolgreichem Ersatz durch #120 **geschlossen, nicht gemergt**. Sein Branch wurde nicht automatisch gelöscht.
- Offenes Fach-Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final bestätigt.

## 4. Abgeschlossener Fix: kurzer Sprachstart / statischer Katalogschlüssel

Bestätigte Ursache vor PR #120:

- Die sichtbare und angeforderte Begrüßung lautete bereits **„Hey! Wobei brauchst du Hilfe?“**.
- Der Supertonic-Builder wandelte den alten langen Begrüßungstext aber nur für die Synthese in den kurzen Satz um.
- Im veröffentlichten Katalogschlüssel blieb dadurch der alte lange Text stehen, obwohl die zugehörige WAV-Datei den kurzen Satz sprach.
- `assets/local-voice-gate-v28.js` indexiert statische WAVs anhand des veröffentlichten `entry.text`. Dadurch konnte die kurze Begrüßungsanfrage den vorhandenen Begrüßungseintrag verfehlen und die Sprachausgabe stumm beziehungsweise auf den neutralen statischen Fallback laufen.

Umsetzung in PR #120:

- `scripts/build-supertonic-guide-audio-v28.py` verwendet für Zusammenführung, Normalisierung, Synthese und veröffentlichten Manifesttext denselben kanonischen Begrüßungstext.
- Der Builder bricht ab, wenn die kurze Begrüßung im veröffentlichten statischen Katalog fehlt oder der alte lange Begrüßungstext als veröffentlichter Schlüssel übrig bleibt.
- `tests/local-voice-v28.test.mjs` sichert diesen Vertrag als Regressionstest ab.
- Keine fachlichen Klickwege wurden verändert.
- Keine Supabase-Migration und kein Edge-Function-Deploy waren für diesen Fix erforderlich.

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
- Aktuelle Edge-Function-Logs zeigten erfolgreiche `200`-Antworten von `dokohilf-ai-router` und `dokohilf-chat-router`.
- Für PR #120 wurde **keine** Datenbankmigration und **kein** Funktionsdeploy ausgeführt.

## 9. Nächster ausführbarer Schritt

Der Greeting-Katalogfix ist technisch abgeschlossen und veröffentlicht. Der nächste sinnvolle Schritt ist ein realer iPhone-Praxistest des Sprachstarts und der wichtigsten Orientierungsfragen. Neue fachliche Klickwege nur übernehmen, wenn sie ausdrücklich bestätigt wurden und anschließend sofort in `CONFIRMED_WORKFLOWS.md` dokumentiert werden.

## 10. Empfohlene reale iPhone-Tests

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
