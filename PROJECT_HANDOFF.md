# DokoHilf – dauerhafte Projektübergabe

**Status:** verbindliche Arbeitsquelle  
**Stand:** 13. August 2026  
**Aktuell vollständig veröffentlicht:** PR #150 / `main` `79e70cf92ec1da55b9f9d99ec61cd432dc25d578`  
**Aktueller veröffentlichter `gh-pages`-Commit:** `4b38572409ac38fa5a3e1c22133998fff91197d8` (`Publish DokoHilf 79e70cf92ec1da55b9f9d99ec61cd432dc25d578`)  
**GitHub Pages:** `built`, HTTPS erzwungen  
**Aktive nächste Arbeit:** Fehler-melden-Funktion + sichtbare Releaseversion **v30**  
**Aktiver Branch:** `feature/feedback-report-v47-main-sync`  
**Detailstatus:** `ACTIVE_WORK_FEEDBACK_V30.md`  
**Öffentlicher Hauptlink:** `https://ys2mm422yb-max.github.io/DokoHilf/`

> Veränderliche Zustände immer live gegen GitHub und Supabase prüfen. Diese Datei ist das dauerhafte Handoff, aber kein Ersatz für die Liveprüfung unmittelbar vor Schreib-, Merge- oder Veröffentlichungsaktionen.

## 1. Vor jeder Arbeit lesen / prüfen

1. `PROJECT_RULES.md` – verbindliche Projekt-, Datenschutz-, Veröffentlichungs- und Versionsregeln.
2. `CONFIRMED_WORKFLOWS.md` – fachliche Source of Truth für bestätigte Klickwege.
3. `STATIC_VOICE_POLICY.md` bei Sprachbezug.
4. `CROSS_PLATFORM_POLICY.md` bei UI-/Mobilbezug.
5. diese Datei.
6. relevante `ACTIVE_WORK_*.md`.
7. aktuelle PRs, Issues, Actions, `main`, `gh-pages` und GitHub Pages.
8. bei Supabase-Bezug ausschließlich Projekt `efifbuqctylsujiauabg`.

## 2. Unveränderliche Produktgrenzen

- Ausschließlich GitHub `ys2mm422yb-max/DokoHilf` und Supabase `efifbuqctylsujiauabg`.
- DokoHilf ist eine öffentliche, kontenfreie Schritt-für-Schritt-Bedienhilfe.
- Keine DokoHilf-Benutzerkonten, Logins, Bewohner-/Mitarbeiterprofile oder Fallakten.
- Keine echten Bewohner-, Klienten-, Patienten-, Angehörigen-, Gesundheits-, Mitarbeiter- oder Falldaten in App, GitHub, Supabase, Tests oder Artefakten.
- Keine Verbindung zu produktiven Dokumentationsdatenbanken.
- Keine erfundenen Klickwege, Feldnamen oder fachlichen Angaben.
- Medikation bleibt ein reiner Leseweg; keine Änderungen anleiten.
- Berichtssuche (#103), Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen, bis ein bestätigter Ablauf vorliegt.

## 3. Verbindlicher GitHub-/Release-Ablauf

- Nie direkt auf `main` arbeiten.
- Eigener Branch → PR → exakten Head prüfen → erst bei grünen Gates manuell mergen.
- Kein Auto-Merge und keine automatische Branch-Löschung.
- Bei Produkt-/UI-/Guide-/Sprachänderungen müssen die acht etablierten Pflichtworkflows auf exakt demselben PR-Head grün sein:
  1. Context and Voice Hotfix v28
  2. Validate context-aware guide help v28
  3. Validate exact PR head
  4. Validate report conditional iOS Android
  5. Validate detailed help iOS Android
  6. Validate static voice iOS Android
  7. Validate dark iPhone UI v27
  8. Deploy DokoHilf
- Zusätzliche funktionsspezifische Gates müssen ebenfalls grün sein.
- Wenn der PR-Head nach einer Prüfung verändert wird, gelten alte grüne Ergebnisse nicht als Freigabe für den neuen Head.
- Datenbankänderungen zuerst als Rollback-/Dry-Run prüfen; produktiv erst nach vollständig grünen PR-Gates und entsprechend dem konkreten Releaseplan.
- Nach Merge `main`, Main-Deploy, `gh-pages`, GitHub Pages und betroffene Supabase-Ressourcen verifizieren.
- Nie `live` behaupten, bevor der veröffentlichte Stand real geprüft wurde.
- Relevante Nutzerentscheidungen, Tests, Fehler, Heads, Merge- und Veröffentlichungsstände immer in GitHub dokumentieren.

## 4. Aktueller bestätigter Live-Stand – PR #150

PR #150 **Fix user-facing help voice progress and report numbering** ist vollständig veröffentlicht.

Bestätigte Daten:

- finaler PR-Head: `eb8b0271271136eb32dca20cde33d4875556e9a1`;
- 8/8 Pflichtprüfungen auf diesem exakten Head erfolgreich;
- Merge-Commit: `79e70cf92ec1da55b9f9d99ec61cd432dc25d578`;
- Main-Deploy #819 / Run `31644787543`: vollständig erfolgreich;
- statische Supertonic-Erzeugung: erfolgreich;
- releasbarer Site-Build: erfolgreich;
- Publish nach `gh-pages`: erfolgreich;
- `gh-pages`: `4b38572409ac38fa5a3e1c22133998fff91197d8`;
- GitHub Pages: `built`.

PR #150 enthält insbesondere:

- sichtbare Hilfetexte ohne interne Produktregel-Sätze wie „Einen anderen Klickweg erfindet DokoHilf nicht“;
- 62 freigegebene `stuck`-Hilfetexte als kostenlose statische Supertonic-F1-Sprachsätze;
- bei 5/5 beziehungsweise dem letzten Guide-Schritt visuell exakt 100 % Fortschritt;
- Bericht anlegen: nach Schritt 5 bei nicht zutreffendem Sonderfall weiter mit **Schritt 9**, nicht Schritt 10;
- PWA-Revisionsmarker zum sicheren Aktualisieren;
- produktive Supabase-Textbereinigungen für betroffene Dateiablage-/Bedarfsmedikationshilfen wurden nach den grünen Gates ausgeführt und verifiziert.

## 5. Dateiablage – bestätigter Stand

Dateiablage ist freigegeben und gehört in der Bibliothek unter **Organisation & Dokumente**.

Bestätigter Ablauf:

1. Stammdaten des gewünschten Bewohners öffnen.
2. In der grauen Leiste `Dateiablage` wählen.
3. Unten mittig erscheint `Dokumente`.
4. Vorhandenes gewünschtes Dokument suchen und auswählen, wenn es dort hinterlegt ist.
5. Per Doppelklick öffnen; Word kann kurz benötigen; nicht mehrfach doppelklicken.

DokoHilf hilft dort nur beim Finden/Öffnen vorhandener Dokumente. Keine Upload-, Lösch-, Umbenennungs- oder Änderungsanleitung ohne spätere separate fachliche Bestätigung.

## 6. Sprache – aktueller Schutzstand

- ausschließlich kostenlose statische Supertonic-Sprachausgabe für freigegebene Sätze;
- keine Cloud-/Bezahl-TTS;
- keine System-/Gerätestimme als regulärer Fallback;
- keine Nutzerstimmen, Diktate oder Chatverläufe als statische Audiodateien;
- bereits veröffentlichte nummerierte WAV-Zuordnungen dürfen bei Erweiterungen nicht verschoben werden;
- bei sichtbarer richtiger Antwort darf der generische Satz „Ich habe die Antwort im Chat angezeigt.“ nur letzte Wahl sein, wenn kein freigegebener statischer Satz für die Antwort verfügbar ist;
- PR #150 ergänzt die 62 freigegebenen kontextuellen Hilfesätze, damit „Ich brauche Hilfe / Ich finde das nicht“ nicht wegen fehlender WAV auf den generischen Fallback fällt.

## 7. Aktive Arbeit – Fehler melden + sichtbare Version v30

Verbindliche Detailquelle: `ACTIVE_WORK_FEEDBACK_V30.md`.

Der ältere PR #149 basiert auf einem vor PR #150 liegenden `main` und darf nicht gemergt werden. Er wird durch einen neuen, auf `79e70cf92ec1da55b9f9d99ec61cd432dc25d578` aufgebauten PR ersetzt.

Aktiver Branch:

`feature/feedback-report-v47-main-sync`

Bereits auf diesen aktuellen Main-Stand portiert:

- Feedback-UI;
- private Supabase-Migration;
- Feedback Edge Function;
- Datenschutz-/Backendtests;
- iOS-/Android-Renderprüfung;
- Service-Worker-Integration unter Erhalt aller #150/v48-Fixes;
- sichtbare Releaseversion v30;
- verbindliche Releaseversionsregel in `PROJECT_RULES.md`;
- Regressionstest gegen erneut veraltete sichtbare Versionsangaben.

### Verbindliche Feedback-Spezifikation

Unten in der App dezent:

`DokoHilf befindet sich noch in der Testphase. Fehler oder fehlende Information gefunden?`

Button:

`Fehler oder Hinweis melden`

Meldefenster:

- Kategorie;
- kurze Beschreibung;
- optional `Aktuelle Stelle mitsenden`.

Bei aktivierter Stelle dürfen nur mitgesendet werden:

- Build-ID;
- aktueller Guide;
- aktueller Schritt.

Nicht erlaubt durch die Meldelogik:

- Chatnachrichten;
- Audio;
- Screenshots;
- IP-Adresse;
- User-Agent;
- Gerätekennung;
- Cookie;
- Session-ID;
- Nutzerkennung.

Vor Absenden sichtbare Warnung: keine Namen, Bewohner-/Klienten- oder Gesundheitsdaten eingeben.

Meldungen werden privat in Supabase gespeichert; keine öffentliche Lesemöglichkeit. Nach erfolgreichem Absenden wird eine technische Meldungsnummer `DH-XXXXXXXXXXXX` ausgegeben.

Produktive Feedback-Tabelle und Feedback Edge Function dürfen erst nach den grünen Gates des neuen aktuellen PRs aktiviert werden. Tests verwenden ausschließlich synthetische Meldungen.

## 8. Sichtbare Releaseversion – dauerhafte neue Regel

Die bisher sichtbare Kennzeichnung `KI · v29` darf nach einem größeren sichtbaren Release nicht stehen bleiben.

Für die aktuelle größere Funktionsstufe mit Fehler-melden-Funktion wird die sichtbare Produktversion auf **v30** angehoben.

Folgende Stellen müssen dieselbe sichtbare Releaseversion tragen:

- App-Pill `KI · vXX`;
- unterer Versions-/Update-Status;
- `version.json.displayVersion`.

`PROJECT_RULES.md` macht dies zum dauerhaften Merge-Vertrag: größere für Nutzer sichtbare Funktions-/UI-Updates erhöhen die sichtbare Releaseversion vor dem Merge. Kleine reine Fehlerkorrekturen müssen nicht automatisch einen Versionssprung verursachen.

Interne historische Dateinamen wie `v29-ui.css`, `local-voice-v28.js` oder Workflow-Namen sind nicht automatisch die sichtbare Produktversion und werden nicht blind umbenannt, wenn dadurch Kompatibilität oder Regressionstests gefährdet würden. Neu sichtbare Releasekennzeichnungen und neue Release-Dokumentation dürfen dagegen nicht veraltet sein.

## 9. Feedback-Datenschutzdesign

Geplante private Tabelle:

`private.dokohilf_feedback_reports`

Nur folgende Datenfelder sind vorgesehen:

- UUID;
- technische Meldungsnummer;
- Kategorie;
- Beschreibung;
- Boolean für Kontext;
- optional Build-ID, Guide-Slug, Schritt;
- Erstellzeitpunkt.

RLS ist aktiviert. `public`, `anon` und `authenticated` erhalten keine öffentliche Tabellen-/Schema-Leserechte und es gibt keine öffentliche Lesepolicy.

Der öffentliche, kontenfreie Endpunkt validiert Origin, Feldlängen, Kategorien und Requestgröße. Ein globaler, identifier-freier Abuse-Guard begrenzt das Volumen, ohne IP-/Geräte-/Session-Wiedererkennung einzuführen.

## 10. Supabase – dauerhafte Grenzen

- ausschließlich Projekt `efifbuqctylsujiauabg`;
- keine App-Nutzerverwaltung;
- keine Echtdaten;
- keine Secrets ins Frontend oder Repository;
- öffentliche Rollen erhalten keinen unkontrollierten internen Lesezugriff;
- bestehende private anonyme Reichweitenmessung bleibt ohne Nutzer-/Gerätewiedererkennung;
- Feedback bleibt von der Guide-Datenhaltung logisch getrennt und privat lesbar nur über technische Verwaltung.

## 11. Offene fachliche Punkte

- Issue #103: Berichtssuche – Klickweg weiterhin nicht vollständig fachlich bestätigt.
- Easy-Plan – genauer Ablauf nicht bestätigt.
- Aufgaben · Aktuelles – genauer Ablauf nicht bestätigt.

Diese Lücken niemals auf Verdacht schließen.

## 12. Nächste ausführbare Schritte

1. Aktuellen Sync-Branch vollständig dokumentieren.
2. Neuen PR gegen `main` öffnen, der #149 ersetzt und Issue #148 umsetzt.
3. #149 ohne Merge als superseded schließen und im Kommentar auf den neuen PR verweisen.
4. Alle acht Pflichtgates plus Feedback-/Versionsgate auf exakt demselben neuen Head abwarten.
5. Bei Fehlern Ursache beheben; danach immer den neuen exakten Head vollständig neu bewerten.
6. Erst nach grünen Gates private Supabase-Migration und Edge Function produktiv ausrollen.
7. Synthetischen Ende-zu-Ende-Test durchführen und Testmeldung anschließend entfernen.
8. Nicht-Lesbarkeit und gespeicherte Spalten verifizieren.
9. Expected-Head-Guard beim Merge nutzen.
10. Main-Deploy bis `gh-pages` und Pages `built` prüfen.
11. Abschluss in PR, Issue #148, `ACTIVE_WORK_FEEDBACK_V30.md` und diesem Handoff dokumentieren.

Diese Datei ersetzt den veralteten Handoff-Stand nach PR #136 und ist ab jetzt die aktuelle Übergabequelle.