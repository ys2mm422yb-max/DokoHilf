# DokoHilf – verbindliche Projektregeln

**Status:** Verbindlich  
**Stand:** 5. August 2026

> Diese Datei ist vor jeder Arbeit an DokoHilf vollständig zu lesen. Bei rechtlicher, datenschutzrechtlicher oder technischer Unsicherheit gilt: stoppen, nichts veröffentlichen, keine Daten importieren und keine Echtdaten verwenden.

## 1. Strikte Projekttrennung

- Ausschließliches GitHub-Repository: `ys2mm422yb-max/DokoHilf`.
- Ausschließliches Supabase-Projekt: Projekt-ID `efifbuqctylsujiauabg`, Region Frankfurt (`eu-central-1`).
- `DungeonVeil`, `Runeborn`, `dungeon` und jedes andere GitHub- oder Supabase-Projekt dürfen nicht geöffnet, verändert, verbunden oder als Vorlage beziehungsweise Deployment-Ziel benutzt werden.
- Vor jeder Schreibaktion müssen Owner, Repository, Branch und Supabase-Projekt-ID geprüft werden.
- Keine projektübergreifenden Secrets, Umgebungsvariablen, Datenbanken, Buckets oder Deployments.
- Kein Auto-Merge und kein automatisches Löschen von Branches.

## 2. Öffentlicher Name

- In öffentlich sichtbaren Repository-, Projekt-, Funktions-, Seiten- und Produktnamen wird ausschließlich **DokoHilf** verwendet.
- Der Name der eingesetzten Fremdsoftware erscheint nur intern dort, wo er für Rechts-, Lizenz- oder Freigabeprüfungen zwingend erforderlich ist.
- Keine Logos oder Marken des Softwareherstellers ohne konkrete schriftliche Freigabe.
- Die Anwendung darf nicht wie ein offizielles Produkt oder eine offizielle Partnerschaft wirken.

## 3. Zweck und technische Grenzen

- DokoHilf ist eine unabhängige interne Bedienungs- und Lernhilfe.
- Keine Verbindung zu produktiven Dokumentationsdatenbanken.
- Kein Scraping, Reverse Engineering, automatisiertes Auslesen oder Nutzen nicht dokumentierter Schnittstellen.
- Keine Speicherung von Zugangsdaten der eingesetzten Fremdsoftware.
- Keine medizinischen, pflegerischen oder betreuerischen Entscheidungen durch die Anwendung.
- Antworten stammen nur aus redaktionell gepflegten und freigegebenen Anleitungen. Keine frei erfundenen KI-Antworten zu internen Abläufen.

## 4. Urheber-, Marken- und Lizenzschutz

- Keine Handbücher, FAQs, Videos, Tabellen, Grafiken, Schulungsunterlagen oder Texte des Herstellers kopieren oder nur oberflächlich umformulieren.
- Inhalte aus geschützten Kundenportalen dürfen nicht übernommen oder veröffentlicht werden.
- Anleitungen werden vollständig selbst formuliert.
- Vor Nutzung offizieller Screenshots, Grafiken, Logos oder Textbausteine müssen Nutzungsrechte und betriebliche Freigabe schriftlich geklärt sein.
- Der Lizenzvertrag des Arbeitgebers mit dem Softwarehersteller muss vor produktivem Einsatz geprüft werden.

## 5. Screenshots und Abbildungen

- Bevorzugt werden neutrale, selbst erstellte schematische Abbildungen.
- Original-Screenshots nur aus einem ausdrücklich freigegebenen Test- oder Schulungssystem.
- Keine Screenshots aus produktiven Bewohner- oder Klientenakten.
- Keine echten Namen, Initialen, Fotos, Geburtsdaten, Bewohnernummern, Diagnosen, Medikamente, Termine, Berichte, Adressen oder Kontaktdaten.
- Schwärzungen müssen endgültig sein. Keine wiederherstellbaren Ebenen, Overlays, Metadaten oder zuschneidbaren Ränder.
- Bilder werden vor Upload neu exportiert und auf EXIF- und Vorschau-Metadaten geprüft.
- Interne Bilder niemals öffentlich im Repository speichern; nur in einem privaten Storage-Bucket mit geprüften Zugriffsregeln.

## 6. Vollständiges Echtdatenverbot

Bis zur schriftlichen Freigabe durch Arbeitgeber, IT und Datenschutz gilt:

- keine Bewohner-, Klienten-, Patienten- oder Angehörigendaten;
- keine Gesundheitsdaten;
- keine echten Berichte, Übergaben, Medikamentenpläne oder Termine;
- keine echten Mitarbeiterdaten außer technisch notwendigen Projekt-Testkonten;
- keine Exporte aus der eingesetzten Dokumentationssoftware;
- keine Echtdaten in Logs, Fehlermeldungen, Screenshots, Issues, Commits oder Pull Requests.

Testdaten müssen vollständig erfunden sein und dürfen keiner realen Person nachgebildet werden.

## 7. Datenschutz

- Datensparsamkeit, Zweckbindung und definierte Löschfristen.
- Keine Werbung, Nutzertracking, Analyse-SDKs, Social-Media-Pixel oder unnötigen Cookies.
- Suchanfragen, IP-Adressen und Nutzungsverläufe werden nicht dauerhaft gespeichert, solange kein genehmigter Zweck und keine Löschfrist bestehen.
- Vor Produktivstart müssen Verantwortlicher, Rechtsgrundlage, Datenschutzhinweis, Löschkonzept, Berechtigungskonzept und Auftragsverarbeitungsverträge geklärt sein.
- Eine EU-Region ersetzt keine vollständige DSGVO-Prüfung.

## 8. Supabase-Sicherheit

- Jede exponierte Tabelle erhält Row Level Security (RLS).
- `anon` erhält keinen Zugriff auf interne Inhalte.
- Öffentliche Selbstregistrierung bleibt deaktiviert; Nutzer werden kontrolliert eingeladen oder freigeschaltet.
- Normale Mitarbeitende lesen, Redakteure bearbeiten freigegebene Inhalte, Administratoren verwalten Konten und Rollen.
- Rollen niemals aus nutzerveränderbarem `user_metadata` ableiten.
- `service_role`, Secret Keys, Datenbankpasswörter und privilegierte Schlüssel niemals im Browser, Repository, Issue, Chat oder Screenshot speichern.
- Im Frontend nur Publishable Key und nur zusammen mit geprüften RLS-Regeln.
- Storage-Buckets mit internen Bildern bleiben privat.
- Jede Migration enthält Grants, RLS und Policies.
- Vor Veröffentlichung Security Advisor und Zugriffstests prüfen.

## 9. GitHub und Secrets

- Repository bleibt zunächst privat.
- Keine Echtdaten im Repository oder in der Git-Historie.
- Keine `.env`-Dateien oder Secrets committen.
- Dependencies sparsam einsetzen, Versionen festlegen und Lockfile committen.
- Keine internen Screenshots oder Fallinformationen in Issues und Pull Requests.
- Interne Inhalte dürfen nicht im statischen HTML- oder JavaScript-Bundle liegen.

## 10. Veröffentlichung und fester Hauptlink

- Einziger fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`.
- Dieser Link wird nicht als „Testlink“ bezeichnet, sondern als fester öffentlicher Hauptlink beziehungsweise fester DokoHilf-Link.
- Veröffentlichte Änderungen dürfen nur über diesen Link bereitgestellt und gegenüber Nutzern genannt werden.
- Keine wechselnden Vorschau-, Versions-, Cache-, Branch- oder Ausweichlinks nennen.
- Keine Queryparameter oder künstlichen Cache-Links als alternative öffentliche Adresse verwenden.
- Öffentliche Prototypen enthalten ausschließlich Fantasiedaten und neutrale Abbildungen.
- Eine öffentlich erreichbare Loginseite bedeutet nicht, dass interne Inhalte öffentlich sein dürfen.
- Produktives Hosting und Login müssen vor Einsatz durch Arbeitgeber und IT freigegeben werden.
- Bis dahin nur inhaltsleere Demos beziehungsweise Fantasiedaten veröffentlichen.

## 11. Erforderliche Freigaben vor echtem Einsatz

- Einrichtungsleitung beziehungsweise Arbeitgeber;
- IT;
- Datenschutzbeauftragte Stelle;
- Prüfung der Lizenz- und Nutzungsrechte;
- Freigabe für Screenshots und Markenhinweise;
- Berechtigungs- und Offboarding-Prozess;
- Datenschutzhinweis für Mitarbeitende;
- Backup-, Lösch-, Update- und Sicherheitskonzept;
- Notfall- und Abschaltprozess.

Private Konten dürfen nicht ohne ausdrückliche betriebliche Entscheidung dauerhaft die alleinige Produktiv-Infrastruktur der Einrichtung bleiben.

## 12. Freigabecheck für jede Anleitung

Eine Anleitung darf erst veröffentlicht werden, wenn alle Punkte erfüllt sind:

- vollständig selbst formulierter Text;
- keine echten Personen- oder Gesundheitsdaten;
- Abbildungen endgültig anonymisiert oder reine Testdaten;
- Nutzungsrecht der Abbildung dokumentiert;
- kein Eindruck eines offiziellen Herstellerprodukts;
- fachlich von einer zuständigen Person geprüft;
- Prüfdatum und verantwortliche Rolle hinterlegt;
- alte oder falsche Versionen gesperrt;
- nur berechtigte Nutzer können zugreifen;
- keine internen Inhalte im öffentlichen Repository oder Frontend-Bundle.

Bei einem Nein: keine Veröffentlichung.

## 13. Harte Stop-Regeln

Die Arbeit wird sofort gestoppt, wenn:

- Repository oder Supabase-Projekt-ID nicht eindeutig sind;
- ein anderes Projekt betroffen sein könnte;
- echte Bewohner- oder Gesundheitsdaten auftauchen;
- ein Screenshot nicht nachweislich freigegeben und endgültig anonymisiert ist;
- fremde Handbuchtexte übernommen werden sollen;
- ein geheimer Schlüssel im Frontend oder Repository landen würde;
- eine Veröffentlichung interne Inhalte öffentlich sichtbar machen könnte;
- eine notwendige rechtliche oder betriebliche Freigabe fehlt.

Dann darf nur eine sichere, datenfreie Alternative vorbereitet werden.

## 14. Hinweis

Diese Regeln sind ein technisches und organisatorisches Schutzkonzept, keine anwaltliche Rechtsberatung und keine betriebliche Datenschutzfreigabe.