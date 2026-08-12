# DokoHilf – aktive Arbeit: Fehler melden + sichtbare Releaseversion v30

**Status:** IN ARBEIT  
**Stand:** 13. August 2026  
**Branch:** `feature/feedback-report-v47-main-sync`  
**Ausgangs-main:** `79e70cf92ec1da55b9f9d99ec61cd432dc25d578` (Merge PR #150)  
**Vorgänger-PR:** #149 – nicht mergen; basiert auf veraltetem main und wird durch den aktuellen Sync-PR ersetzt.

## Nutzerentscheidung

Die Funktion „Fehler oder Hinweis melden“ wird exakt mit folgenden Grenzen umgesetzt:

- unten dezent: „DokoHilf befindet sich noch in der Testphase. Fehler oder fehlende Information gefunden?“;
- Button: „Fehler oder Hinweis melden“;
- Meldefenster mit Kategorie und kurzer Beschreibung;
- optionaler Schalter „Aktuelle Stelle mitsenden“;
- bei aktivierter Stelle ausschließlich Build-ID, aktueller Guide und aktueller Schritt;
- niemals Chatnachrichten, Audio oder Screenshots mitsenden;
- sichtbare Warnung, keine Namen, Bewohner-/Klienten- oder Gesundheitsdaten einzugeben;
- Meldungen ausschließlich privat in Supabase; keine öffentliche Lesemöglichkeit;
- DokoHilf-Meldelogik liest oder speichert keine IP-, Geräte-, Cookie-, Session- oder Nutzerkennung;
- nach erfolgreichem Speichern technische Meldungsnummer im Format `DH-XXXXXXXXXXXX`.

## Sichtbare Releaseversion

Zusätzliche verbindliche Nutzerentscheidung:

- die in der App sichtbare Version darf nach größeren sichtbaren Updates nicht auf einem alten Stand wie `v29` stehen bleiben;
- für diesen größeren Funktionsstand wird die sichtbare DokoHilf-Version auf **v30** gesetzt;
- `KI · v30`, der untere Versionsstatus und `version.json.displayVersion` müssen übereinstimmen;
- `PROJECT_RULES.md` enthält dafür ab diesem Arbeitsblock eine dauerhafte Merge-Regel;
- kleine reine Fehlerkorrekturen erzwingen nicht automatisch einen Versionssprung, größere sichtbare Funktions-/UI-Releases dagegen schon.

Historische interne Dateinamen wie `v29-ui.css` oder `local-voice-v28.js` sind Implementierungs-/Kompatibilitätsnamen und werden nicht blind umbenannt. Sie sind nicht die sichtbare Produktreleaseversion.

## Bereits umgesetzt auf dem aktuellen Branch

- Feedback-UI `assets/feedback-report-v47.js`;
- privates DB-Schema als Migration `supabase/migrations/20260812205500_dokohilf_private_feedback_reports.sql`;
- Edge Function `supabase/functions/dokohilf-feedback/`;
- `verify_jwt=false` nur für diesen kontenfreien Feedback-Endpunkt; weiterhin Origin- und Feldvalidierung;
- eigene Datenschutz-/Backend-Regressionstests;
- iOS-/Android-Renderprüfung des Meldefensters;
- Feedback-Modul wird über die bestehende UI-Schicht geladen;
- Service Worker precacht das neue Modul und behält den kompletten v48-Stand aus PR #150;
- sichtbare Releaseversion v30 in `index.html` und `version.json`;
- unterer Update-/Versionsstatus zeigt Releaseversion und Build getrennt;
- neuer Test `tests/display-version-policy.test.mjs` schützt vor einer erneut veralteten sichtbaren Versionsangabe;
- `PROJECT_RULES.md` wurde um Feedback-Datenschutz und Versionspflege erweitert.

## Datenschutz-/Sicherheitsdesign

Tabelle: `private.dokohilf_feedback_reports`.

Gespeicherte Felder:

- technische UUID;
- technische Meldungsnummer;
- Kategorie;
- kurze Beschreibung;
- `include_context`;
- optional Build-ID, Guide-Slug und Schritt;
- Erstellzeitpunkt.

Nicht vorhanden und nicht erlaubt:

- IP-Adresse;
- User-Agent;
- Gerätekennung;
- Cookie-/Session-/Nutzerkennung;
- Chatverlauf;
- Audio;
- Screenshot.

`private` wird nicht als öffentliche Leseschnittstelle verwendet. `public`, `anon` und `authenticated` erhalten keine Tabellen-/Schema-Leserechte; RLS ist zusätzlich aktiviert und es gibt keine öffentliche Policy.

## Prüf- und Veröffentlichungsplan

1. PR aus diesem Branch gegen aktuellen `main` öffnen; #149 anschließend ausdrücklich als superseded schließen.
2. Eigener Feedback-v47-Gate plus alle acht etablierten DokoHilf-Pflichtworkflows auf exakt demselben Head.
3. Bei Head-Änderung alle erforderlichen Gates erneut auf dem neuen Head.
4. Erst nach vollständig grünen PR-Gates produktive Supabase-Migration ausführen.
5. Edge Function produktiv deployen.
6. Nur vollständig synthetischen Ende-zu-Ende-Test der Meldung ausführen; Testdatensatz danach wieder entfernen.
7. Private Nicht-Lesbarkeit und tatsächliche gespeicherte Feldmenge erneut prüfen.
8. Expected-Head-Guard beim Merge verwenden.
9. Main-Deploy vollständig bis `gh-pages` und GitHub Pages `built` verifizieren.
10. Abschlussstatus in PR, Issue #148 und `PROJECT_HANDOFF.md` dokumentieren.

## Aktueller veröffentlichter Ausgangsstand

PR #150 ist vollständig veröffentlicht:

- `main`: `79e70cf92ec1da55b9f9d99ec61cd432dc25d578`;
- `gh-pages`: `4b38572409ac38fa5a3e1c22133998fff91197d8` mit Committext `Publish DokoHilf 79e70cf92ec1da55b9f9d99ec61cd432dc25d578`;
- Main-Deploy #819 / Run `31644787543`: erfolgreich inklusive Supertonic und gh-pages-Publish;
- GitHub Pages: `built`, HTTPS erzwungen.

Damit werden die Feedback-/v30-Arbeiten ausschließlich auf dem bereits veröffentlichten #150-Stand fortgesetzt.