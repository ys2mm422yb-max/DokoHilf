# Finaler Umfang Build 27

Dieser Branch enthält den zusammengeführten Zielumfang für DokoHilf Build `20260806-27`.

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

## Datenschutz

- zentraler Hinweis im Hauptmenü
- keine wiederholten Fantasiedaten-Hinweise in normalen Guide-Schritten
- technischer Eingabefilter bleibt aktiv
- keine Nutzerstimmen, Diktate, Gesprächsverläufe oder personenbezogenen Inhalte dauerhaft speichern

## Sprache

- bekannte freigegebene Guide-Anweisungen und Begrüßung als vorproduzierte Gacrux-WAV-Dateien
- 23 freigegebene Guides, 108 Schritte, 92 eindeutige Schritttexte plus Begrüßung
- statische Audiodatei wird vor Live-TTS verwendet
- Live-TTS nur für freie, nicht katalogisierte Antworten
- kurzer Zeitrahmen für Live-TTS, danach sofort lokale Sofortstimme
- statische allgemeine Guide-Audios dürfen offline im PWA-Cache liegen

## Abschlussbedingungen

- 93 gültige WAV-Dateien mit Manifest, Größe und SHA-256
- vollständige Routing-, Fach-, Datenschutz-, UI-, Mobile- und Audio-Tests
- echter mobiler Rendernachweis mit künstlicher App-Oberfläche
- exakter grüner PR-Head
- manueller Merge ohne Auto-Merge und ohne Branch-Löschung
- Prüfung von main, gh-pages, Supabase und festem Hauptlink nach Veröffentlichung
