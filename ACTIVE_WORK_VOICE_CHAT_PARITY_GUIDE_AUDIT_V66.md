# DokoHilf – Sprach-/Schreibparität und Guide-Audit v66

**Stand:** 3. September 2026  
**Status:** PR-Vorbereitung

## Ziel

Sprachmodus und Schreibmodus sollen für denselben erkannten Inhalt dieselbe bestätigte fachliche Logik verwenden. Die hörbare Ausgabe bleibt ausschließlich vorab erzeugtes Supertonic-3 / F1. Bestätigte Antworten sollen nach Möglichkeit als passender statischer F1-Satz gesprochen werden, statt unnötig auf den neutralen Audiosatz „Ich habe die Antwort im Chat angezeigt.“ zurückzufallen.

## Festgestellte Ursachen und Korrekturen

1. Die Web-Spracherkennung hatte bisher nur die erste Transkriptvariante praktisch für die fachliche Zielauswahl genutzt. v66 lässt bis zu fünf Erkennungsvarianten liefern, begrenzt die weiterverarbeiteten Alternativen auf vier und filtert sie client- und serverseitig nach denselben Datenschutzgrenzen wie die primäre Eingabe.
2. Die sicheren Alternativen wurden zunächst nur an den Server mitgesendet, aber nicht für die bestätigte deterministische Guide-Auswahl genutzt. v66 verwendet sie jetzt ausschließlich als Fallback: Die primäre Erkennung gewinnt immer, wenn sie selbst einen bestätigten oder fachlich zu schützenden Wunsch enthält.
3. Klare Primärabsichten werden nicht durch eine Alternative umgedeutet. Insbesondere bleibt `Medikamente abhaken` von `Medikamente abzeichnen` getrennt. Ebenso dürfen `Berichtssuche`, `Easy-Plan` und `Aufgaben · Aktuelles` nicht über eine alternative Erkennung in einen ähnlichen bestätigten Guide rutschen.
4. Unvollständige allgemeine Eingaben wie „Ich möchte bitte …“ erhalten dieselbe konkrete Rückfrage in Chat und Sprache, statt nur den neutralen Audio-Fallback auszugeben.
5. Mehrere historische statische Sprachkataloge waren nicht vollständig mit dem aktuellen bestätigten Guide-Bestand synchron. Bereinigt wurden unter anderem alte Aussagen, nach denen `Berichte` ein Hauptbereich der grünen Leiste sei, die falsche Schaltflächenbezeichnung `Alles ausklappen`, eine inzwischen entfernte allgemeine DNF-Folgeauswahl sowie veraltete Berichtstexte.
6. Der Basiskatalog ist auf 41 freigegebene Guides / 133 eindeutige freigegebene Schritttexte synchronisiert. Der Supertonic-Build blockiert bekannte veraltete Klickweg-Fragmente künftig ausdrücklich.
7. Im produktiven An-/Abwesenheitsguide stehen noch konkrete Status-Beispiele, die in der aktuellen verbindlichen Fachquelle nicht ausreichend bestätigt sind. Die v66-Migration ersetzt nur diesen einen Schritt durch `Wähle den passenden Status aus.`. Der Dry-Run wurde ausschließlich gegen `efifbuqctylsujiauabg` in `BEGIN … ROLLBACK` erfolgreich geprüft; eine Kontrollabfrage danach bestätigte den unveränderten Produktivstand.

## Fachliche Grenzen

- `Bericht` ist **kein** Hauptbereich der grünen Hauptleiste. Bestätigt ist `Doku` in der grünen Hauptleiste und `Bericht` im weißen Funktionsband direkt darunter.
- Für Vitalwerte und An-/Abwesenheiten bleiben beide bestätigten Zugänge erhalten: über `Doku-Erweitert` und über `Doku`.
- Allgemeines Abzeichnen endet ohne erfundenen Folgeschritt beim geöffneten Durchführungsnachweis. Nur ausdrücklich bestätigte Detailabläufe werden weitergeführt.
- `Medikamente abhaken` wird nicht automatisch als Abzeichnen interpretiert.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.
- Keine neuen Vivendi-Felder, Statusnamen, Menüpunkte oder Klickwege werden ergänzt.

## Sprache

- ausschließlich statische Supertonic-3-WAVs mit Stimme F1
- keine Browser-/Systemstimme, keine Cloud-TTS, kein kostenpflichtiger Dienst
- keine dynamische Sprachgenerierung aus Nutzer- oder Falldaten
- freie, nicht vorab katalogisierte Antworttexte behalten den neutralen statischen F1-Fallback gemäß `STATIC_VOICE_POLICY.md`

## Datenschutz

- keine realen Personen-, Bewohner-, Mitarbeiter-, Fall- oder Gesundheitsdaten
- Spracherkennungsalternativen werden nur für dieselbe laufende Anfrage verarbeitet
- Alternativen werden vor der Weitergabe begrenzt und auf dieselben Datenschutzgrenzen wie die primäre Eingabe geprüft
- keine Screenshots oder Originalunterlagen werden in GitHub oder Supabase übernommen

## Freigabe

PR erst nach vollständigem Diff-Abgleich gegen den live verifizierten v65-Stand `d8a9078b39041bce12c8e07129327dff50c72fd7`. Merge nur bei vollständig grünen Prüfungen am exakten PR-Head. Danach produktive v66-Inhaltsmigration, Deployment des exakt gemergten `dokohilf-conversation-router`, Pages-Publish und tatsächliche Live-Prüfung.