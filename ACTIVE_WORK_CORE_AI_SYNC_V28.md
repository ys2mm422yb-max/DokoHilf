# DokoHilf – Core-AI GitHub/Supabase-Angleichung v28

**Stand:** 8. August 2026  
**Status:** in Arbeit  
**Branch:** `agent/sync-core-ai-v28`

## Gefundener Drift

Beim Live-Abgleich nach PR #88 wurde festgestellt, dass `supabase/functions/dokohilf-ai/index.ts` auf `main` nicht mehr dem produktiv laufenden Supabase-Core entsprach. Die Repository-Datei enthielt noch eine alte hart codierte Klickweg-Wissensbasis. Die Live-Funktion arbeitete bereits mit den freigegebenen Guide-/Topic-Tabellen und blockierte mögliche Echtdaten vor Gemini.

Ein blindes Deployment der alten Repository-Datei hätte deshalb die Live-Funktion fachlich und sicherheitstechnisch zurückgestuft.

Zusätzlich enthielt die Live-Core-Logik noch einen veralteten Hilfetext, der bei Audio-Problemen von einer Gerätestimme sprach. Das widerspricht der veröffentlichten v28-Architektur, in der System-/Gerätestimmen blockiert sind und die reguläre Stimme Supertonic F1 ist.

## Zielzustand

- `dokohilf-ai` enthält keine eigene hart codierte Klickweg-Wissensbasis mehr.
- Bestätigte Guides und Themen werden ausschließlich aus den freigegebenen Supabase-Tabellen geladen.
- mögliche Echtdaten werden vor jedem Gemini-Aufruf abgefangen.
- Gemini darf nur zwischen freigegebenen Guides/Themen routen oder eine kurze Klärungsantwort liefern; es darf keine Klickwege erfinden.
- Audio-Hilfe nennt ausschließlich die kostenlose DokoHilf-Stimme Supertonic F1 und nie eine System-/Gerätestimme als Fallback.
- ein eigener GitHub-Workflow führt Deno-Typecheck und Source-Verträge für den Core aus, damit veraltete Core-Logik nicht mehr unbemerkt in GitHub zurückkehren kann.

## Betroffene Dateien

- `supabase/functions/dokohilf-ai/index.ts`
- `tests/core-ai-sync-v28.test.mjs`
- `.github/workflows/core-ai-sync-v28.yml`
- diese Statusdatei

## Freigabeweg

1. Branch und Pull Request vom aktuellen `main`.
2. Exakten PR-Head vollständig prüfen.
3. Erst nach grünen Prüfungen den exakt geprüften Core in das ausschließlich freigegebene Supabase-Projekt `efifbuqctylsujiauabg` deployen.
4. Live-Core anschließend erneut lesen und Smoke-Tests ausführen.
5. Nur bei erfolgreicher Live-Verifikation manuell mergen.
6. `main`, Supabase und den veröffentlichten App-Stand danach erneut prüfen.

Kein Auto-Merge und keine automatische Branch-Löschung. Keine Echtdaten in Tests oder Logs.
