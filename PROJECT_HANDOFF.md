# DokoHilf – dauerhafte Projektübergabe

**Status:** Verbindliche Arbeitsquelle  
**Stand:** 7. August 2026  
**Veröffentlichter Build:** `20260806-27`  
**Aktueller Produktstand:** Build 27 live; direkte Komplettanleitungen, Cross-Platform-Mobile-QA, neue iOS-/Android-PWA-Icons und detaillierte Orientierungshilfe bei Klickproblemen veröffentlicht  
**Aktuelle PWA-Hotfixrevision:** `20260807-detail-help-cross-platform-1`

> Jeder neue Chat liest zuerst vollständig `README.md`, `PROJECT_RULES.md`, `CONFIRMED_WORKFLOWS.md`, diese Datei und alle vorhandenen `ACTIVE_WORK_*.md`. Danach werden der tatsächliche GitHub-, Actions-, Pages- und gegebenenfalls Supabase-Stand live geprüft. GitHub ist das dauerhafte Arbeitsgedächtnis; alte Chats sind keine notwendige Voraussetzung zur Fortsetzung.

## 1. Harte Projektgrenzen

- Einziges Repository: `ys2mm422yb-max/DokoHilf`
- Einziges Supabase-Projekt: `efifbuqctylsujiauabg`
- Region: Frankfurt, `eu-central-1`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Andere Repositories oder Supabase-Projekte niemals öffnen, verändern oder verbinden.
- Keine produktive Verbindung zur Dokumentationssoftware, kein Scraping und keine nicht dokumentierten Schnittstellen.
- Keine echten Bewohner-, Gesundheits-, Mitarbeiter- oder Zugangsdaten in Repository, Supabase, Tests oder Artefakten.
- Nutzerbilder und Screenshots bleiben ausschließlich im jeweiligen Chat. Nur anonymisierte, selbst formulierte und fachlich bestätigte Klickwege dürfen daraus übernommen werden.

## 2. Dauerhafte GitHub-Dokumentationspflicht

Diese Regel wurde vom Nutzer ausdrücklich bestätigt.

Nach jedem relevanten Arbeitsblock dauerhaft dokumentieren:

- neue Nutzerentscheidungen und fachliche Bestätigungen
- betroffene Dateien, Komponenten und Supabase-Bereiche
- tatsächliche Tests und Ergebnisse
- Fehler, Ursachen und offene Blocker
- Branch, Pull Request und exakten Head
- Merge- und Veröffentlichungsstand
- nächsten ausführbaren Schritt

Bestätigte Klickwege gehören nach `CONFIRMED_WORKFLOWS.md`. Größere Arbeitsblöcke erhalten eine `ACTIVE_WORK_*.md`. Ein neuer Chat soll aus GitHub ohne Rekonstruktion alter Chats weiterarbeiten können.

## 3. Verbindlicher GitHub-Ablauf

1. Vor Eingriffen `main`, offene Pull Requests, Actions und `gh-pages` prüfen; Supabase zusätzlich prüfen, wenn der Block Supabase betrifft.
2. Produktänderungen nie direkt auf `main`.
3. Eigener Branch und Pull Request pro Arbeitsblock.
4. Änderungen und Arbeitsstand dauerhaft dokumentieren.
5. Nur einen vollständig geprüften **exakten PR-Head** mergen.
6. Kein Auto-Merge und keine automatische Branch-Löschung.
7. Nach Merge `main`, `gh-pages` und relevante Live-Komponenten prüfen.
8. Gegenüber dem Nutzer keine alternativen Preview-/Branch-/Cache-Links als Hauptzugang nennen.

## 4. Mobile Grundregel – iOS UND Android

Seit PR #71 gilt dauerhaft: **„mobil geprüft“ bedeutet immer iOS und Android.**

Mindest-QA:

- iOS/iPhone-orientiert: `393 × 852`
- Android/Pixel-orientiert: `412 × 915`

Bei jeder mobilen Änderung werden mindestens geprüft:

- kein horizontaler Overflow
- keine Überlagerungen oder abgeschnittenen Inhalte
- Header/Footer/Safe Areas
- Touch-Ziele
- Chat und Voice, sofern betroffen
- PWA-/Updateverhalten, sofern betroffen

Plattformspezifische Änderungen dürfen die andere Plattform nicht ungeprüft lassen.

Details: `ACTIVE_WORK_MOBILE_CROSS_PLATFORM.md`.

## 5. Build 27 – Basis und aktuelle veröffentlichte Produktblöcke

Build `20260806-27` ist veröffentlicht.

### Basis-Release

- PR #53 `Finale Build-27-Validierung und iPhone-Renderfix`
- Merge-Commit: `5d58167e2df9c78493f2e4ef880ac293be8aa2be`
- final geprüfter Feature-Head: `0ca4cd911297b22702f38b82b8caafeab9975a4e`
- `version.json`: Build `20260806-27`, Release `dark-premium-fast-voice`

### Schneller Sprachfallback und Voice-Geometrie

- PR #67 `Mache Sprachantwort sofort und beseitige iPhone-Überlagerungen`
- finaler Head: `f19290cb75fe0a11d918f9dec2a9eeab3641d187`
- Merge-Commit: `98a8718027bfc520a9ccba03db3b38152b852c2b`
- Client-Fallback: **180 ms**
- Gacrux bleibt bevorzugt; wenn natürliche Live-Stimme nicht praktisch sofort bereit ist, übernimmt die Gerätestimme.
- iOS-Speech-Watchdog verhindert stumm pausierten `speechSynthesis`-Fallback.

### Direkte häufige Abläufe und Chatpolish

- alter PR #69 wurde nicht gemergt und ist historisch ersetzt.
- PR #72 `Direkte Anleitungen und Cross-Platform-QA` wurde gemergt.
- Merge-Commit: `33cfdad0ab62a69c961d0288b72849f3fc74e5d9`
- `Häufige Abläufe` öffnet direkt eine **vollständige bestätigte Anleitung**, nicht zuerst einen Chat.
- Direkt geführt werden derzeit:
  - Bericht anlegen
  - Visite anlegen
  - Vitalwerte erfassen
  - An-/Abwesenheit
  - Medikation ansehen
  - Formular anlegen
  - Übergabe anzeigen
- Vitalwerte verzweigen nur in die bestätigten Varianten Einzelwert und Sammelerfassung.
- Schreibmodus wurde kompakter und als eigener Chatbereich gestaltet.
- Der reale Mobile-Flow ist auf iOS `393×852` und Android `412×915` geprüft.

Details: `ACTIVE_WORK_DIRECT_GUIDES_CHAT.md`.

### PWA-Installationssymbol iOS und Android

- PR #73 `Ersetze PWA-Icon sauber auf iOS und Android` wurde gemergt.
- Merge-SHA aus GitHub-Livehistorie prüfen, wenn für einen Folgeblock benötigt.
- Browser-/UI-Vektorquelle: `icon-v3.svg`
- iOS: `icon-touch-180-v3.png` – 180×180
- Android/PWA: `icon-192-v3.png` – 192×192
- Android/PWA: `icon-512-v3.png` – 512×512
- Android maskable: `icon-maskable-512-v3.png` – 512×512
- Die versionierten Dateinamen lösen die alte SVG-/Homescreen-Cachekopplung.
- Der Release-Build erzeugt/prüft die freigegebenen PNGs deterministisch; Nutzerbilder werden niemals verwendet.

Details: `ACTIVE_WORK_PWA_ICONS_CROSS_PLATFORM.md`.

### Detaillierte Orientierung bei Klickproblemen

- PR #74 `Mache „Ich finde das nicht“ zu echter detaillierter Orientierung`
- finaler geprüfter Head: `e770efa6060d9ced966d57870baa52eff04cc710`
- Merge-Commit: `644e93aa55997b0ac62c45db2daf232d1650a646`
- PR #74 ist gemergt und die Release-Ausgabe liegt auf `gh-pages`.
- aktuelle PWA-Hotfixrevision: `20260807-detail-help-cross-platform-1`

Verbindliches Verhalten:

- Problemformulierungen wie `Ich finde das nicht`, `Wo ist ...?`, `Wo muss ich klicken?`, `Bei mir heißt es anders`, `Ich bin auf einer anderen Seite` oder `Ich brauche Hilfe` öffnen einen **Orientierungs-/Detailhilfemodus**.
- aktueller Guide und aktueller Schritt bleiben erhalten.
- der Problemhinweis markiert keinen Schritt als erledigt.
- `Weiter` wird während der Fehlersuche ausgeblendet.
- DokoHilf fragt zuerst, **was der Nutzer tatsächlich sieht**.
- erst nach bestätigtem Fund darf die normale Führung fortgesetzt werden.
- wenn der bestätigte Menüpunkt fehlt, wird **kein alternativer Klickweg erfunden**; DokoHilf bleibt an der Fachgrenze und führt zum letzten sicheren Einstieg oder zu menschlicher Unterstützung.
- Chat und Voice verwenden dieselbe Fachlogik.
- die Hilfesitzung bleibt nur im RAM; keine dauerhafte Speicherung.

Details: `ACTIVE_WORK_DETAIL_HELP.md`.

## 6. Vitalwerte – Referenzbeispiel der neuen Detailhilfe

Beim Satz wie `Ich finde die Vitalwerte nicht, wo sind die?` läuft jetzt:

1. DokoHilf erklärt, dass zunächst **nur die richtige Stelle gesucht** wird und nichts als erledigt gilt.
2. Orientierung auf den bestätigten Einstieg `Doku-Erweitert`.
3. strukturierte Rückfrage, z. B.:
   - `Doku-Erweitert ist offen`
   - `Ich bin in Doku / einem anderen Reiter`
   - `Doku-Erweitert fehlt`
   - `Ich weiß nicht, wo ich bin`
4. Nach bestätigtem geöffnetem Reiter erklärt DokoHilf, dass `Vitalwerte` und `Vitalwerte Sammelerf.` zwei getrennte Einträge sind.
5. zweite Rückfrage:
   - `Vitalwerte sehe ich`
   - `Ich sehe nur „Vitalwerte Sammelerf.“`
   - `„Vitalwerte“ fehlt`
   - `Ich bin mir nicht sicher`
6. Nur bei bestätigtem Fund endet der Hilfemodus und `Weiter` wird wieder möglich.
7. Bei fehlendem Eintrag: keine Vermutung, kein ähnlich klingender Menüpunkt, sondern transparente Fachgrenze.

## 7. Detailhilfe – technische Architektur und QA

Neue Kernkomponenten:

- `assets/detail-help-v27.js` – flüchtige kontrollierte Detailhilfe
- `scripts/apply-detail-help-v27.mjs` – Release-Injektion
- `scripts/detail-help-render-v27.mjs` – realer Cross-Platform-Interaktionstest
- `tests/detail-help-v27.test.mjs` – deterministische Verträge
- `.github/workflows/detail-help-mobile.yml` – iOS-/Android-Pflicht-QA

Verbindliche Wrapper-Reihenfolge im gebauten `index.html`:

`clarification-ui.js → detail-help-v27.js → guide-progress.js`

Dadurch kann die Detailhilfe eine offensichtliche Orientierungsfrage kontrolliert abfangen, während `guide-progress.js` die sichere synthetische Hilfsantwort weiterhin sieht und den Schritt korrekt hält.

Finaler exakter PR-#74-Head `e770efa6060d9ced966d57870baa52eff04cc710`:

- `Deploy DokoHilf` Run #296 – **success**
- `Validate dark iPhone UI v27` Run #49 – **success**
- `Validate detailed help iOS Android` Run #7 – **success**
- 7/7 neue deterministische Detailhilfe-Tests grün
- exakter Release-Build grün
- Detailhilfe-Render auf iOS grün
- Detailhilfe-Render auf Android grün

Nach Merge wurde direkt auf `gh-pages` geprüft:

- `service-worker.js` enthält `HOTFIX_REVISION = '20260807-detail-help-cross-platform-1'`
- `detail-help-v27.js` liegt im Core-Cache
- `index.html` lädt die Detailhilfe in der vorgesehenen Reihenfolge.

## 8. Build-27-Frontendarchitektur

Wichtige Dateien:

- `index.html`
- `assets/app.js` – Kernlogik
- `assets/conversation-intelligence.js` – Gesprächslogik
- `assets/clarification-ui.js` – strukturierte Auswahl
- `assets/detail-help-v27.js` – detaillierte Orientierung bei Klickproblemen
- `assets/guide-progress.js` – Guidezustand
- `assets/voice-focus-mode.js` – fokussierte Sprachbühne
- `assets/mobile-audio-fix.js` – Audio-Entsperrung
- `assets/update-manager.js` – Updates
- `assets/premium-ui-v27.css` – Dark-Design
- `assets/ux-v27.css` / `assets/ux-v27.js` – Interaktion, Datenschutz, 180-ms-Fallback
- `assets/voice-stage-balance-v27.css` – Voice-Geometrie
- `assets/direct-guides-v27.js` – direkte Komplettanleitungen
- `assets/direct-guides-chat-v27.css` – Direktguide-/Chatdarstellung
- `assets/experience-v27.js` – statische und dynamische Sprachausgabe
- `assets/voice-diagnostics.js` – privater Audiokatalog und Gerätecache
- `assets/guide-audio-catalog.json` – Zielkatalog allgemeiner statischer Audio-Texte
- `service-worker.js` – PWA, aktueller Release-Hotfix wird beim Build angewandt
- `scripts/build-static-site-v27.sh` – exakter Pages-Build
- `scripts/mobile-render-v27.mjs` – allgemeiner iOS-/Android-Rendernachweis

## 9. Supabase-Stand

Zuletzt live bestätigt:

- `dokohilf-ai-router` v11
- `dokohilf-tts` v21
- `dokohilf-guide-audio` v1
- `dokohilf-guide-audio-build` v3
- `dokohilf-editor` v1
- `public.dokohilf_guides`
- `public.dokohilf_topics`
- `public.dokohilf_static_guide_audio`
- `public.dokohilf_internal_build_control`
- privater Bucket `dokohilf-guide-audio`
- alte Diagnose-/Export-/Batch-/Store-/Snapshot-Endpunkte neutralisiert auf HTTP 410

Die Detailhilfe aus PR #74 erforderte **keine Supabase-Schreibänderung**. Der bestehende AI-Router bleibt eine zweite Sicherheitsebene.

## 10. Sprache und private Gacrux-Audios

Natürliche Stimme: **Gacrux**.

Aktuelle Client-Reihenfolge:

1. vorhandenes statisches freigegebenes Gacrux-Audio
2. dynamisches Gacrux nur, wenn es innerhalb des 180-ms-Fensters praktisch sofort bereit ist
3. lokale Sofortstimme
4. iOS-Resume-Watchdog gegen stumm pausiertes `speechSynthesis`

Statische Audio-Sicherheitsgrenze:

- nur allgemeine freigegebene Guide-Texte
- keine Nutzerstimmen
- keine Diktate
- keine freien Antworten
- keine Gesprächsverläufe
- keine Namen, Fall- oder Gesundheitsdaten

Der Audio-Bestand ist veränderlich. Vor jeder neuen Audioarbeit aktuellen Bestand und Cronzustand **live aus Supabase** prüfen; alte Zahlen aus diesem Dokument nicht als aktuellen Bestand behandeln.

## 11. Verbindliche Fachquelle

`CONFIRMED_WORKFLOWS.md` ist die verbindliche Quelle für lokal bestätigte Klickwege. Router, Supabase-Guides, direkte Anleitungen, Detailhilfe und Tests müssen damit übereinstimmen.

Bestätigt sind insbesondere:

- Bericht anlegen einschließlich Kategorieauswahl und automatisch verknüpfter Protokolle
- Bericht durchstreichen
- Folgebericht erstellen
- falsch abgezeichnete Durchführung stornieren
- Visite/Sprechstunde mit vorgeschalteter Klientenauswahl und Status **durchgeführt**
- Vitalwerte als getrennte Einzel- und Sammelerfassung
- An-/Abwesenheit mit harter Von-/Bis-Regel
- Medikation ausschließlich ansehen
- Formulare anlegen
- Notfallblatt öffnen
- Übergabe über `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

Nie fehlende Feldnamen, alternative Menüs oder Klickwege ergänzen, nur weil sie plausibel erscheinen.

## 12. Bildbasierte Nachbestätigungen

Die vom Nutzer geschickten Vivendi-Bilder bleiben Chat-only und dürfen niemals in GitHub, Supabase, Tests oder Artefakte kopiert werden.

Anonymisiert daraus bestätigt und in `CONFIRMED_WORKFLOWS.md` festgehalten sind unter anderem:

- `Doku-Erweitert → Visiten → Neu → Klienten auswählen → Neue Visite → Durchführen`
- Bericht anlegen mit Kategorieauswahl
- Einzel-Vitalwerte und separater Menüpunkt `Vitalwerte Sammelerf.`
- Bericht über `Eintrag bearbeiten → Durchstreichen`
- `Doku → Durchführungsnachweis → Durchführung stornieren`
- kleines rotes Kreuz → `Notfallblatt aufrufen`
- `Formulare → Neu → Formular anlegen → Protokoll auswählen → OK`
- `Analyse → Was war los? → Alle anzeigen → Alles ausklappen`

## 13. Nächster sinnvoller Produktblock

Die generische Detailhilfe ist **implementiert und live**. Der nächste sinnvolle Ausbau ist nicht mehr der Grundmechanismus, sondern **zusätzliche bestätigte Orientierungszustände pro Workflow**.

Geeignete nächste Kandidaten:

- Visite: detaillierte Orientierung `Doku-Erweitert → Visiten → Neu → Klientenauswahl`
- Bericht: Orientierung zur Berichtsliste, Kategorieauswahl und Bearbeitung
- Formulare: Orientierung zum Menü `Formulare` und `Neu`
- Durchführung: Orientierung `Doku → Durchführungsnachweis`

Für jeden solchen Ausbau gilt weiterhin: nur bestätigte sichtbare Zustände und Begriffe verwenden; keine Alternativen erfinden.

## 14. Pflicht für jeden neuen Chat

1. `PROJECT_RULES.md` lesen.
2. `CONFIRMED_WORKFLOWS.md` lesen.
3. `PROJECT_HANDOFF.md` lesen.
4. alle `ACTIVE_WORK_*.md` prüfen.
5. Live-GitHub prüfen: `main`, offene PRs, aktuelle Heads, Actions und `gh-pages`.
6. Live-Supabase prüfen, wenn der Arbeitsblock Supabase, Router, Audio oder Guides betrifft.
7. Bei Audioarbeit den veränderlichen statischen Audio-Bestand und Cronzustand live prüfen.
8. Exakt beim dokumentierten nächsten ausführbaren Schritt fortfahren.
9. Nach eigener Arbeit Repository-Dokumentation wieder aktualisieren.

Diese Datei ist das dauerhafte Handoff, ersetzt aber nie die Live-Prüfung veränderlicher Zustände.
