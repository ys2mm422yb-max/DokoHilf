# Aktiver Arbeitsstand – Detailhilfe bei „Ich brauche Hilfe / Ich finde das nicht“

**Stand:** 7. August 2026  
**Status:** fachlich bestätigt, Umsetzung noch offen  
**Ausgangsbuild:** `20260806-27`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

## Nutzerentscheidung

DokoHilf soll bei einem laufenden Guide nicht nur starr den nächsten Klickschritt nennen. Wenn jemand etwas nicht findet, soll eine gezielte Detailhilfe innerhalb des aktuell laufenden bestätigten Ablaufs möglich sein.

Die bestehende sichtbare Aktion **„Ich brauche Hilfe“** ist dafür die Grundlage. Inhaltlich soll sie auch Aussagen wie **„Ich finde das nicht“**, **„Bei mir heißt das anders“**, **„Ich bin auf einer anderen Seite“** oder **„Was muss ich jetzt drücken?“** abfangen.

## Verbindliches Verhalten

- Die aktuelle Absicht und der aktuelle Guide-Schritt bleiben erhalten.
- DokoHilf fragt gezielt nach dem sichtbaren Zustand, statt den Schritt als erledigt zu markieren.
- Sinnvolle erste Unterscheidungen sind:
  - Menüpunkt fehlt
  - Bezeichnung sieht anders aus
  - Nutzer ist auf einer anderen Seite / in einem anderen Reiter
  - Nutzer weiß nicht, wo er sich befindet
- Danach wird nur anhand bestätigter lokaler Bezeichnungen und bestätigter Alternativen weitergeführt.
- DokoHilf darf niemals einen neuen Vivendi-Klickweg, Feldnamen oder eine Funktion erfinden.
- Wenn für den beschriebenen Zustand keine bestätigte Hilfe existiert, muss DokoHilf das klar sagen und entweder zum letzten sicheren bestätigten Schritt zurückführen oder menschliche Unterstützung empfehlen.
- Sprachmodus und Schreibmodus müssen dieselbe fachliche Hilfelogik verwenden.
- Bedienkommandos und technische Zustände erscheinen weiterhin nicht als normale Chatnachrichten.
- Keine personenbezogenen Inhalte dauerhaft speichern.

## Am 7. August 2026 erneut anhand lokaler Nutzerbilder bestätigte Bereiche

Die zugrunde liegenden Bilder bleiben ausschließlich im Chat. Sie werden nicht in GitHub, Supabase, Tests, Issues, Pull Requests oder Artefakte übernommen. Dokumentiert werden nur anonymisierte, selbst formulierte Klickwege.

Erneut bestätigt wurden:

1. **Visite dokumentieren**
   - `Doku-Erweitert → Visiten → Neu`
   - vorgeschaltete Klientenauswahl
   - danach Maske `Neue Visite`
   - Visite über **Durchführen** als durchgeführt erfassen

2. **Bericht anlegen**
   - Berichtbereich öffnen
   - grünes Plus / neuer Berichtseintrag
   - Kategorie auswählen
   - Eingabemaske öffnen und Bericht vervollständigen

3. **Vitalwerte**
   - `Doku-Erweitert → Vitalwerte` für Einzelwert
   - separater Menüpunkt `Vitalwerte Sammelerf.` für mehrere Werte
   - Einzelwertmaske zeigt je nach Typ passende Felder, z. B. Systole und Diastole bei Blutdruck

4. **Bericht durchstreichen**
   - Bericht auswählen
   - Kontextmenü / `Eintrag bearbeiten`
   - **Durchstreichen**
   - Bemerkung zur Bearbeitung
   - OK

5. **Durchführung stornieren**
   - `Doku → Durchführungsnachweis`
   - betroffenen Eintrag per Kontextmenü öffnen
   - **Durchführung stornieren**

6. **Notfallblatt öffnen**
   - kleines rotes Kreuz / zugehöriges Menü oben links
   - **Notfallblatt aufrufen**
   - Notfallblattmaske öffnen

7. **Formular anlegen / öffnen**
   - Formulare öffnen
   - **Neu**
   - Fenster **Formular anlegen**
   - passendes Protokoll/Formular wählen, z. B. Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll
   - OK

8. **Übergabe / Was war los?**
   - `Analyse → Was war los?`
   - **Alle anzeigen**
   - **Alles ausklappen**
   - darunter werden u. a. durchgeführte Visiten und neue/geänderte Formulare sichtbar

Die verbindlichen vollständigen Klickwege stehen in `CONFIRMED_WORKFLOWS.md`.

## Nächste Umsetzung

1. Detailhilfe als eigener fachlicher Zustand im laufenden Guide modellieren.
2. `Ich brauche Hilfe` und freie Aussagen wie `Ich finde das nicht` auf diesen Zustand routen.
3. Strukturierte Rückfragen anbieten, ohne den aktuellen Schritt zu verlieren.
4. Nur bestätigte Hilfetexte/Alternativen ausgeben.
5. Regressionstests ergänzen: Hilfe darf keinen Schritt automatisch abschließen, keine neue Absicht erzeugen und keine unbestätigten Klickwege ausgeben.
6. Sprach- und Schreibmodus gemeinsam testen.
7. Nach Umsetzung exakten PR-Head vollständig prüfen, danach erst mergen und veröffentlichen.

## Dauerhafte Dokumentationsregel

Jeder zukünftige DokoHilf-Arbeitsblock muss seinen echten Stand dauerhaft im Repository hinterlassen: Entscheidung, betroffene Dateien/Komponenten, Tests, Fehler, offene Blocker, aktueller PR/Head sowie der nächste ausführbare Schritt. Ein neuer Chat soll die Arbeit aus GitHub fortsetzen können, ohne alte Chats rekonstruieren zu müssen.
