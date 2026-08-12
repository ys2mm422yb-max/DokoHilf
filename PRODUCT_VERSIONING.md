# DokoHilf – sichtbare Produktversion

**Status:** verbindliche Ergänzung zu `PROJECT_RULES.md`  
**Aktueller Stand:** `v30`

Die unten in DokoHilf sichtbare Angabe `DokoHilf vN · Build …` ist die **Produktversion für Nutzer**. Sie ist von technischen Dateinamen wie `v27`, `v28`, `v29` oder internen Hotfix-/Revisionsnummern getrennt.

## Verbindliche Regel

Bei einem **größeren, für Nutzer merkbaren Update** muss die sichtbare Produktversion vor der Veröffentlichung geprüft und bei einem Versionssprung aktualisiert werden. Dazu zählen insbesondere:

- eine neue größere Funktion oder ein neuer öffentlich sichtbarer Funktionsbereich;
- eine größere Änderung an Navigation, Oberfläche oder Bedienkonzept;
- eine größere Änderung am Sprachverhalten, die mehrere Abläufe betrifft;
- ein größerer Ausbau der Anleitungsbibliothek oder eine vergleichbare Produktstufe.

Kleine Textkorrekturen, einzelne Fehlerbehebungen und technische Hardening-Änderungen erzwingen nicht automatisch einen neuen Produktversionssprung.

## Source of Truth und Pflichtprüfung

- `version.json` enthält die aktuelle sichtbare Produktversion unter `productVersion`.
- `assets/release-polish-v29.js` muss im Footer exakt dieselbe Version anzeigen.
- `tests/product-version-policy.test.mjs` vergleicht beide Werte. Ein Unterschied lässt den exakten PR-Head fehlschlagen.
- Vor dem Merge eines größeren Produktupdates ist ausdrücklich zu prüfen, ob `productVersion` hochgesetzt werden muss.
- Nach dem Merge muss die tatsächlich veröffentlichte App unten die erwartete neue Produktversion anzeigen.

Technische Bestandsdateien mit älteren Versionsnummern werden nicht allein wegen eines Produktversionssprungs umbenannt. Ihre Nummer ist eine Implementierungs-/Kompatibilitätsbezeichnung und darf nicht mit der sichtbaren Produktversion verwechselt werden.
