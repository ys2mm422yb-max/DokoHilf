# Aktiver Arbeitsstand – Übergabe „Alle ausklappen“ v51

**Stand:** 13. August 2026  
**Status:** PR-Prüfung läuft  
**Öffentliche Version:** v31 bleibt unverändert  
**Issue:** #157  
**PR:** #158  
**Branch:** `hotfix/uebergabe-alle-ausklappen-v31`  
**Exact PR Head:** `68241b55b25059fc280aaa388fde623f35e6a348`  
**Basis-Main:** `946a557f4b9664a994163418b06997210a72c409`

## Bestätigte Produktentscheidung

Für **Übergabe anzeigen / Was war los?** ist zusätzlich bestätigt:

- die Schaltfläche heißt **„Alle ausklappen“**;
- **„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“**;
- nach jeder Änderung des Zeitraums und anschließender Aktualisierung der Anzeige muss **„Alle ausklappen“ erneut gewählt werden**, damit alle Einträge wieder vollständig geöffnet sind.

Die genaue Orts-/Wiederholungsangabe ist primär **Detailhilfe bei Rückfragen oder „Ich finde das nicht“**. Der normale Hauptablauf bleibt kurz; dort wird nur die korrekte Schaltflächenbezeichnung verwendet.

## Umsetzung in PR #158

- `assets/guide-library-v29.js`: sichtbarer Direktguide von `Alles ausklappen` auf `Alle ausklappen` korrigiert.
- `CONFIRMED_WORKFLOWS.md`: verbindliche Fachquelle auf Stand 13.08.2026 aktualisiert und Detailhilfe dokumentiert.
- `supabase/migrations/20260813104500_uebergabe_alle_ausklappen_detail_v51.sql`: approved Guide `uebergabeformular` erhält korrigierten Schritt, zwei `stuck`-Hilfen, neues Troubleshooting und Alias `alle ausklappen`.
- `assets/voice-context-stuck-catalog-v48.json`: drei neue bestätigte Supertonic-F1-Sätze **am Ende** ergänzt; bisherige WAV-Zuordnungen bleiben dadurch stabil.
- `scripts/build-supertonic-guide-audio-v28.py`: kontrollierter Kontextkatalog auf 65 Einträge erweitert.
- `service-worker.js`: `HANDOVER_DETAIL_REVISION = '20260813-uebergabe-alle-ausklappen-v51-1'`, damit installierte PWAs die kleine Korrektur trotz unveränderter v31 zuverlässig übernehmen.
- `tests/handover-detail-v51.test.mjs` und `tests/user-facing-hotfix-v48.test.mjs`: Regressionstests für Text, Detailhilfe, Supabase-Vertrag, statische Sprache, PWA und Versionsregel.

## Supabase-Sicherheitsprüfung

Die geplante produktive Inhaltsänderung wurde vollständig in `BEGIN … ROLLBACK` gegen das DokoHilf-Produktionsprojekt geprüft.

Verifiziert wurde im Testzustand:

- v8 → v9;
- Schritt 4 exakt `Wähle „Alle ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.`;
- Schritt-4-Hilfe exakt `„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“.`;
- Schritt-5-Hilfe weist auf erneutes Ausklappen nach Zeitraum-Aktualisierung hin;
- alter Troubleshooting-Key `alles_ausklappen` entfernt, neuer `alle_ausklappen` gesetzt;
- Alias `alle ausklappen` ergänzt.

Danach wurde vollständig zurückgerollt. Eine separate Kontrolle bestätigte den unveränderten produktiven Ausgangsstand v8. **Produktion ist zu diesem Zeitpunkt noch nicht geändert.**

## Freigaberegel

Produktive Supabase-Anwendung und Merge erst, wenn sämtliche etablierten DokoHilf-Pflichtgates sowie Versions-/Voice-/Feedback-Gates auf exakt `68241b55b25059fc280aaa388fde623f35e6a348` grün sind. Vor Merge `main` erneut prüfen; bei zwischenzeitlichem Advance den geprüften alten Head niemals blind mergen.

Nach Merge muss der neue `main`-Deploy inklusive `gh-pages` erfolgreich sein und GitHub Pages `built` melden, bevor die Änderung als live gilt.
