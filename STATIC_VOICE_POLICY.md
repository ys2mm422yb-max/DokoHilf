# DokoHilf – verbindliche Spracharchitektur

**Stand:** 9. August 2026  
**Status:** verbindlich

## Grundregel

Jeder Satz, den DokoHilf hörbar ausgibt, muss aus einer **vorab im GitHub-Release erzeugten Supertonic-3-Datei mit Stimme F1** stammen.

Nicht zulässig sind:

- Supertonic-Inferenz auf dem iPhone, Android-Gerät oder allgemein im Browser;
- WebGPU-/WASM-TTS im Endgerät;
- System-/Gerätestimmen als Fallback;
- Cloud-TTS oder kostenpflichtige TTS-APIs;
- dynamische Spracherzeugung aus freien Nutzer- oder Falldaten.

Wenn ein frei formulierter Antworttext keinen exakt vorbereiteten Sprachsatz besitzt, darf DokoHilf ausschließlich einen ebenfalls vorab erzeugten neutralen Supertonic-F1-Satz verwenden. Der vollständige Text bleibt im Chat sichtbar.

## Release-Regel

- Der Release-Build erzeugt alle freigegebenen statischen Sprachsätze mit Supertonic 3 / F1.
- Textänderung = Audio neu erzeugen.
- Der Build muss fehlschlagen, wenn der erwartete statische Sprachbestand unvollständig ist.
- Browsercode darf keine Supertonic-Modellgewichte zur Laufzeit laden.
- Alte lokale Inferenzpfade bleiben technisch deaktiviert und dürfen nicht wieder aktiviert werden.

## Sprachstart

Der kurze Startsatz im Sprachmodus lautet:

**„Hey! Wobei brauchst du Hilfe?“**

## Orientierung

Auch Orientierungsantworten wie „Wo ist Doku-Erweitert?“ oder „Ich finde Vitalwerte nicht“ werden nur aus bestätigten Klickwegen formuliert und als feste Supertonic-F1-Sätze gebaut. DokoHilf darf keine Positionen, Menüs oder Klickwege erfinden.
