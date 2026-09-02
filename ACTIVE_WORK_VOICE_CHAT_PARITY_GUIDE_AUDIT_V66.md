# DokoHilf – Sprach-/Schreibparität und Guide-Audit v66

**Stand:** 2. September 2026  
**Status:** in Arbeit

## Ziel

Sprachmodus und Schreibmodus sollen für denselben erkannten Inhalt dieselbe bestätigte fachliche Logik verwenden. Die hörbare Ausgabe bleibt ausschließlich vorab erzeugtes Supertonic-3 / F1 und soll bei bestätigten Schrittantworten möglichst den vollständigen sichtbaren Chattext wiedergeben statt unnötig auf den neutralen Audiosatz zurückzufallen.

## Festgestellte Ursachen

1. Die Web-Spracherkennung verwertet bisher nur eine einzige Transkriptvariante (`maxAlternatives = 1`). Dadurch gehen brauchbare alternative Erkennungen verloren, obwohl die Serverlogik alternative Transkripte grundsätzlich auswerten kann.
2. `local-voice-gate-v28.js` bevorzugt bisher den verkürzten `spokenText`. Bei nicht vollständig katalogisierten Antworten kann deshalb der neutrale Satz „Ich habe die Antwort im Chat angezeigt.“ hörbar werden, obwohl im Chat eine bessere bestätigte Antwort sichtbar ist.
3. Mehrere historische statische Sprachkataloge sind nicht vollständig mit dem aktuellen bestätigten Guide-Bestand synchron. Gefunden wurden unter anderem alte Aussagen, nach denen „Berichte“ ein Hauptbereich der grünen Leiste sei, die falsche Schaltflächenbezeichnung „Alles ausklappen“ sowie eine inzwischen entfernte allgemeine Folgeauswahl nach dem geöffneten Durchführungsnachweis.
4. Der Basiskatalog und der Stuck-Hilfekatalog sind ältere Snapshots und werden auf den aktuellen freigegebenen Supabase-Bestand synchronisiert.

## Fachliche Grenzen

- Bericht ist **kein** Hauptbereich der grünen Hauptleiste. Bestätigt ist `Doku` in der grünen Hauptleiste und `Bericht` im weißen Funktionsband direkt darunter.
- Für Vitalwerte und An-/Abwesenheiten bleiben beide bestätigten Zugänge erhalten: über `Doku-Erweitert` und über `Doku`.
- Allgemeines Abzeichnen endet ohne erfundenen Folgeschritt beim geöffneten Durchführungsnachweis. Nur ausdrücklich bestätigte Detailabläufe werden weitergeführt.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.
- Keine neuen Vivendi-Felder, Menüpunkte oder Klickwege werden ergänzt.

## Sprache

- ausschließlich statische Supertonic-3-WAVs mit Stimme F1
- keine Browser-/Systemstimme, keine Cloud-TTS, kein kostenpflichtiger Dienst
- keine dynamische Sprachgenerierung aus Nutzer- oder Falldaten
- freie, nicht vorab katalogisierte Antworttexte behalten den neutralen statischen Fallback gemäß `STATIC_VOICE_POLICY.md`

## Datenschutz

- keine realen Personen-, Bewohner-, Mitarbeiter-, Fall- oder Gesundheitsdaten
- Spracherkennungsalternativen werden nur für dieselbe laufende Anfrage verarbeitet und vor Weitergabe auf dieselben Datenschutzgrenzen wie die primäre Eingabe begrenzt
