# DokoHilf – Core-AI GitHub/Supabase-Angleichung v28

**Stand:** 8. August 2026  
**Status:** technisch abgeschlossen, live verifiziert; PR #89 vor manuellem Merge  
**Branch:** `agent/sync-core-ai-v28`  
**Pull Request:** `#89`

## Gefundener Drift

Beim Live-Abgleich nach PR #88 wurde festgestellt, dass `supabase/functions/dokohilf-ai/index.ts` auf `main` nicht mehr dem produktiv laufenden Supabase-Core entsprach. Die Repository-Datei enthielt noch eine alte hart codierte Klickweg-Wissensbasis. Die Live-Funktion arbeitete bereits mit den freigegebenen Guide-/Topic-Tabellen und blockierte mögliche Echtdaten vor Gemini.

Ein blindes Deployment der alten Repository-Datei hätte deshalb die Live-Funktion fachlich und sicherheitstechnisch zurückgestuft.

Zusätzlich enthielt die Live-Core-Logik noch einen veralteten Hilfetext, der bei Audio-Problemen von einer Gerätestimme sprach. Das widerspricht der veröffentlichten v28-Architektur, in der System-/Gerätestimmen blockiert sind und die reguläre Stimme Supertonic F1 ist.

## Umgesetzter Zielzustand

- `dokohilf-ai` enthält keine eigene hart codierte Klickweg-Wissensbasis mehr.
- Bestätigte Guides und Themen werden ausschließlich aus den freigegebenen Supabase-Tabellen mit `status=approved` geladen.
- mögliche Echtdaten werden vor jedem Gemini-Aufruf abgefangen.
- Gemini darf nur zwischen freigegebenen Guides/Themen routen oder eine kurze Klärungsantwort liefern; es darf keine Klickwege erfinden.
- Audio-Hilfe nennt ausschließlich die kostenlose DokoHilf-Stimme Supertonic F1 und nie eine System-/Gerätestimme als Fallback.
- allgemeine Basisantworten wie Audiohilfe laufen nach der Echtdatenprüfung, aber ohne unnötige Abhängigkeit vom Guide-/Topic-Abruf.
- Guide-/Topic-Abrufe besitzen einen kurzen Zwei-Versuch-Retry mit Timeout.
- ein eigener GitHub-Workflow führt Deno-Typecheck und Source-Verträge für den Core aus, damit veraltete Core-Logik nicht mehr unbemerkt in GitHub zurückkehren kann.

## Betroffene Dateien

- `supabase/functions/dokohilf-ai/index.ts`
- `tests/core-ai-sync-v28.test.mjs`
- `tests/privacy-contract.test.mjs`
- `.github/workflows/core-ai-sync-v28.yml`
- diese Statusdatei

## Prüfverlauf

Der erste vollständig grüne Core-Head `a5ebd51b834ef4ca28b250647e3874db7be48814` bestand alle sechs Pflichtworkflows einschließlich:

- Deno/Core-Verträge
- vollständige deterministische Fach-, Privacy- und UI-Tests
- iOS- und Android-Render
- Router-Smokes
- exakt 111 statische Supertonic-F1-WAVs
- exakter releasable Site-Build

Beim ersten Supabase-Deployversuch wurde keine neue Version aktiviert, weil ein aus der alten Live-Version geerbter absoluter `deno.json`-Importpfad abgelehnt wurde. Der korrigierte Deploy mit relativem `deno.json`-Pfad aktivierte `dokohilf-ai` v14.

Ein erster parallel gestarteter Live-Smoke zeigte einmal HTTP 503 beim Wissensabruf. Dieser Fund wurde nicht ignoriert. Der Core wurde anschließend gehärtet: Basisantworten sind vom Wissensabruf entkoppelt, und echte Wissensabrufe besitzen wieder einen kurzen Retry.

Der gehärtete Code-Head `f1e34cefa27e16eca2297ded6173da82b144c905` bestand danach erneut alle sechs Pflichtworkflows vollständig grün, einschließlich 111/111 Supertonic-F1-Audios und releasable Site-Build.

## Live-Supabase

Ausschließlich im freigegebenen Projekt `efifbuqctylsujiauabg` wurde exakt der gehärtete Core aus `f1e34cef...` deployed.

Aktiv:

- Edge Function: `dokohilf-ai`
- Version: `15`
- Status: `ACTIVE`
- `verify_jwt = false` bleibt für den öffentlichen, origin-beschränkten Core unverändert
- Live-Code enthält `fetchKnowledgeJson`, Zwei-Versuch-Retry, Timeout und die Supertonic-F1-Basisantwort

## Synthetische Live-Smokes auf v15

Alle Tests verwenden ausschließlich erfundene technische Testtexte.

1. `Ich höre nichts` → HTTP 200; Antwort nennt korrekt die kostenlose DokoHilf-Stimme **Supertonic F1** und benötigt keinen Guide-/Topic-Abruf.
2. `Ich möchte einen Folgebericht erstellen` → HTTP 200; freigegebener Guide `bericht-folgebericht`, Quelle `approved-guide-core-match-v14`.
3. `Frau Beispiel hat einen Bericht` → HTTP 422; mögliche Echtdaten werden blockiert und ausdrücklich **nicht an Gemini übertragen**.

Damit ist der GitHub/Supabase-Drift technisch behoben und live verifiziert.

## Abschlussweg

Die nach diesem Nachweis ergänzte Dokumentation ändert den bereits live getesteten Core nicht. Der endgültige PR-Head wird nochmals durch die automatischen Pflichtprüfungen geschickt. Danach wird PR #89 manuell gemergt. Branch bleibt bestehen; kein Auto-Merge und keine automatische Branch-Löschung.

Nach Merge werden `main`, die Push-Workflows, `gh-pages` und Supabase v15 erneut geprüft.
