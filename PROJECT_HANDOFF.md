# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 5. September 2026  
**Verifizierter Produkt-Release:** `v35` / Build `20260904-43` / Release `pwa-install-and-full-qa-v69`  
**v69 Produkt-Merge-Commit:** `b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6`  
**v69 Veröffentlichungsbeleg auf `gh-pages`:** `98bb5f8f92b7b6c661c152a839ad7a9eff95cd4e`  
**Produkt-PR:** `#188` – Add PWA installation and complete user-facing QA v69  
**PR-Head von #188:** `c6d54cc45698be4877d0d8b23dc5b7eac3012f7c`  
**Letzter Hardening-PR des v69-Stands:** `#136` – explizite RLS-Deny-All-Policy  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Veränderliche Remote-Zustände wie die jeweils aktuelle `main`-SHA, `gh-pages`-SHA, offene PRs und laufende Actions werden bewusst nicht als dauerhaft „aktuelle“ Werte festgeschrieben. Sie müssen vor neuer Arbeit live geprüft werden. Diese Datei ist das dauerhafte Handoff, aber kein Ersatz für GitHub-, Actions-, Pages- und Supabase-Liveprüfung.

Diese dauerhafte Projektübergabe enthält ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Inhalte. Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert.

## 1. Verbindliche Quellen und Reihenfolge

Vor neuer DokoHilf-Arbeit mindestens vollständig lesen beziehungsweise prüfen:

1. `PROJECT_RULES.md`
2. `PROJECT_HANDOFF.md`
3. `CONFIRMED_WORKFLOWS.md`
4. `CROSS_PLATFORM_POLICY.md`
5. `STATIC_VOICE_POLICY.md` bei Sprachbezug
6. `USAGE_METRICS.md` bei Reichweiten-/Datenschutzbezug
7. relevante `ACTIVE_WORK_*.md`
8. aktuelle GitHub-PRs, Issues, Actions, `main` und `gh-pages`
9. bei Supabase-Bezug ausschließlich Projekt `efifbuqctylsujiauabg`

`CONFIRMED_WORKFLOWS.md` ist die fachliche Source of Truth für bestätigte lokale Klickwege. Technische Implementierung, Migrationen, Router, Sprache oder Tests dürfen diese Quelle nicht stillschweigend erweitern.

Ältere `ACTIVE_WORK_*.md` können abgeschlossene historische Arbeitsblöcke dokumentieren. Maßgeblich sind deren jeweiliger Status, diese Datei, die aktuelle Fachquelle und der bei Arbeitsbeginn neu geprüfte Remote-Stand.

## 2. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`.
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region `eu-central-1`.
- Andere GitHub- oder Supabase-Projekte werden nicht geöffnet, verändert, verbunden oder als Deployment-Ziel genutzt.
- DokoHilf ist eine öffentliche, accountfreie Schritt-für-Schritt-Bedienhilfe.
- DokoHilf führt keinerlei Konten oder Anmeldung; auch keine Redaktions-, Mitarbeiter- oder Administrationskonten in DokoHilf.
- Keine Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken.
- Keine echten Bewohner-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in App, Repository, Supabase, Tests oder Artefakten.
- Tests und Renderzustände bleiben vollständig synthetisch; keine reale Person und kein realer Fall werden nachgebildet.
- Keine erfundenen Vivendi-Klickwege, Feldnamen, Menüpunkte oder Abläufe.
- Keine medizinischen, pflegerischen oder betreuerischen Entscheidungen durch DokoHilf.
- Berichtssuche bleibt fachlich offen; Issue #103 bleibt offen.
- Easy-Plan bleibt im genauen Detailweg fachlich offen.
- `Aufgaben · Aktuelles` bleibt fachlich offen.
- Medikation bleibt im normalen Medikationsbereich strikt **nur ansehen**.
- Dateiablage bleibt ausschließlich beim Finden und Öffnen bereits vorhandener Dokumente.

## 3. Verbindlicher GitHub- und Veröffentlichungsablauf

1. Nie direkt auf `main` arbeiten.
2. Eigener Branch → Pull Request → exakten PR-Head prüfen.
3. Kein Auto-Merge und keine automatische Branch-Löschung.
4. Produkt-/UI-/Guide-/Sprachänderungen nur mergen, wenn alle ausgelösten Pflichtprüfungen auf exakt demselben PR-Head erfolgreich sind; die etablierten iOS-/Android-Prüfungen bleiben verpflichtend.
5. Reine Docs-only-Änderungen müssen alle durch die vorhandenen Pfadfilter tatsächlich ausgelösten Pflichtworkflows grün bestehen; nicht ausgelöste UI-Workflows werden nicht künstlich verlangt.
6. Datenbankänderungen zuerst per Transaktion mit Rollback prüfen; produktive Migration erst nach geprüftem Merge.
7. Edge Functions erst nach geprüftem Merge produktiv deployen.
8. Nach Produktmerge `main`, `gh-pages`, festen Hauptlink und betroffene Supabase-Ressourcen prüfen.
9. Gegenüber dem Nutzer nie `live` oder `fertig` behaupten, bevor der dafür relevante veröffentlichte Stand tatsächlich geprüft wurde.

## 4. Verifizierter GitHub- und Release-Stand v35 / v69

Am 4. September 2026 wurde PR #188 mit dem exakten Head `c6d54cc45698be4877d0d8b23dc5b7eac3012f7c` vollständig geprüft und anschließend manuell gemergt.

- Alle 11 für diesen PR-Head ausgelösten GitHub-Workflows stehen auf `completed / success`, darunter Exact-Head-, iOS-/Android-, statische Sprach-, Versions- und Deploy-Prüfungen.
- Produkt-Merge-Commit von PR #188: `b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6`.
- Der Produkt-Merge-Commit und der PR-Head besitzen denselben Produkt-Tree `ca42104227b454291a9de8d9f6987c61eeae30b2`.
- Main-Deploy #958 für `b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6` ist erfolgreich abgeschlossen.
- v69-Veröffentlichungsbeleg auf `gh-pages`: `98bb5f8f92b7b6c661c152a839ad7a9eff95cd4e`.
- Dessen Committext lautet `Publish DokoHilf b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6`.
- Auch das anschließende GitHub-Pages-Build-and-Deployment für diesen `gh-pages`-Commit wurde erfolgreich abgeschlossen.
- `gh-pages/version.json` dieses Release-Belegs enthält `appVersion: v35`, `buildId: 20260904-43`, `release: pwa-install-and-full-qa-v69`.
- Der Release-Branch `feature/pwa-install-full-qa-v69-20260904` wurde nach dem Merge nicht gelöscht.

Spätere reine Dokumentations-Merges können die jeweils aktuelle `main`- oder `gh-pages`-SHA ändern, ohne den freigegebenen Produktstand `v35` / `20260904-43` / v69 zu verändern. Deshalb sind die oben genannten SHAs ausdrücklich Release-Belege und keine dauerhaft gültigen Aussagen über den jeweils aktuellen Remote-Head.

Die v69-Arbeit ist abgeschlossen. `ACTIVE_WORK_INSTALL_AND_FULL_QA_V69.md` ist als abgeschlossen markiert und darf nicht mehr wie ein offener Release-Block behandelt werden.

## 5. PWA-Installation v69

Der veröffentlichte v69-Stand enthält die startseitige Installationskarte **DokoHilf installieren**.

- Android verwendet `beforeinstallprompt`, wenn der Browser das Ereignis bereitstellt; andernfalls werden die vorgesehenen Browser-Menüschritte angezeigt.
- Auf iPhone/iPad wird die Safari-Anleitung für **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen** verwendet.
- Im Standalone-Modus wird die Installationskarte ausgeblendet.
- Im Chat, Sprachmodus und in geöffneten Direktguides wird die Karte ebenfalls nicht angezeigt.
- Manifest, Service Worker und die erforderlichen PWA-Icons sind Bestandteil des veröffentlichten Stands.
- Die Release-Prüfung umfasst die mobilen Profile iOS 393×852 und Android 412×915.

Nicht automatisch behaupten, eine physische Installation auf einem konkreten iPhone oder Android-Gerät sei durchgeführt worden. Bestätigt sind Implementierung, Release-Prüfung und veröffentlichter PWA-Stand.

## 6. Aktueller fachlicher Stand

Die vollständigen Klickwege stehen ausschließlich verbindlich in `CONFIRMED_WORKFLOWS.md`. Besonders wichtig bleiben:

- **Bericht anlegen:** richtiger Bewohner → Berichte → grünes Plus → Kategorie → bestätigte Sonderfälle beachten → Datum/Uhrzeit → `Wichtig für Schichtübergabe` nur bei Bedarf → Bericht in Textfeld → OK.
- **Bericht korrigieren:** falschen Bericht rechtsklicken → Eintrag bearbeiten → Durchstreichen → Bemerkung zur Bearbeitung → OK; Korrektur danach als neuer Bericht, nicht als Folgebericht.
- **Folgebericht:** neuer Bericht mit Bezug auf ein bestehendes Geschehen; ursprünglicher Bericht bleibt unverändert.
- **Zum Abzeichnen:** richtiger Bewohner → `Doku` → `Durchführungsnachweis`; für einen allgemeinen Durchführungsnachweis endet die bestätigte Orientierung dort. Keinen dritten Fantasie-Schritt ergänzen.
- **Durchführung stornieren:** im Durchführungsnachweis falschen Eintrag rechtsklicken → Durchführung stornieren → Grund → OK.
- **Bedarfsmedikation:** eigener bestätigter Ablauf im Durchführungsnachweis; keine Veränderung der Verordnung.
- **Wirksamkeitskontrolle:** automatisch angelegt; keine erfundene Wartezeit.
- **Visite:** wird immer als `durchgeführt` dokumentiert, niemals als abgeschlossen.
- **Vitalwerte:** Einzelwert und Sammelerfassung sind getrennte Wege. Klare Mehrfachabsicht führt zur Sammelerfassung; klar benannter Einzelwert zum Einzelwert-Ablauf; allgemeine Anfrage bleibt eine Rückfrage mit den bestätigten Möglichkeiten.
- **An-/Abwesenheit:** `Von` immer; `Bis` nur bei sicher bekanntem Endzeitpunkt, niemals schätzen.
- **Medikation ansehen:** normale Medikationsübersicht ausschließlich lesen, dort keine Änderungen anleiten.
- **Dateiablage:** ausschließlich vorhandene Dokumente finden und öffnen; nicht hochladen, löschen, umbenennen, bearbeiten oder verschieben.
- **Notfallblatt, Formulare, Stammdaten und Übergabe/Was war los?** bleiben gemäß `CONFIRMED_WORKFLOWS.md` bestätigt.

## 7. Chat- und Sprachlogik

Der veröffentlichte v69-Stand bewahrt die bestehende kontextbewusste Guide-Logik und korrigiert die bestätigten v69-Regressionspunkte:

- Natürliche Formulierungen wie `lege … an`, `trage … ein`, `erstelle`, `dokumentiere`, `erfasse`, `öffne`, `rufe … auf`, `sehe … an` werden für freigegebene Guides erkannt.
- `dokohilf-conversation-router` sitzt vor `dokohilf-chat-router` und behandelt bestätigte Anschlussdialoge.
- Bereits erreichte Navigation wird erhalten, wenn der nächste Schritt bestätigt ist.
- Finden-/Öffnen-Guides tun nicht so, als wäre bereits ein Eintrag erstellt worden.
- Vitalwerte behandeln Einzelwert, Sammelerfassung und allgemeine Rückfrage getrennt.
- Der allgemeine Durchführungsnachweis endet nach `Doku → Durchführungsnachweis`.
- Die betroffenen Router schneiden bestätigte längere Schritte nicht mehr nach 260 Zeichen ab.
- Die natürliche Rückfrage bei fehlender Detailinformation bleibt sinngemäß auf dem bestätigten sichtbaren Zustand und erfindet keinen Klickweg.
- Gibt es keine passende bestätigte Anleitung, wird transparent auf menschliche Unterstützung verwiesen.
- Berichtssuche, Easy-Plan und Aufgaben/Aktuelles bleiben als unbestätigte Anschlussziele gesperrt.

## 8. Bibliothek und offene fachliche Punkte

Aktuelle sichtbare Bibliotheksgruppen enthalten die freigegebenen Guides für Berichte, Gesundheit & Medizin, Organisation & Dokumente, Übergabe & Übersicht sowie Durchführung.

Als **In Vorbereitung** bleiben:

- Berichtssuche
- Easy-Plan
- Aufgaben · Aktuelles

Offene GitHub-Issues:

- Issue #103: Berichtssuche später fachlich überarbeiten.
- Issue #167: Orientierungswissen schrittweise und ausschließlich aus bestätigten Informationen erweitern.

Keine dieser Lücken auf Verdacht schließen oder durch KI ergänzen.

## 9. Sprache

`STATIC_VOICE_POLICY.md` bleibt verbindlich.

- ausschließlich kostenloses statisches Supertonic 3 / F1;
- keine System-, Geräte- oder Browserstimme als Fallback;
- keine Cloud-/Bezahl-TTS;
- keine Browser-/WebGPU-/WASM-Inferenz;
- Sprachstart: **„Hey! Wobei brauchst du Hilfe?“**;
- der v69-Release bleibt auf dem bestätigten Bestand von 316 statischen Supertonic-F1-Audios;
- Textänderung eines hörbaren freigegebenen Satzes erfordert synchron neu erzeugtes statisches Audio.

Die Spracharchitektur darf nicht stillschweigend auf einen anderen TTS-Pfad wechseln.

## 10. Zuletzt bestätigter Supabase-Stand

Ausschließlich Projekt `efifbuqctylsujiauabg` verwenden.

Am 4. September 2026 erneut geprüft:

- Projektstatus: `ACTIVE_HEALTHY`.
- `dokohilf-ai-router`: Version 13, `ACTIVE`, `verify_jwt=false`.
- `dokohilf-conversation-router`: Version 6, `ACTIVE`, `verify_jwt=false`.
- `dokohilf-chat-router`: Version 11, `ACTIVE`, `verify_jwt=false`.
- Neueste produktive Migration: `natural_dateiablage_help_v69`.
- `dokohilf_guides`: 46 Guides insgesamt, 41 `approved`, 5 `draft`.
- 155 freigegebene Schritte, 133 eindeutige freigegebene Schritttexte.
- Keine leeren freigegebenen Schritttexte und keine leeren Prüffragen.
- Entwürfe bleiben: `aufgaben-aktuelles`, `berichtssuche`, `durchfuehrung-abweichung`, `easyplan`, `vitalwerte-erfassen-fortsetzen`.

Die fünf Entwürfe werden nicht als fertige Guides veröffentlicht.

### Private anonyme Reichweitenmessung

`USAGE_METRICS.md` und der abgeschlossene Arbeitsblock `ACTIVE_WORK_PRIVATE_USAGE_METRICS_V41.md` bleiben verbindlich.

- gezählt werden Seitenaufrufe, keine eindeutigen Personen oder Geräte;
- keine Geräte-ID, kein Fingerprinting, keine DokoHilf-IP-Speicherung, kein User-Agent, Referrer, Session-ID oder Analysecookie;
- Statistik ist nicht öffentlich in DokoHilf sichtbar;
- explizite RLS-Deny-All-Policy plus REVOKEs bleiben aktiv;
- die Reichweitenmessung darf nicht zu Geräte- oder Nutzerwiedererkennung erweitert werden.

## 11. Qualitäts- und Release-Anker v69

Für PR #188 sind auf exakt demselben Head 11 Workflow-Runs erfolgreich abgeschlossen worden, darunter:

- `Validate exact PR head`
- `Validate dark iPhone UI v27`
- `Validate report conditional iOS Android`
- `Validate detailed help iOS Android`
- `Validate static voice iOS Android`
- `Validate app version policy`
- die weiteren für den PR ausgelösten Kontext-, Registry-, Feedback- und Deploy-Prüfungen

Main-Deploy #958 und das anschließende GitHub-Pages-Deployment sind erfolgreich abgeschlossen.

Dokumentierte v69-Release-Nachweise umfassen außerdem die vollständige Node-Testreihe, Routingregressionen, Gesprächsfolgen, Workflow-Marker, Live-Routing, Vitalwerte-Regressionsprüfung, statische Audio-Prüfung sowie iOS-/Android-Renderprüfung. Künftige Änderungen müssen ihre eigenen aktuellen Nachweise erzeugen und dürfen sich nicht pauschal auf diese alte Freigabe berufen.

## 12. Dokumentationspflicht ab jetzt

- Neue bestätigte Klickwege sofort anonymisiert in `CONFIRMED_WORKFLOWS.md` aufnehmen.
- Den aktuellen Gesamtstand nach relevanten Releases in `PROJECT_HANDOFF.md` nachziehen.
- Ein `ACTIVE_WORK_*.md` muss einen eindeutigen Status tragen; abgeschlossene Blöcke dürfen nicht weiter als offene Arbeit beschrieben werden.
- PR-Beschreibungen, Migrationen und Tests ersetzen die zentrale Fachquelle nicht.
- Dokumentationsänderungen allein dürfen keine App-, Guide-, Router- oder Sprachlogik verändern.
- Vor jeder neuen Aufgabe trotzdem `main`, `gh-pages`, offene PRs, relevante Actions und bei Bedarf Supabase erneut prüfen.

Diese Datei beschreibt den verifizierten Produkt-Release nach PR #188 auf `v35` / Build `20260904-43` / Release `pwa-install-and-full-qa-v69`. Die jeweils aktuellen Remote-SHAs werden absichtlich nicht dauerhaft festgeschrieben; sie sind vor neuer Arbeit live zu prüfen. Diese Dokumentationssynchronisierung verändert keine Produktfunktion.