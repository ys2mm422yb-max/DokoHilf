# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 10. August 2026  
**Aktueller Releaseblock:** `v29` / Build `20260809-36` / Bibliothekslayout `20260810-health-medicine-library-v37-1` / Chat-UI `20260810-mobile-chat-viewport-v38-1` / Routing & natürliche Guide-Abschlüsse `20260810-natural-guide-completions-v40-1`  
**Letzter abgeschlossener Produkt-PR:** `#132`  
**Aktiver Produkt-Arbeitsbranch:** keiner  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, `CROSS_PLATFORM_POLICY.md`, `STATIC_VOICE_POLICY.md`, diese Datei und alle `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Supabase-Bezug ausschließlich das Projekt `efifbuqctylsujiauabg` live geprüft. Veränderliche Zustände niemals nur aus Dokumentation ableiten.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere GitHub- oder Supabase-Projekte werden nicht geöffnet, verändert, verbunden oder als Deployment-Ziel genutzt.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe; es gibt **keinerlei Konten oder Anmeldung**.
- Keine Bewohner-/Mitarbeiterkonten, keine Fallakten, keine personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
- Öffentliche Projekttexte und Testzustände sind selbst formuliert, anonymisiert und veröffentlichungsfähig; keine reale Person und kein realer Fall werden nachgebildet.
- Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert; veröffentlicht werden nur bestätigte DokoHilf-Ergebnisse und Regeln.
- Keine erfundenen Klickwege oder Feldnamen. `CONFIRMED_WORKFLOWS.md` ist fachliche Source of Truth.
- Berichtssuche bleibt fachlich offen / Draft. Issue #103 nicht durch erfundene Details schließen.
- Der genaue Easy-Plan-Ablauf bleibt offen und darf nicht erfunden werden.

## 2. Verbindlicher GitHub-, Mobile- und Veröffentlichungsablauf

1. Nie direkt auf `main` arbeiten.
2. Änderungen über Branch + PR integrieren.
3. Nur einen vollständig geprüften **exakten PR-Head** mergen.
4. Bei Produkt-/Releaseänderungen müssen alle acht etablierten Pflichtworkflows auf genau diesem Head grün sein. Bei einem reinen Docs-only-Abschluss müssen alle für diesen exakten Head durch die vorhandenen Workflow-Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün sein; nicht ausgelöste UI-Workflows werden nicht künstlich als fehlgeschlagen behandelt.
5. **Dauerhafte Nutzerregel: DokoHilf muss auf iPhone/iOS und Android gleichwertig funktionieren. Jede endnutzerwirksame Produkt-, UI-, Guide-, Sprach- oder Navigationsänderung wird auf beiden mobilen Plattformen geprüft. Wenn iPhone/iOS oder Android fehlschlägt, wird nicht gemergt oder veröffentlicht.** `CROSS_PLATFORM_POLICY.md` ist verbindlich.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Bei Datenbankänderungen zuerst Dry-Run in Transaktion mit Rollback; produktive Migration erst nach Merge.
8. Edge-Functions werden bei Produktänderungen erst nach erfolgreichem Merge aus dem gemergten Stand produktiv deployed.
9. Nach Merge `main`, `gh-pages`, den festen öffentlichen Stand und bei Supabase-Bezug den tatsächlich aktiven Function-/Advisor-Stand konkret prüfen.
10. Gegenüber dem Nutzer nie `live` behaupten, solange der veröffentlichte `gh-pages`-Stand nicht real verifiziert wurde.
11. Sichtbare Versionsbezeichnungen in Actions/Tests/Statushinweisen aktuell halten; wo die Versionsnummer keinen fachlichen Nutzen hat, versionsneutral benennen.

## 3. Aktueller GitHub-/Release-Stand – v40

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
- Im vollständigen Deploy waren insbesondere **„Render and interact with iOS and Android layouts“**, **„Check active DokoHilf router“**, der vollständige statische Supertonic-Build und der exakte Release-Build erfolgreich.
- Merge-Commit auf `main`: `7b9f79554d8215c2995fc05622d0cb3bd0e290df`.
- `main/assets/routing-fix.js` und `gh-pages/assets/routing-fix.js` führen alte `dokohilf-ai*`-Requests zum neuen `dokohilf-conversation-router`.
- `main/service-worker.js` und `gh-pages/service-worker.js` enthalten `ROUTING_REVISION` und `CONVERSATION_COMPLETION_REVISION` jeweils als `20260810-natural-guide-completions-v40-1`.
- Der veröffentlichte statische Sprachbestand ist vollständig: Supertonic 3 / F1, Sprache `de`, `completionSourceCount = 44`, insgesamt `staticSpeechCount = 275` WAV-Sätze.
- Der Sprachstart bleibt **„Hey! Wobei brauchst du Hilfe?“** und liegt weiterhin als statische Supertonic-F1-WAV vor.
- Supabase `dokohilf-conversation-router` ist im einzigen DokoHilf-Projekt `efifbuqctylsujiauabg` als **ACTIVE Version 2** mit `verify_jwt = false` aktiv. Das ist absichtlich öffentlich, weil DokoHilf keinerlei Konten oder Anmeldung besitzt.
- Der aktive Function-Code entspricht dem gemergten `main`: `ROUTER_VERSION = 'natural-guide-completions-v40'` und `COMPLETION_REVISION = '20260810-natural-guide-completions-v40-1'`.
- Der Wrapper speichert keine Gespräche und leitet mögliche Echtdaten in die bestehende Schutzkette weiter; er verarbeitet solche Inhalte nicht in der Completion-Logik.
- Für v40 war **keine Datenbankmigration** nötig und es wurden keine Guide-Schritte in Supabase verändert.
- Supabase Security Advisor: **keine offenen Lints** nach dem v40-Deploy.
- Issue #103 bleibt bewusst offen: Berichtssuche ist noch nicht final fachlich bestätigt.
- Der genaue Easy-Plan-Detailweg bleibt offen/verblendet und ist kein erlaubtes Anschlussziel.

## 4. Natürliche Guide-Abschlüsse und Anschlusslogik ab PR #132

### Fehlerbild vor v40

Ein realer iPhone-Test zeigte nach dem reinen Finden von **An-/Abwesenheiten** den technischen Abschluss **„Der Ablauf ist erledigt …“**. Das war nicht nur unnatürlich, sondern bei einem Finden-/Öffnen-Guide inhaltlich falsch: Der Nutzer hatte nur den Bereich gefunden und noch keinen Eintrag erstellt.

### Verbindlicher Fix

Der neue `dokohilf-conversation-router` ist eine schmale deterministische Schicht **vor** dem bestehenden `dokohilf-chat-router`:

- Normale Fragen, natürliche Starts, Hilfe im laufenden Schritt, Gemini-Interpretation und die bestehende Sicherheitslogik bleiben beim bestehenden Chat-Router.
- Der Wrapper greift nur bei einem bestätigten letzten Schritt eines freigegebenen Guides oder bei einer klar definierten Antwort auf eine natürliche Abschluss-/Anschlussfrage ein.
- Alle **40 aktuell freigegebenen Guides** besitzen einen expliziten Completion-Contract.
- Der generische technische Abschluss wird für diese Guides nicht mehr verwendet.
- Finden-/Öffnen-Guides bestätigen natürlich, was erreicht wurde, und bieten nur einen fachlich bestätigten sinnvollen nächsten Schritt an.
- Bereits erreichter Kontext bleibt erhalten; ein Folgeguide wiederholt nicht unnötig die gesamte Navigation.
- `berichtssuche`, `easyplan` und `aufgaben-aktuelles` sind als Anschlussziele ausdrücklich gesperrt.
- Medikation bleibt strikt read-only.
- Visitenstatus bleibt ausschließlich **durchgeführt**.

### Beispiel An-/Abwesenheiten

Nach erfolgreichem Finden lautet die Abschlussfrage:

**„Perfekt, dann hast du An-/Abwesenheiten gefunden. Möchtest du dort jetzt eine An- oder Abwesenheit eintragen?“**

Bei `Ja` folgt zunächst:

**„Bevor du die An- oder Abwesenheit einträgst: Ist der richtige Bewohner ausgewählt?“**

Erst nach bestätigter Bewohnerauswahl setzt DokoHilf den bereits geöffneten Kontext fort, statt erneut den kompletten Weg über Doku-Erweitert zu erklären.

### Weitere verbindliche v40-Fälle

- Visiten gefunden → bei bestätigtem Wunsch zum Dokumentieren kontextgerecht beim nächsten tatsächlich nötigen Schritt fortsetzen, ohne die bereits erledigte Navigation zu wiederholen.
- Berichte gefunden → nur den bestätigten Weg zum neuen Bericht anbieten.
- Formulare gefunden → vor dem kontextgekürzten Weiterlauf die richtige Bewohnerauswahl prüfen.
- Vitalwerte geöffnet → nicht durch ein bloßes `Ja` fälschlich abschließen, sondern fragen: einzelner Vitalwert oder mehrere Werte gleichzeitig.
- Durchführungsnachweis geöffnet → nicht durch ein bloßes `Ja` fälschlich abschließen, sondern nach dem tatsächlichen Ziel fragen: Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahme ohne Zeitangabe, Storno oder nur ansehen.
- Medikation gefunden/angesehen → natürlich bestätigen, aber keinerlei Änderungsablauf anbieten.
- Planung, Analyse und Doku als reine Orientierung → keine nicht bestätigten Unterabläufe erfinden.

`tests/guide-completion-v40.test.mjs` sperrt diese Regeln für alle 40 freigegebenen Slugs, die natürlichen Anschlusssequenzen, die gesperrten Ziele und die statische Sprachabdeckung ab.

## 5. Schreib-Chat: natürliche Bedienfragen und konkrete Guides aus v39 bleiben erhalten

PR #130 **„Route natural chat questions to concrete guides“** bleibt vollständig Bestandteil von v40.

- `assets/routing-fix.js` erkennt eindeutige natürliche deutsche Aktionsformulierungen und setzt nur für bereits freigegebene konkrete Guides einen `selectedGuideSlug`.
- Der sichtbare Nutzersatz wird dadurch nicht fachlich umgeschrieben; die Erkennung dient nur dem Routing.
- Abgedeckte natürliche Aktionsformen umfassen unter anderem `lege … an`, `trage … ein`, `erstelle`, `dokumentiere`, `erfasse`, `öffne`, `rufe … auf`, `sehe … an`.
- Mehrdeutige Vitalwert-Fragen werden nicht lokal erzwungen; die Auswahl Einzelwert/Sammelerfassung bleibt zuständig.
- Medikationsänderungen werden nicht lokal geroutet.
- Easy-Plan wird nicht lokal erzwungen.
- Ein bereits aktiver Guide wird durch die lokale Intent-Erkennung nicht ungefragt überschrieben.

Für **„Wie lege ich eine Visite an?“** muss DokoHilf direkt den Guide `visite-anlegen` starten und mit dem bestätigten ersten Schritt beginnen, statt allgemeine Möglichkeiten oder interne Freigabehinweise aufzuzählen.

## 6. Mobiler Chat und Cross-Platform-Stand

Die mobilen Korrekturen aus PR #128 bleiben vollständig Bestandteil des aktuellen Releases:

- Die final wirksame Mobile-Schicht setzt das Textarea auf mindestens 16 px und verhindert iPhone-Fokuszoom.
- Die Chat-Shell orientiert sich über `visualViewport.height` an der tatsächlich sichtbaren mobilen Höhe.
- Der Composer bleibt als unteres Flex-Element am sichtbaren unteren Rand des Chats und ist nicht `sticky`.
- Kurze aktive Gespräche stehen direkt über dem Composer; lange Verläufe scrollen im eigenen Gesprächsbereich.
- Neue Antworten und Schrittaktionen werden in Sicht gebracht.
- Die Schrittbuttons heißen **„Erledigt, weiter“** und **„Hilfe zum Schritt“**.
- `Shift+Enter` bleibt Zeilenumbruch; Enter sendet.

Jede endnutzerwirksame Änderung wird auf beiden Pflichtprofilen geprüft:

- iOS: 393 × 852
- Android: 412 × 915

Der exakte v40-PR-Head hat den kombinierten realen iOS-/Android-Render erfolgreich bestanden.

## 7. Verbindliche Bibliotheksgruppierung

Die Ansicht **„Alle Anleitungen“** bleibt nach der bestätigten Gruppierung aufgebaut:

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
- Fachlich noch nicht freigegebene Inhalte bleiben deutlich als später/in Vorbereitung gekennzeichnet.
- Berichtssuche bleibt fachlich offen und darf nicht als fertiger Guide behandelt werden.

Die Gruppierung verändert keinen bestätigten Klickweg und keinen Guide-Inhalt.

## 8. Verbindliche Spracharchitektur

`STATIC_VOICE_POLICY.md` ist verbindlich.

- **Jeder hörbar ausgegebene Satz kommt aus einer vorab im Release erzeugten Supertonic-3/F1-WAV-Datei.**
- Keine Supertonic-Inferenz auf iPhone, Android oder im Browser.
- Kein WebGPU-/WASM-TTS im Endgerät.
- Keine System-/Gerätestimme als Fallback.
- Keine Cloud-/Bezahl-TTS.
- `assets/local-voice-v28.js` ist nur ein stillgelegter Kompatibilitätspfad und darf nicht synthetisieren.
- `assets/local-voice-gate-v28.js` bedient ausschließlich den statischen Katalog.
- Für freie Texte ohne exakte Audiodatei darf nur ein ebenfalls vorab erzeugter neutraler Supertonic-F1-Satz gesprochen werden; der vollständige Text bleibt sichtbar.
- Sprachstart im Sprechmodus: **„Hey! Wobei brauchst du Hilfe?“**
- Der Supertonic-Build leitet die Gesamtzahl der WAV-Dateien aus den kontrollierten Sprachkatalogen ab. Katalogzahl, WAV-Zahl und Build-Summary müssen exakt übereinstimmen.
- v40 ergänzt **44** feste Abschluss-/Anschlussformulierungen in `assets/voice-completion-catalog-v40.json`.
- Der veröffentlichte v40-Bestand umfasst **275** statische Supertonic-F1-WAV-Sätze.

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

Doku oben in der grünen Hauptleiste → darunter Durchführungsnachweis → **kleiner Pfeil links** neben Bedarfsmedikation → gewünschtes Medikament rechts anhaken → Pop-up-Fenster: tatsächliche Uhrzeit prüfen und nur bei Bedarf auf die tatsächliche Gabezeit korrigieren → `Wichtig für Schichtübergabe` bleibt automatisch ausgewählt → im Textfeld darunter kurz den Anlass der Gabe dokumentieren → bei tatsächlich geringerer Bedarfsmenge die tatsächlich verwendete Menge dokumentieren, ohne die Verordnung zu verändern → unten OK.

Danach wird die zugehörige **Wirksamkeitskontrolle automatisch vom System angelegt**. DokoHilf erfindet keine Wartezeit und legt keine Kontrolle selbst an. Wenn sie zum vorgesehenen Zeitpunkt fällig ist: im Durchführungsnachweis öffnen → abhaken → dokumentieren, ob und wie die Bedarfsmedikation gewirkt/geholfen hat → unten OK.

### Wirksamkeitskontrolle direkt

Bei einer direkten Frage zur Wirksamkeitskontrolle nicht wieder bei der ursprünglichen Bedarfsgabe starten. Direkt erklären, dass die Kontrolle automatisch angelegt wird und zum vorgesehenen Zeitpunkt im Durchführungsnachweis bearbeitet wird.

### Maßnahmen ohne Zeitangabe

Doku oben → darunter Durchführungsnachweis → **kleiner Pfeil links neben „Maßnahmen ohne Zeitangabe“** → gewünschte Maßnahme wählen, zum Beispiel Klienten-Team Sitzung oder Krise → Pop-up-Fenster: Datum/Uhrzeit prüfen und nur auf die tatsächliche Dokumentationszeit korrigieren → Kategorie wählen → `Wichtig für Schichtübergabe` je nach Relevanz optional → im großen Textfeld darunter dokumentieren, was passiert ist beziehungsweise gemacht wurde → optionale zusätzliche Zeitangabe oben rechts → unten OK.

## 11. Weitere harte Fachregeln

- Visiten werden immer als **durchgeführt** dokumentiert, niemals als abgeschlossen.
- Berichte werden nicht endgültig gelöscht, sondern nachvollziehbar durchgestrichen.
- Falsch abgezeichnete Durchführungen werden im Durchführungsnachweis storniert.
- Medikation ist ausschließlich ein Leseweg. Keine Änderung, Dosierung, Pause, Fortsetzung, Absetzung, Korrektur, Ergänzung oder Löschung anleiten.
- Bei An- und Abwesenheiten wird `Von` immer eingetragen. `Bis` nur, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist; niemals schätzen.
- Nicht bestätigte Formularfelder oder interne Abläufe werden nicht erfunden.

## 12. Aktueller Supabase-Stand

Letzter live verifizierter Stand für ausschließlich Projekt `efifbuqctylsujiauabg`:

- Projekt und bestehende Router sind aktiv; die zuletzt betrachteten Router-Logs enthalten erfolgreiche HTTP-200-Antworten.
- Öffentliche DokoHilf-Tabellen haben RLS aktiviert.
- `dokohilf_guides` enthält ausschließlich allgemeine, unpersönliche Anleitungen; keine Konten, Profile oder Falldaten.
- `dokohilf-conversation-router` ist **ACTIVE Version 2**, `verify_jwt = false`, und enthält exakt den gemergten v40-Wrapper sowie den Completion-Contract.
- Der Wrapper speichert keine Unterhaltung und besitzt keine Konto-/Anmeldefunktion.
- Verdächtige Echtdaten werden nicht in der Completion-Logik verarbeitet, sondern an den bestehenden Schutzpfad weitergereicht.
- Für PR #132 war keine Datenbankmigration nötig; bestätigte Guide-Schritte wurden nicht verändert.
- Die bereits früher bestätigte Visiten-Themenmigration aus PR #130 bleibt produktiv enthalten.
- Security Advisor: keine offenen Lints.
- Performance Advisor hatte zuletzt nur den INFO-Hinweis auf den bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; kein akuter Fehler und deshalb nicht ungeprüft entfernen.

## 13. Aktueller `gh-pages`-/PWA-Stand

- `gh-pages/assets/routing-fix.js` zeigt auf `dokohilf-conversation-router` und trägt die Revision `20260810-natural-guide-completions-v40-1`.
- `gh-pages/service-worker.js` enthält dieselbe Routing- und Completion-Revision, damit installierte PWAs den neuen Routerpfad erhalten.
- `gh-pages/assets/voice-completion-catalog-v40.json` enthält die 44 festen v40-Abschluss-/Anschlussformulierungen.
- `gh-pages/assets/audio/guides/build-summary.json` bestätigt Supertonic 3 / F1, `completionSourceCount = 44` und `staticSpeechCount = 275`.
- Der Release-Build bleibt Build `20260809-36`; v40 ist eine zusätzliche Routing-/Completion-Revision innerhalb dieses Releaseblocks.

## 14. Nächster ausführbarer Schritt

v40 aus PR #132 ist technisch abgeschlossen, auf iPhone/iOS und Android geprüft, in `main` gemergt, als Supabase-Wrapper aktiv und auf `gh-pages` veröffentlicht.

Sinnvolle nächste Arbeit ist **kein weiterer v40-Umbau auf Verdacht**, sondern ein echter Praxistest der natürlichen Abschlüsse und Anschlussfragen, insbesondere:

- An-/Abwesenheiten finden → `Ja` → Bewohnerprüfung → kontextgerecht weiter.
- Vitalwerte öffnen → Auswahl Einzelwert/Sammelerfassung statt falschem Abschluss.
- Durchführungsnachweis öffnen → tatsächliches Ziel abfragen statt falschem Abschluss.
- Visiten finden → bestätigten Anschluss ohne unnötige Wiederholung der Navigation.
- Medikation ansehen → niemals in eine Änderungsanleitung wechseln.

Neue fachliche Klickwege nur übernehmen, wenn sie ausdrücklich bestätigt wurden und anschließend sofort in `CONFIRMED_WORKFLOWS.md` dokumentiert werden. Berichtssuche (Issue #103) und der genaue Easy-Plan-Detailweg bleiben bis dahin offen.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
