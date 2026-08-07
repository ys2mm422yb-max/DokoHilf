# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260807-28`  
**Sichtbare Version:** `v28`  
**Aktuell veröffentlichte PWA-Revision vor PR #86:** `20260807-voice-guides-report-v28-3`  
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

Die fachliche Grundlogik wurde in PR #82 gemergt und in PR #83 als PWA-v28-3 veröffentlicht. Die Darstellung bleibt in PR #86 Bestandteil der iOS-/Android-Regressionstests.

## 7. Voice v28 – veröffentlichter Stand und laufender PR #86

### Bisheriger Verlauf

PR #78 führte Supertonic 3 als kostenlose lokale Sprachengine ein. Ein realer iPhone-Praxistest zeigte, dass reine lokale WASM-Inferenz auf dem Gerät für den normalen Sprachfluss nicht zuverlässig genug ist.

PR #80 führte deshalb vorhandene statische Audios vor lokaler Inferenz ein. PR #82/#83 ergänzten Router-`spokenText`, Bericht-Sonderfall und PWA-Revision `20260807-voice-guides-report-v28-3`.

Ein weiterer realer iPhone-Test zeigte: Der erste vorhandene Satz kann hörbar sein, aber ein späterer bestätigter Guide-Satz fällt bei fehlendem statischem Audio erneut in lokale Supertonic-WASM-Inferenz und kann stumm bleiben.

### Aktueller Folgeblock PR #86

Branch:

`fix/static-supertonic-accountfree-v28-20260807`

PR:

`#86` – **offen; nicht mergen, bevor der aktuelle exakte Head vollständig grün ist.**

Ziel-PWA-Revision:

`20260807-static-supertonic-guides-v28-4`

Zielarchitektur:

1. **Supertonic F1** ist die einzige reguläre DokoHilf-Stimme.
2. Die 93 bestätigten allgemeinen Guide-Sätze werden im öffentlichen GitHub-Actions-Build mit Supertonic 3 / F1 / Deutsch als statische WAV-Dateien erzeugt.
3. iPhone und Android spielen diese bestätigten Guide-Audios nur ab; dafür ist keine lokale Geräte-Inferenz nötig.
4. Router-`spokenText` wird berücksichtigt, damit kurze bestätigte Anweisungen zuverlässig den passenden statischen Satz treffen.
5. Der aktive Browser-Sprachpfad ruft keine Cloud-TTS-API auf.
6. Keine System-/Gerätestimme als regulärer Fallback.
7. Nur ein noch nicht vorbereiteter freier Satz darf als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden; auf iOS bleibt die harte Zeitgrenze bestehen.
8. Generierte freie Audios werden nicht dauerhaft gespeichert.

Der öffentliche Pages-Build muss exakt 93 statische Supertonic-F1-WAVs erzeugen und den ausgelieferten Katalog als `Supertonic-F1` kennzeichnen.

## 8. Kostenkontrolle / alter Cloud-Sprachaufbau

Der bisherige automatische serverseitige statische Sprachaufbau darf für den neuen kostenlosen Releasepfad nicht weitergenerieren.

Live im festen Supabase-Projekt gesetzt und verifiziert:

`public.dokohilf_internal_build_control.enabled = false`

Der vorhandene Cron kann technisch weiterhin ausgelöst werden, wird durch diesen Build-Schalter aber vor einer neuen TTS-Erzeugung gestoppt. Der direkte Zugriff auf `cron.job` war über die verfügbare Datenbankrolle nicht erlaubt; deshalb wird nicht behauptet, der Cron selbst sei gelöscht oder deaktiviert.

Serverseitige ältere TTS-/Audiofunktionen können als technische Altkomponenten noch vorhanden sein, sind aber nicht Ziel des neuen PR-#86-Voice-Releasepfads.

## 9. Verbindliche Fachquelle

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

## 10. Supabase-Grundstand

Vor veränderlichen Aussagen immer live prüfen. Zuletzt bekannte technische Kernkomponenten:

- `dokohilf-ai-router`
- `dokohilf-tts` als ältere serverseitige technische Komponente
- `dokohilf-guide-audio`
- `dokohilf-guide-audio-build`
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`

Supabase ist technische Infrastruktur, **keine DokoHilf-Endnutzerverwaltung**. Keine Endnutzerkonten, Rollenprofile, Bewohnerprofile oder Mitarbeiterprofile in DokoHilf einführen.

## 11. Dauerhafte Datenschutz- und Sicherheitsgrenzen

- dauerhaft keine Echtdaten, auch nicht nach späterer organisatorischer Freigabe
- keine Endnutzerkonten oder Personenprofile in DokoHilf
- keine produktiven Exporte oder Kopien in DokoHilf
- keine Nutzerstimmen, Diktate oder freien Gesprächsinhalte dauerhaft speichern
- keine Secrets im Browser, Repository oder öffentlich sichtbaren Projekttext
- keine fremden Handbücher oder geschützten Inhalte kopieren
- keine erfundenen Fach- oder Klickwege
- öffentliche Projekttexte nur selbst formuliert, anonymisiert und veröffentlichungsfähig

`PROJECT_RULES.md` ist hierfür verbindlich.

## 12. Nächster ausführbarer Schritt

Für PR #86:

1. alle bestehenden v28-3-Verträge auf die neue v28-4-Revision konsistent halten,
2. GitHub-Actions-Releasejob tatsächlich 93 Supertonic-F1-Audios erzeugen lassen,
3. iOS `393×852` und Android `412×915` für Voice, Detailhilfe und Bericht-Sonderfall prüfen,
4. 0 Systemstimmenaufrufe und 0 Cloud-TTS-Aufrufe im aktiven Voice-Pfad nachweisen,
5. nur vollständig grünen exakten Head manuell mergen,
6. danach `main`, `gh-pages`, ausgelieferte PWA-Revision, statische Audiozusammenfassung und Supabase-Build-Schalter live prüfen,
7. anschließend real auf dem iPhone Begrüßung plus mehrere bestätigte Folgeanweisungen testen.

## 13. Pflicht für jeden neuen Chat

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
