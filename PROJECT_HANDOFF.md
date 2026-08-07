# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260807-28`  
**Sichtbare Version:** `v28`  
**Aktuell veröffentlichte PWA-Revision:** `20260807-static-supertonic-guides-v28-4`
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden GitHub, Actions, `main`, `gh-pages` und bei Bedarf Supabase live geprüft. Veränderliche Zustände werden niemals nur aus dieser Datei abgeleitet.

## 1. Harte Projekt- und Produktgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`, Region Frankfurt (`eu-central-1`)
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Supabase-Projekte niemals öffnen, verändern oder verbinden.
- DokoHilf ist ausschließlich eine **erklärende Schritt-für-Schritt-Bedienhilfe**.
- Die App besitzt keinerlei Konten oder Anmeldung – einschließlich Redaktions-, Mitarbeiter- oder Administrationskonten –, keine Bewohner-/Mitarbeiterprofile, Fallakten oder personenbezogenen Eingabemasken. Solche Funktionen werden nicht eingeplant.
- Allgemeine Guide-Inhalte werden ausschließlich über geprüfte Repository-Änderungen und technische Migrationen gepflegt, nie über einen App-Login.
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

Die fachliche Grundlogik wurde in PR #82 gemergt und in PR #83 als PWA-v28-3 veröffentlicht. Die Darstellung blieb auch beim v28-4-Release Bestandteil der iOS-/Android-Regressionstests.

## 7. Voice v28 – veröffentlicht mit PR #86

### Bisheriger Verlauf

PR #78 führte Supertonic 3 als kostenlose lokale Sprachengine ein. Ein realer iPhone-Praxistest zeigte, dass reine lokale WASM-Inferenz auf dem Gerät für den normalen Sprachfluss nicht zuverlässig genug ist.

PR #80 führte deshalb vorhandene statische Audios vor lokaler Inferenz ein. PR #82/#83 ergänzten Router-`spokenText`, Bericht-Sonderfall und PWA-Revision `20260807-voice-guides-report-v28-3`.

Ein weiterer realer iPhone-Test zeigte: Der erste vorhandene Satz kann hörbar sein, aber ein späterer bestätigter Guide-Satz fällt bei fehlendem statischem Audio erneut in lokale Supertonic-WASM-Inferenz und kann stumm bleiben.

### Abgeschlossener Folgeblock PR #86

Branch:

`fix/static-supertonic-accountfree-v28-20260807`

PR #86 wurde manuell mit dem vollständig grünen exakten Head `6061f4d532ec4eddadd84bf6e658735ba35571ba` gemergt. Merge-Commit auf `main`: `7eed2aec275464e90436c3686aae30671f3803e3`. Der Implementierungsbranch bleibt bewusst bestehen.

PWA-Revision:

`20260807-static-supertonic-guides-v28-4`

Veröffentlichte Architektur:

1. **Supertonic F1** ist die einzige reguläre DokoHilf-Stimme.
2. Der öffentliche GitHub-Actions-Build erzeugt 93 bestätigte allgemeine Guide-Sätze plus 18 feste Dialogsätze mit Supertonic 3 / F1 / Deutsch als statische WAV-Dateien.
3. iPhone und Android spielen diese bestätigten Guide-Audios nur ab; dafür ist keine lokale Geräte-Inferenz nötig.
4. Router-`spokenText` wird berücksichtigt, damit kurze bestätigte Anweisungen zuverlässig den passenden statischen Satz treffen.
5. Der aktive Browser-Sprachpfad ruft keine Cloud-TTS-API auf.
6. Keine System-/Gerätestimme als regulärer Fallback.
7. Nur ein noch nicht vorbereiteter freier Satz darf als technischer Notweg lokal mit derselben Supertonic-F1-Stimme erzeugt werden; auf iOS bleibt die harte Zeitgrenze bestehen.
8. Generierte freie Audios werden nicht dauerhaft gespeichert.

Der öffentliche Pages-Build muss exakt **111 statische Supertonic-F1-WAVs** erzeugen (93 Guide-Sätze + 18 feste Dialogsätze) und den ausgelieferten Katalog als `Supertonic-F1` kennzeichnen.

## 8. Kostenkontrolle / stillgelegter Cloud-Sprachaufbau

Der bisherige automatische serverseitige Sprachaufbau ist kein Fallback mehr und darf kein Audio mehr erzeugen:

- `dokohilf-tts` ist ein nicht-generierender Ruhestandsendpunkt (`410 Gone`).
- `dokohilf-guide-audio-build` ist ein nicht-generierender Ruhestandsendpunkt (`410 Gone`).
- `dokohilf-guide-audio` liefert auch die alten Gacrux-Dateien nicht mehr aus und ist ebenfalls ein nicht-generierender Ruhestandsendpunkt (`410 Gone`).
- Alle drei Funktionen verlangen zusätzlich ein gültiges JWT (`verify_jwt = true`).
- `public.dokohilf_internal_build_control.enabled` bleibt `false`.
- Die Migration `20260807214545_retire_legacy_cloud_voice.sql` entfernt den Cron `dokohilf-static-guide-audio-v27`.

Damit enthält der aktive und der serverseitige Sprachpfad keinen Gemini-/Gacrux-Provideraufruf mehr. Reguläre Audios entstehen ausschließlich kostenlos im geprüften GitHub-Releasebuild mit Supertonic F1; der lokale technische Notweg nutzt dieselbe Stimme.

Live verifiziert: `dokohilf-tts` v22, `dokohilf-guide-audio-build` v4 und `dokohilf-guide-audio` v2 sind aktiv, JWT-geschützt und enthalten nur Ruhestandscode; der Cron ist nicht mehr vorhanden, der Build-Schalter ist `false`, Supabase Auth enthält 0 Nutzer, der Security-Advisor meldet 0 Hinweise und der Performance-Advisor 1 reinen Infohinweis zum bislang ungenutzten Guide-Versionsindex.

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
- `dokohilf-tts` als stillgelegter, nicht-generierender Ruhestandsendpunkt
- `dokohilf-guide-audio` als stillgelegter alter Gacrux-Auslieferungsendpunkt
- `dokohilf-guide-audio-build` als stillgelegter, nicht-generierender Ruhestandsendpunkt
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`

Supabase ist technische Infrastruktur, **keine DokoHilf-Nutzerverwaltung**. Keine App-Konten, Anmeldung, Rollenprofile, Bewohnerprofile oder Mitarbeiterprofile in DokoHilf einführen.

Der frühere, nie produktiv verwendete Redaktions-Login ist vollständig stillgelegt: keine veröffentlichte Editor-Seite, keine App-Rollen oder Kontentabellen, keine Auth-Verweise in den Guide-Tabellen und `dokohilf-editor` v3 nur als JWT-geschützter `410 Gone`-Ruhestandsendpunkt. Ein interner `BEFORE INSERT`-Trigger blockiert jede Kontoerstellung; zwei restriktive RLS-Policies verweigern `anon` und `authenticated` jeden Zugriff auf Guides und Versionen. Die 25 allgemeinen Guide-Inhalte und 38 technischen Versionseinträge bleiben ohne Personenbezug erhalten. Supabase Auth bleibt bei 0 Nutzern.

## 11. Dauerhafte Datenschutz- und Sicherheitsgrenzen

- dauerhaft keine Echtdaten, auch nicht nach späterer organisatorischer Freigabe
- keinerlei App-Konten, Anmeldung, Rollen- oder Personenprofile in DokoHilf
- keine produktiven Exporte oder Kopien in DokoHilf
- keine Nutzerstimmen, Diktate oder freien Gesprächsinhalte dauerhaft speichern
- keine Secrets im Browser, Repository oder öffentlich sichtbaren Projekttext
- keine fremden Handbücher oder geschützten Inhalte kopieren
- keine erfundenen Fach- oder Klickwege
- öffentliche Projekttexte nur selbst formuliert, anonymisiert und veröffentlichungsfähig

`PROJECT_RULES.md` ist hierfür verbindlich.

## 12. Nächster ausführbarer Schritt

Der technische v28-4-Release ist abgeschlossen. Als nächstes real auf dem iPhone:

1. DokoHilf vollständig schließen und neu öffnen,
2. `KI · v28` und die aktuelle PWA-Revision prüfen,
3. Begrüßung sowie mehrere bestätigte Folgeanweisungen anhören,
4. bestätigen, dass durchgehend dieselbe Supertonic-F1-Stimme hörbar ist,
5. bei einem neuen Fehler den exakten Satz und den sichtbaren Status dokumentieren, aber keinen Cloud- oder Systemstimmen-Rollback einführen.

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
