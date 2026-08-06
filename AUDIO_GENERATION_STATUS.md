# Audio-Erzeugungsstatus

Die statischen Gacrux-Dateien gelten erst als abgeschlossen, wenn alle folgenden Dateien im Branch vorhanden und geprüft sind:

- `assets/guide-audio-manifest.json`
- exakt 93 Dateien unter `assets/audio/guides/`
- gültiger RIFF-/WAVE-Header für jede Datei
- übereinstimmende Dateigröße und SHA-256 aus dem Manifest
- Stimme Gacrux

Bis diese Bedingungen erfüllt und durch `tests/prebuilt-guide-audio.test.mjs` bestätigt sind, darf der Branch nicht gemergt oder veröffentlicht werden.
