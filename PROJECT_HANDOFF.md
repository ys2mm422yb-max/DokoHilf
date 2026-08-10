# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36` / Bibliothekslayout `20260810-health-medicine-library-v37-1` / Chat-UI `20260810-mobile-chat-viewport-v38-1` / Routing `20260810-natural-guide-routing-v39-1`  
**Letzter abgeschlossener Produkt-PR:** `#130`  
**Aktiver Produkt-Arbeitsbranch:** keiner  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, `CROSS_PLATFORM_POLICY.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug ausschließlich das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

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
5. **Dauerhafte Nutzerregel: DokoHilf muss auf iPhone/iOS und Android gleichwertig funktionieren. Jede endnutzerwirksame Produkt-, UI-, Guide-, Sprach- oder Navigationsänderung wird auf beiden mobilen Plattformen geprüft. Wenn iPhone/iOS oder Android fehlschlägt, wird nicht gemergt oder veröffentlicht.** `CROSS_PLATFORM_POLICY.md` ist verbindlich.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Bei Supabase-Änderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge.
8. Nach Merge `main`, `gh-pages` und den festen öffentlichen Stand konkret prüfen.
9. Gegenüber dem Nutzer nie `live` behaupten, solange der veröffentlichte `gh-pages`-Stand nicht real verifiziert wurde.
10. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Aktueller GitHub-/Release-Stand

Live auf Repository-, Supabase- und `gh-pages`-Ebene verifiziert am 10. August 2026:

- Produkt-PR #130 **„Route natural chat questions to concrete guides“** ist gemergt.
- Exakter freigegebener PR-Head: `0eb5fd3cebfc7d5d3f81a8ee7d655f95e192366c`.
- Alle acht Pflichtworkflows waren auf genau diesem Head erfolgreich:
  - Context and Voice Hotfix v28
  - Validate exact PR head
  - Validate context-aware guide help v28
  - Validate detailed help iOS Android
  - Validate dark iPhone UI v27
  - Validate static voice iOS Android
  - Validate report conditional iOS Android
  - Deploy DokoHilf
- Im vollständigen Deploy waren insbesondere **„Render and interact with iOS and Android layouts“** und **„Check active DokoHilf router“** erfolgreich.
- Merge-Commit auf `main`: `2332abbfb1d09555f084d05f64aa699cf3398a82`.
- `main/assets/routing-fix.js` und `gh-pages/assets/routing-fix.js` enthalten `ROUTING_REVISION = '20260810-natural-guide-routing-v39-1'` und führen alte `dokohilf-ai*`-Requests zum `dokohilf-chat-router`.
- `main/service-worker.js` und `gh-pages/service-worker.js` enthalten dieselbe Routing-Revision, damit der neue Router-Patch über den PWA-Updateweg ausgeliefert wird.
- Der Live-Router-Test enthält den real gemeldeten Satz **„Wie lege ich eine Visite an?“** und erwartet den freigegebenen Guide `visite-anlegen`, Schritt 1, mit kurzer Antwort statt allgemeinem Themenblock.
- Supabase-Migration `shorten_visiten_topic_after_routing_v39` ist nach vorherigem Transaktions-Dry-Run produktiv angewendet.
- Der allgemeine Themenblock `visiten` ist jetzt kurz und verweist nicht mehr fälschlich darauf, dass nur der Einstieg bestätigt sei.
- `visite-anlegen` bleibt in Supabase `approved`, Version 11; Schritt 1 lautet weiterhin **„Öffne „Doku-Erweitert“ und wähle „Visiten“.“**, Schritt 2 **„Klicke oben links auf das grüne Plus beziehungsweise „Neu“.“**.
- Supabase Security Advisor: keine offenen Lints nach der Migration.
- Chat-UI v38 aus PR #128 bleibt vollständig enthalten und veröffentlicht.
- Die Bibliotheksgruppierung aus PR #123, die iPhone-/Android-Freigaberegel aus PR #125 und der kurze statische Sprachstart aus PR #120 bleiben vollständig enthalten und veröffentlicht.
- Der überholte PR #110 ist geschlossen und wurde nicht gemergt. Sein Branch wurde nicht automatisch gelöscht.
- Offenes Fach-Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final bestätigt.

## 4. Schreib-Chat: natürliche Bedienfragen und konkrete Guides

### Fehlerbild vor PR #130

Ein realer iPhone-Test zeigte bei **„Wie lege ich eine Visite an?“** einen langen allgemeinen Visiten-Text statt der vorhandenen Schritt-für-Schritt-Anleitung. Die Oberfläche war dabei korrekt; die Antwortlogik war falsch.

### Bestätigte Ursache

- Der freigegebene Guide `visite-anlegen` war bereits vollständig vorhanden.
- Die Router erkannten hauptsächlich Grundformen wie `anlegen`, `eintragen`, `dokumentieren`.
- Natürliche deutsche Formulierungen mit konjugierten oder trennbaren Verben wie **„lege … an“**, **„trage … ein“** oder **„rufe … auf“** konnten deshalb am konkreten Guide vorbeifallen.
- Bei einem solchen Fehlrouting konnte die allgemeine Themenantwort aus `dokohilf_topics` zurückgegeben werden.
- Der Visiten-Themenblock enthielt zusätzlich eine veraltete Aussage, wonach nur das Öffnen des Visitenbereichs bestätigt sei, obwohl der komplette `visite-anlegen`-Guide inzwischen freigegeben war.

### Verbindlicher Fix ab PR #130

- `assets/routing-fix.js` erkennt eindeutige natürliche deutsche Aktionsformulierungen und setzt nur für **bereits freigegebene konkrete Guides** einen `selectedGuideSlug`.
- Der sichtbare Nutzersatz wird dadurch nicht umformuliert; die Erkennung dient nur dem Routing.
- Alte AI-Endpunkte werden im produktiven Browserpfad direkt zum bestehenden `dokohilf-chat-router` geführt.
- Abgedeckte natürliche Aktionsformen umfassen unter anderem `lege … an`, `trage … ein`, `erstelle`, `dokumentiere`, `erfasse`, `öffne`, `rufe … auf`, `sehe … an`.
- Mehrdeutige Vitalwert-Fragen werden **nicht** lokal erzwungen; die bestehende Auswahl Einzelwert/Sammelerfassung bleibt zuständig.
- Medikationsänderungen werden **nicht** lokal geroutet; die verbindliche View-only-Sicherheitslogik bleibt zuständig.
- Easy-Plan wird nicht lokal erzwungen, solange der genaue fachliche Ablauf offen ist.
- Ein bereits aktiver Guide wird durch die neue lokale Erkennung nicht ungefragt überschrieben.
- Die Regressionstests sperren diese Grenzen und den exakten Visiten-Satz dauerhaft ab.

Für **„Wie lege ich eine Visite an?“** muss DokoHilf damit direkt den Guide `visite-anlegen` starten und mit dem bestätigten ersten Schritt beginnen, statt allgemeine Möglichkeiten oder interne Freigabehinweise aufzuzählen.

## 5. Mobiler Chat: Tastatur, sichtbarer Viewport und aktive Unterhaltung

### Fehlerkette vor PR #128

PR #126 hatte den zuerst sichtbaren iPhone-Fokuszoom bereits an einer späten CSS-Schicht korrigiert. Beim anschließenden vollständigen Chat-Review zeigte sich jedoch, dass noch eine **später per JavaScript injizierte Mobile-Schicht** existierte:

- `assets/mobile-polish-v29.js` setzte das Textarea weiterhin mit höherer Spezifität auf `15px!important`.
- Damit konnte der 16-px-Schutz trotz korrekt aussehender CSS-Datei auf dem tatsächlichen Mobilgerät wieder überstimmt werden.
- Zusätzlich war der Composer mobil als `position:sticky` Teil des Dokumentflusses. Bei kurzen Gesprächen stand die Eingabeleiste dadurch sichtbar zu weit oben und ließ unnötigen Leerraum unter sich.

### Verbindlicher Fix ab PR #128

- Die **final wirksame Mobile-Schicht** setzt das Textarea auf `font-size:16px!important`, `min-width:0` und 100 % Text-Scaling.
- Die Chat-Shell orientiert sich über `visualViewport.height` an der tatsächlich sichtbaren mobilen Höhe und aktualisiert sich bei Resize, Rotation, `pageshow` und Visual-Viewport-Änderungen.
- Der Chat ist mobil eine Viewport-Spalte: Topbar oben, dazwischen ein eigener vertikal scrollbarer Gesprächsbereich, Composer als unteres Flex-Element.
- Der Composer ist nicht mehr `sticky`; er bleibt durch das Flexlayout am unteren Rand des sichtbaren Chatbereichs.
- Kurze aktive Gespräche werden mit `margin-top:auto` direkt über den Composer gezogen; lange Verläufe belegen den verfügbaren Bereich und scrollen normal.
- Neue Antworten beziehungsweise Schrittaktionen werden automatisch in Sicht gebracht.
- Der Guide-Fortschritt bleibt im inneren Chat-Scroller erreichbar.
- Die Schrittbuttons heißen verständlicher **„Erledigt, weiter“** und **„Hilfe zum Schritt“**.
- Die mobile Enter-Taste erhält `enterkeyhint="send"`. Das vorhandene Hauptskript sendet bereits mit Enter; `Shift+Enter` bleibt Zeilenumbruch.
- Nutzer- und aktuelle Assistentenblasen haben auf Mobilgeräten etwas klareren Textkontrast.
- Der Datenschutzhinweis unter dem Composer ist mit 10,5 px besser lesbar als zuvor mit 9 px.
- Beim Eintritt in den mobilen Schreibmodus wird ein ungefragt gesetzter Fokus wieder gelöst, damit die Tastatur nicht sofort den Einstieg verdeckt.

### Reale Freigabeprüfung

Der Release-Render prüft den Chat nicht mehr nur über Quelltextmarker, sondern misst die **berechnete Browser-Geometrie** auf beiden Pflichtprofilen:

- iOS: 393 × 852
- Android: 412 × 915
- berechnete Textarea-Schrift mindestens 16 px
- Composer `position:relative`
- Abstand Composer → sichtbarer unterer Chat-Rand höchstens 3 px; im finalen Evidence-Run 0 px
- `chatInput` ist beim Einstieg nicht automatisch fokussiert
- nach einer Antwort bleiben Composer und Schrittaktionen korrekt sichtbar
- die beiden Schrittbuttons tragen die bestätigten neuen UI-Beschriftungen
- keine Console- oder Page-Fehler im finalen Render

### Noch sinnvoller echter Gerätetest

Die CI simuliert iPhone- und Android-Viewport, Touch und Interaktionen, aber keine physisch eingeblendete iOS-Systemtastatur. Deshalb bleibt ein kurzer Praxistest auf einem echten iPhone sinnvoll: Eingabefeld fokussieren → Tastatur öffnen → Text schreiben → Tastatur schließen → prüfen, dass Skalierung, unterer Composer und Scrollposition stabil bleiben. Das ist ein QA-Test, kein derzeit bekannter offener Produktfehler.

## 6. Verbindliche Bibliotheksgruppierung

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

## 7. Verbindliche Spracharchitektur

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

## 8. Bestätigte Navigationshierarchie

- Ganz oben befindet sich die **feste grüne Hauptleiste**.
- Bestätigte Hauptbereiche dort: **Berichte, Doku, Doku-Erweitert, Planung, Analyse**.
- Nach Auswahl eines Hauptbereichs erscheinen direkt darunter die zugehörigen Symbole/Funktionen.
- Unter **Doku-Erweitert**: Vitalwerte, Visiten, Medikation, Formulare, An-/Abwesenheiten.
- Unter **Doku**: Durchführungsnachweis.
- Unter **Analyse**: Was war los? für die Übergabe.
- **Planung** als Hauptbereich ist bestätigt; der genaue Easy-Plan-Ablauf bleibt offen.
- Orientierung muss bei „Ich finde X nicht“ eine Ebene zurück erklären und darf nicht nur denselben Schritt wiederholen.

## 9. Bestätigte Durchführung-Abläufe

### Bedarfsmedikation dokumentieren

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → kleiner Pfeil links neben Bedarfsmedikation → gewünschtes Medikament rechts anhaken → Pop-up-Fenster: tatsächliche Uhrzeit prüfen/ergänzen → Anlass dokumentieren → bei tatsächlich geringerer Gabe die tatsächlich verwendete Bedarfsmenge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → **kleiner Pfeil links neben „Maßnahmen ohne Zeitangabe“** → gewünschte Maßnahme wählen, zum Beispiel Klienten-Team Sitzung oder Krise → Pop-up-Fenster: Datum/Uhrzeit prüfen → Kategorie wählen → im großen Textfeld dokumentieren → optionale zusätzliche Zeitangabe oben rechts → unten OK.

## 10. Weitere harte Fachregeln

- Visiten werden immer als **durchgeführt** dokumentiert, niemals als abgeschlossen.
- Berichte werden nicht endgültig gelöscht, sondern nachvollziehbar durchgestrichen.
- Falsch abgezeichnete Durchführungen werden im Durchführungsnachweis storniert.
- Medikation ist ausschließlich ein Leseweg. Keine Änderung, Dosierung, Pause, Fortsetzung, Absetzung, Korrektur, Ergänzung oder Löschung anleiten.
- Bei An- und Abwesenheiten wird `Von` immer eingetragen. `Bis` nur, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist; niemals schätzen.
- Nicht bestätigte Formularfelder oder interne Abläufe werden nicht erfunden.

## 11. Aktueller Supabase-Stand

Letzter bestätigter Stand für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projektstatus zuletzt `ACTIVE_HEALTHY`.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- `visite-anlegen` ist `approved`, Version 11, und der bestätigte vollständige Ablauf bleibt unverändert.
- `dokohilf_topics.visiten` wurde nach PR #130 mit Migration `shorten_visiten_topic_after_routing_v39` an die inzwischen freigegebenen Detailguides angepasst; der veraltete Hinweis auf angeblich unbestätigte Detailwege ist entfernt.
- Security Advisor: keine offenen Lints nach der Migration.
- Performance Advisor hatte zuletzt nur den INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; kein akuter Fehler und deshalb nicht ungeprüft entfernen.
- Für PR #123, #125, #126 und #128 wurde keine Datenbankmigration und kein Edge-Function-Deploy ausgeführt. PR #130 enthält ausschließlich die oben dokumentierte allgemeine Visiten-Themenmigration; kein Edge-Function-Deploy war nötig.

## 12. Nächster ausführbarer Schritt

Routing v39 aus PR #130 ist technisch abgeschlossen, auf iPhone/iOS und Android geprüft, mit dem konkreten real gemeldeten Visiten-Satz im Live-Router-Test abgesichert und auf `gh-pages` veröffentlicht. Sinnvoll ist jetzt ein echter Praxistest im Schreib-Chat mit **„Wie lege ich eine Visite an?“**. Erwartet wird direkt der bestätigte Schritt 1 des Guides und anschließend die normale schrittweise Führung – keine allgemeine Visiten-Textwand.

Für die mobile Oberfläche bleibt zusätzlich der kurze echte Gerätetest mit geöffneter Bildschirmtastatur sinnvoll. Nur reproduzierbare Restfehler werden weiter angepasst; nicht auf Verdacht.

Neue fachliche Klickwege nur übernehmen, wenn sie ausdrücklich bestätigt wurden und anschließend sofort in `CONFIRMED_WORKFLOWS.md` dokumentiert werden.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
