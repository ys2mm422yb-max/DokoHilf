# DokoHilf – aktive Arbeit: Guide Discovery v53 / v32

**Status:** IN ARBEIT  
**Stand:** 23. August 2026  
**Branch:** `feature/guide-discovery-v53-v32`  
**Ausgangs-main:** `9c920d55f52bbd0a2f6a8f11ce76777a06ec1094` (Merge PR #159)

## Nutzerentscheidung

DokoHilf soll auf Basis der bereits bestätigten Fachinformationen weiter verbessert werden. Neue fachliche Gleichsetzungen oder unbekannte Klickwege werden nicht erfunden; sobald dafür Informationen fehlen, wird gezielt beim Nutzer nachgefragt.

## Ziel dieses Arbeitsblocks

Zwei zusammengehörige nutzerseitige Verbesserungen der bestehenden Anleitungsbibliothek:

1. Die vorhandene Suchleiste wird intent-bewusster, ohne eine zweite Suche oder eine neue KI-Inhaltsquelle einzuführen.
2. Eine bereits geöffnete vollständige Anleitung kann direkt als bestehender bestätigter Guide **Schritt für Schritt** im Chat gestartet werden.

## Fachliche Grenzen

- `abzeichnen` bleibt verbindlich Durchführungsnachweis.
- `falsch/versehentlich abgezeichnet` bleibt Durchführung stornieren.
- Medikation bleibt im normalen Medikationsbereich ausschließlich ansehen.
- Nicht bestätigte Synonyme werden nicht stillschweigend gleichgesetzt. Insbesondere wird `abhaken` nicht neu als allgemeines Synonym für `abzeichnen` festgelegt.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.
- Keine neuen Klickwege oder Guide-Schritte.

## Technische Umsetzung

- `assets/guide-discovery-v53.js`
  - erweitert nur die bestehende Bibliothekssuche;
  - priorisiert bestätigte Tätigkeitsabsichten vor bloßen Fachbegriffen;
  - berücksichtigt bestätigte Suchbegriffe, die nicht auf den Karten stehen, z. B. Sauerstoff → Vitalwerte, Arztbrief → Dateiablage und Notfallbogen → Notfallblatt;
  - ergänzt auf vorhandenen vollständigen Guides den Button `Schritt für Schritt starten`;
  - startet exakt den bereits approved Guide über `selectedGuideSlug`;
  - keine zusätzliche Speicherung, keine Konten, keine neue Fachdatenquelle.
- `assets/release-polish-v29.js`
  - lädt die neue Discovery-Schicht;
  - öffentliche Version wird gemäß Versionsregel auf v32 gesetzt.
- `service-worker.js`
  - neuer Guide-Discovery-Revisionsmarker und PWA-Cache-Eintrag;
  - der bereits auf `gh-pages` vorhandene statische Supertonic-/Orientierungs-Hotfix wird in `main` übernommen, damit er bei der nächsten Veröffentlichung nicht überschrieben wird.
- `version.json`
  - `appVersion: v32`;
  - Release-Metadatum `guide-discovery-v53`.

## Supabase

Keine Migration, keine neuen Tabellen und kein Edge-Function-Deploy. Der Schritt-für-Schritt-Start verwendet ausschließlich bereits freigegebene Guide-Slugs aus dem bestehenden produktiven Guide-Bestand.

## Prüfplan

- deterministischer Regressionstest für intelligente Suche und exakten Guided-Start;
- bestehende DokoHilf-Pflichtworkflows auf exakt demselben PR-Head;
- `Validate app version policy`;
- iOS- und Android-Renderprüfung;
- statischer Voice-Vertrag muss unverändert grün bleiben, da keine hörbaren Guide-Texte geändert werden;
- nach Merge `main`, `gh-pages`, v32 und fester öffentlicher Hauptlink prüfen.

## Noch nicht live

Dieser Arbeitsblock ist erst nach vollständig grünen Pflichtprüfungen, manuellem Merge mit Expected-Head-Schutz und realer Prüfung des veröffentlichten Hauptlinks als live zu betrachten.