# DokoHilf – Abschluss: natürliche Guide-Abschlüsse v40

**Status:** abgeschlossen und veröffentlicht  
**Produkt-PR:** `#132`  
**Exakter freigegebener Produkt-Head:** `fcfd4fdd2fbaa26d16cf91d1b185b432320aa198`  
**Merge-Commit:** `7b9f79554d8215c2995fc05622d0cb3bd0e290df`  
**Produkt-Arbeitsbranch:** keiner  
**Scope:** ausschließlich DokoHilf

## Ziel

Nach dem letzten bestätigten Schritt eines freigegebenen Guides darf der Chat nicht mehr mit dem generischen technischen Satz „Der Ablauf ist erledigt … vorgesehene Übersicht“ enden. Stattdessen erhält jeder aktuell freigegebene Guide einen expliziten, natürlichen Abschluss. Wo ein bestätigter Anschluss fachlich sinnvoll und vollständig bekannt ist, kann DokoHilf direkt kontextgerecht weiterführen, ohne bereits erledigte Navigation zu wiederholen.

## Verbindliche Grenzen

- Alle 40 aktuell produktiv `approved` Guides haben einen expliziten Completion-Contract.
- Bestehende Guide-Schritte in Supabase wurden in diesem Arbeitsblock nicht verändert.
- Anschlussziele dürfen ausschließlich bereits freigegebene Guides sein.
- `berichtssuche`, `easyplan` und `aufgaben-aktuelles` bleiben als Anschlussziele ausdrücklich gesperrt.
- Medikation bleibt strikt read-only.
- Visitenstatus bleibt ausschließlich `durchgeführt`.
- Keine realen Personen, Fälle, Bewohner-, Gesundheits- oder Zugangsdaten in Code, Tests oder Supabase.
- Sprachchat bleibt vollständig statisch: alle hörbaren neuen Abschluss- und Anschlussformulierungen stammen aus dem Supertonic-F1-Releasekatalog.

## Technische Umsetzung

- Der Wrapper `dokohilf-conversation-router` fängt nur natürliche Guide-Abschlüsse und bestätigte Anschlussdialoge ab.
- Alle anderen Nachrichten werden unverändert an den bestehenden `dokohilf-chat-router` weitergereicht.
- Der bestehende Echtdaten-Schutzpfad wird nicht umgangen; verdächtige Eingaben werden an die bestehende Schutzkette weitergereicht.
- `assets/routing-fix.js` routet die bisherigen AI-Endpunkte auf den Wrapper.
- `assets/voice-completion-catalog-v40.json` katalogisiert 44 neue hörbare Abschluss-/Anschlussformulierungen.
- Der bestehende Supertonic-Builder nimmt diesen Katalog in den statischen Releasebestand auf.
- `tests/guide-completion-v40.test.mjs` deckt alle 40 freigegebenen Slugs, natürliche Folgefragen, gesperrte Ziele und statische Sprache ab und läuft als eigene `tests/*.test.mjs`-Datei in allen etablierten Test-Suites mit vollständigem Test-Glob.

## Freigabe und Live-Stand

- Alle acht etablierten Pflichtworkflows waren auf exakt `fcfd4fdd2fbaa26d16cf91d1b185b432320aa198` erfolgreich.
- Der kombinierte iPhone/iOS- und Android-Render war erfolgreich.
- PR #132 wurde erst danach manuell gemergt; Branch wurde nicht automatisch gelöscht.
- Supabase `dokohilf-conversation-router` ist im Projekt `efifbuqctylsujiauabg` als ACTIVE Version 2 mit dem gemergten v40-Code aktiv.
- Für v40 war keine Datenbankmigration nötig.
- Supabase Security Advisor hat keine offenen Lints.
- `gh-pages` routet auf den neuen Wrapper und enthält die v40-PWA-Revision.
- Der veröffentlichte statische Sprachbestand enthält `completionSourceCount = 44` und insgesamt `staticSpeechCount = 275` Supertonic-3/F1-WAV-Sätze.
- Issue #103 Berichtssuche bleibt bewusst offen; der genaue Easy-Plan-Ablauf bleibt ebenfalls fachlich offen.

Dieser Arbeitsblock ist abgeschlossen. Neue Änderungen an der Completion-Logik nur aufgrund eines reproduzierbaren Praxistests oder einer neu ausdrücklich bestätigten fachlichen Regel.
