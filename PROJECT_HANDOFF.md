# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 3. September 2026
**Aktueller live verifizierter Produktstand:** `v34` / Build `20260812-41` / progressive Sprachnavigation v68
**Aktueller `main`:** `c0634b133a24e097397184ab60bfe353635d83c5`
**Aktueller veröffentlichter `gh-pages`-Commit:** `225b30a88a019c6456e5971576571069637cd16f` (`Publish DokoHilf c0634b133a24e097397184ab60bfe353635d83c5`)
**Letzter Produkt-PR:** `#186` – progressive und knappe Sprachnavigation v68
**Letzter Hardening-PR:** `#136` – explizite RLS-Deny-All-Policy  
**PWA-Ziel dieses Arbeitsblocks:** `v34` / Build `20260903-42`; Details in `ACTIVE_WORK_PWA_REFRESH_V68.md`
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Veränderliche Zustände werden bei neuer Arbeit immer live geprüft. Diese Datei ist das dauerhafte Handoff, aber kein Ersatz für GitHub-/Supabase-Liveprüfung.

Diese dauerhafte Projektübergabe enthält ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Inhalte. Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert.

## 1. Verbindliche Quellen und Reihenfolge

Vor neuer DokoHilf-Arbeit mindestens lesen beziehungsweise prüfen:

1. `PROJECT_RULES.md`
2. `CONFIRMED_WORKFLOWS.md`
3. `CROSS_PLATFORM_POLICY.md`
4. `STATIC_VOICE_POLICY.md` bei Sprachbezug
5. `USAGE_METRICS.md` bei Reichweiten-/Datenschutzbezug
6. diese Datei
7. relevante `ACTIVE_WORK_*.md`
8. aktuelle GitHub-PRs/Issues/Actions sowie `main` und `gh-pages`
9. bei Supabase-Bezug ausschließlich Projekt `efifbuqctylsujiauabg`

**Wichtig:** `CONFIRMED_WORKFLOWS.md` ist die fachliche Source of Truth für lokale Klickwege. Eine spätere technische Änderung in JS, Migration, Router, Sprache oder Test gilt nicht als sauber dokumentiert, solange der bestätigte Weg dort nicht nachgezogen ist.

Ältere `ACTIVE_WORK_*.md` können abgeschlossene historische Arbeitsblöcke dokumentieren. Maßgeblich für den aktuellen Gesamtstand sind deren jeweiliger Status, diese Datei und die aktuelle Fachquelle; ein Dateiname mit `ACTIVE_WORK_` allein bedeutet nicht automatisch, dass der Block noch offen ist.

## 2. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere GitHub- oder Supabase-Projekte werden nicht geöffnet, verändert, verbunden oder als Deployment-Ziel genutzt.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe.
- DokoHilf führt keinerlei Konten oder Anmeldung; auch interne App-, Redaktions-, Mitarbeiter- oder Administrationskonten sind nicht Teil des Produkts.
- Keine App-Konten, Anmeldung, Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
- Tests und sonstige synthetische Prüfzustände bleiben vollständig künstlich; keine reale Person und kein realer Fall werden nachgebildet.
- Keine erfundenen Klickwege oder Feldnamen.
- Keine medizinischen, pflegerischen oder betreuerischen Entscheidungen durch DokoHilf.
- Berichtssuche bleibt fachlich offen; Issue #103 bleibt offen.
- Der genaue Easy-Plan-Ablauf bleibt fachlich offen.
- `Aufgaben · Aktuelles` bleibt fachlich offen.
- Medikation bleibt im normalen Medikationsbereich strikt **nur ansehen**.

## 3. Verbindlicher GitHub- und Veröffentlichungsablauf

1. Nie direkt auf `main` arbeiten.
2. Eigener Branch → Pull Request → exakten PR-Head prüfen.
3. Kein Auto-Merge und keine automatische Branch-Löschung.
4. Produkt-/UI-/Guide-/Sprachänderungen nur bei allen acht etablierten Pflichtworkflows grün auf exakt demselben Head mergen.
5. Reine Docs-only-Änderungen müssen alle durch die vorhandenen Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün bestehen; nicht ausgelöste UI-Workflows werden nicht künstlich verlangt.
6. Bei Datenbankänderungen zuerst Transaktions-Dry-Run mit Rollback; produktive Migration erst nach Merge.
7. Edge Functions erst nach geprüftem Merge produktiv deployen.
8. Nach Produktmerge `main`, `gh-pages`, festen Hauptlink und betroffene Supabase-Ressourcen prüfen.
9. Gegenüber dem Nutzer nie `live` behaupten, bevor der veröffentlichte Stand real verifiziert wurde.

## 4. Aktueller GitHub-/Release-Stand

Am 3. September 2026 live gegen GitHub und den festen öffentlichen Hauptlink verifiziert:

- `main` steht auf `c0634b133a24e097397184ab60bfe353635d83c5`, Merge von PR #186.
- `gh-pages` steht auf `225b30a88a019c6456e5971576571069637cd16f` und wurde mit `Publish DokoHilf c0634b133a24e097397184ab60bfe353635d83c5` erzeugt.
- Damit ist der veröffentlichte Branch auf demselben Produkt-/Hardening-Stand wie `main`.
- PR #186 ist vollständig grün gemergt und mit v34/v68 sowie 316 statischen Supertonic-F1-Sätzen live bestätigt.
- Der fachliche v68-Stand verwendet noch Build `20260812-41`. Der getrennte PWA-Refresh hebt ausschließlich den technischen Build auf `20260903-42` und gilt erst nach erneutem Main-Deploy und Live-Nachweis als veröffentlicht.
- Dieser PWA-Arbeitsblock verändert **keinen Guide, keinen Router, keinen hörbaren Text, keine Migration und kein Supabase-Objekt**.

## 5. Aktueller fachlicher Stand

Die vollständigen Schrittfolgen stehen in `CONFIRMED_WORKFLOWS.md`. Dort sind seit dieser Synchronisierung auch die nachträglich bestätigten Details aus den späteren PRs vollständig enthalten.

Besonders wichtig:

- **Bericht anlegen:** richtiger Bewohner → Berichte → grünes Plus → Kategorie → Sonderfall nur bei `Kontakt – alles außer Arzt` / `Sturzereignis` → Datum/Uhrzeit → `Wichtig für Schichtübergabe` nur bei Bedarf → Bericht in Textfeld darunter → OK.
- **Bericht korrigieren:** falschen Bericht rechtsklicken → Eintrag bearbeiten → Durchstreichen → Bemerkung zur Bearbeitung → OK. Korrektur danach als neuer Bericht, nicht als Folgebericht.
- **Folgebericht:** neuer Bericht mit Bezug auf bestehendes Geschehen; ursprünglicher Bericht bleibt unverändert.
- **Durchführung stornieren:** Doku → Durchführungsnachweis → falsche Durchführung → Rechtsklick → Durchführung stornieren → Grund → OK.
- **Bedarfsmedikation:** Doku → Durchführungsnachweis → kleiner Pfeil links neben Bedarfsmedikation → Medikament anhaken → tatsächliche Uhrzeit → `Wichtig für Schichtübergabe` bleibt automatisch gesetzt → Anlass im Textfeld → ggf. tatsächlich verwendete geringere Menge → OK → automatische Wirksamkeitskontrolle.
- **Wirksamkeitskontrolle:** automatisch angelegt; keine erfundene Wartezeit; zum vorgesehenen Zeitpunkt im Durchführungsnachweis öffnen, abhaken, Wirkung dokumentieren, OK.
- **Maßnahmen ohne Zeitangabe:** Doku → Durchführungsnachweis → **kleiner Pfeil links** neben Maßnahmen ohne Zeitangabe → Maßnahme → Datum/Uhrzeit → Kategorie → `Wichtig für Schichtübergabe` optional → Dokumentation im großen Textfeld → optionale zusätzliche Zeit → OK.
- **Visite:** Doku-Erweitert → Visiten → grünes Plus/Neu → Klient auswählen → Neue Visite → Durchführen → Datum/Beginn/ggf. Ende → hinterlegten Arzt → Mitarbeiter leer/ohne Mitarbeiter → Anforderung → Grund → Ort `Einrichtung / beim Arzt / telefonisch / per Mail` → Bemerkung → speichern; Status immer `durchgeführt`.
- **Visiten-Sonderfall:** Arzt nicht beim Bewohner hinterlegt → kleines Filtersymbol rechts neben der Arztauswahl → alle Systemärzte; im Normalfall Filter aus.
- **Vitalwerte:** Einzelwert und Sammelerfassung sind getrennte Wege. Bestätigte Beispiele: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz, Atemalkohol. Blutdruck mit Systole/Diastole; zusätzliche Felder/Einheiten nur nach sichtbarer Maske.
- **An-/Abwesenheit:** `Von` immer; `Bis` nur bei sicher bekanntem Endzeitpunkt, sonst leer.
- **Formulare:** Doku-Erweitert → Formulare → Neu → Formular auswählen → OK → ausfüllen → oben links speichern.
- **Stammdaten:** Berichte oder Durchführungsnachweis öffnen → links Bewohnerübersicht → Bewohner doppelklicken → Stammdaten.
- **Notfallblatt:** Bewohner → rotes Kreuz/Pfeil oben links → Notfallblatt aufrufen → Notfallblatt_Allgemein → Einweisungsgrund nur bei Bedarf → OK → bis etwa drei Minuten auf Word warten, Standby verhindern, nicht mehrfach starten.
- **Übergabe:** Analyse → Was war los? → Alle anzeigen → Alles ausklappen → Zeitraum nur bei Bedarf ändern.

## 6. Bestätigte kontextbewusste Chatlogik

PR #130 und #132 bleiben verbindlich enthalten:

- Natürliche Formulierungen wie `lege … an`, `trage … ein`, `erstelle`, `dokumentiere`, `erfasse`, `öffne`, `rufe … auf`, `sehe … an` werden für freigegebene Guides erkannt.
- Der `dokohilf-conversation-router` sitzt vor dem bestehenden `dokohilf-chat-router` und behandelt natürliche Guide-Abschlüsse sowie bestätigte Anschlussdialoge.
- Bereits erreichte Navigation wird erhalten, wenn der nächste Schritt bestätigt ist.
- Finden-/Öffnen-Guides tun nicht so, als wäre bereits ein Eintrag erstellt worden.
- `vitalwerte-erfassen` und `durchfuehrungsnachweis-oeffnen` behandeln ein bloßes `Ja` nicht als Abschluss, sondern klären die noch offene Auswahl.
- Medikation bietet keinen Änderungsanschluss.
- Berichtssuche, Easy-Plan und Aufgaben/Aktuelles bleiben als unbestätigte Anschlussziele gesperrt.

## 7. Bibliothek und mobile Darstellung

Aktuelle Bibliotheksgruppen:

### Berichte
- Bericht anlegen
- Bericht korrigieren
- Folgebericht erstellen

### Gesundheit & Medizin
- Visite anlegen
- Visiten öffnen
- Visitenstatus
- Vitalwerte erfassen
- Medikation ansehen
- Notfallblatt öffnen

### Organisation & Dokumente
- An-/Abwesenheit
- Formular anlegen
- Stammdaten öffnen

### Übergabe & Übersicht
- Übergabe / Was war los?

### Durchführung
- Durchführung stornieren
- Durchführungsnachweis öffnen
- Bedarfsmedikation dokumentieren
- Wirksamkeitskontrolle
- Maßnahmen ohne Zeitangabe

### In Vorbereitung
- Berichtssuche
- Easy-Plan
- Aufgaben · Aktuelles

Mobile Chat-UI v38 bleibt aktiv: 16-px-Textarea auf Mobilgeräten, eigener Chat-Scroller, Composer am sichtbaren unteren Rand, keine ungefragte Tastaturöffnung. Produktänderungen werden weiterhin auf iOS 393×852 und Android 412×915 geprüft.

## 8. Sprache

`STATIC_VOICE_POLICY.md` bleibt verbindlich.

- ausschließlich kostenloses statisches Supertonic-3/F1 für freigegebene hörbare Sätze;
- keine System-/Gerätestimme als regulärer Fallback;
- keine Cloud-/Bezahl-TTS;
- keine Browser-/WebGPU-/WASM-Inferenz;
- Sprachstart: **„Hey! Wobei brauchst du Hilfe?“**;
- v40-Completion-Katalog: 44 feste Completion-/Anschlusssätze;
- letzter live bestätigter Gesamtbestand nach PR #186: 316 statische WAV-Sätze.

Eine Änderung eines bestätigten Textes muss mit der statischen Sprachquelle synchron gehalten werden; diese Dokumentationssynchronisierung ändert keinen hörbaren Text.

## 9. Private anonyme Reichweitenmessung v41

Verbindliche Detaildokumentation: `USAGE_METRICS.md` sowie der abgeschlossene Arbeitsblock `ACTIVE_WORK_PRIVATE_USAGE_METRICS_V41.md`.

Fachliche Bedeutung:

- gezählt werden **Seitenaufrufe**, keine eindeutigen Personen oder Geräte;
- keine Geräte-ID, kein Fingerprinting, keine DokoHilf-IP-Speicherung, kein User-Agent, Referrer, Session-ID oder Analysecookie;
- Browser sendet pro neu geladenem Produktionsdokument einen leeren Counter-POST;
- Statistik ist nicht öffentlich in DokoHilf sichtbar;
- interne Summary liefert heute / 7 Tage / 30 Tage / gesamt;
- Tageswerte werden höchstens 400 Kalendertage gehalten;
- öffentliche Rollen haben keinen Lese- oder Increment-Zugriff;
- explizite RLS-Deny-All-Policy aus PR #136 bleibt zusätzlich zu den REVOKEs aktiv.

Der Zähler ist kein Nutzertracking und darf nicht zu einer Geräte- oder Nutzerwiedererkennung erweitert werden.

## 10. Technische Architektur- und Supabase-Anker

Die folgenden technischen Anker bleiben bewusst wörtlich dokumentiert, weil sie Bestandteil der etablierten DokoHilf-Regressions- und Übergabeverträge sind.

**Aktive Supabase-Funktion:** `dokohilf-conversation-router`, live bestätigte Version 5, Status `ACTIVE`.
**Aktiver Basisrouter:** `dokohilf-chat-router`, live bestätigte Version 11, Status `ACTIVE`.
**Aktiver AI-Router:** `dokohilf-ai-router`, live bestätigte Version 12, Status `ACTIVE`; `dokohilf-ai` bleibt der bestehende private Core-Pfad.
**Aktueller Datenbankstand:** `natural_path_routing_v39` plus produktive private Reichweitenmessung v41.  
**Supabase Security:** Security Advisor nach v41 / PR #136 ohne offene Lints.  
**Offenes fachliches Issue:** `#103` Berichtssuche.

### Supabase-Architektur

Im zuletzt bestätigten v40-/v41-Stand bestehen die etablierten Router-/AI-Pfade plus der technische Reichweitenzähler:

1. `dokohilf-conversation-router` – öffentlicher kontenfreier Wrapper, `verify_jwt=false`.
2. `dokohilf-chat-router` – öffentlicher Basisrouter, `verify_jwt=false`.
3. `dokohilf-ai` – bestehender privater Core-Pfad.
4. `dokohilf-usage-counter` – technischer, origin-beschränkter Seitenaufruf-Endpunkt; gibt keine öffentlichen Statistikwerte aus.

Der zuletzt bestätigte Guide-Datenstand vor der v41-Reichweitenänderung war:

- `dokohilf_guides`: **45 Zeilen insgesamt, 40 `approved`, 5 `draft`**;
- alle 40 freigegebenen Guide-Slugs werden vom v40-Completion-Contract abgedeckt;
- `dokohilf_guide_versions`: **42 Archivzeilen** im zuletzt bestätigten v40-Stand;
- `auth.users = 0`;
- keine DokoHilf-Cronjobs;
- interner Build-Schalter `false`.

Die v41-Reichweitenänderung verändert keine Guides und ergänzt ausschließlich technische Statistikobjekte:

- `public.dokohilf_usage_counters`;
- `public.dokohilf_usage_summary`;
- `public.dokohilf_increment_page_view()`;
- Edge Function `dokohilf-usage-counter`.

Für diese Statistik gilt:

- `anon` und `authenticated` dürfen weder Counter noch Summary lesen;
- `anon` und `authenticated` dürfen den Increment-RPC nicht ausführen;
- explizite RLS-Deny-All-Policy plus REVOKEs bleiben aktiv;
- Security Advisor nach PR #136: **0 Lints**;
- Performance Advisor zuletzt nur INFO zum ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; nicht ohne neue Evidenz entfernen.

Veränderliche Werte wie aktuelle Seitenaufrufe oder spätere Function-Versionen werden bei Bedarf live geprüft.

### Kanonische technische Quellen

Die folgenden Pfade bleiben als Architekturanker erhalten:

- `assets/conversation-router-v40.ts`
- `assets/voice-completion-catalog-v40.json`
- `supabase/functions/dokohilf-conversation-router/index.ts`
- `tests/guide-completion-v40.test.mjs`
- `scripts/build-supertonic-guide-audio-v28.py`
- `supabase/functions/dokohilf-usage-counter/index.ts`
- `supabase/migrations/20260811225800_private_usage_metrics_v41.sql`
- `USAGE_METRICS.md`

## 11. Offene fachliche Punkte

- Issue #103: Berichtssuche – weiterhin offen.
- Issue #167: Erweiterung der Orientierung – weiterhin offen.
- Easy-Plan: genauer Detailweg nicht bestätigt.
- Aufgaben · Aktuelles: nicht als fertiger Guide freigegeben.

Keine dieser Lücken auf Verdacht schließen oder durch KI ergänzen.

## 12. Dokumentationspflicht ab jetzt

- Neue bestätigte Klickwege sofort in `CONFIRMED_WORKFLOWS.md` aufnehmen.
- Den aktuellen Gesamtstand nach relevanten Releases in `PROJECT_HANDOFF.md` nachziehen.
- Ein `ACTIVE_WORK_*.md` muss einen eindeutigen Status tragen; abgeschlossene Blöcke dürfen nicht weiter als offene Arbeit beschrieben werden.
- PR-Beschreibungen, Migrationen und Tests ersetzen die zentrale Fachquelle nicht.
- Dokumentationsänderungen allein dürfen keine App-/Guide-/Router-/Sprachlogik verändern.

Diese Datei beschreibt den live verifizierten fachlichen Stand nach PR #186 sowie den davon getrennten PWA-Refresh auf Build `20260903-42`.
