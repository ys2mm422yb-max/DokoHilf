# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 9. August 2026  
**Aktueller Releaseblock:** `v29` / geplanter Build `20260809-32`  
**Aktiver Arbeitsbranch:** `fix/v29-static-supertonic-orientation-ui-20260809`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe.
- Keine Bewohner-/Mitarbeiterkonten, keine Fallakten, keine personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
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
8. Gegenüber dem Nutzer nie `live` behaupten, solange `gh-pages` nicht real verifiziert wurde.
9. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Letzter gemergter Stand vor diesem Arbeitsbranch

- PR #107 brachte die ersten deterministischen `*-finden`-Guides und Build `20260809-31`.
- PR #108 brachte kontextuelle Bereichshilfe innerhalb laufender Guides.
- `main` vor diesem Branch: `0b54cbf88ad221c0cbc16eef11a28292c22b9c93`.
- Build 31 war auf `gh-pages` testbar.
- Nach Build 31 meldete das reale iPhone zwei verbleibende Probleme:
  1. Orientierung war noch zu flach, z. B. Doku-Erweitert selbst wurde nicht ausreichend lokalisiert.
  2. Voice zeigte „Lokale Stimme nicht bereit“ und blieb stumm.

## 4. Verbindliche Spracharchitektur ab Build 32

`STATIC_VOICE_POLICY.md` ist verbindlich.

- **Jeder hörbar ausgegebene Satz kommt aus einer vorab im Release erzeugten Supertonic-3/F1-WAV-Datei.**
- Keine Supertonic-Inferenz auf iPhone, Android oder im Browser.
- Kein WebGPU-/WASM-TTS im Endgerät.
- Keine System-/Gerätestimme als Fallback.
- Keine Cloud-/Bezahl-TTS.
- `assets/local-voice-v28.js` ist nur noch ein stillgelegter Kompatibilitätspfad und darf nicht synthetisieren.
- `assets/local-voice-gate-v28.js` bedient ausschließlich den statischen Katalog.
- Für freie Texte ohne exakte Audiodatei darf nur ein ebenfalls vorab erzeugter neutraler Supertonic-F1-Satz verwendet werden; der vollständige Text bleibt sichtbar.
- Sprachstart im Sprechmodus: **„Hey! Wobei brauchst du Hilfe?“**
- Der Supertonic-Build leitet die Gesamtzahl der WAV-Dateien aus allen kontrollierten Sprachkatalogen ab. Katalogzahl, WAV-Zahl und Build-Summary müssen exakt übereinstimmen.

Kontrollierte Sprachquellen auf diesem Branch:
- Basis-Katalog
- feste Dialogsätze
- Release-Sätze
- Bedarfsmedikation / Wirksamkeitskontrolle / Maßnahmen ohne Zeitangabe
- UI-Startsatz
- grüne Navigationshierarchie
- kontextuelle `stuck`-Hilfe

## 5. Bestätigte Navigationshierarchie

- Ganz oben befindet sich die **feste grüne Hauptleiste**.
- Bestätigte Hauptbereiche dort: **Berichte, Doku, Doku-Erweitert, Planung, Analyse**.
- Nach Auswahl eines Hauptbereichs erscheinen direkt darunter die zugehörigen Symbole/Funktionen.
- Unter **Doku-Erweitert**: Vitalwerte, Visiten, Medikation, Formulare, An-/Abwesenheiten.
- Unter **Doku**: Durchführungsnachweis.
- Unter **Analyse**: Was war los? für die Übergabe.
- **Planung** als Hauptbereich ist bestätigt; der genaue Easy-Plan-Ablauf bleibt offen.
- Orientierung muss bei „Ich finde X nicht“ eine Ebene zurück erklären und darf nicht nur denselben Schritt wiederholen.

## 6. Neue bestätigte Abläufe im Build-32-Branch

### Bedarfsmedikation dokumentieren

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → kleiner Pfeil links neben Bedarfsmedikation → gewünschtes Medikament rechts anhaken → Pop-up: tatsächliche Uhrzeit prüfen/ergänzen → Anlass dokumentieren → bei tatsächlich geringerer Gabe die tatsächlich verwendete Bedarfsmenge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → Maßnahmen ohne Zeitangabe → gewünschte Maßnahme, z. B. Klienten-Team Sitzung oder Krise → Pop-up: Datum/Uhrzeit prüfen → Kategorie wählen → unter „Was war“ dokumentieren → optionale zusätzliche Zeitangabe oben rechts → unten OK.

## 7. UI-Polish in Build 32

- Update-Hinweis bleibt ungefähr 10 Sekunden sichtbar.
- `KI · v29` wird nicht mehr prominent im Kopfbereich gezeigt.
- Version/Build wird dezent ganz unten im Footer-/Statusbereich angezeigt.
- Neue Durchführung-Anleitungen erscheinen als aktive Karten vor den deaktivierten „Später“-Karten.

## 8. Aktuelle Supabase-Migrationen auf dem Branch

Nur diese beiden neuen Migrationen sind kanonisch:

1. `20260809124000_bedarfsmedikation_massnahmen_v29.sql`
2. `20260809125500_green_navigation_hierarchy_v29.sql`

Doppelte Zwischenmigrationen wurden entfernt.

Beide kanonischen Migrationen wurden gegen Produktion innerhalb `BEGIN ... ROLLBACK` erfolgreich getestet. Danach wurde ausdrücklich geprüft, dass die neuen Guide-Slugs produktiv noch **nicht** vorhanden sind. Produktive Anwendung erst nach erfolgreichem Merge des exakten finalen PR-Heads.

## 9. Noch offene Freigabeschritte

1. Branch final auf Konsistenz von Router, statischen Sprachkatalogen, Build-Gates und Tests prüfen.
2. PR gegen `main` öffnen.
3. Exakten finalen PR-Head bestimmen.
4. Alle acht Pflichtworkflows auf genau diesem Head grün bekommen.
5. Erst dann mit `expected_head_sha` mergen.
6. Danach die zwei kanonischen Migrationen produktiv anwenden.
7. Falls die geänderte `dokohilf-chat-router` Edge Function nicht über den normalen Releasepfad produktiv ausgerollt wird, sie gezielt aus dem gemergten Main deployen.
8. `main`, `gh-pages`, `version.json`, Service Worker, statischen Supertonic-Katalog und öffentlichen Build prüfen.
9. Erst danach Nutzer zum iPhone-Test auffordern.

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
