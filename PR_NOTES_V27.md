# Pull-Request-Notizen Build 27

## Finaler Stand

- finaler Release-Branch: `feat/dark-premium-v27-release`
- finaler Draft-PR: **#52**
- Zielbranch: `main`
- Ziel-Build: `20260806-27`
- kein Auto-Merge
- keine automatische Branch-Löschung

## Ersetzte Pull Requests

- PR #49 wurde durch spätere Build-27-Arbeit ersetzt und geschlossen; Branch nicht gelöscht
- PR #50 wurde durch PR #51 ersetzt und geschlossen; Branch nicht gelöscht
- PR #51 wurde durch PR #52 ersetzt und geschlossen; Branch nicht gelöscht

PR #52 enthält den vollständigen Dark-UI-, Datenschutz-, TTS-v20-, privaten Guide-Audio-, Sicherheits-, Build- und Dokumentationsstand.

## Zusätzliche Bereinigung im Release-PR

Nach Abtrennung des Release-Branches wurden drei veraltete Regressionen gefunden und auf den tatsächlichen Build-27-Vertrag migriert:

- `tests/voice-diagnostics.test.mjs`
- `tests/live-build-recovery.test.mjs`
- `tests/voice-layout-v26.test.mjs`

Diese Änderungen entfernen ausschließlich harte Build-26-/TTS-v16-Erwartungen. Fachliche Router-, Sicherheits- und Klickwegprüfungen bleiben vollständig bestehen.

## Merge-Grenze

PR #52 bleibt Draft, bis die beiden Workflows auf dem exakten Release-Head grün sind:

1. `Deploy DokoHilf`
2. `Validate dark iPhone UI v27`

Die verbundene GitHub-App kann diese Workflows nicht selbst auslösen und der Connector stellt keinen Workflow-Dispatch bereit. Deshalb ist einmalig ein manueller Start in der GitHub-Oberfläche auf Branch `feat/dark-premium-v27-release` erforderlich.

Erst danach darf der exakte Head manuell gemergt und über den festen Hauptlink verifiziert werden.
