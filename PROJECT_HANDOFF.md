# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36` / Bibliothekslayout `20260810-health-medicine-library-v37-1`  
**Letzter abgeschlossener Produkt-PR:** `#123`  
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

## 2. Verbindlicher GitHub-, Mobile- und Veröffentlichungsablauf

1. Nie direkt auf `main` arbeiten.
2. Änderungen über Branch + PR integrieren.
3. Nur einen vollständig geprüften **exakten PR-Head** mergen.
4. Bei Produkt-/Releaseänderungen müssen alle acht etablierten Pflichtworkflows auf genau diesem Head grün sein. Bei einem reinen Docs-only-Abschluss müssen alle für diesen exakten Head durch die vorhandenen Workflow-Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün sein; nicht ausgelöste UI-Workflows werden nicht künstlich als fehlgeschlagen behandelt.
5. **Dauerhafte Nutzerregel: DokoHilf muss auf iPhone/iOS und Android gleichwertig funktionieren. Jede endnutzerwirksame Produkt-, UI-, Guide-, Sprach- oder Navigationsänderung wird auf beiden mobilen Plattformen geprüft. Wenn iPhone/iOS oder Android fehlschlägt, wird nicht gemergt oder veröffentlicht.**
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Bei Supabase-Änderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge.
8. Nach Merge `main`, `gh-pages` und den festen öffentlichen Stand konkret prüfen.
9. Gegenüber dem Nutzer nie `live` behaupten, solange der veröffentlichte `gh-pages`-Stand nicht real verifiziert wurde.
10. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Aktueller GitHub-/Release-Stand

Live verifiziert am 10. August 2026:

- Produkt-PR #123 **„Regroup guide library into clear purpose areas“** ist gemergt.
- Exakter freigegebener PR-Head: `95947cfeaed1bdf99d70ea8583dade9d38ac75eb`.
- Alle acht Pflichtworkflows waren auf genau diesem Head erfolgreich:
  - Context and Voice Hotfix v28
  - Validate exact PR head
  - Validate context-aware guide help v28
  - Validate detailed help iOS Android
  - Validate dark iPhone UI v27
  - Validate static voice iOS Android
  - Validate report conditional iOS Android
  - Deploy DokoHilf
- Im vollständigen Deploy war insbesondere **„Render and interact with iOS and Android layouts“** erfolgreich.
- Merge-Commit auf `main`: `960d8ce6c7aaf4570a6a36e49aa70aad6cae8e54`.
- `main` und der veröffentlichte `gh-pages`-Stand enthalten das Bibliothekslayout `20260810-health-medicine-library-v37-1`.
- `gh-pages/assets/ui-polish-v35.js` enthält die neue Gruppierung; die alte aktive Sammelgruppe „Weitere Bereiche“ ist entfernt.
- `gh-pages/service-worker.js` enthält `LIBRARY_LAYOUT_REVISION = '20260810-health-medicine-library-v37-1'`, damit installierte PWAs die neue Sortierung nachziehen.
- Build-ID bleibt `20260809-36`; die Layoutänderung wird über die eigene PWA-Layoutrevision aktualisiert.
- PR #120 mit dem kurzen statischen Sprachstart bleibt vollständig enthalten und veröffentlicht.
- Der überholte PR #110 ist geschlossen und wurde nicht gemergt. Sein Branch wurde nicht automatisch gelöscht.
- Offenes Fach-Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final bestätigt.

## 4. Verbindliche Bibliotheksgruppierung

Die Ansicht **„Alle Anleitungen“** ist nicht mehr über die unspezifische Sammelgruppe „Weitere Bereiche“ sortiert. Aktuell gilt:

### Berichte
- Bericht anlegen
- Bericht korrigieren
- Folgebericht erstellen

### Gesundheit & Medizin
- Visite anlegen
- Visiten öffnen
- Visitenstatus richtig setzen
- Vitalwerte erfassen
- Medikation ansehen
- Notfallblatt öffnen

### Organisation & Dokumente
- An-/Abwesenheit
- Formular anlegen
- Stammdaten öffnen

### Übergabe & Übersicht
- Übergabe anzeigen / „Was war los?“

### Durchführung
- Durchführung stornieren
- Durchführungsnachweis öffnen
- Bedarfsmedikation dokumentieren
- Wirksamkeitskontrolle
- Maßnahmen ohne Zeitangabe

### In Vorbereitung
- fachlich noch nicht freigegebene Inhalte bleiben deutlich als später/in Vorbereitung gekennzeichnet.
- Berichtssuche bleibt hier fachlich offen und darf nicht als fertiger Guide behandelt werden.

Die Gruppierung verändert **keinen** bestätigten Klickweg und **keinen** Guide-Inhalt. Sie ist ausschließlich eine verständlichere Sortierung der vorhandenen Anleitungen.

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

Der kurze Sprachstart wurde in PR #120 korrigiert. `gh-pages/assets/guide-audio-catalog.json` verwendet dafür denselben veröffentlichten Textschlüssel wie die WAV-Datei.

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

## 8. Weitere harte Fachregeln

- Visiten werden immer als **durchgeführt** dokumentiert, niemals als abgeschlossen.
- Berichte werden nicht endgültig gelöscht, sondern nachvollziehbar durchgestrichen.
- Falsch abgezeichnete Durchführungen werden im Durchführungsnachweis storniert.
- Medikation ist ausschließlich ein Leseweg. Keine Änderung, Dosierung, Pause, Fortsetzung, Absetzung, Korrektur, Ergänzung oder Löschung anleiten.
- Bei An- und Abwesenheiten wird `Von` immer eingetragen. `Bis` nur, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist; niemals schätzen.
- Nicht bestätigte Formularfelder oder interne Abläufe werden nicht erfunden.

## 9. Aktueller Supabase-Stand

Letzter bestätigter Stand für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projektstatus: `ACTIVE_HEALTHY`.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- Security Advisor: keine offenen Lints.
- Performance Advisor: ein reiner INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; kein akuter Fehler und deshalb nicht ungeprüft entfernen.
- Für PR #123 wurde **keine** Datenbankmigration und **kein** Edge-Function-Deploy ausgeführt.

## 10. Nächster ausführbarer Schritt

Die Bibliotheksgruppierung aus PR #123 ist technisch abgeschlossen, auf iPhone/iOS und Android geprüft und auf `gh-pages` veröffentlicht. Der nächste sinnvolle Schritt ist ein realer Praxistest der neuen „Alle Anleitungen“-Sortierung auf den tatsächlichen Endgeräten. Neue fachliche Klickwege nur übernehmen, wenn sie ausdrücklich bestätigt wurden und anschließend sofort in `CONFIRMED_WORKFLOWS.md` dokumentiert werden.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
