# ACTIVE WORK – Voice-Guide-Folgeaudio und Bericht-Sonderfall v28

**Stand:** 7. August 2026  
**Status:** Produktänderung gemergt und auf `gh-pages` veröffentlicht  
**Build:** `20260807-28` / sichtbare Version `v28`  
**PWA-Hotfixrevision:** `20260807-voice-guides-report-v28-3`

## Reproduzierte Produktprobleme

- Auf einem realen iPhone wurde im Voice-Guide der erste vorhandene natürliche Satz hörbar abgespielt; bei späteren Guide-Anweisungen konnte die Ausgabe stumm bleiben und die lokale Engine hängen.
- Die komplette Anleitung `Bericht anlegen` stellte die Protokollschritte 6–9 nicht deutlich genug als bedingten Sonderfall dar.
- Fachlich bestätigt ist die konkrete Zuordnung beim Bericht:
  - `Kontakt – alles außer Arzt` → `Fallgespräch`
  - `Sturzereignis` → `Sturzprotokoll`
  - bei allen anderen Berichtskategorien Schritte 6–9 überspringen und mit Schritt 10 fortfahren.

Öffentlich dokumentiert werden ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Produkt- und Fachergebnisse.

## Voice-Ursache und veröffentlichte Änderung

Der aktive Router liefert für Guide-Antworten neben dem sichtbaren `reply` einen eigenen kurzen `spokenText`. Der bisherige Frontendpfad übergab zur Audioausgabe den langen sichtbaren `reply`. Dadurch verfehlte der statische Audioabgleich bestätigte Guide-Sätze und fiel unnötig auf lokale Supertonic-Inferenz zurück.

`assets/local-voice-gate-v28.js` merkt sich jetzt bei Routerantworten die Zuordnung `reply → spokenText`. Bei der anschließenden Audioanfrage wird ausschließlich für die Sprachausgabe der zugehörige `spokenText` verwendet. Der sichtbare Text bleibt unverändert.

Zusätzlich darf ein bestätigter statischer Satz ab 16 normalisierten Zeichen als enthaltene eindeutige Teilanweisung getroffen werden. Freigegebenes statisches Gacrux-Audio wird weiterhin vor lokaler Inferenz geprüft. Die System-/Gerätestimme bleibt blockiert.

## Statischer Gacrux-Bestand und kostenlose Grenze

Zum Abschluss dieses Arbeitsblocks sind für Build `20260806-27` **9 von 93** Katalogeinträgen vorhanden: Indizes 0–7 und 33.

Der vorhandene serverseitige Builder wurde ausschließlich über seine bestehende kostenlose TTS-Konfiguration für den nächsten Eintrag angestoßen. Der Dienst antwortete mit HTTP 429 / aktuellem Kontingentlimit. Der Bestand blieb 9. Es wurde **keine kostenpflichtige Stufe aktiviert** und nach dem 429 kein weiterer Batch gestartet.

Der vorhandene Katalog enthält 93 freigegebene allgemeine Guide-Sätze. Er kann später in kleinen Paketen weitergebaut werden, sobald das kostenlose Kontingent wieder verfügbar ist.

Wichtig für den nächsten Praxistest: Der `spokenText`-Routingfehler ist behoben, aber nur vorhandene statische Einträge können bereits mit Gacrux abgespielt werden. Fehlt ein fertiges statisches Audio, bleibt derzeit die lokale Supertonic-Inferenz der freie Fallback; deren reale Zuverlässigkeit auf dem iPhone muss weiterhin praktisch geprüft werden.

## Bericht-Sonderfall

Die verbindliche Fachquelle und der aktive Supabase-Guide `bericht-neu` sind synchronisiert. `bericht-neu` steht auf **Version 7**.

In der vollständigen Direktanleitung werden Schritte 6–9 visuell als eigener Sonderblock markiert:

- `Kontakt – alles außer Arzt` → `Fallgespräch`
- `Sturzereignis` → `Sturzprotokoll`
- bei jeder anderen Berichtskategorie: Schritte 6–9 überspringen und direkt bei Schritt 10 mit Datum/Uhrzeit fortfahren.

Der Block wurde auf iOS 393×852 und Android 412×915 auf Inhalt, Markierung und horizontalen Overflow geprüft.

## Produkt-PR #82

Implementierungsbranch: `fix/voice-guides-report-conditions-v28-20260807` (bewusst nicht gelöscht)  
Finaler geprüfter Head: `13985b06a4906ec509d0268d9448459ee73837d1`  
Merge-Commit auf `main`: `3e37deea72984eef0ed75f02e6f1e4b9c9f39c0f`

Der exakte Produkt-Head war vor Merge in allen fünf relevanten Prüfungen grün:

- `Deploy DokoHilf` Run #360 – success
- `Validate dark iPhone UI v27` Run #101 – success
- `Validate local voice v28 iOS Android` Run #48 – success
- `Validate detailed help iOS Android` Run #71 – success
- `Validate report conditional iOS Android` Run #1 – success

## PWA-Refresh-PR #83

Damit installierte PWAs den neuen Voice-/Berichtscode sicher erkennen, wurde anschließend die PWA-Hotfixrevision auf `20260807-voice-guides-report-v28-3` erhöht.

Branch: `fix/pwa-refresh-voice-report-v28-3-20260807` (bewusst nicht gelöscht)  
Finaler geprüfter Head: `68dc5e30771a87ea38f3ffadbaea1c7693923b56`  
Merge-Commit auf `main`: `c8840ee2f24c531f2071cc96098bb00206c422c9`

Der exakte Refresh-Head war vor Merge in allen fünf Prüfungen grün:

- `Deploy DokoHilf` Run #367 – success
- `Validate dark iPhone UI v27` Run #108 – success
- `Validate local voice v28 iOS Android` Run #55 – success
- `Validate detailed help iOS Android` Run #78 – success
- `Validate report conditional iOS Android` Run #8 – success

## Live-Prüfung nach Merge

Verifiziert:

- `gh-pages/service-worker.js` liefert `HOTFIX_REVISION = '20260807-voice-guides-report-v28-3'`.
- `gh-pages/assets/local-voice-gate-v28.js` enthält den Router-`spokenText`-Abgleich.
- Derselbe ausgelieferte Gate enthält den sichtbaren Bericht-Sonderblock mit `Fallgespräch`, `Sturzprotokoll` und Sprung von 6–9 zu Schritt 10.
- Supabase `bericht-neu` steht auf Version 7.
- Der freigegebene statische Audio-Bestand liegt bei 9 Einträgen.

## Datenschutz- und Projektgrenzen

- dauerhaft keine Echtdaten
- vollständig synthetische Tests
- ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Projektinhalte
- keine Systemstimme als hörbarer v28-Fallback
- keine kostenpflichtige TTS-Stufe aktivieren
- keine unbestätigten Klickwege erfinden
- iOS und Android bleiben gleichberechtigte Pflicht-QA

## Nächster realer Praxistest

1. Installierte DokoHilf-PWA vollständig schließen und neu öffnen, damit v28-3 übernommen wird.
2. Voice-Guide `Visite` starten und den ersten natürlichen Satz hören.
3. Weitergehen beziehungsweise antworten und mindestens einen weiteren Guide-Schritt auf hörbare Ausgabe prüfen.
4. `Bericht anlegen` als vollständige Direktanleitung öffnen und kontrollieren, dass Schritte 6–9 klar als Sonderfall der beiden Kategorien abgesetzt sind.
5. Bei einer anderen Kategorie muss eindeutig erkennbar sein, dass direkt mit Schritt 10 fortgefahren wird.

Wenn ein nicht vorgebauter Guide-Satz auf dem realen iPhone weiterhin an Supertonic hängen bleibt, nicht erneut die Systemstimme aktivieren. Dann entweder den statischen Gacrux-Katalog nach Reset des kostenlosen Kontingents weiter ausbauen oder die lokale Freitext-Engine separat ersetzen.
