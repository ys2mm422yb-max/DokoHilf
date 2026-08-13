# DokoHilf – verbindliche Regel für „Fehler oder Hinweis melden“

**Status:** Verbindlich  
**Stand:** 13. August 2026

Diese Datei dokumentiert die bestätigte Produktspezifikation und Datenschutzgrenze für die öffentliche DokoHilf-Meldefunktion.

## Sichtbare Funktion

Unten in der App steht dezent:

> DokoHilf befindet sich noch in der Testphase. Fehler oder fehlende Information gefunden?

Der Button heißt:

> Fehler oder Hinweis melden

Das Meldefenster enthält:

- eine Kategorie;
- eine kurze Beschreibung;
- den optionalen Schalter `Aktuelle Stelle mitsenden`.

Vor dem Absenden wird sichtbar gewarnt:

> Bitte keine Namen, Bewohner-/Klienten- oder Gesundheitsdaten eingeben.

Nach erfolgreichem Speichern erhält der Nutzer eine technische Meldungsnummer im Format `DH-XXXXXXXXXXXX`.

## Daten, die gespeichert werden dürfen

Immer:

- technische UUID;
- technische Meldungsnummer;
- Kategorie;
- kurze Beschreibung;
- Erstellzeitpunkt;
- Information, ob der optionale Kontext aktiviert wurde.

Nur wenn der Nutzer `Aktuelle Stelle mitsenden` ausdrücklich aktiviert:

- Build-ID;
- aktueller Guide-Slug;
- aktueller Schritt.

## Daten, die die DokoHilf-Meldelogik nicht lesen oder speichern darf

- Chatnachrichten oder Chatverlauf;
- Audio oder Diktat;
- Screenshots;
- Namen oder absichtlich vorgesehene Personenfelder;
- Bewohner-, Klienten-, Patienten- oder Gesundheitsdaten;
- IP-Adresse;
- User-Agent;
- Gerätekennung oder Fingerprint;
- Cookie;
- Session-ID;
- Nutzerkennung oder Konto-ID.

DokoHilf bleibt kontenfrei. Die Meldefunktion darf keine Nutzer- oder Gerätewiedererkennung einführen.

## Speicherung und Zugriff

- Meldungen werden ausschließlich privat in Supabase gespeichert.
- Die Datentabelle liegt im nicht öffentlich als Data-API-Schema vorgesehenen Schema `private`.
- `public`, `anon` und `authenticated` erhalten keine Tabellen-/Schema-Leserechte.
- RLS ist zusätzlich aktiviert; es gibt keine öffentliche Lesepolicy.
- Der Insert-RPC `public.dokohilf_store_feedback(...)` ist ausschließlich für `service_role` ausführbar.
- Der Browser erhält niemals den Service-Role-Key.
- Der öffentliche Edge-Function-Endpunkt validiert Origin, Requestgröße, Kategorie und Felder und speichert nur die oben definierten Werte.

## Missbrauchsschutz

Der Missbrauchsschutz darf keine Personen- oder Gerätekennung benötigen. Aktuell gilt ein globaler, identifier-freier Volumen-Grenzwert von höchstens 30 gespeicherten Meldungen pro Minute insgesamt.

## Tests und Veröffentlichung

- Datenbankänderungen werden vor produktiver Anwendung zuerst transaktional mit vollständigem Rollback geprüft.
- Ende-zu-Ende-Tests verwenden ausschließlich vollständig synthetische Meldungen.
- Eine synthetische produktive Testmeldung wird nach erfolgreicher Prüfung wieder entfernt.
- Vor Merge müssen die etablierten DokoHilf-Pflichtgates sowie der funktionsspezifische Feedback-Gate auf demselben exakten PR-Head grün sein.
- Nach produktiver Aktivierung werden private Nicht-Lesbarkeit und die tatsächlich gespeicherte Feldmenge erneut geprüft.
- Erst danach darf der Release gemergt und als live bezeichnet werden.

## Versionsregel

Die Einführung der Meldefunktion ist ein größeres, für Nutzer sichtbares Funktionsupdate. Der Release erhöht deshalb gemäß `VERSIONING_POLICY.md` und `PROJECT_RULES.md` die öffentliche App-Version von v30 auf **v31**. Historische interne Dateinamen mit älteren Versionsnummern sind keine öffentliche Produktversion.
