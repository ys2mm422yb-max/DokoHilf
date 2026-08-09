# DokoHilf – Active Work: Guide-Library Render Owner v29

**Status:** aktiver Release-Hotfix  
**Stand:** 9. August 2026  
**Branch:** `fix/v29-guide-library-render-owner-20260809`  
**Ziel-Build:** `20260809-30`

## Ausgangslage

PR #105 wurde nach 8/8 grünen Pflichtworkflows auf dem exakten Head `c49a4841b84e4eff0ee31f10834db773162422a7` gemergt. Main-Merge war `49ea85f02bc600f9288cb6026a4072029c753426`, der automatische gh-pages-Publish `0f911ac80281343fc9336d7b18fe1254e49e54c4`. Damit war der Build-ID-/PWA-Refresh von `20260808-29` auf `20260809-29` technisch erfolgreich.

Die reale Render-Abnahme des finalen PR-Artefakts zeigte danach jedoch weiterhin die alte Startsektion `HÄUFIGE ABLÄUFE · DIREKT ÖFFNEN` mit sieben Legacy-Karten. Die neue Guide-Bibliothek war geladen, wurde aber im Startzustand nicht dauerhaft sichtbar.

## Zweite Ursache

Es lagen zwei konkurrierende UI-Besitzer vor:

1. `direct-guides-v27.js` erwartet einen vollständigen Legacy-Fallback mit sieben Direktkarten. Der statische Index enthielt nur sechs. Beim ersten verzögerten Sync konnte die v27-Schicht deshalb den von `guide-library-v29.js` gerade gerenderten Bereich wieder durch die sieben Legacy-Karten ersetzen.
2. `v29-ui.js` behandelte anschließend weiterhin **alle** Buttons unter `.examples` als Legacy-Karten und setzte die Überschrift wieder auf `Häufige Abläufe · direkt öffnen`.

Der bisherige Mobiltest hat diesen Fehler nicht erkannt, weil er nur geprüft hat, ob mindestens sieben Legacy-Buttons im DOM existieren. Genau der falsche Zustand erfüllte damit den Test.

## Reparatur

- neuer Build `20260809-30`, damit auch bereits aktualisierte installierte PWAs einen weiteren echten Versionswechsel erkennen
- statischer Legacy-Fallback im Index vollständig mit sieben Direktkarten und `data-v27-ready="direct-guides-cross-platform"`
- `v29-ui.js` stylt/symbolisiert nur noch `button[data-direct-guide]`
- sobald die Guide-Bibliothek aktiv ist, respektiert `v29-ui.js` deren Überschrift `Häufig genutzt`
- `direct-guide-copy-v29.js` liest die Build-ID aus dem ausgelieferten Meta-Tag und baut Guide-Library-Asset-URLs dynamisch
- iOS-/Android-Renderer prüft jetzt den sichtbaren Endzustand:
  - `Häufig genutzt`
  - sechs sichtbare `.v29-frequent-guide`-Karten
  - unterschiedliche SVG-Icons
  - `Alle Anleitungen anzeigen`
  - sieben Legacy-Direktkarten tatsächlich unsichtbar
  - vollständige Bibliothek mit mindestens 17 fertigen Guides
  - Berichtssuche separat als `kommt später`

## Fachliche Grenzen bleiben unverändert

- Bericht korrigieren ist keine Folgebericht-Funktion.
- Folgebericht ergänzt/führt ein bestehendes Geschehen fort.
- Visite: Arztfilter nur als Sonderfall, wenn der Arzt beim Bewohner nicht hinterlegt ist; Ort enthält Einrichtung / beim Arzt / telefonisch / per Mail.
- Vitalwerte: Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz, Atemalkohol; Blutdruck mit Systole + Diastole; keine unbestätigten Einheiten erfinden.
- Berichtssuche bleibt Draft / kommt später.
- Supertonic F1 bleibt die kostenlose Stimme; keine Cloud-TTS-Lösung einführen.

## Freigaberegel

Der Hotfix darf erst gemergt werden, wenn alle acht bestehenden Pflichtworkflows auf **demselben exakten Head** grün sind. Danach Main-Publish und gh-pages erneut prüfen. Zusätzlich muss das iOS-Render-Artefakt des finalen grünen Heads sichtbar die neue Startbibliothek zeigen; reine Dateipräsenz reicht nicht mehr als Abnahme.
