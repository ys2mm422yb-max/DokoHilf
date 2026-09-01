# ACTIVE WORK – räumliche Vivendi-Orientierung v59

Stand: 1. September 2026

## Ziel

DokoHilf soll bei Rückfragen wie „Wo ist die Leiste?“, „Was ist das Funktionsband?“ oder „Wo finde ich Bericht?“ räumlich genauer helfen, ohne bestätigte Klickwege zu verändern oder neue fachliche Abläufe zu erfinden.

Die räumliche Orientierung wird mit dem bereits bestätigten DokoHilf-Wissen verknüpft. Es entsteht keine zweite, konkurrierende Wissensquelle.

## Datenschutz- und Quellenbegrenzung

- Originale visuelle Quellen, Aufnahmen oder Dokumente werden weder in GitHub noch in Supabase gespeichert.
- Es werden nur anonymisierte, selbst formulierte und bestätigte UI-Fakten übernommen.
- Keine Namen, Personen-, Bewohner-, Mitarbeiter-, Fall-, Gesundheits-, Organisations- oder sonstigen Echtdaten werden übernommen oder nachgebildet.
- Tests verwenden ausschließlich synthetische, nicht personenbezogene Inhalte.
- Öffentliche DokoHilf-Texte enthalten keine Herkunftsangaben zu internem Prüfmaterial.

## Bereits bestätigte räumliche Struktur

- Die feste grüne Hauptleiste verläuft ganz oben im Vivendi-Fenster.
- Dort befinden sich beschriftete Hauptreiter, darunter Doku, Doku-Erweitert, Planung und Analyse.
- Doku liegt in der bestätigten Anordnung zwischen Planung und Doku-Erweitert.
- Direkt unter der grünen Hauptleiste liegt das weiße Funktionsband des ausgewählten Hauptbereichs.
- Das weiße Funktionsband zeigt die Funktionen des ausgewählten Hauptbereichs als beschriftete Symbole beziehungsweise Schaltflächen.
- Unter Doku befinden sich im weißen Funktionsband unter anderem Bericht und Durchführungsnachweis.
- Bericht ist kein Hauptreiter der grünen Leiste.
- Die räumliche Hilfe darf einen laufenden Guide-Schritt nicht als erledigt markieren und darf den Klickweg nicht eigenmächtig erweitern.
- Eine routinemäßige Prüfung des aktuellen Bereichs wird nicht in bestehende Anleitungen eingebaut.

## Umsetzung v59

- `assets/orientation-help-v29.js` erkennt nun auch Rückfragen zum weißen Funktionsband, zur weißen Leiste und zu den darunterliegenden Symbolen/Funktionen.
- Die Erklärung der grünen Hauptleiste beschreibt zusätzlich die räumliche Beziehung zum weißen Funktionsband.
- Doku wird als beschrifteter Hauptreiter beschrieben; Bericht und Durchführungsnachweis werden als Funktionen im darunterliegenden weißen Funktionsband eingeordnet.
- Alle neu oder verändert hörbaren Sätze bleiben im statischen `Supertonic-F1`-Katalog. Es gibt keinen Browser-, System- oder Cloud-TTS-Fallback.
- Keine Supabase-Guide-Schritte werden in diesem Arbeitsblock verändert.

## Nächste Schritte – strikt einzeln

### 1. Vitalwerte

Bestehendes Wissen zuerst vollständig gegen den aktuellen bestätigten Stand prüfen. Der derzeit produktive Guide verwendet Doku-Erweitert → Vitalwerte. Ein zusätzlich bestätigter Zugang darf nur in einem eigenen, isolierten PR ergänzt werden. Der bestehende funktionierende Weg darf dabei nicht entfernt werden. Danach gezielt Such-, Chat-, Hilfe- und Sprachtests durchführen.

### 2. An-/Abwesenheiten

Den aktuell hinterlegten Weg Doku-Erweitert → An-/Abwesenheiten gegen den zusätzlich bestätigten Navigationsstand separat prüfen. Keine Änderung zusammen mit Vitalwerte. Erst nach isolierter Bestätigung Guide, Orientierung, statische Sprache und Regressionstests anpassen.

### 3. Durchführungsnachweis – Detailwissen

Die bereits vorhandenen DNF-Guides bleiben maßgeblich. Zusätzliche bestätigte Informationen zu Routinedokumentation, Abweichungen und Medikamentengabe werden jeweils gegen bestehende DNF-Guides geprüft und nur als eigene, klar abgegrenzte Bedienabläufe ergänzt. DokoHilf trifft dabei keine fachliche, medizinische oder pflegerische Entscheidung. Der allgemeine Einstieg „etwas abzeichnen“ bleibt resident-first über Doku → Durchführungsnachweis.

### 4. Bereich wechseln

Als eigene Anleitung vorsehen, aber erst umsetzen, wenn der tatsächliche Wechselweg vollständig bestätigt ist. Die bloße Anzeige des aktuellen Bereichs reicht nicht aus, um einen Wechselweg zu erfinden. Keine Bereichsprüfung als Standardvorspann in andere Guides einbauen.

## Prüfreihenfolge pro Folgeblock

1. Bestehenden GitHub- und Supabase-Stand lesen.
2. Nur die konkrete Anleitung mit dem bestätigten Zusatzwissen abgleichen.
3. Widersprüche zuerst auflösen; nichts überschreiben, nur weil eine neuere Beschreibung existiert.
4. Branch erstellen.
5. Fachlich minimalen Patch plus Regressionstests erstellen.
6. Exact-PR-Head vollständig prüfen.
7. Erst nach grünen Checks mergen.
8. Falls Supabase betroffen ist: Migration zuerst als Rollback-/Dry-Run prüfen, danach erst aus gemergtem `main` produktiv anwenden.
9. Veröffentlichung abwarten und tatsächlichen Live-Stand prüfen.
10. Erst danach den nächsten fachlichen Block beginnen.
