# DokoHilf – verbindliche Regel für „Fehler oder Hinweis melden“

**Status:** Verbindlich  
**Stand:** 13. August 2026

Diese Datei dokumentiert die bestätigte Produktspezifikation und Datenschutzgrenze für die öffentliche DokoHilf-Meldefunktion.

## Sichtbare Funktion

Die Meldefunktion ist **ausschließlich im Hauptmenü** sichtbar. Sie darf nicht in „Alle Anleitungen“, einzelnen Anleitungen, Chat- oder Sprachmodus eingeblendet werden.

Der Hauptmenü-Einstieg ist ein kompakter, zum dunklen DokoHilf-Design passender Hinweis mit dem Buttontext:

> Fehler oder Hinweis melden

Das Meldefenster enthält:

- eine Kategorie;
- eine kurze Beschreibung.

Der frühere Schalter `Aktuelle Stelle mitsenden` ist entfernt. Da die Meldung nur aus dem Hauptmenü geöffnet wird, gibt es keinen sinnvollen aktuellen Guide oder Schritt, der mitgesendet werden müsste.

Vor dem Absenden wird sichtbar gewarnt:

> Bitte keine Namen, Bewohner-/Klienten- oder Gesundheitsdaten eingeben.

Zusätzlich wird transparent angezeigt, dass automatisch ausschließlich die technische DokoHilf-Build-ID mitgesendet wird. Kein Guide, kein Schritt und keine Chatnachrichten.

Nach erfolgreichem Speichern erhält der Nutzer eine technische Meldungsnummer im Format `DH-XXXXXXXXXXXX`.

## Daten, die gespeichert werden dürfen

- technische UUID;
- technische Meldungsnummer;
- Kategorie;
- kurze Beschreibung;
- aktuelle DokoHilf-Build-ID;
- Erstellzeitpunkt.

Die bestehenden technischen Datenbankfelder `include_context`, `guide_slug` und `guide_step` bleiben aus Kompatibilitätsgründen bestehen. Für Meldungen der aktuellen Hauptmenü-Funktion gilt:

- `include_context = true`, weil die Build-ID technisch mitgeführt wird;
- `guide_slug = null`;
- `guide_step = null`.

Es gibt keinen Nutzer-Schalter mehr für diesen technischen Kontext.

## Daten, die die DokoHilf-Meldelogik nicht lesen oder speichern darf

- Chatnachrichten oder Chatverlauf;
- Audio oder Diktat;
- Screenshots;
- Guide-Slug oder Guide-Schritt aus dem aktuellen App-Zustand;
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

- Die Hauptmenü-Platzierung wird auf iOS 393×852 und Android 412×915 geprüft.
- Zusätzlich wird geprüft, dass der Feedback-Einstieg in „Alle Anleitungen“, einzelnen Anleitungen, Sprachmodus und Chatmodus nicht sichtbar ist.
- Das Meldefenster darf keinen `Aktuelle Stelle mitsenden`-Schalter enthalten.
- Der Client darf keinen aktuellen Guide oder Schritt auslesen.
- Ende-zu-Ende-Tests verwenden ausschließlich vollständig synthetische Meldungen.
- Vor Merge müssen die etablierten DokoHilf-Pflichtgates sowie der funktionsspezifische Feedback-Gate auf demselben exakten PR-Head grün sein.
- Erst nach vollständig verifiziertem `main`-/`gh-pages`-Publish darf der Hotfix als live bezeichnet werden.

## Versionsregel

Die Einführung der Meldefunktion erhöhte die öffentliche App-Version von v30 auf **v31**. Die jetzige Korrektur der Platzierung, Darstellung und des überflüssigen Kontext-Schalters ist ein kleiner v31-UX-Hotfix und kein neues größeres Funktionsrelease. Die sichtbare Produktversion bleibt deshalb **v31**. Ein eigener Feedback-/PWA-Revisionsmarker muss installierte DokoHilf-Versionen trotzdem zuverlässig aktualisieren.
