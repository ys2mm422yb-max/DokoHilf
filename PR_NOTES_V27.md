# Pull-Request-Notizen Build 27

## Finaler Stand

- finaler Release-Branch: `release/build-27-final-validation`
- finaler Release-PR: **#53**
- vorheriger Release-PR: **#52**
- Zielbranch: `main`
- Ziel-Build: `20260806-27`
- kein Auto-Merge
- keine automatische Branch-Löschung

## Ersetzte Pull Requests

- PR #49 wurde durch spätere Build-27-Arbeit ersetzt und geschlossen; Branch nicht gelöscht
- PR #50 wurde durch PR #51 ersetzt und geschlossen; Branch nicht gelöscht
- PR #51 wurde durch PR #52 ersetzt und geschlossen; Branch nicht gelöscht
- PR #52 bleibt bis zum grünen Nachweis von PR #53 offen und wird anschließend als ersetzt geschlossen; Branch nicht löschen

PR #53 enthält den vollständigen Stand aus PR #52 einschließlich der korrigierten iPhone-Renderprüfung und der auf den finalen Release-PR ausgerichteten Übergabedokumentation.

## Zusätzliche Bereinigung im Release-PR

Drei veraltete Regressionen wurden auf den tatsächlichen Build-27-Vertrag migriert:

- `tests/voice-diagnostics.test.mjs`
- `tests/live-build-recovery.test.mjs`
- `tests/voice-layout-v26.test.mjs`

Diese Änderungen entfernen ausschließlich harte Build-26- und TTS-v16-Erwartungen. Fachliche Router-, Sicherheits- und Klickwegprüfungen bleiben vollständig bestehen.

Für beide internen Audio-Tabellen wurden explizite Deny-All-RLS-Policies für `anon` und `authenticated` ergänzt. Der Supabase-Sicherheitsberater meldet keine Lints.

## Korrigierte iPhone-Renderprüfung

Die Renderprüfung wartete nach dem Wechsel in den Sprachmodus noch auf den absichtlich ausgeblendeten alten `#workspace`. Der Test wartet nun auf die sichtbare Vollbild-Sprachansicht `.voice-focus-stage` und prüft gleichzeitig, dass `#workspace` im Sprachfokus verborgen bleibt. Die fachlichen und visuellen Anforderungen wurden nicht abgeschwächt.

## Manueller Lauf #229

Der erste manuell gestartete Lauf auf Head `369e7a127b78833927697f842fa54fc136d26436` erreichte die deterministischen Verträge und meldete exakt drei fehlgeschlagene Tests bei 114 von 117 bestandenen Tests.

Die drei Ursachen wurden auf dem Release-Branch behoben:

1. Der Mobile-Vertrag las Build-27-Mikrofonregeln aus `premium-ui-v27.css`, obwohl sie bewusst in der nachgelagerten Interaktionsschicht `ux-v27.css` liegen. Der Test prüft nun beide Ebenen korrekt.
2. Der Datenschutzvertrag erwartete eine veraltete SQL-Schreibweise. Er prüft nun die tatsächlich angewandte Migration mit `regexp_replace`, Regex-Nachkontrolle und Exception-Grenze, ohne den Datenschutz abzuschwächen.
3. Die statische Audio-Dokumentation enthielt die ausgeschlossenen Nutzerinhalte nur als Liste. Ein zusätzlicher eindeutiger Satz dokumentiert jetzt ausdrücklich, dass Nutzerstimmen, Diktate, freie Antworten und Gesprächsverläufe nicht dauerhaft gespeichert werden.

Der aktuelle exakte Head wird immer direkt in PR #53 geprüft. Diese Datei enthält bewusst keinen selbstreferenziellen aktuellen Head, weil jede Dokumentationskorrektur selbst einen neuen Commit erzeugt.

## Live-Audit

- Supabase-Projekt aktiv und gesund
- 23 freigegebene Guides mit 108 Schritten
- Router v11, TTS v20, Guide-Audio v1 und Builder v2 aktiv
- privater Audiobestand 1/93
- stündlicher Builder-Cron aktiv
- temporäre Diagnose-, Export-, Batch-, Store- und Snapshot-Endpunkte auf HTTP 410 neutralisiert
- Supabase-Sicherheitsberater ohne Lints

## Merge-Grenze

PR #53 bleibt ungemergt, bis `Deploy DokoHilf` auf dem exakten Release-Head vollständig grün ist. Dieser Workflow enthält:

- Syntax- und Quellverträge
- Fach- und Routingregressionen
- Datenschutz- und Sicherheitsprüfungen
- Playwright-iPhone-Render auf 393 × 852
- Live-Router
- Live-TTS v20
- privaten Guide-Audiobestand
- exakten Pages-Build

Durch die verbundene GitHub-App erzeugte Pushes und PR-Änderungen lösen keinen Workflow aus. Der Connector stellt keinen direkten Workflow-Dispatch bereit. Deshalb ist ein manueller Start über **Actions → Deploy DokoHilf → Run workflow** auf Branch `release/build-27-final-validation` erforderlich.

Erst nach vollständig grünem Lauf auf dem dann exakten Head darf manuell gemergt und über den festen Hauptlink veröffentlicht werden.
