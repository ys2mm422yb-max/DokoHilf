# DokoHilf – verbindliche Projektregeln

**Status:** Verbindlich  
**Stand:** 7. August 2026

> Diese Datei ist vor jeder Arbeit an DokoHilf vollständig zu lesen. Bei rechtlicher, datenschutzrechtlicher oder technischer Unsicherheit gilt: stoppen, nichts veröffentlichen, keine Daten importieren und keine Echtdaten verwenden.

## 1. Strikte Projekttrennung

- Ausschließliches GitHub-Repository: `ys2mm422yb-max/DokoHilf`.
- Ausschließliches Supabase-Projekt: Projekt-ID `efifbuqctylsujiauabg`, Region Frankfurt (`eu-central-1`).
- `DungeonVeil`, `Runeborn`, `dungeon` und jedes andere GitHub- oder Supabase-Projekt dürfen nicht geöffnet, verändert, verbunden oder als Vorlage beziehungsweise Deployment-Ziel benutzt werden.
- Vor jeder Schreibaktion müssen Owner, Repository, Branch und Supabase-Projekt-ID geprüft werden.
- Keine projektübergreifenden Secrets, Umgebungsvariablen, Datenbanken, Buckets oder Deployments.
- Kein Auto-Merge und kein automatisches Löschen von Branches.
- Nie direkt auf `main` arbeiten. Änderungen erfolgen über eigenen Branch, Pull Request, grünen exakten Head und manuellen Merge.

## 2. Öffentlicher Name und Hauptlink

- In öffentlich sichtbaren Repository-, Projekt-, Funktions-, Seiten- und Produktnamen wird ausschließlich **DokoHilf** verwendet.
- Die Anwendung darf nicht wie ein offizielles Produkt oder eine offizielle Partnerschaft des Softwareherstellers wirken.
- Keine Herstellerlogos oder Marken ohne konkrete schriftliche Freigabe.
- Einziger fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`.
- Keine Vorschau-, Cache-, Versions-, Branch- oder Ausweichlinks gegenüber Nutzern nennen.

## 3. Zweck und technische Grenzen

- DokoHilf ist eine unabhängige interne Bedienungs- und Lernhilfe.
- Keine Verbindung zu produktiven Dokumentationsdatenbanken.
- Kein Scraping, Reverse Engineering, automatisiertes Auslesen oder Nutzen nicht dokumentierter Schnittstellen.
- Keine Speicherung von Zugangsdaten der eingesetzten Fremdsoftware.
- Keine medizinischen, pflegerischen oder betreuerischen Entscheidungen durch die Anwendung.
- Bedienantworten stammen nur aus redaktionell gepflegten und freigegebenen Anleitungen.
- Gemini darf Nutzerabsichten und freie Antworten interpretieren, aber niemals interne Klickwege erfinden.

## 4. Urheber-, Marken- und Lizenzschutz

- Keine Handbücher, FAQs, Videos, Tabellen, Grafiken, Schulungsunterlagen oder Texte des Herstellers kopieren oder nur oberflächlich umformulieren.
- Inhalte aus geschützten Kundenportalen dürfen nicht übernommen oder veröffentlicht werden.
- Anleitungen werden vollständig selbst formuliert.
- Der Lizenzvertrag des Arbeitgebers mit dem Softwarehersteller muss vor produktivem Einsatz geprüft werden.

## 5. Absolute Chat-only-Regel für Bilder

Die vom Nutzer zur Bestätigung geschickten Bilder und Screenshots bleiben **ausschließlich im jeweiligen Chat**.

Sie dürfen niemals:

- in GitHub-Dateien, Commits, Branches, Issues, Pull Requests oder Actions-Artefakte gelangen;
- in Supabase-Tabellen, Storage-Buckets, Edge Functions, Logs oder Backups gespeichert werden;
- in die öffentliche oder installierte App eingebaut werden;
- in Testfälle, Dokumentationen, Präsentationen oder andere externe Dateien übernommen werden;
- erneut hochgeladen, verlinkt oder als Bildnachweis veröffentlicht werden.

Aus den Bildern dürfen ausschließlich anonymisierte, selbst formulierte Text-Klickwege abgeleitet werden. Sichtbare Namen, Benutzerkennungen, Datumsangaben, Bewohnerinformationen oder andere Bildinhalte werden nicht übernommen.

Für automatisierte visuelle Tests werden ausschließlich künstliche Oberflächen und Fantasiedaten verwendet.

## 6. Vollständiges Echtdatenverbot

Bis zur schriftlichen Freigabe durch Arbeitgeber, IT und Datenschutz gilt:

- keine Bewohner-, Klienten-, Patienten- oder Angehörigendaten;
- keine Gesundheitsdaten;
- keine echten Berichte, Übergaben, Medikamentenpläne, Vitalwerte oder Termine;
- keine echten Mitarbeiterdaten außer technisch notwendigen Projekt-Testkonten;
- keine Exporte aus der eingesetzten Dokumentationssoftware;
- keine Echtdaten in Logs, Fehlermeldungen, Screenshots, Issues, Commits oder Pull Requests.

Testdaten müssen vollständig erfunden sein und dürfen keiner realen Person nachgebildet werden.

## 7. Datenschutz, lokale Speicherung und Audio

- Datensparsamkeit, Zweckbindung und definierte Löschfristen.
- Keine Werbung, Nutzertracking, Analyse-SDKs, Social-Media-Pixel oder unnötigen Cookies.
- Gesprächsverläufe, Nutzerstimmen, Diktate, freie Sprachantworten und personenbezogene Audioinhalte werden nicht dauerhaft im Browser, Repository oder in Supabase gespeichert.
- Flüchtige Caches für dynamische Sprachantworten dürfen ausschließlich im Arbeitsspeicher existieren und müssen mit dem Prozess enden.
- Als eng begrenzte Ausnahme dürfen **allgemeine, fachlich freigegebene Guide-Anweisungen** einmal mit Gacrux erzeugt und als statische WAV-Dateien in der App ausgeliefert und im PWA-Cache gespeichert werden.
- Diese statischen Dateien dürfen ausschließlich aus `step.text` freigegebener Guides entstehen. Nutzerantworten, Checks, Diktate, Namen, Fallinhalte, Gesundheitsdaten und Gesprächsdaten sind als Audioquelle ausgeschlossen.
- Jede statische Guide-Audiodatei benötigt einen dokumentierten Textschlüssel, gültigen WAV-Header, Dateigröße und SHA-256 im Manifest. Ändert sich der freigegebene Text, muss die Datei neu erzeugt werden.
- Lokal dauerhaft gespeichert werden darf genau ein unpersönliches Ja/Nein-Merkmal: `dokohilf-privacy-ack-v1=yes`. Es zeigt ausschließlich an, dass der zentrale Datenschutz-Hinweis bereits bestätigt wurde. Keine Zeit, Identität, Gerätekennung oder weitere Nutzungsinformation speichern.
- Vor Produktivstart müssen Verantwortlicher, Rechtsgrundlage, Datenschutzhinweis, Löschkonzept, Berechtigungskonzept und Auftragsverarbeitungsverträge geklärt sein.
- Eine EU-Region ersetzt keine vollständige DSGVO-Prüfung.

## 8. Supabase-Sicherheit

- Jede exponierte Tabelle erhält Row Level Security, soweit sie nicht ausschließlich serverseitig mit Service Role genutzt wird.
- `anon` erhält keinen unkontrollierten Zugriff auf interne Inhalte.
- Öffentliche Selbstregistrierung bleibt deaktiviert; Nutzer werden kontrolliert eingeladen oder freigeschaltet.
- Rollen niemals aus nutzerveränderbarem `user_metadata` ableiten.
- `service_role`, Secret Keys, Datenbankpasswörter und privilegierte Schlüssel niemals im Browser, Repository, Issue, Chat oder Screenshot speichern.
- Im Frontend nur Publishable Key und nur zusammen mit geprüften RLS-Regeln.
- Jede Migration enthält erforderliche Grants, RLS und Policies.
- Vor Veröffentlichung Security Advisor und Zugriffstests prüfen.

## 9. GitHub, Veröffentlichung und Secrets

- Das Repository ist aktuell öffentlich; deshalb dürfen dort ausschließlich neutrale, anonymisierte und veröffentlichungsfähige Inhalte liegen.
- Keine Echtdaten oder internen Screenshots im Repository oder in der Git-Historie.
- Keine `.env`-Dateien oder Secrets committen.
- Keine internen Fallinformationen in Issues und Pull Requests.
- Statische App-Bundles dürfen keine internen oder personenbezogenen Inhalte enthalten.
- `main` ist Integrationsbranch; `gh-pages` ist der tatsächlich ausgelieferte Branch.
- Veröffentlichungen erfolgen nur nach grünem exakten PR-Head und anschließendem manuellen Merge.
- Nach Merge müssen `main`, `gh-pages` und der feste öffentliche Hauptlink geprüft werden.

## 10. Fachliche Sicherheitsregeln

- Visiten werden immer als **durchgeführt** dokumentiert, niemals als abgeschlossen.
- Berichte werden nicht endgültig gelöscht, sondern nachvollziehbar durchgestrichen.
- Falsch abgezeichnete Durchführungen werden im Durchführungsnachweis storniert.
- Medikation ist in DokoHilf ausschließlich ein Leseweg. Keine Änderung, Dosierung, Pause, Fortsetzung, Absetzung, Korrektur, Ergänzung oder Löschung anleiten.
- Bei An- und Abwesenheiten wird `Von` immer eingetragen. `Bis` nur, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist; niemals schätzen.
- Nicht bestätigte Formularfelder oder interne Abläufe werden nicht erfunden.
- `CONFIRMED_WORKFLOWS.md` ist die verbindliche Fachquelle für bestätigte lokale Klickwege.

## 11. Erforderliche Freigaben vor echtem Einsatz

- Einrichtungsleitung beziehungsweise Arbeitgeber;
- IT;
- Datenschutzbeauftragte Stelle;
- Prüfung der Lizenz- und Nutzungsrechte;
- Berechtigungs- und Offboarding-Prozess;
- Datenschutzhinweis für Mitarbeitende;
- Backup-, Lösch-, Update- und Sicherheitskonzept;
- Notfall- und Abschaltprozess.

Private Konten dürfen nicht ohne ausdrückliche betriebliche Entscheidung dauerhaft die alleinige Produktiv-Infrastruktur der Einrichtung bleiben.

## 12. Freigabecheck für jede Anleitung

Eine Anleitung darf erst veröffentlicht werden, wenn alle Punkte erfüllt sind:

- vollständig selbst formulierter Text;
- keine echten Personen- oder Gesundheitsdaten;
- keine Bilder aus dem Nutzerchat;
- kein Eindruck eines offiziellen Herstellerprodukts;
- fachlich durch den Nutzer oder eine zuständige Rolle bestätigt;
- Prüfdatum und verantwortliche Rolle hinterlegt;
- alte oder falsche Versionen gesperrt;
- nur freigegebene Klickwege werden ausgegeben;
- statische Guide-Audios stimmen exakt mit dem freigegebenen Text und Manifest überein;
- keine internen Inhalte im öffentlichen Repository oder Frontend-Bundle.

Bei einem Nein: keine Veröffentlichung.

## 13. Harte Stop-Regeln

Die Arbeit wird sofort gestoppt, wenn:

- Repository oder Supabase-Projekt-ID nicht eindeutig sind;
- ein anderes Projekt betroffen sein könnte;
- echte Bewohner- oder Gesundheitsdaten übernommen werden müssten;
- ein Bild aus dem Chat außerhalb des Chats gespeichert werden soll;
- fremde Handbuchtexte übernommen werden sollen;
- ein geheimer Schlüssel im Frontend oder Repository landen würde;
- eine statische Audiodatei Nutzer-, Gesprächs- oder personenbezogene Inhalte enthalten könnte;
- eine Veröffentlichung interne Inhalte öffentlich sichtbar machen könnte;
- eine notwendige rechtliche oder betriebliche Freigabe fehlt.

Dann darf nur eine sichere, datenfreie Alternative vorbereitet werden.

## 14. Hinweis

Diese Regeln sind ein technisches und organisatorisches Schutzkonzept, keine anwaltliche Rechtsberatung und keine betriebliche Datenschutzfreigabe.

## 15. Dauerhafte GitHub-Dokumentationspflicht

- GitHub ist das dauerhafte Arbeitsgedächtnis für DokoHilf. Ein neuer Chat muss den Projektstand aus dem Repository nachvollziehen und fortsetzen können, ohne alte Chats rekonstruieren zu müssen.
- Nach jedem relevanten Arbeitsblock werden mindestens dokumentiert: Nutzerentscheidung, fachlicher Stand, betroffene Komponenten/Dateien, tatsächliche Tests und Ergebnisse, Fehler/Blocker, aktueller Branch/PR/Exact Head, Veröffentlichungsstand sowie der nächste ausführbare Schritt.
- Bestätigte lokale Klickwege werden sofort anonymisiert in `CONFIRMED_WORKFLOWS.md` gepflegt.
- Der aktuelle Gesamtstand und alle Übergaben werden in `PROJECT_HANDOFF.md` gepflegt.
- Laufende größere Aufgaben erhalten bei Bedarf eine eigene `ACTIVE_WORK_*.md`, die im Handoff verlinkt wird.
- PR-Beschreibungen und relevante Statusdokumente müssen bei Head- oder Scope-Wechseln aktualisiert werden; veraltete Aussagen dürfen nicht als aktueller Stand stehen bleiben.
- Bild- und Echtdatenregeln bleiben vorrangig: Screenshots selbst werden trotz Dokumentationspflicht niemals nach GitHub übernommen. Dokumentiert werden ausschließlich anonymisierte, selbst formulierte Erkenntnisse.
