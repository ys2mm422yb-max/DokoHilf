# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36` / Bibliothekslayout `20260810-health-medicine-library-v37-1` / Chat-UI `20260810-mobile-chat-viewport-v38-1` / Natural Routing `20260810-natural-guide-routing-v39-1` / Guide-Completions `20260810-natural-guide-completions-v40-1`  
**Letzter abgeschlossener Produkt-PR:** `#132`  
**Aktiver Produkt-Arbeitsbranch:** keiner  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, `CROSS_PLATFORM_POLICY.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug ausschließlich das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

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
- Der genaue Easy-Plan-Ablauf bleibt fachlich offen. `Planung` als Hauptbereich darf gefunden/geöffnet werden; Easy-Plan-Details dürfen weder im Schreibchat noch im Sprachchat erfunden oder erklärt werden.

## 2. Verbindlicher GitHub-, Mobile- und Veröffentlichungsablauf

1. Nie direkt auf `main` arbeiten.
2. Änderungen über Branch + PR integrieren.
3. Nur einen vollständig geprüften **exakten PR-Head** mergen.
4. Bei Produkt-/Releaseänderungen müssen alle acht etablierten Pflichtworkflows auf genau diesem Head grün sein. Bei einem reinen Docs-only-Abschluss müssen alle für diesen exakten Head durch die vorhandenen Workflow-Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün sein; nicht ausgelöste UI-Workflows werden nicht künstlich als fehlgeschlagen behandelt.
5. **Dauerhafte Nutzerregel: DokoHilf muss auf iPhone/iOS und Android gleichwertig funktionieren. Jede endnutzerwirksame Produkt-, UI-, Guide-, Sprach- oder Navigationsänderung wird auf beiden mobilen Plattformen geprüft. Wenn iPhone/iOS oder Android fehlschlägt, wird nicht gemergt oder veröffentlicht.** `CROSS_PLATFORM_POLICY.md` ist verbindlich.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Bei Datenbankänderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge. Edge-Function-Änderungen ebenfalls erst nach geprüftem Merge produktiv deployen.
8. Nach Merge `main`, `gh-pages`, den festen öffentlichen Stand und betroffene Supabase-Ressourcen konkret prüfen.
9. Gegenüber dem Nutzer nie `live` behaupten, solange der veröffentlichte `gh-pages`-Stand nicht real verifiziert wurde.
10. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Aktueller GitHub-/Release-Stand

Live auf Repository-, Supabase- und `gh-pages`-Ebene verifiziert am 10. August 2026:

- Produkt-PR #132 **„Make guide completions natural and context-aware“** ist gemergt.
- Exakter freigegebener PR-Head: `fcfd4fdd2fbaa26d16cf91d1b185b432320aa198`.
- Alle acht Pflichtworkflows waren auf genau diesem Head erfolgreich:
  - Context and Voice Hotfix v28
  - Validate exact PR head
  - Validate context-aware guide help v28
  - Validate detailed help iOS Android
  - Validate dark iPhone UI v27
  - Validate static voice iOS Android
  - Validate report conditional iOS Android
  - Deploy DokoHilf
- Im vollständigen Deploy waren insbesondere **„Render and interact with iOS and Android layouts“**, der aktive Router-Check, die komplette Supertonic-Erzeugung und der exakte Releasebuild erfolgreich.
- Merge-Commit auf `main`: `7b9f79554d8215c2995fc05622d0cb3bd0e290df`.
- `main/assets/routing-fix.js` und `gh-pages/assets/routing-fix.js` verwenden `ROUTING_REVISION = '20260810-natural-guide-completions-v40-1'` und routen den produktiven Chat zum `dokohilf-conversation-router`.
- `main/service-worker.js` und `gh-pages/service-worker.js` enthalten `ROUTING_REVISION` und `CONVERSATION_COMPLETION_REVISION` mit demselben v40-Wert.
- Der neue Edge Function `dokohilf-conversation-router` ist im Projekt `efifbuqctylsujiauabg` produktiv `ACTIVE`; zuletzt beobachtete Version 2. `verify_jwt=false` bleibt absichtlich erhalten, weil DokoHilf öffentlich und accountfrei ist.
- Der Wrapper verarbeitet nur natürliche Guide-Abschlüsse und definierte bestätigte Anschlussdialoge. Alle übrigen Nachrichten gehen weiter an den bestehenden `dokohilf-chat-router`; die bestehende Fach-, Kontext- und Sicherheitslogik bleibt damit erhalten.
- Supabase Security Advisor nach dem Edge-Deploy: keine offenen Lints.
- Für PR #132 war **keine Datenbankmigration** nötig.
- Offenes Fach-Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final bestätigt.

## 4. Guide-Completions v40: natürliche Abschlüsse und bestätigte Anschlussdialoge

### Fehlerbild vor PR #132

Nach dem letzten bestätigten Schritt verwendete der darunterliegende Stateful-Router praktisch für jeden Guide denselben technischen Abschluss:

`Der Ablauf ist erledigt. Kontrolliere zum Schluss, ob der Eintrag in der vorgesehenen Übersicht sichtbar ist.`

Das war bei echten Speicherabläufen unnatürlich und bei reinen Finden-/Öffnen-Guides teilweise sachlich falsch. Reales Beispiel: Nach **„Ich finde An-/Abwesenheit nicht“** wurde der Bereich korrekt gefunden; auf das anschließende **„Ja“** folgte trotzdem ein Satz über einen angeblichen Eintrag, obwohl noch nichts eingetragen worden war.

### Verbindlicher Fix ab PR #132

- `dokohilf-conversation-router` sitzt als schmale Completion-Schicht vor dem bestehenden `dokohilf-chat-router`.
- Alle **40 aktuell freigegebenen Guides** besitzen im `guide-completion-contract.mjs` einen expliziten natürlichen Abschluss.
- Der alte generische Technikabschluss wird auf dem produktiven v40-Completion-Pfad nicht mehr verwendet.
- Finden-/Öffnen-Guides bestätigen das erreichte Ziel natürlich und bieten nur dann einen nächsten Schritt an, wenn dafür bereits ein bestätigter Guide existiert.
- Echte Dokumentations-/Speicherabläufe enden mit einer kurzen zum Ergebnis passenden Bestätigung, zum Beispiel gespeicherter Bericht, gespeicherte Maßnahme oder Visite mit Status `durchgeführt`.
- Korrektur/Storno bestätigt das tatsächliche Ergebnis statt einen allgemeinen Kontrollsatz auszugeben.
- Medikation bleibt ausschließlich **ansehen**; weder Abschluss noch Anschlussdialog darf in einen Änderungsablauf führen.
- Reine Orientierung zu `Doku`, `Doku-Erweitert`, `Analyse` oder `Planung` darf nur bestätigen, dass der Nutzer im richtigen Hauptbereich ist. Nicht bestätigte Unterfunktionen werden nicht angeboten.

### Kontext wird beim Anschluss erhalten

Bestätigte Beispiele:

- `anwesenheiten-finden` → **„Perfekt, dann hast du An-/Abwesenheiten gefunden. Möchtest du dort jetzt eine An- oder Abwesenheit eintragen?“** → bei Ja wird zunächst geprüft, ob der richtige Bewohner ausgewählt ist → danach geht es direkt bei **„Neu“** weiter; `Doku-Erweitert → An-/Abwesenheiten` wird nicht erneut erklärt.
- `formulare-finden` → Bewohner prüfen → direkt bei **„Neu“** weiter.
- `berichte-finden` → bei gewünschtem neuen Bericht direkt beim grünen Plus weiter.
- `visiten-finden` / `visiten-oeffnen` → bei gewünschter Dokumentation direkt beim grünen Plus beziehungsweise „Neu“ weiter.
- `bedarfsmedikation-finden`, Wirksamkeitskontrolle und Maßnahmen ohne Zeitangabe übernehmen den bereits erreichten Durchführungs-Kontext und wiederholen nicht unnötig die komplette Navigation.
- Nach einem durchgestrichenen Bericht darf gefragt werden, ob der Inhalt korrekt als **neuer Bericht** dokumentiert werden soll; ein Folgebericht wird weiterhin nicht als Korrektur missbraucht.

### Offene Auswahl ist nicht „erledigt“

- `vitalwerte-erfassen`: Ein bloßes **„Ja“** beendet den Ablauf nicht. DokoHilf fragt weiter, ob ein einzelner Vitalwert oder mehrere Werte gleichzeitig erfasst werden sollen.
- `durchfuehrungsnachweis-oeffnen` / `durchfuehrungsnachweis-finden`: Ein bloßes **„Ja“** beendet ebenfalls nichts. DokoHilf fragt nach dem tatsächlichen Ziel, zum Beispiel Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahme ohne Zeitangabe, Storno oder nur ansehen.

### Harte Sperren für noch nicht bestätigte Funktionen

Folgende Ziele sind im Completion-Contract ausdrücklich als unzulässige Anschlussziele abgesichert:

- `berichtssuche`
- `easyplan`
- `aufgaben-aktuelles`

Die zugehörigen noch offenen/verblendeten Abläufe werden daher **weder im Schreibchat noch im Sprachchat** durch die neue Gesprächslogik freigeschaltet oder erklärt.

## 5. Statische Sprache für v40

`STATIC_VOICE_POLICY.md` bleibt vollständig verbindlich.

- Alle neuen hörbaren Completion- und Anschlussformulierungen sind in `assets/voice-completion-catalog-v40.json` fest katalogisiert.
- Der Completion-Katalog enthält exakt **44 feste Supertonic-F1-Sätze**.
- Der GitHub-Releasebuild erzeugt damit aktuell insgesamt **275 statische WAV-Dateien**.
- `gh-pages/assets/guide-audio-catalog.json` enthält `completionSourceCount: 44` und `staticSpeechCount: 275`.
- Der konkrete An-/Abwesenheits-Anschluss **„Perfekt, dann hast du An-/Abwesenheiten gefunden. Möchtest du dort jetzt eine An- oder Abwesenheit eintragen?“** ist veröffentlicht als `assets/audio/guides/241.wav`.
- Keine Supertonic-Inferenz auf iPhone, Android oder im Browser.
- Kein WebGPU-/WASM-TTS im Endgerät.
- Keine System-/Gerätestimme als Fallback.
- Keine Cloud-/Bezahl-TTS.
- Für freie Texte ohne exakte Audiodatei bleibt nur der bereits definierte statische neutrale Fallback zulässig; der vollständige Text bleibt sichtbar.
- Sprachstart im Sprechmodus bleibt **„Hey! Wobei brauchst du Hilfe?“**.

## 6. Natürliches Routing v39 bleibt enthalten

PR #130 hatte bereits den Fehler behoben, dass natürliche deutsche Formulierungen wie **„Wie lege ich eine Visite an?“** an konkreten Guides vorbeifallen konnten.

- Natürliche Aktionsformen wie `lege … an`, `trage … ein`, `erstelle`, `dokumentiere`, `erfasse`, `öffne`, `rufe … auf`, `sehe … an` werden für bestätigte konkrete Guides erkannt.
- Mehrdeutige Vitalwert-Fragen werden nicht lokal auf einen falschen Modus gezwungen.
- Medikationsänderungen werden nicht lokal geroutet.
- Easy-Plan bleibt ungeklärt und wird nicht lokal erzwungen.
- `dokohilf_topics.visiten` wurde nach PR #130 an den inzwischen bestätigten Detailstand angepasst.
- `visite-anlegen` bleibt `approved`, Version 11, mit unverändertem bestätigtem Klickweg.

v40 ersetzt diese Logik nicht, sondern ergänzt sie nur um natürliche Abschlüsse und Anschlussdialoge.

## 7. Mobiler Chat: Tastatur, sichtbarer Viewport und aktive Unterhaltung

Chat-UI v38 aus PR #128 bleibt unverändert aktiv:

- Die final wirksame Mobile-Schicht setzt das Textarea auf `font-size:16px!important`.
- Die Chat-Shell orientiert sich über `visualViewport.height` an der tatsächlich sichtbaren mobilen Höhe.
- Der Chat ist mobil eine Viewport-Spalte mit eigenem Scrollbereich und Composer am unteren sichtbaren Rand.
- Kurze aktive Gespräche liegen direkt über dem Composer; lange Verläufe scrollen normal.
- Neue Antworten beziehungsweise Schrittaktionen werden automatisch in Sicht gebracht.
- Schrittbuttons heißen **„Erledigt, weiter“** und **„Hilfe zum Schritt“**.
- Enter sendet; `Shift+Enter` bleibt Zeilenumbruch.
- Beim Eintritt in den mobilen Schreibmodus wird kein ungefragter Fokus erzwungen.

Der Release-Render prüft weiterhin beide Pflichtprofile:

- iOS: 393 × 852
- Android: 412 × 915
- berechnete Textarea-Schrift mindestens 16 px
- Composer am sichtbaren unteren Chat-Rand
- kein ungefragter Fokus
- keine Console-/Page-Fehler im finalen Render

Eine physisch eingeblendete iOS-Systemtastatur lässt sich in CI nicht vollständig nachbilden; reale Gerätetests bleiben deshalb ein sinnvoller zusätzlicher QA-Schritt.

## 8. Verbindliche Bibliotheksgruppierung

Die Ansicht **„Alle Anleitungen“** ist aktuell so gruppiert:

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
- Berichtssuche bleibt fachlich offen und darf nicht als fertiger Guide behandelt werden.
- Der genaue Easy-Plan-Ablauf bleibt ebenfalls ungeklärt und darf nicht durch Chat oder Sprache vorweggenommen werden.

Die Gruppierung verändert keinen bestätigten Klickweg und keinen Guide-Inhalt.

## 9. Bestätigte Navigationshierarchie

- Ganz oben befindet sich die **feste grüne Hauptleiste**.
- Bestätigte Hauptbereiche dort: **Berichte, Doku, Doku-Erweitert, Planung, Analyse**.
- Nach Auswahl eines Hauptbereichs erscheinen direkt darunter die zugehörigen Symbole/Funktionen.
- Unter **Doku-Erweitert**: Vitalwerte, Visiten, Medikation, Formulare, An-/Abwesenheiten.
- Unter **Doku**: Durchführungsnachweis.
- Unter **Analyse**: Was war los? für die Übergabe.
- **Planung** als Hauptbereich ist bestätigt; der genaue Easy-Plan-Ablauf bleibt offen.
- Orientierung muss bei „Ich finde X nicht“ eine Ebene zurück erklären und darf nicht nur denselben Schritt wiederholen.

## 10. Bestätigte Durchführung-Abläufe

### Bedarfsmedikation dokumentieren

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → kleiner Pfeil links neben Bedarfsmedikation → gewünschtes Medikament rechts anhaken → Pop-up-Fenster: tatsächliche Uhrzeit prüfen/ergänzen → Anlass dokumentieren → bei tatsächlich geringerer Gabe die tatsächlich verwendete Bedarfsmenge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → **kleiner Pfeil links neben „Maßnahmen ohne Zeitangabe“** → gewünschte Maßnahme wählen, zum Beispiel Klienten-Team Sitzung oder Krise → Pop-up-Fenster: Datum/Uhrzeit prüfen → Kategorie wählen → im großen Textfeld dokumentieren → optionale zusätzliche Zeitangabe oben rechts → unten OK.

## 11. Weitere harte Fachregeln

- Visiten werden immer als **durchgeführt** dokumentiert, niemals als abgeschlossen.
- Berichte werden nicht endgültig gelöscht, sondern nachvollziehbar durchgestrichen.
- Falsch abgezeichnete Durchführungen werden im Durchführungsnachweis storniert.
- Medikation ist ausschließlich ein Leseweg. Keine Änderung, Dosierung, Pause, Fortsetzung, Absetzung, Korrektur, Ergänzung oder Löschung anleiten.
- Bei An- und Abwesenheiten wird `Von` immer eingetragen. `Bis` nur, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist; niemals schätzen.
- Nicht bestätigte Formularfelder oder interne Abläufe werden nicht erfunden.

## 12. Aktueller Supabase-Stand

Letzter bestätigter Stand für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projektstatus zuletzt gesund / produktiv erreichbar.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- Aktuell 40 freigegebene Guides; der v40-Completion-Contract deckt genau diese freigegebenen Slugs ab.
- `visite-anlegen` bleibt `approved`, Version 11, und der bestätigte vollständige Ablauf bleibt unverändert.
- `dokohilf_topics.visiten` wurde nach PR #130 mit der bereits dokumentierten Migration an die bestätigten Detailguides angepasst.
- `dokohilf-conversation-router` ist `ACTIVE`, zuletzt Version 2, und sitzt produktiv vor `dokohilf-chat-router`.
- `dokohilf-ai-router`, `dokohilf-chat-router` und die bestehende Kernlogik bleiben darunter erhalten; v40 dupliziert keine allgemeine Fachlogik.
- Security Advisor: keine offenen Lints nach dem v40-Edge-Deploy.
- Performance Advisor hatte zuletzt nur den INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; nicht ungeprüft entfernen.
- PR #132 enthält keine Datenbankmigration.

## 13. Nächster ausführbarer Schritt

Guide-Completions v40 sind technisch abgeschlossen, auf iPhone/iOS und Android geprüft, in Supabase deployed und auf `gh-pages` veröffentlicht. Es gibt keinen offenen v40-Produkt-Arbeitsblock.

Sinnvoller Praxischeck auf einem echten Gerät:

1. Neue Unterhaltung starten.
2. Beispiel: **„Ich finde An-/Abwesenheit nicht.“**
3. Nach erfolgreichem Finden auf die Frage, ob der Bereich geöffnet ist, **„Ja“** antworten.
4. Erwartet wird jetzt die natürliche Anschlussfrage: **„Perfekt, dann hast du An-/Abwesenheiten gefunden. Möchtest du dort jetzt eine An- oder Abwesenheit eintragen?“**
5. Bei anschließendem Ja wird der richtige Bewohner geprüft und danach direkt bei **„Neu“** weitergeführt, ohne die bereits erledigte Navigation zu wiederholen.

Nur reproduzierbare Restfehler werden weiter angepasst; nicht auf Verdacht. Neue fachliche Klickwege nur übernehmen, wenn sie ausdrücklich bestätigt wurden und anschließend sofort in `CONFIRMED_WORKFLOWS.md` dokumentiert werden.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
