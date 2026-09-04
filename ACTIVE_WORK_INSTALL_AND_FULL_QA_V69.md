# Aktiver Arbeitsstand – Installation und vollständige QA v69

**Stand:** 4. September 2026
**Status:** abgeschlossen, gemergt und veröffentlicht
**Fachliche Basis vor Umsetzung:** PR #187 / `4aee543e8dabfcb4622789f651b71c34f111fd04`
**Freigegebener Produktstand:** App-Version `v35`, Build `20260904-43`, Release `pwa-install-and-full-qa-v69`
**Produkt-PR:** #188
**PR-Head:** `c6d54cc45698be4877d0d8b23dc5b7eac3012f7c`
**Merge-Commit auf `main`:** `b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6`
**Veröffentlichter `gh-pages`-Commit:** `98bb5f8f92b7b6c661c152a839ad7a9eff95cd4e`

## Anlass

Die vorherige PWA besaß Manifest, Icons und Service Worker, aber keinen sichtbaren Installationsweg in DokoHilf. Zusätzlich wurde der veröffentlichte Stand erneut gegen Oberfläche, Bibliothek, Chat, Sprache, statische Audios und die verbindlichen Fachquellen geprüft.

## Vor der Umsetzung belegte Befunde

- Auf der Startseite fehlte ein sichtbarer Installationsbutton.
- Android kann den Browser-Installationsdialog über `beforeinstallprompt` anbieten. iOS stellt diesen programmatischen Dialog nicht bereit; dort sind die Safari-Schritte **Teilen → Zum Home-Bildschirm → Als Web-App öffnen → Hinzufügen** erforderlich.
- Die Eingabe **„Ich möchte mehrere Vitalwerte gleichzeitig eingeben“** wurde durch eine späte Client-Regel fälschlich als reine Vitalwerte-Suche behandelt. Die bereits bestätigte Trennung bleibt: klare Mehrfachabsicht → Sammelerfassung, klar benannter Einzelwert → Einzelwert, allgemeine Erfassungsabsicht → Rückfrage.
- Beide betroffenen Sprachrouter kürzten bestätigte Schritte nach 260 Zeichen und konnten dadurch einen Satz mitten im Wort beenden. Der vollständige bestätigte Text war bereits im statischen Supertonic-Katalog vorhanden.
- Der Direktguide **Durchführungsnachweis öffnen** enthielt lokal einen dritten allgemeinen Folgeschritt, obwohl der freigegebene Datenbankstand und v65 ausdrücklich nach dem Öffnen enden.
- Mehrere sichtbare Texte verwendeten interne Freigabesprache und wurden verständlich formuliert, ohne Klickweg oder fachliche Aussage zu erweitern.

## Umgesetzt

- Sichtbare startseitige Karte **DokoHilf installieren**.
- Android: direkter Browserprompt, sobald der Browser ihn bereitstellt; andernfalls klare Chrome-Menüschritte.
- iPhone/iPad: Safari-Anleitung; im bereits installierten Stand wird die Installationskarte ausgeblendet.
- Die Installationsoberfläche bleibt im Chat, Sprachmodus und in geöffneten Direktguides verborgen.
- Vitalwerte-Routing wurde ausschließlich für die bereits bestätigte Einzel-/Sammeltrennung korrigiert.
- Sprachrouter geben bestätigte Schritte vollständig aus; kein Browser-, System-, Cloud- oder Bezahl-TTS wurde ergänzt.
- Allgemeiner Durchführungsnachweis endet in Datenbank und Direktbibliothek identisch nach **Doku → Durchführungsnachweis**.
- Statische F1-Katalogtexte und die bestehende Dateiablage-Hilfe wurden wortgleich synchronisiert.
- Mobile Renderprüfung deckt Installationskarte und beide Plattformpfade auf iOS 393×852 und Android 412×915 ab.

## Freigabe- und Prüfstand

- PR #188 wurde auf exakt dem Head `c6d54cc45698be4877d0d8b23dc5b7eac3012f7c` geprüft und anschließend manuell gemergt.
- Auf diesem Head liefen 11 GitHub-Checks erfolgreich.
- Der Main-Deploy #958 für `b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6` wurde erfolgreich abgeschlossen.
- `gh-pages` wurde anschließend als `98bb5f8f92b7b6c661c152a839ad7a9eff95cd4e` mit Committext **Publish DokoHilf b767ef1f8b72ee14719a2e47105bb4fa64ecd6f6** veröffentlicht.
- Die GitHub-Pages-Bereitstellung dieses `gh-pages`-Commits wurde erfolgreich abgeschlossen.
- Supabase Projekt `efifbuqctylsujiauabg` ist aktiv; `dokohilf-ai-router` v13, `dokohilf-conversation-router` v6 und `dokohilf-chat-router` v11 sind `ACTIVE`.
- Die produktive Migration `natural_dateiablage_help_v69` ist vorhanden.
- Guide-Datenstand: 46 Guides insgesamt, 41 freigegeben, 5 Entwürfe, 155 freigegebene Schritte und 133 eindeutige freigegebene Schritttexte; keine leeren Schritttexte oder Prüffragen.
- Der veröffentlichte `gh-pages`-Stand enthält `v35`, Build `20260904-43`, Release `pwa-install-and-full-qa-v69`.

Die vollständige v69-Abnahme umfasste außerdem die bereits im Release dokumentierten Routing-, Gesprächs-, Workflow-, Audio- und Mobilprüfungen. Diese Datei markiert den Arbeitsblock jetzt ausdrücklich als abgeschlossen; sie führt keine neue Produktänderung ein.

## Unveränderte Grenzen

- Keine neuen Vivendi-Menüpunkte, Felder, Statuswerte oder Klickwege.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.
- Medikation bleibt im normalen Medikationsbereich ausschließlich zum Ansehen.
- Dateiablage bleibt auf Finden und Öffnen bereits vorhandener Dokumente beschränkt.
- Keine Echtdaten, Konten, Profile oder dauerhafte Gesprächsspeicherung.
- Ausschließlich statische Supertonic-3/F1-Sprachausgabe.

## Abschluss

Der v69-Arbeitsblock ist abgeschlossen. Künftige Änderungen beginnen wieder auf einem neuen Branch vom dann aktuell live geprüften `main`-Stand und folgen erneut dem vollständigen Branch-/PR-/Exact-Head-/Merge-/Deploy-/Live-Prozess.