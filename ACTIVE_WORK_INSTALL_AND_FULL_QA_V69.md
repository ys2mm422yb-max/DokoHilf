# Aktiver Arbeitsstand – Installation und vollständige QA v69

**Stand:** 4. September 2026
**Status:** Umsetzung und Freigabe über separaten Pull Request
**Fachliche Basis:** live verifizierter Stand nach PR #187 / `4aee543e8dabfcb4622789f651b71c34f111fd04`
**Ziel:** App-Version `v35`, Build `20260904-43`, Release `pwa-install-and-full-qa-v69`

## Anlass

Die bisherige PWA besitzt Manifest, Icons und Service Worker, aber keinen sichtbaren Installationsweg in DokoHilf. Zusätzlich wurde der komplette veröffentlichte Stand erneut gegen Oberfläche, Bibliothek, Chat, Sprache, statische Audios und die verbindlichen Fachquellen geprüft.

## Technisch belegte Befunde

- Auf der Startseite fehlt ein sichtbarer Installationsbutton.
- Android kann den Browser-Installationsdialog über `beforeinstallprompt` anbieten. iOS stellt diesen programmatischen Dialog nicht bereit; dort sind die Safari-Schritte **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen** erforderlich.
- Die Eingabe **„Ich möchte mehrere Vitalwerte gleichzeitig eingeben“** wurde durch die späte Client-Regel fälschlich als reine Vitalwerte-Suche behandelt. Die bereits bestätigte Trennung bleibt: klare Mehrfachabsicht → Sammelerfassung, klar benannter Einzelwert → Einzelwert, allgemeine Erfassungsabsicht → Rückfrage.
- Beide aktiven Sprachrouter kürzten bestätigte Schritte nach 260 Zeichen und konnten dadurch einen Satz mitten im Wort beenden. Der vollständige bestätigte Text ist bereits im statischen Supertonic-Katalog vorhanden.
- Der Direktguide **Durchführungsnachweis öffnen** enthielt lokal einen dritten allgemeinen Folgeschritt, obwohl der freigegebene Datenbankstand und v65 ausdrücklich nach dem Öffnen enden.
- Mehrere sichtbare Texte verwendeten interne Freigabesprache. Sie werden verständlich formuliert, ohne Klickweg oder fachliche Aussage zu erweitern.

## Umsetzung

- Sichtbarer, startseitiger Button **DokoHilf installieren**.
- Android: direkter Browserprompt, sobald der Browser ihn bereitstellt; andernfalls klare Chrome-Menüschritte.
- iPhone/iPad: klare Safari-Anleitung; im bereits installierten Stand wird der Button ausgeblendet.
- Neue Installationsoberfläche bleibt im Chat, Sprachmodus und in Direktguides verborgen.
- Vitalwerte-Routing wird ausschließlich für die bereits bestätigte Einzel-/Sammeltrennung korrigiert.
- Sprachrouter geben bestätigte Schritte vollständig aus; kein Browser-, System-, Cloud- oder Bezahl-TTS wird ergänzt.
- Allgemeiner Durchführungsnachweis endet in Datenbank und Direktbibliothek identisch nach **Doku → Durchführungsnachweis**.
- Statische F1-Katalogtexte und die bestehende Dateiablage-Hilfe werden wortgleich synchronisiert.
- Mobile Renderprüfung deckt Installationskarte und beide Plattformpfade auf iOS 393×852 und Android 412×915 ab.

## Unveränderte Grenzen

- Keine neuen Vivendi-Menüpunkte, Felder, Statuswerte oder Klickwege.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.
- Medikation bleibt im normalen Medikationsbereich ausschließlich zum Ansehen.
- Dateiablage bleibt auf Finden und Öffnen bereits vorhandener Dokumente beschränkt.
- Keine Echtdaten, Konten, Profile oder dauerhafte Gesprächsspeicherung.
- Ausschließlich statische Supertonic-3/F1-Sprachausgabe.

## Freigabe

Branch → Pull Request → alle Pflichtprüfungen auf exakt demselben Head → manueller Merge mit erwartetem Head-SHA → Datenbankmigration und beide betroffenen Edge Functions erst nach Merge → Main-Deploy → `gh-pages` → echte iOS-/Android- und Desktop-Liveprüfung. Erst danach darf v35/v69 als live bezeichnet werden.
