# ACTIVE WORK – Voice-Guide-Folgeaudio und Bericht-Sonderfall v28

**Stand:** 7. August 2026  
**Status:** Umsetzung im PR; Merge erst nach vollständig grünem exakten Head  
**Branch:** `fix/voice-guides-report-conditions-v28-20260807`  
**Build:** `20260807-28` / sichtbare Version `v28`

## Reproduzierte Produktprobleme

- Auf einem realen iPhone wird im Voice-Guide der erste vorhandene natürliche Satz hörbar abgespielt; bei späteren Guide-Anweisungen kann die Ausgabe stumm bleiben und die lokale Engine hängen.
- Die komplette Anleitung `Bericht anlegen` stellte die Protokollschritte 6–9 nicht deutlich genug als bedingten Sonderfall dar.
- Fachlich bestätigt ist jetzt zusätzlich die konkrete Zuordnung beim Bericht:
  - `Kontakt – alles außer Arzt` → `Fallgespräch`
  - `Sturzereignis` → `Sturzprotokoll`
  - bei allen anderen Berichtskategorien Schritte 6–9 überspringen und mit Schritt 10 fortfahren.

Öffentlich dokumentiert werden ausschließlich selbst formulierte, anonymisierte und veröffentlichungsfähige Produkt- und Fachergebnisse.

## Voice-Ursache

Der aktive Router liefert für Guide-Antworten neben dem sichtbaren `reply` bereits einen eigenen kurzen `spokenText`. Das Frontend sprach bislang den langen sichtbaren `reply`. Dadurch verfehlte der statische Audioabgleich viele bestätigte Guide-Sätze und fiel unnötig auf lokale Supertonic-Inferenz zurück.

## Voice-Änderung

`assets/local-voice-gate-v28.js` merkt sich bei Routerantworten die Zuordnung `reply → spokenText`. Kommt danach die TTS-Anfrage des bestehenden Frontends, wird ausschließlich für die Audioausgabe der zugehörige `spokenText` verwendet. Der sichtbare Chattext bleibt unverändert.

Zusätzlich darf ein bestätigter statischer Satz ab 16 normalisierten Zeichen als enthaltene, eindeutig längere Teilanweisung getroffen werden. Statisches freigegebenes Audio wird weiterhin vor lokaler Inferenz geprüft. Die System-/Gerätestimme bleibt blockiert.

## Statischer Gacrux-Bestand

Zum Zeitpunkt dieser Umsetzung sind für Build `20260806-27` 9 von 93 Katalogeinträgen vorhanden: Indizes 0–7 und 33.

Der vorhandene serverseitige Builder wurde ausschließlich über seine bestehende kostenlose TTS-Konfiguration erneut für Index 8 angestoßen. Der Dienst antwortete mit HTTP 429 / aktuellem Kontingentlimit; der Bestand blieb 9. Es wurde keine kostenpflichtige Stufe aktiviert und nach dem 429 kein weiterer Batch gestartet.

Der vorhandene Katalog enthält 93 freigegebene allgemeine Guide-Sätze. Er kann später in kleinen Paketen weitergebaut werden, sobald das kostenlose Kontingent wieder verfügbar ist.

## Bericht-Sonderfall

Die verbindliche Fachquelle und der aktive Supabase-Guide `bericht-neu` wurden synchronisiert. `bericht-neu` steht jetzt auf Version 7.

In der vollständigen Direktanleitung werden Schritte 6–9 visuell als Sonderblock markiert. Der Block nennt beide konkreten Zuordnungen und weist ausdrücklich darauf hin, bei jeder anderen Kategorie direkt mit Schritt 10 fortzufahren.

## Datenschutz- und Projektgrenzen

- dauerhaft keine Echtdaten
- vollständig synthetische Tests
- keine externen Ausgangsmaterialien in Repository oder App
- keine Systemstimme als hörbarer v28-Fallback
- keine kostenpflichtige TTS-Stufe aktivieren
- keine unbestätigten Klickwege erfinden
- iOS und Android bleiben gleichberechtigte Pflicht-QA

## Pflicht-QA vor Merge

Mindestens:

- bestehende v28-Voice-Verträge grün
- neuer Vertrag `voice-spoken-report-conditional-v28.test.mjs` grün
- iOS 393×852 und Android 412×915 ohne Overflow/Überlagerung
- Detailhilfe-QA grün
- kompletter Deploy-/Release-Nachweis grün
- exakter PR-Head geprüft und nur manuell gemergt

Nach Merge `main` und `gh-pages` live prüfen. Danach real auf dem iPhone testen: Visite starten, ersten Satz hören, bestätigen/weitergehen und mindestens einen weiteren Guide-Schritt auf hörbare Ausgabe prüfen.
