# DokoHilf – Active Work: natürliche Guide-Abschlüsse v40

**Branch:** `feat/natural-guide-completions-v40-20260810`  
**Basis:** `main` nach PR #131  
**Scope:** ausschließlich DokoHilf

## Ziel

Nach dem letzten bestätigten Schritt eines freigegebenen Guides darf der Chat nicht mehr mit dem generischen technischen Satz „Der Ablauf ist erledigt … vorgesehene Übersicht“ enden. Stattdessen erhält jeder aktuell freigegebene Guide einen expliziten, natürlichen Abschluss. Wo ein bestätigter Anschluss fachlich sinnvoll und vollständig bekannt ist, kann DokoHilf direkt kontextgerecht weiterführen, ohne bereits erledigte Navigation zu wiederholen.

## Verbindliche Grenzen

- Alle 40 aktuell produktiv `approved` Guides haben einen expliziten Completion-Contract.
- Bestehende Guide-Schritte in Supabase werden in diesem Arbeitsblock nicht verändert.
- Anschlussziele dürfen ausschließlich bereits freigegebene Guides sein.
- `berichtssuche`, `easyplan` und `aufgaben-aktuelles` bleiben als Anschlussziele ausdrücklich gesperrt.
- Medikation bleibt strikt read-only.
- Visitenstatus bleibt ausschließlich `durchgeführt`.
- Keine realen Personen, Fälle, Bewohner-, Gesundheits- oder Zugangsdaten in Code, Tests oder Supabase.
- Sprachchat bleibt vollständig statisch: alle hörbaren neuen Abschluss- und Anschlussformulierungen stammen aus dem Supertonic-F1-Releasekatalog.

## Technische Umsetzung

- Neuer Wrapper `dokohilf-conversation-router` fängt nur natürliche Guide-Abschlüsse und bestätigte Anschlussdialoge ab.
- Alle anderen Nachrichten werden unverändert an den bestehenden `dokohilf-chat-router` weitergereicht.
- Der bestehende Echtdaten-Schutzpfad wird nicht umgangen; verdächtige Eingaben werden an die bestehende Schutzkette weitergereicht.
- `assets/routing-fix.js` routet die bisherigen AI-Endpunkte nach Veröffentlichung auf den Wrapper.
- `assets/voice-completion-catalog-v40.json` katalogisiert alle neuen hörbaren Sätze.
- Der bestehende Supertonic-Builder nimmt diesen Katalog in den statischen Releasebestand auf.
- `tests/guide-completion-v40.test.mjs` deckt alle 40 freigegebenen Slugs, natürliche Folgefragen, gesperrte Ziele und statische Sprache ab. Die etablierte Exact-Head-Suite führt `tests/*.test.mjs` direkt aus; der Completion-Test wird deshalb genau einmal als eigener Test geladen.

## Freigabe

Produktänderung: vor Merge müssen alle acht etablierten Pflichtworkflows auf dem exakten finalen PR-Head grün sein. Erst danach manueller Merge. Der neue Supabase Edge Function wird erst nach erfolgreichem Merge produktiv deployed; anschließend werden Router, `main`, `gh-pages`, öffentlicher Link und Security Advisor geprüft.
