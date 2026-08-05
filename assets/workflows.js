(() => {
  'use strict';

  function step(text, route, focus, stuck) {
    return { text, route, focus, stuck };
  }

  const WORKFLOWS = {
    reportNew: {
      title: 'Neuen Berichtseintrag anlegen',
      aliases: ['neuer bericht', 'bericht schreiben', 'bericht anlegen', 'berichtseintrag', 'etwas dokumentieren', 'dokumentieren'],
      steps: [
        step('Öffne oben in der grauen Leiste den festen Reiter „Berichte“.', ['Berichte'], 'Reiter „Berichte“', 'Prüfe die graue Leiste ganz oben. „Berichte“ ist ein eigener fester Reiter.'),
        step('Prüfe, ob der richtige Bewohner ausgewählt ist.', ['Berichte'], 'richtiger Bewohner', 'Der Name des ausgewählten Bewohners sollte im Arbeitsbereich sichtbar sein. Wähle sonst zuerst den richtigen Bewohner aus.'),
        step('Klicke oben links auf das grüne Plus.', ['Berichte'], 'grünes Plus oben links', 'Das Plus befindet sich oben links im Bereich „Berichte“. Es ist grün und mit einem Pluszeichen markiert.'),
        step('Wähle „Neuer Berichtseintrag“.', ['Berichte', '+'], 'Neuer Berichtseintrag', 'Nach dem Klick auf das grüne Plus öffnet sich ein kleines Menü. Dort steht „Neuer Berichtseintrag“.'),
        step('Wähle Datum und Uhrzeit für den Eintrag aus.', ['Berichte', 'Neuer Berichtseintrag'], 'Datum und Uhrzeit', 'Im geöffneten Fenster findest du Felder für Datum und Uhrzeit. Prüfe beides sorgfältig.'),
        step('Wähle die passende Kategorie aus.', ['Berichte', 'Neuer Berichtseintrag'], 'Kategorie', 'Öffne das Feld „Kategorie“ und wähle die Kategorie, die zum Inhalt des Berichts passt.'),
        step('Lege fest, ob der Eintrag wichtig für die Schichtübergabe ist: Ja oder Nein.', ['Berichte', 'Neuer Berichtseintrag'], 'Schichtübergabe: Ja oder Nein', 'Suche im Fenster die Einstellung zur Schichtübergabe und wähle bewusst „Ja“ oder „Nein“.'),
        step('Trage den Inhalt des Berichtseintrags ein.', ['Berichte', 'Neuer Berichtseintrag'], 'Inhalt eingeben', 'Schreibe den Bericht sachlich und prüfe ihn vor dem Speichern noch einmal.'),
        step('Bestätige den fertigen Eintrag unten mit „OK“.', ['Berichte', 'Neuer Berichtseintrag'], 'OK', 'Der Eintrag wird erst gespeichert, wenn du unten auf „OK“ klickst.')
      ]
    },
    reportStrike: {
      title: 'Berichtseintrag durchstreichen',
      aliases: ['bericht korrigieren', 'bericht durchstreichen', 'verschrieben', 'falscher bericht', 'bericht falsch', 'bericht bearbeiten'],
      steps: [
        step('Öffne den festen Reiter „Berichte“ und suche den falschen Eintrag.', ['Berichte'], 'falschen Eintrag auswählen', 'Achte darauf, dass du wirklich den richtigen Berichtseintrag auswählst.'),
        step('Mache einen Rechtsklick auf den betreffenden Berichtseintrag.', ['Berichte'], 'Rechtsklick auf den Eintrag', 'Öffne das Kontextmenü direkt auf dem falschen Berichtseintrag.'),
        step('Wähle „Eintrag bearbeiten“.', ['Berichte', 'Rechtsklick'], 'Eintrag bearbeiten', 'Im Kontextmenü findest du den Punkt „Eintrag bearbeiten“.'),
        step('Wähle anschließend „Durchstreichen“.', ['Berichte', 'Eintrag bearbeiten'], 'Durchstreichen', 'Der ursprüngliche Eintrag bleibt nachvollziehbar und wird als durchgestrichen gekennzeichnet.'),
        step('Gib im Optimalfall eine kurze, sachliche Begründung ein.', ['Berichte', 'Durchstreichen'], 'Begründung', 'Erkläre knapp, warum der Eintrag durchgestrichen wird, zum Beispiel „falscher Bewohner“ oder „Eingabefehler“.'),
        step('Bestätige unten mit „OK“.', ['Berichte', 'Durchstreichen'], 'OK', 'Prüfe die Begründung und bestätige den Vorgang mit „OK“.')
      ]
    },
    executionChoice: {
      title: 'Durchführungsnachweis bearbeiten',
      aliases: ['durchführungsnachweis', 'durchfuehrungsnachweis', 'durchführung', 'durchfuehrung', 'nachweis'],
      choice: [
        { label: 'Abweichung dokumentieren', target: 'executionDeviation' },
        { label: 'Durchführung stornieren', target: 'executionCancel' }
      ]
    },
    executionDeviation: {
      title: 'Abweichung dokumentieren',
      aliases: ['abweichung dokumentieren', 'nicht stattgefunden', 'anders durchgeführt', 'anders durchgefuehrt'],
      steps: [
        step('Öffne „Doku“ und danach „Durchführungsnachweis“.', ['Doku', 'Durchführungsnachweis'], 'Durchführungsnachweis', 'Der Durchführungsnachweis liegt im Bereich „Doku“.'),
        step('Mache einen Rechtsklick auf den betreffenden Nachweis.', ['Doku', 'Durchführungsnachweis'], 'Rechtsklick auf den Nachweis', 'Klicke direkt auf die Zeile, zu der du eine Abweichung dokumentieren möchtest.'),
        step('Wähle „Abweichung dokumentieren“.', ['Durchführungsnachweis', 'Rechtsklick'], 'Abweichung dokumentieren', 'Nutze diese Funktion, wenn etwas nicht stattgefunden hat oder anders dokumentiert werden muss.'),
        step('Trage die Abweichung beziehungsweise den Grund verständlich ein.', ['Durchführungsnachweis', 'Abweichung'], 'Grund oder Abweichung', 'Beschreibe kurz und sachlich, was abgewichen ist.'),
        step('Bestätige den Vorgang mit „OK“.', ['Durchführungsnachweis', 'Abweichung'], 'OK', 'Prüfe deine Eingabe und bestätige sie mit „OK“.')
      ]
    },
    executionCancel: {
      title: 'Durchführung stornieren',
      aliases: ['durchführung stornieren', 'durchfuehrung stornieren', 'falsch dokumentiert', 'nachweis stornieren'],
      steps: [
        step('Öffne „Doku“ und danach „Durchführungsnachweis“.', ['Doku', 'Durchführungsnachweis'], 'Durchführungsnachweis', 'Der Durchführungsnachweis liegt im Bereich „Doku“.'),
        step('Suche den bereits falsch dokumentierten Eintrag.', ['Doku', 'Durchführungsnachweis'], 'falschen Eintrag auswählen', 'Prüfe Datum, Uhrzeit und Bewohner, bevor du fortfährst.'),
        step('Mache einen Rechtsklick auf den Eintrag.', ['Durchführungsnachweis'], 'Rechtsklick auf den Eintrag', 'Das benötigte Menü erscheint direkt am ausgewählten Eintrag.'),
        step('Wähle „Durchführung stornieren“.', ['Durchführungsnachweis', 'Rechtsklick'], 'Durchführung stornieren', 'Nutze „Durchführung stornieren“, wenn eine bereits dokumentierte Durchführung falsch ist.'),
        step('Gib den Grund für die Stornierung ein.', ['Durchführungsnachweis', 'Stornieren'], 'Grund eingeben', 'Die Begründung sollte kurz, sachlich und nachvollziehbar sein.'),
        step('Bestätige mit „OK“.', ['Durchführungsnachweis', 'Stornieren'], 'OK', 'Prüfe den Grund und bestätige die Stornierung mit „OK“.')
      ]
    },
    visit: {
      title: 'Visite hinzufügen',
      aliases: ['visite', 'visiten', 'visite anlegen', 'visite hinzufügen'],
      steps: [
        step('Öffne oben „Doku erweitert“.', ['Doku erweitert'], 'Reiter „Doku erweitert“', 'Der Bereich befindet sich oben in der Hauptleiste.'),
        step('Wähle „Visiten“.', ['Doku erweitert', 'Visiten'], 'Visiten', 'Im Bereich „Doku erweitert“ findest du den Punkt „Visiten“.'),
        step('Prüfe, ob der richtige Bewohner ausgewählt ist.', ['Doku erweitert', 'Visiten'], 'richtiger Bewohner', 'Kontrolliere den Bewohner, bevor du einen neuen Eintrag anlegst.'),
        step('Klicke oben links auf das grüne Plus.', ['Visiten'], 'grünes Plus oben links', 'Das grüne Plus legt eine neue Visite an.'),
        step('Trage die Angaben zur Visite vollständig ein.', ['Visiten', '+'], 'Angaben zur Visite', 'Fülle die angezeigten Felder sorgfältig aus.'),
        step('Bestätige den fertigen Eintrag mit „OK“.', ['Visiten'], 'OK', 'Prüfe deine Angaben und bestätige sie mit „OK“.')
      ]
    },
    vitals: {
      title: 'Vitalwerte öffnen',
      aliases: ['vitalwerte', 'vitalwert', 'blutdruck', 'puls', 'temperatur', 'gewicht'],
      steps: [
        step('Vitalwerte kannst du über „Doku“ oder über „Doku erweitert“ öffnen.', ['Doku', 'Doku erweitert'], 'einen der beiden Bereiche öffnen', 'Beide Wege führen zu den Vitalwerten. Nimm den Bereich, den du gerade offen hast.'),
        step('Wähle dort den Punkt „Vitalwerte“.', ['Doku oder Doku erweitert', 'Vitalwerte'], 'Vitalwerte', 'Suche in der jeweiligen Liste nach „Vitalwerte“.'),
        step('Prüfe den ausgewählten Bewohner.', ['Vitalwerte'], 'richtiger Bewohner', 'Kontrolliere den Bewohner, bevor du Werte ansiehst oder einträgst.'),
        step('Jetzt kannst du vorhandene Werte ansehen. Für einen neuen Wert nutzt du das grüne Plus.', ['Vitalwerte'], 'Werte ansehen oder grünes Plus', 'Vor dem Speichern neuer Werte immer Einheit, Datum und Bewohner prüfen.')
      ]
    },
    medication: {
      title: 'Medikation ansehen',
      aliases: ['medikation', 'medikationen', 'medikamente', 'medikament'],
      steps: [
        step('Öffne oben „Doku erweitert“.', ['Doku erweitert'], 'Doku erweitert', 'Der Bereich befindet sich oben in der Hauptleiste.'),
        step('Wähle „Medikationen“.', ['Doku erweitert', 'Medikationen'], 'Medikationen', 'Dort kannst du die Medikation ansehen. Für diese Hilfe ist kein neuer Eintrag nötig.'),
        step('Prüfe, ob der richtige Bewohner ausgewählt ist.', ['Medikationen'], 'richtiger Bewohner', 'Kontrolliere den Namen des Bewohners, bevor du Angaben liest.')
      ]
    },
    attendance: {
      title: 'An- oder Abwesenheit öffnen',
      aliases: ['anwesenheit', 'abwesenheit', 'anwesend', 'abwesend', 'an und abwesenheit'],
      steps: [
        step('Öffne oben den Reiter „Doku“.', ['Doku'], 'Reiter „Doku“', 'Der Bereich „Doku“ liegt oben in der Hauptleiste.'),
        step('Wähle „An- und Abwesenheit“.', ['Doku', 'An- und Abwesenheit'], 'An- und Abwesenheit', 'Dort werden An- und Abwesenheiten bearbeitet.'),
        step('Wähle den richtigen Bewohner aus.', ['An- und Abwesenheit'], 'richtiger Bewohner', 'Prüfe den Namen, bevor du den Status änderst.'),
        step('Trage die passende An- oder Abwesenheit ein und bestätige den Vorgang.', ['An- und Abwesenheit'], 'Status eintragen und bestätigen', 'Prüfe Zeitraum und Status sorgfältig, bevor du speicherst.')
      ]
    },
    easyPlan: {
      title: 'EasyPlan öffnen',
      aliases: ['easyplan', 'easy plan', 'planung', 'dienstplanung'],
      steps: [
        step('Öffne oben den Reiter „Planung“.', ['Planung'], 'Reiter „Planung“', 'Der Reiter „Planung“ befindet sich in der oberen Hauptleiste.'),
        step('Wähle dort „EasyPlan“.', ['Planung', 'EasyPlan'], 'EasyPlan', 'Der Menüpunkt heißt „EasyPlan“, nicht „Easy-Sammlung“.')
      ]
    },
    tasks: {
      title: 'Aktuelles und Kalender öffnen',
      aliases: ['aufgaben', 'aktuelles', 'kalender', 'termine'],
      steps: [
        step('Öffne oben den Reiter „Aufgaben“.', ['Aufgaben'], 'Reiter „Aufgaben“', 'Der Reiter befindet sich oben in der Hauptleiste.'),
        step('Wähle darunter „Aktuelles“.', ['Aufgaben', 'Aktuelles'], 'Aktuelles', 'Im Bereich „Aktuelles“ befindet sich auch die Kalenderfunktion.'),
        step('Öffne dort die Kalenderfunktion, wenn du Termine beziehungsweise aktuelle Aufgaben sehen möchtest.', ['Aufgaben', 'Aktuelles'], 'Kalenderfunktion', 'Der Kalenderausbau ist für eine spätere Version vorgesehen; der Weg dorthin ist bereits erklärt.')
      ]
    },
    masterData: {
      title: 'Stammdaten öffnen',
      aliases: ['stammdaten', 'bewohner öffnen', 'bewohnerdaten', 'doppelklick'],
      steps: [
        step('Suche den gewünschten Bewohner in der Bewohnerliste.', ['Bewohnerliste'], 'Bewohner auswählen', 'Achte darauf, den richtigen Bewohner zu wählen.'),
        step('Mache einen Doppelklick auf den Bewohner.', ['Bewohnerliste'], 'Doppelklick auf Bewohner', 'Durch den Doppelklick öffnen sich die Stammdaten.'),
        step('Die Stammdaten des Bewohners sind jetzt geöffnet.', ['Stammdaten'], 'Stammdaten', 'Prüfe oben den Namen, bevor du Angaben ansiehst.')
      ]
    },
    handover: {
      title: 'Übergabeformular öffnen',
      aliases: ['übergabeformular', 'uebergabeformular', 'übergabe', 'uebergabe', 'was war los'],
      steps: [
        step('Öffne oben den Hauptreiter „Analyse“.', ['Analyse'], 'Reiter „Analyse“', 'Der Bereich befindet sich oben in der Hauptleiste.'),
        step('Wähle „Was war los“.', ['Analyse', 'Was war los'], 'Was war los', 'Unter „Was war los“ findest du das Übergabeformular.'),
        step('Öffne das Übergabeformular.', ['Analyse', 'Was war los'], 'Übergabeformular', 'Dort kannst du die für die Übergabe benötigten Informationen ansehen.')
      ]
    },
    query: {
      title: 'Berichtseintrag gezielt suchen',
      aliases: ['abfrage', 'bericht suchen', 'bericht finden', 'eintrag suchen', 'gezielt suchen'],
      steps: [
        step('Öffne oben den Hauptreiter „Analyse“.', ['Analyse'], 'Reiter „Analyse“', 'Der Bereich befindet sich oben in der Hauptleiste.'),
        step('Wähle dort „Abfrage“.', ['Analyse', 'Abfrage'], 'Abfrage', 'Mit der Abfrage kannst du gezielt nach Berichtseinträgen suchen.'),
        step('Wähle den gewünschten Bewohner und die passenden Suchkriterien.', ['Analyse', 'Abfrage'], 'Bewohner und Suchkriterien', 'Grenze die Suche möglichst genau ein, zum Beispiel nach Bewohner oder Zeitraum.'),
        step('Starte die Abfrage und öffne den passenden Berichtseintrag aus der Ergebnisliste.', ['Analyse', 'Abfrage'], 'Abfrage starten', 'Prüfe die Treffer anhand von Datum, Bewohner und Inhalt.')
      ]
    }
  };

  window.DOKOHILF_WORKFLOWS = WORKFLOWS;
})();
