# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260807-28`  
**Sichtbare Version:** `v28`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Bedarf Supabase live geprüft. Veränderliche Zustände werden niemals nur aus dieser Datei abgeleitet.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region Frankfurt (`eu-central-1`)
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Supabase-Projekte niemals öffnen, verändern oder verbinden.
- DokoHilf ist ausschließlich eine **erklärende Schritt-für-Schritt-Bedienhilfe**.
- Die App besitzt keine Endnutzerkonten, Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken. Solche Funktionen werden nicht eingeplant.
- Bewohner-, Mitarbeiter- und sonstige Personendaten werden nicht in DokoHilf eingegeben oder gespeichert.
- Dauerhaft keine realen Bewohner-, Klienten-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter-, Fall-, Termin- oder Zugangsdaten in Repository, Supabase, App, Tests oder Artefakten.
- Das Echtdatenverbot gilt dauerhaft und wird durch spätere betriebliche, technische oder datenschutzrechtliche Freigaben nicht aufgehoben.
- Automatisierte Tests verwenden ausschließlich synthetische UI-Zustände, neutrale Platzhalter und erfundene Werte; keine reale Person und kein realer Fall werden nachgebildet.
- Öffentlich sichtbare Projektinhalte enthalten ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Ergebnisse. Herkunft, Prüfmaterialien und interne Ausgangsmaterialien werden nicht öffentlich dokumentiert.

## 2. Verbindlicher GitHub-Ablauf

1. Vor Eingriffen `main`, offene Pull Requests, Actions und `gh-pages` prüfen; Supabase zusätzlich prüfen, wenn der Block Supabase betrifft.
2. Nie direkt auf `main` arbeiten.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen und Arbeitsstand dauerhaft dokumentieren.
5. Nur einen vollständig geprüften **exakten PR-Head** manuell mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages` und relevante Live-Komponenten prüfen.
8. Gegenüber dem Nutzer keine alternativen Preview-/Branch-/Cache-Links als Hauptzugang nennen.

## 3. Dauerhafte Dokumentationspflicht

Nach jedem relevanten Arbeitsblock dauerhaft dokumentieren:

- neue Nutzerentscheidungen und fachliche Bestätigungen
- betroffene Dateien, Komponenten und Supabase-Bereiche
- tatsächliche Tests und Ergebnisse
- Fehler, Ursachen und offene Blocker
- Branch, Pull Request und exakten Head
- Merge- und Veröffentlichungsstand
- nächsten ausführbaren Schritt

Bestätigte Klickwege gehören nach `CONFIRMED_WORKFLOWS.md`. Größere Arbeitsblöcke erhalten eine `ACTIVE_WORK_*.md`.

## 4. Mobile Grundregel – iOS UND Android

„Mobil geprüft“ bedeutet immer mindestens:

- iOS `393 × 852`
- Android `412 × 915`

Geprüft werden je nach Änderung insbesondere Overflow, Überlagerungen, Safe Areas, Touch-Ziele, Chat, Voice und PWA-Updateverhalten. Details: `ACTIVE_WORK_MOBILE_CROSS_PLATFORM.md`.

## 5. Bestätigte Produktfunktionen

Direkte häufige Abläufe öffnen vollständige bestätigte Anleitungen für Bericht, Visite, Vitalwerte, An-/Abwesenheit, Medikation ansehen, Formulare und Übergabe.

Detailhilfe bei Aussagen wie `Ich finde das nicht` hält den aktuellen Guide-Schritt fest, fragt nach dem sichtbaren Zustand und verwendet ausschließlich bestätigte Bezeichnungen. `Weiter` bleibt während der Fehlersuche verborgen. Keine Alternativwege erfinden.

`CONFIRMED_WORKFLOWS.md` ist die verbindliche Fachquelle.

## 6. Bericht – bestätigter Sonderfall

Für **Bericht anlegen** gilt verbindlich:

- `Kontakt – alles außer Arzt` → automatisch verknüpftes **Fallgespräch**
- `Sturzereignis` → automatisch verknüpftes **Sturzprotokoll**
- nur bei diesen beiden Kategorien gelten die Protokollschritte 6–9
- bei allen anderen Berichtskategorien Schritte 6–9 überspringen und direkt mit Datum/Uhrzeit bei Schritt 10 fortfahren
- das kleine rote X entfernt nur die Protokollverknüpfung, nicht den Bericht

Die fachliche Grundlogik wurde in PR #82 gemergt. Ihre Darstellung und der neue einheitliche Voice-Pfad werden im laufenden PR #85 erneut auf iOS und Android geprüft.

## 7. Voice v28 – veröffentlichter Stand und laufende Korrektur

Der veröffentlichte v28-Stand nutzt Supertonic 3 als kostenlose lokale Sprachengine. Ein realer iPhone-Praxistest zeigte jedoch, dass lokale WASM-Inferenz für Folgeantworten auf dem Gerät nicht zuverlässig genug ist.

### Laufender PR #85

Branch: `fix/voice-guides-report-conditions-v28-20260807`

Ziel des laufenden Blocks:

1. Für bestätigte Guide-Sätze **Supertonic F1 als einzige reguläre Stimme** verwenden.
2. Die bestätigten allgemeinen Guide-Texte einmalig im öffentlichen GitHub-Actions-Build mit Supertonic 3 erzeugen.
3. Das iPhone spielt diese statischen Audios nur ab und muss dafür keine lokale KI-Inferenz ausführen.
4. Keine System-/Gerätestimme als regulären Fallback.
5. Kein Cloud-TTS-Aufruf für den Voice-Releasepfad und keine kostenpflichtige TTS-Stufe.
6. Nur noch nicht statisch vorbereitete freie Sätze dürfen als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden; auf iOS bleibt dafür eine harte Zeitgrenze bestehen.
7. iOS 393×852 und Android 412×915 bleiben Pflicht-QA.

Der alte automatische statische Cloud-Sprachaufbau ist serverseitig über `dokohilf_internal_build_control.enabled=false` deaktiviert. Ein vorhandener Cron kann technisch weiter auslösen, darf bei deaktiviertem Build-Schalter aber keine neue Sprachgenerierung starten. Vor späteren Aussagen hierzu immer live prüfen.

**Wichtig:** PR #85 ist erst veröffentlicht, wenn sein aktueller exakter Head vollständig grün ist, manuell gemergt wurde und `gh-pages` verifiziert ist.

## 8. Verbindliche Fachquelle

Bestätigt sind insbesondere:

- Bericht anlegen einschließlich bedingter Protokollverknüpfung
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite/Sprechstunde mit vorgeschalteter Klientenauswahl und Status **durchgeführt**
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt öffnen
- Übergabe über `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

Nie fehlende Feldnamen, alternative Menüs oder Klickwege ergänzen, nur weil sie plausibel erscheinen.

## 9. Supabase-Grundstand

Vor veränderlichen Aussagen immer live prüfen. Zuletzt bekannte technische Kernkomponenten:

- `dokohilf-ai-router`
- `dokohilf-tts` (serverseitig vorhanden, aber nicht als Ziel des neuen kostenlosen Voice-Releasepfads)
- `dokohilf-guide-audio`
- `dokohilf-guide-audio-build`
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`

Supabase ist technische Infrastruktur, **keine DokoHilf-Endnutzerverwaltung**. Keine Endnutzerkonten, Rollenprofile, Bewohnerprofile oder Mitarbeiterprofile in DokoHilf einführen.

## 10. Dauerhafte Datenschutz- und Sicherheitsgrenzen

- dauerhaft keine Echtdaten, auch nicht nach späterer organisatorischer Freigabe
- keine Endnutzerkonten oder Personenprofile in DokoHilf
- keine produktiven Exporte oder Kopien in DokoHilf
- keine Nutzerstimmen, Diktate oder freien Gesprächsinhalte dauerhaft speichern
- keine Secrets im Browser, Repository oder öffentlich sichtbaren Projekttext
- keine fremden Handbücher oder geschützten Inhalte kopieren
- keine erfundenen Fach- oder Klickwege
- öffentliche Projekttexte nur selbst formuliert, anonymisiert und veröffentlichungsfähig

`PROJECT_RULES.md` ist hierfür verbindlich.

## 11. Pflicht für jeden neuen Chat

1. `README.md` lesen.
2. `PROJECT_RULES.md` lesen.
3. `CONFIRMED_WORKFLOWS.md` lesen.
4. `PROJECT_HANDOFF.md` lesen.
5. alle `ACTIVE_WORK_*.md` prüfen.
6. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
7. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
8. Bei Audioarbeit den aktiven Sprachpfad und Build-Schalter live prüfen.
9. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
10. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
