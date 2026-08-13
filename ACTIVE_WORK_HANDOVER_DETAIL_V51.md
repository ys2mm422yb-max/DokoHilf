# Aktiver Arbeitsstand – Übergabe „Alle ausklappen“ v51

**Stand:** 13. August 2026  
**Status:** **fertig, gemergt, produktiv in Supabase und auf GitHub Pages veröffentlicht**  
**Öffentliche Version:** v31 bleibt unverändert  
**Issue:** #157 – geschlossen  
**PR:** #158 – gemergt  
**Merge-Commit auf `main`:** `841a08bfb278302369428fb721158d0dbcc338d7`  
**Veröffentlichter `gh-pages`-Commit:** `a91457b04b7641870fcc0cfe9e741d4aebc51c5c`

## Bestätigte Produktentscheidung

Für **Übergabe anzeigen / Was war los?** ist zusätzlich bestätigt:

- die Schaltfläche heißt **„Alle ausklappen“**;
- **„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“**;
- nach jeder Änderung des Zeitraums und anschließender Aktualisierung der Anzeige muss **„Alle ausklappen“ erneut gewählt werden**, damit alle Einträge wieder vollständig geöffnet sind.

Die genaue Orts-/Wiederholungsangabe ist primär **Detailhilfe bei Rückfragen oder „Ich finde das nicht“**. Der normale Hauptablauf bleibt kurz; dort wird nur die korrekte Schaltflächenbezeichnung verwendet.

## Umgesetzter Stand

- `assets/guide-library-v29.js`: sichtbarer Direktguide von `Alles ausklappen` auf `Alle ausklappen` korrigiert.
- `CONFIRMED_WORKFLOWS.md`: verbindliche Fachquelle auf Stand 13.08.2026 aktualisiert und Detailhilfe dokumentiert.
- `supabase/migrations/20260813104500_uebergabe_alle_ausklappen_detail_v51.sql`: approved Guide `uebergabeformular` produktiv aktualisiert.
- `assets/voice-context-stuck-catalog-v48.json`: drei neue bestätigte Supertonic-F1-Sätze am Ende ergänzt; bisherige WAV-Zuordnungen bleiben stabil.
- `scripts/build-supertonic-guide-audio-v28.py`: kontrollierter Kontextkatalog auf 65 Einträge erweitert.
- `service-worker.js`: `HANDOVER_DETAIL_REVISION = '20260813-uebergabe-alle-ausklappen-v51-1'`.
- Regressionstests sichern Text, Detailhilfe, Supabase-Vertrag, statische Sprache, PWA und Versionsregel ab.

## Supabase-Verifikation

Vor produktiver Anwendung wurde die Inhaltsänderung vollständig in `BEGIN … ROLLBACK` geprüft. Danach wurde die Migration produktiv angewendet und verifiziert:

- Guide `uebergabeformular` ist produktiv auf **v9**;
- Schritt 4 lautet exakt `Wähle „Alle ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.`;
- Schritt-4-Hilfe lautet exakt `„Alle ausklappen“ befindet sich rechts neben „Alle anzeigen“.`;
- Schritt-5-Hilfe weist auf erneutes Ausklappen nach Zeitraum-Aktualisierung hin;
- neuer Troubleshooting-Key `alle_ausklappen` vorhanden;
- alter Key `alles_ausklappen` entfernt;
- Alias `alle ausklappen` vorhanden.

## GitHub-/Release-Verifikation

Der exakte PR-Head war vor Merge in sämtlichen etablierten DokoHilf-Pflichtgates grün, einschließlich Versions-, Voice-, Feedback-, iOS-/Android- und Deploy-Prüfungen. `main` war beim Merge unverändert.

Danach wurde PR #158 mit Expected-Head-Schutz gemergt. Der anschließende `main`-Deploy **#843** lief erfolgreich durch. `gh-pages` wurde mit dem Stand von `main`-Commit `841a08bfb278302369428fb721158d0dbcc338d7` veröffentlicht; der veröffentlichte Commit trägt die Nachricht `Publish DokoHilf 841a08bfb278302369428fb721158d0dbcc338d7`.

GitHub Pages meldet anschließend **`status: built`** und verwendet `gh-pages` als Quelle.

Damit ist diese Änderung vollständig produktiv und abgeschlossen.
