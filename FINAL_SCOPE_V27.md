# Finaler Umfang Build 27

Dieser Release-Branch enthält den zusammengeführten Zielumfang für DokoHilf Build `20260806-27`.

**Finaler Branch:** `release/build-27-final-validation`  
**Finaler Pull Request:** `#53`  
**Ersetzter Release-PR:** `#52`

## Oberfläche

- vollständiges dunkles Premium-Design für Hauptmenü, Chat und Sprachmodus
- flache, kompakte Kopfzeile
- zwei klare Hauptwege: Sprechen und Schreiben
- häufige bestätigte Abläufe im Hauptmenü
- schmale Fortschrittsanzeige mit Drei-Punkte-Menü
- pro Guide-Schritt nur Weiter und Ich brauche Hilfe als sichtbare Hauptaktionen
- technische Bedienkommandos erscheinen nicht als normale Chatnachrichten
- große Mikrofonfläche nur in aktivem Sprachzustand
- verdichtete Darstellung auf kleinen und niedrigen iPhones
- korrigierte Playwright-Prüfung der sichtbaren Vollbild-Sprachansicht auf 393 × 852

## Datenschutz

- einmalige Datenschutzbestätigung beim ersten Start
- zentraler Hinweis im Hauptmenü
- keine wiederholten Fantasiedaten-Hinweise in normalen Guide-Schritten
- technischer Eingabefilter bleibt aktiv
- keine Nutzerstimmen, Diktate, Gesprächsverläufe oder personenbezogenen Inhalte dauerhaft speichern
- ausschließlich allgemeine freigegebene Guide-Audios dürfen im privaten Bucket und im PWA-Cache liegen

## Sprache

- TTS v20 mit Gacrux und Roh-REST-Parser `raw-steps-content-v1`
- bekannte freigegebene Guide-Anweisungen und Begrüßung werden kontrolliert als Gacrux-WAV-Dateien aufgebaut
- 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- vorhandene statische Audiodatei wird vor Live-TTS verwendet
- fehlende statische Einträge nutzen TTS v20
- nach rund 1,9 Sekunden startet die lokale Sofortstimme
- statische allgemeine Guide-Audios dürfen offline im PWA-Cache liegen
- keine WAV-Binärdateien im öffentlichen GitHub- oder Pages-Build

## Abschlussbedingungen Build 27

- mindestens ein vollständig geprüftes privates Gacrux-Audio mit Manifest, Größe, SHA-256 und gültigem RIFF/WAVE-Inhalt
- vollständige Routing-, Fach-, Datenschutz-, Sicherheits-, UI-, Mobile- und Audio-Tests
- echter mobiler Rendernachweis auf 393 × 852
- Live-Router und Live-TTS-v20-Nachweis
- identischer Pages- und `gh-pages`-Build
- vollständig grüner exakter PR-#53-Head
- manueller Merge ohne Auto-Merge und ohne Branch-Löschung
- PR #52 anschließend als ersetzt schließen, ohne seinen Branch zu löschen
- Prüfung von `main`, `gh-pages`, Supabase und festem Hauptlink nach Veröffentlichung

Der erforderliche Workflow `Deploy DokoHilf` muss einmal manuell über die GitHub-Oberfläche auf `release/build-27-final-validation` gestartet werden. Durch die verbundene GitHub-App ausgelöste Änderungen erzeugen keinen Actions-Lauf, und der Connector stellt keinen Workflow-Dispatch bereit. Ohne vollständig grünen exakten Head darf nicht gemergt werden.

## Separater Audioabschluss

Die vollständige Bibliothek ist ein eigener Ausbauzustand und kein Blocker für die funktionsfähige Build-27-Oberfläche.

Der Audioausbau ist abgeschlossen, wenn:

- Manifest `complete: true` meldet
- exakt 93 eindeutige Gacrux-Einträge vorhanden sind
- Größe und SHA-256 jedes Eintrags vorhanden sind
- repräsentative WAV-Abrufe gültig sind
- der Builder deaktiviert und der Cronjob entfernt ist
- die strenge Prüfung erfolgreich ist:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```
