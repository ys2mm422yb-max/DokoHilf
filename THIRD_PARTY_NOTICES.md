# DokoHilf – Third-Party Notices

Stand: 7. August 2026

## Supertonic 3 / Supertone Inc.

DokoHilf v28 verwendet für die lokale Sprachausgabe die öffentlich bereitgestellten **Supertonic-3**-Modellartefakte von Supertone Inc.

- Modell: `Supertone/supertonic-3`
- Quelle: https://huggingface.co/Supertone/supertonic-3
- Modelllizenz laut Model Card: **OpenRAIL-M**
- Copyright laut Model Card: © 2026 Supertone Inc.
- Die Modellgewichte werden **nicht** in diesem GitHub-Repository oder im öffentlichen DokoHilf-Pages-Build weiterverteilt. Der Browser lädt die benötigten Modellartefakte bei aktivierter Sprachfunktion direkt von der angegebenen Modellquelle und cached ausschließlich diese Modellressourcen lokal auf dem Gerät.
- Die OpenRAIL-M-Bedingungen und Nutzungsbeschränkungen gelten unabhängig davon weiterhin. Vor einem organisationsweiten/produktiven Arbeitsplatz-Rollout muss die konkrete Nutzung einschließlich Lizenz- und Datenschutzanforderungen geprüft werden.

Die Browser-Inferenzschicht in `assets/vendor/supertonic-web-v28.mjs` ist eine für DokoHilf angepasste Implementierung auf Basis des öffentlich bereitgestellten Supertonic-Webbeispiels. Die Supertonic-Model-Card beschreibt den Beispielcode als **MIT-lizenziert**. Der DokoHilf-Adapter enthält keine Modellgewichte.

## ONNX Runtime Web / Microsoft

Die lokale Browser-Inferenz verwendet **ONNX Runtime Web** über die ES-Modul-/WASM-Ressourcen von jsDelivr.

- Projekt: https://onnxruntime.ai/
- Paket: `onnxruntime-web`
- verwendete Version in v28: `1.27.0`

DokoHilf verwendet auf Android nach Möglichkeit den WebGPU-Ausführungspfad und fällt innerhalb derselben lokalen Engine auf WASM zurück. Auf iOS wird wegen der aktuellen ONNX-Runtime-Web-Browserunterstützung WASM verwendet.

## Keine Sprach-API als v28-Ausgabepfad

Die frühere serverseitige Gemini-/Gacrux-Erzeugung ist kein Rollback- oder Fallbackpfad mehr. `dokohilf-tts`, `dokohilf-guide-audio-build` und die alte Gacrux-Auslieferung `dokohilf-guide-audio` sind nicht-generierende Ruhestandsendpunkte mit `410 Gone`; der frühere Erzeugungs-Cron wird entfernt. Der v28-Browserpfad verwendet ausschließlich statische Supertonic-F1-Audios und dieselbe Supertonic-F1-Stimme für die zeitlich begrenzte lokale Notinferenz. Eine System-/Gerätestimme wird nicht hörbar verwendet.
