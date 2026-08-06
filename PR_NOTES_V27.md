# Pull-Request-Notizen Build 27

## Finaler Stand

- finaler Release-Branch: `release/build-27-final-validation`
- vorheriger Release-PR: **#52**
- Zielbranch: `main`
- Ziel-Build: `20260806-27`
- kein Auto-Merge
- keine automatische Branch-Löschung

## Ersetzte Pull Requests

- PR #49 wurde durch spätere Build-27-Arbeit ersetzt und geschlossen; Branch nicht gelöscht
- PR #50 wurde durch PR #51 ersetzt und geschlossen; Branch nicht gelöscht
- PR #51 wurde durch PR #52 ersetzt und geschlossen; Branch nicht gelöscht
- PR #52 bleibt bis zum grünen Nachweis offen und wird anschließend durch den finalen Validierungs-PR ersetzt; Branch nicht löschen

Der finale Validierungsbranch enthält den vollständigen Stand aus PR #52 einschließlich der korrigierten iPhone-Renderprüfung auf Commit `1cc9024db2f7d209dc42439563639d967a410160`.

## Zusätzliche Bereinigung im Release-PR

Nach Abtrennung des Release-Branches wurden drei veraltete Regressionen gefunden und auf den tatsächlichen Build-27-Vertrag migriert:

- `tests/voice-diagnostics.test.mjs`
- `tests/live-build-recovery.test.mjs`
- `tests/voice-layout-v26.test.mjs`

Diese Änderungen entfernen ausschließlich harte Build-26-/TTS-v16-Erwartungen. Fachliche Router-, Sicherheits- und Klickwegprüfungen bleiben vollständig bestehen.

Zusätzlich wurden für beide internen Audio-Tabellen explizite Deny-All-RLS-Policies für `anon` und `authenticated` ergänzt. Der Supabase-Sicherheitsberater meldet danach keine Lints.

## Korrigierte iPhone-Renderprüfung

Die Renderprüfung wartete nach dem Wechsel in den Sprachmodus noch auf den absichtlich ausgeblendeten alten `#workspace`. Der Test wartet nun auf die sichtbare Vollbild-Sprachansicht `.voice-focus-stage` und prüft gleichzeitig, dass `#workspace` im Sprachfokus verborgen bleibt. Die fachlichen und visuellen Anforderungen wurden nicht abgeschwächt.

## Merge-Grenze

Der finale Validierungs-PR bleibt ungemergt, bis `Deploy DokoHilf` auf dem exakten Release-Head vollständig grün ist. Dieser eine Workflow enthält bereits:

- Syntax- und Quellverträge
- Fach- und Routingregressionen
- Datenschutz- und Sicherheitsprüfungen
- Playwright-iPhone-Render auf 393 × 852
- Live-Router
- Live-TTS v20
- privaten Guide-Audiobestand
- exakten Pages-Build

Der neue Pull Request wird bewusst als eigenständiger `opened`-Trigger angelegt, damit GitHub Actions den vollständigen exakten Head prüft.

Erst danach darf der exakte Head manuell gemergt und über den festen Hauptlink verifiziert werden.
