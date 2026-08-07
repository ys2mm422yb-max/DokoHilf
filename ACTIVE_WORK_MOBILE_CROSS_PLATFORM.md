# Dauerhafte Mobile-Regel – iOS und Android gleichberechtigt

**Stand:** 7. August 2026  
**Status:** Verbindliche dauerhafte Produktanforderung  
**Gilt für:** gesamte DokoHilf-Webapp/PWA, nicht nur das App-Icon

## Nutzerentscheidung

Der Nutzer hat ausdrücklich festgelegt: **DokoHilf muss mobil immer auf iOS und Android passen.** Diese Anforderung betrifft jede mobile Änderung und darf nicht auf iPhone/iOS beschränkt interpretiert werden.

## Verbindliche Regel

Bei jeder mobilen Produktänderung müssen iOS **und** Android berücksichtigt, umgesetzt und vor Merge geprüft werden. Dazu gehören insbesondere:

- Startseite und Hauptmenü
- Chat-/Schreibmodus
- Sprachmodus inklusive Schrittkarte, Mikrofon, Status und Aktionen
- `Ich brauche Hilfe / Ich finde das nicht`
- direkte Schritt-für-Schritt-Anleitungen
- Header, Safe Areas, Footer und Tastaturverhalten
- Scrollen, Überlauf, Touch-Ziele und Textumbruch
- PWA-Installation, Service Worker und Updateverhalten
- Homescreen-/Launcher-Icons, Theme-/Background-Colors und Manifest
- Spracherkennung, Audioausgabe und Fallbackverhalten soweit browser-/plattformabhängig

Eine Prüfung ausschließlich auf einem iPhone-Viewport reicht künftig **nicht** als mobile Freigabe.

## Mindest-QA für mobile UI-Änderungen

Vor Merge eines mobilen UI-/PWA-PRs mindestens:

1. iOS-orientierter mobiler Render, aktuell 393 × 852.
2. Android-orientierter mobiler Render, typischer Pixel-/Chrome-Viewport (mindestens etwa 412 × 915 oder gleichwertig).
3. Kein horizontaler Overflow auf beiden.
4. Keine Überlagerungen/Clipping auf beiden.
5. Primäre Touch-Aktionen auf beiden vollständig erreichbar.
6. Sprach- und Chatoberflächen auf beiden lesbar und bedienbar.
7. PWA-Metadaten/Icons plattformgerecht: iOS Touch-Icon sowie Android `192×192`/`512×512` und `maskable`.

Wenn eine Änderung plattformspezifisch ist, muss die andere Plattform ausdrücklich als Regressionstest mitlaufen.

## Aktueller Icon-Block

Die laufende Korrektur des App-Symbols wird deshalb nicht mehr als reine iPhone-Korrektur behandelt:

- iOS: eigenes versioniertes PNG-Touch-Icon (180 × 180)
- Android/PWA: versionierte PNG-Icons 192 × 192 und 512 × 512
- Android `maskable` mit ausreichender Safe-Zone
- SVG darf zusätzlich als Browser-Favicon bestehen bleiben, aber nicht mehr die einzige Installationsquelle sein
- neue Dateinamen/Revisionen müssen alte Homescreen-/Launcher-Cachepfade vermeiden

## Dokumentationsregel

Jeder neue Chat muss diese Datei zusammen mit den übrigen `ACTIVE_WORK_*.md` lesen. Aussagen wie „mobile geprüft“ bedeuten ab jetzt **iOS und Android geprüft**, sofern nicht ausdrücklich anders dokumentiert.

## Datenschutz

Automatisierte iOS-/Android-Renderprüfungen verwenden ausschließlich selbst erzeugte, synthetische Oberflächen und Fantasiedaten. Reale Personen-, Gesundheits-, Mitarbeiter- oder Falldaten sind dauerhaft ausgeschlossen.
