# DokoHilf – aktive Arbeit: Hilfe, Regelbasis und Selbsttest v54 / v33

**Status:** IN PRÜFUNG  
**Stand:** 23. August 2026  
**Branch:** `feature/help-registry-selftest-v54-v33`  
**Ausgangs-main:** `d74c54e25e6f046112e618c1ad658e8505ec6707` (Merge PR #160)

## Ziel

Die noch offenen, bereits beschlossenen Verbesserungsblöcke werden ohne neue fachliche Klickwege umgesetzt:

1. Kontextuelle Schritthilfe sichtbar und direkt erreichbar machen.
2. Bestätigte Intent-/Routingregeln in einer zentralen finalen Client-Regelbasis bündeln, damit Suche und Routing nicht auseinanderlaufen.
3. Einen kleinen lokalen technischen Selbsttest für App, Verbindung, DokoHilf-Dienst, Mikrofon und ausschließlich statische Supertonic-F1-Sprachausgabe ergänzen.

## Fachliche Grenzen

- Keine neuen Vivendi-Klickwege, Feldnamen oder Bildschirmzustände werden erfunden.
- Spezifische `stuck`-Hilfen bleiben exakt die bereits bestätigten Supabase-Inhalte.
- Fehlt eine spezifische `stuck`-Hilfe, darf der bestehende Router nur den bestätigten Schritt wiederholen.
- `abzeichnen` bleibt Durchführungsnachweis; falsch/versehentlich abgezeichnet bleibt Storno.
- `abhaken` wird nicht neu als allgemeines Synonym für `abzeichnen` eingeführt.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben blockiert/fachlich offen.
- Medikation bleibt im normalen Medikationsbereich ausschließlich ansehen.

## Datenschutz / Stimme

- Keine Konten, keine Nutzerprofile, keine dauerhafte Speicherung.
- Selbsttest überträgt keine Bewohner-, Mitarbeiter-, Fall-, Chat- oder Audiodaten.
- Mikrofontest öffnet den Gerätezugriff nur nach explizitem Tippen, stoppt den Stream sofort und speichert/überträgt nichts.
- Voice-Test prüft ausschließlich den statischen `Supertonic-F1`-Katalog und eine statische WAV-Datei.
- Keine System-/Browser-/Cloud-/Bezahlstimme und kein Voice-Fallback.

## Technische Umsetzung

- `assets/intent-registry-v54.js`: äußerste bestätigte Routing-Schicht + gemeinsame Library-Ziele; ältere Routingmodule bleiben nur Fallback.
- `assets/step-help-v54.js`: sichtbarer Button `Hilfe zum Schritt`, der den bestehenden `ich finde das nicht`-Pfad des aktiven Guides nutzt.
- `assets/self-test-v54.js`: lokaler Selbsttest; Mikrofonzugriff nur auf ausdrückliche Nutzeraktion.
- `assets/release-polish-v29.js`: lädt Registry zuerst, danach Discovery, Schritthilfe und Selbsttest; öffentliche Version v33.
- `tests/help-registry-selftest-v54.test.mjs` + eigener CI-Gate.

## Supabase

Keine Migration und kein Edge-Function-Deploy erforderlich. Die bestehende produktive Guide-/Stuck-Quelle wird unverändert verwendet.

## Noch nicht live

Erst nach grünem exakten PR-Head, Merge mit Expected-Head-Schutz und realer Prüfung von `main`, `gh-pages` und dem festen Hauptlink als live betrachten.
