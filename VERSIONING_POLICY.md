# DokoHilf – verbindliche Versionsregel

**Status:** Verbindlich  
**Gilt für:** ausschließlich DokoHilf

## Zweck

Die unten in der App angezeigte Versionsbezeichnung (`DokoHilf v… · Build …`) muss den tatsächlich veröffentlichten größeren Produktstand widerspiegeln und darf nach größeren Updates nicht dauerhaft auf einer alten Version stehen bleiben.

## Verbindliche Regeln

- `version.json` enthält mit `appVersion` die aktuelle öffentliche DokoHilf-App-Version.
- Die unten in der App angezeigte Versionsbezeichnung muss exakt dieselbe `appVersion` verwenden.
- Bei einem **größeren Update** wird die App-Version erhöht, bevor der Release gemergt und veröffentlicht wird.
- Als größeres Update gelten insbesondere:
  - neue oder wesentlich erweiterte nutzerseitige Hauptfunktionen oder Anleitungen;
  - größere Änderungen an Sprachbedienung, Navigation, Chatlogik oder UI;
  - mehrere zusammengehörige nutzerseitige Änderungen, die als gemeinsamer Release veröffentlicht werden;
  - ein technischer Umbau, der das Verhalten der App für Nutzer deutlich verändert.
- Reine kleine Fehlerkorrekturen, Textkorrekturen oder technische Hotfixes ohne wesentliche Produktänderung benötigen nicht automatisch eine neue App-Version.
- Ein Versionssprung ändert **nicht automatisch** historische interne Dateinamen wie `*-v27.js`, `*-v28.js` oder `*-v29.js`, wenn diese aus Kompatibilitätsgründen bestehen bleiben. Solche Dateinamen dürfen aber nicht als aktuelle öffentliche App-Version missverstanden werden.
- Bei einem Versionssprung müssen alle **sichtbaren aktuellen Versionsangaben** in App, Release-Hinweisen, Statusdokumenten und GitHub-Actions-Bezeichnungen geprüft und bei Bedarf aktualisiert oder versionsneutral formuliert werden.
- Nach dem Merge muss auf dem öffentlichen Hauptlink geprüft werden, dass die neue App-Version unten tatsächlich angezeigt wird.

## Technische Absicherung

Der GitHub-Workflow `Validate app version policy` prüft bei Pull Requests und auf `main` mindestens:

1. `version.json.appVersion` existiert und hat das Format `v<Nummer>`.
2. Die Versionskonstante für die sichtbare App-Fußzeile stimmt exakt mit `version.json.appVersion` überein.
3. Die Fußzeile verwendet diese Versionskonstante tatsächlich für `DokoHilf v… · Build …`.
4. Diese Versionsregel bleibt im Repository vorhanden.

Ein Versions-Mismatch ist ein Release-Fehler und muss vor dem Merge behoben werden.
