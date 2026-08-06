-- DokoHilf blocks 1-4: user-confirmed, anonymized click paths only.
-- No screenshots, names, resident data or other production content are stored here.

insert into public.dokohilf_guides (
  slug, title, aliases, steps, troubleshooting, status, version,
  reviewed_at, reviewed_role, approved_at, change_note
) values
(
  'bericht-neu',
  'Neuen Berichtseintrag erfassen',
  array[
    'neuer bericht', 'bericht schreiben', 'bericht verfassen', 'berichtseintrag verfassen',
    'bericht anlegen', 'neuen berichtseintrag', 'bericht erfassen', 'dokumentation schreiben',
    'doku schreiben', 'eintrag machen', 'etwas dokumentieren', 'pflegebericht schreiben'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.', 'check', 'Ist der richtige Bewohner geöffnet und bist du im Bereich „Berichte“?', 'stuck', 'Wähle zuerst den gewünschten Bewohner und suche danach in der festen Leiste nach „Berichte“.'),
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus für einen neuen Berichtseintrag.', 'check', 'Hat sich die Auswahl der Berichtskategorie geöffnet?', 'stuck', 'Das grüne Plus befindet sich oben links im Bereich „Berichte“.'),
    jsonb_build_object('text', 'Wähle die passende Berichtskategorie aus. Danach öffnet sich die Eingabemaske für den Bericht.', 'check', 'Ist die richtige Kategorie ausgewählt und die Eingabemaske geöffnet?'),
    jsonb_build_object('text', 'Nur bei „Kontakt – alles außer Arzt“ und „Sturzereignis“: Prüfe das automatisch zugeordnete Protokoll. Wird es nicht benötigt, klicke zuerst auf den Protokollnamen und danach oben rechts auf das kleine rote X. Das entfernt nur die Protokollverknüpfung, nicht den Bericht.', 'check', 'Ist das zusätzliche Protokoll so verknüpft oder entfernt, wie du es brauchst?', 'stuck', 'Das kleine rote X wird erst nutzbar, nachdem du den angezeigten Protokollnamen angeklickt hast.'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und ändere sie nur, wenn der tatsächliche Dokumentationszeitpunkt abweicht.', 'check', 'Sind Datum und Uhrzeit korrekt?'),
    jsonb_build_object('text', 'Trage den Berichtstext ein. Verwende in Übungen ausschließlich Fantasiedaten.', 'check', 'Ist der Berichtstext vollständig eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“.', 'check', 'Wurde der Bericht gespeichert?'),
    jsonb_build_object('text', 'Kontrolliere, ob der neue Berichtseintrag im Berichteblatt sichtbar ist.', 'check', 'Ist der neue Berichtseintrag sichtbar?')
  ),
  jsonb_build_object(
    'protokoll_kontakt', 'Bei „Kontakt – alles außer Arzt“ ist automatisch ein Fallgespräch verknüpft. Lasse es bestehen, wenn es benötigt wird. Andernfalls Protokollnamen anklicken und mit dem kleinen roten X entfernen.',
    'protokoll_sturz', 'Bei „Sturzereignis“ kann automatisch ein zusätzliches Protokoll verknüpft sein. Entferne es nur, wenn es nicht benötigt wird.',
    'rotes_x', 'Das kleine rote X entfernt ausschließlich die Verknüpfung des zusätzlichen Protokolls. Der Bericht bleibt erhalten.'
  ),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Kategorieauswahl vor der Eingabemaske sowie Sonderfall der automatisch verknüpften Protokolle ergänzt.'
),
(
  'bericht-folgebericht',
  'Folgebericht zu einem bestehenden Bericht erstellen',
  array['folgebericht', 'folgebericht erstellen', 'bericht fortsetzen', 'zu bericht weiteren bericht schreiben', 'anschlussbericht', 'bericht weiterführen'],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne beim gewünschten Bewohner den Bereich „Berichte“.', 'check', 'Bist du im Bereich „Berichte“?'),
    jsonb_build_object('text', 'Suche den Bericht, zu dem du einen Folgebericht erstellen möchtest.', 'check', 'Hast du den ursprünglichen Bericht gefunden?'),
    jsonb_build_object('text', 'Klicke den ursprünglichen Bericht mit der rechten Maustaste an.', 'check', 'Ist das Kontextmenü geöffnet?'),
    jsonb_build_object('text', 'Wähle „Folgebericht erstellen“.', 'check', 'Hat sich die Eingabemaske für den Folgebericht geöffnet?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage den Inhalt des Folgeberichts ein. In Übungen nur Fantasiedaten verwenden.', 'check', 'Ist der Folgebericht vollständig eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ und kontrolliere, ob der Folgebericht beim Bewohner sichtbar ist.', 'check', 'Ist der Folgebericht sichtbar?')
  ),
  jsonb_build_object('kontextmenue', 'Klicke direkt auf den ursprünglichen Bericht und nicht auf eine freie Stelle in der Liste.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Folgebericht als eigener, bestätigter Kontextmenü-Ablauf ergänzt.'
),
(
  'bericht-durchstreichen',
  'Bestehenden Berichtseintrag durchstreichen',
  array[
    'bericht durchstreichen', 'berichtseintrag durchstreichen', 'falscher bericht', 'eintrag korrigieren',
    'fehler im bericht', 'bericht löschen', 'bericht stornieren', 'bericht entfernen',
    'bericht rückgängig machen', 'falschen bericht wegmachen'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Ein Bericht wird nicht endgültig gelöscht. Öffne beim gewünschten Bewohner den Bereich „Berichte“.', 'check', 'Bist du im Bereich „Berichte“?'),
    jsonb_build_object('text', 'Suche den falschen Berichtseintrag und klicke ihn mit der rechten Maustaste an.', 'check', 'Ist das Kontextmenü geöffnet?'),
    jsonb_build_object('text', 'Wähle „Eintrag bearbeiten“.', 'check', 'Ist das Fenster „Eintrag bearbeiten“ geöffnet?'),
    jsonb_build_object('text', 'Wähle „Durchstreichen“.', 'check', 'Ist „Durchstreichen“ ausgewählt?'),
    jsonb_build_object('text', 'Trage im Feld „Bemerkung zur Bearbeitung“ einen nachvollziehbaren Grund ein.', 'check', 'Ist die Bemerkung zur Bearbeitung eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“.', 'check', 'Wurde die Bearbeitung bestätigt?'),
    jsonb_build_object('text', 'Kontrolliere, ob der Bericht sichtbar durchgestrichen ist.', 'check', 'Ist der Eintrag sichtbar durchgestrichen?')
  ),
  jsonb_build_object('nicht_loeschen', 'Berichte werden zur Nachvollziehbarkeit durchgestrichen und nicht endgültig gelöscht.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Exakte Bezeichnung „Bemerkung zur Bearbeitung“ und bestätigter Abschluss ergänzt.'
),
(
  'durchfuehrung-storno',
  'Falsch abgezeichnete Durchführung stornieren',
  array[
    'durchführung stornieren', 'durchführungsnachweis stornieren', 'falsch abgezeichnet',
    'falsch abgezeichnete durchführung', 'nachweis rückgängig machen', 'maßnahme stornieren',
    'falschen nachweis entfernen'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne „Doku“.', 'check', 'Bist du im Reiter „Doku“?'),
    jsonb_build_object('text', 'Öffne den „Durchführungsnachweis“.', 'check', 'Ist der Durchführungsnachweis geöffnet?'),
    jsonb_build_object('text', 'Suche die falsch abgezeichnete Durchführung.', 'check', 'Hast du den richtigen Eintrag gefunden?'),
    jsonb_build_object('text', 'Klicke den Eintrag mit der rechten Maustaste an.', 'check', 'Ist das Kontextmenü geöffnet?'),
    jsonb_build_object('text', 'Wähle „Durchführung stornieren“.', 'check', 'Ist das Storno-Fenster geöffnet?'),
    jsonb_build_object('text', 'Trage einen nachvollziehbaren Stornogrund ein und bestätige mit „OK“. In Übungen nur Fantasiedaten verwenden.', 'check', 'Ist der Grund eingetragen und bestätigt?'),
    jsonb_build_object('text', 'Kontrolliere, ob die Durchführung als storniert beziehungsweise ungültig gekennzeichnet ist.', 'check', 'Ist die Durchführung als storniert gekennzeichnet?')
  ),
  jsonb_build_object('abgrenzung', 'Ein Bericht wird durchgestrichen. Eine falsch abgezeichnete Durchführung wird im Durchführungsnachweis storniert.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Formulierung für falsch abgezeichnete Durchführung und Abschlusskontrolle präzisiert.'
),
(
  'visite-anlegen',
  'Visite beziehungsweise Sprechstunde dokumentieren',
  array[
    'visite anlegen', 'visite dokumentieren', 'sprechstunde dokumentieren', 'arztvisite eintragen',
    'sprechstunde eintragen', 'neue visite', 'visite durchführen', 'visite durchgeführt'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle „Visiten“.', 'check', 'Ist der Bereich „Visiten“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus beziehungsweise „Neu“.', 'check', 'Hat sich das Fenster „Klienten auswählen“ geöffnet?'),
    jsonb_build_object('text', 'Wähle im Fenster „Klienten auswählen“ den Bewohner aus, für den du die bereits erfolgte Visite dokumentierst.', 'check', 'Ist der richtige Bewohner ausgewählt und die Maske „Neue Visite“ geöffnet?', 'stuck', 'Nach dem grünen Plus erscheint zuerst die Bewohnerauswahl. Die Visitenmaske öffnet sich erst nach dieser Auswahl.'),
    jsonb_build_object('text', 'Klicke oben in der Maske auf „Durchführen“. Dadurch wird die Visite als durchgeführt dokumentiert. Verwende niemals den Status „abgeschlossen“.', 'check', 'Ist die Visite auf „durchgeführt“ gesetzt?'),
    jsonb_build_object('text', 'Prüfe Datum, Beginn und gegebenenfalls Ende der bereits durchgeführten Visite.', 'check', 'Sind Datum und Zeiten korrekt?'),
    jsonb_build_object('text', 'Wähle im Feld „Arzt“ die Ärztin oder den Arzt aus, die beziehungsweise der die Visite durchgeführt hat.', 'check', 'Ist der durchführende Arzt ausgewählt?'),
    jsonb_build_object('text', 'Das Feld „Mitarbeiter“ bleibt immer auf „ohne Mitarbeiter“ beziehungsweise leer.', 'check', 'Ist kein Mitarbeiter eingetragen?'),
    jsonb_build_object('text', 'Trage bei „Anforderung“ ein, wer die Sprechstunde angefordert hat.', 'check', 'Ist die anfordernde Person ausgewählt?'),
    jsonb_build_object('text', 'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt oder telefonisch.', 'check', 'Sind Grund und Ort eingetragen?'),
    jsonb_build_object('text', 'Trage rechts im Feld „Bemerkung“ den Inhalt und die wesentlichen Ergebnisse der Visite ein. In Übungen ausschließlich Fantasiedaten verwenden.', 'check', 'Ist der Inhalt in „Bemerkung“ vollständig eingetragen?'),
    jsonb_build_object('text', 'Speichere und kontrolliere, ob die Visite unter den durchgeführten Visiten erscheint.', 'check', 'Wird die Visite als durchgeführt angezeigt?')
  ),
  jsonb_build_object(
    'bewohnerauswahl', 'Nach „Neu“ beziehungsweise dem grünen Plus kommt zuerst „Klienten auswählen“. Erst danach öffnet sich „Neue Visite“.',
    'mitarbeiter', 'Das Feld „Mitarbeiter“ bleibt ohne Mitarbeiter beziehungsweise leer.',
    'status', 'Visiten werden bei euch erst nach der Durchführung dokumentiert und immer als durchgeführt erfasst, niemals als abgeschlossen.'
  ),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Bewohnerauswahl nach dem grünen Plus und exakte Felder der Visitenmaske ergänzt.'
),
(
  'vitalwerte-einzelwert',
  'Einzelnen Vitalwert erfassen',
  array[
    'einzelnen vitalwert erfassen', 'einen vitalwert eingeben', 'blutdruck eingeben', 'puls eingeben',
    'temperatur eingeben', 'gewicht eingeben', 'blutzucker eingeben', 'sauerstoffsättigung eingeben'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den gewünschten Bewohner aus.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle „Vitalwerte“.', 'check', 'Ist der Bereich „Vitalwerte“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus beziehungsweise „Neu“.', 'check', 'Hat sich das Pop-up zur Auswahl des Vitalwerts geöffnet?'),
    jsonb_build_object('text', 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest.', 'check', 'Ist der richtige Vitalwert ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Bei Blutdruck sind beispielsweise Systole und Diastole erforderlich. In Übungen nur Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Wert vollständig eingetragen?'),
    jsonb_build_object('text', 'Ergänze nur bei Bedarf vorhandene Angaben wie Messart, Qualität oder Bemerkung.', 'check', 'Sind alle benötigten Zusatzangaben eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ und kontrolliere den neuen Wert in der Übersicht.', 'check', 'Ist der neue Vitalwert sichtbar?')
  ),
  jsonb_build_object('popup', 'Nach dem grünen Plus wird zuerst im Pop-up ausgewählt, welcher Vitalwert erfasst werden soll.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Einzelerfassung auf den bestätigten Weg über Doku-Erweitert, Vitalwerte, Neu und Auswahl-Pop-up ausgerichtet.'
),
(
  'vitalwerte-einzelwert-fortsetzen',
  'Einzelnen Vitalwert erfassen – Vitalwerte bereits geöffnet',
  array['einzelwert', 'einzelerfassung', 'grünes plus', 'einen wert', 'einzelnen wert'],
  jsonb_build_array(
    jsonb_build_object('text', 'Klicke oben links auf das grüne Plus beziehungsweise „Neu“.', 'check', 'Hat sich das Pop-up zur Auswahl des Vitalwerts geöffnet?'),
    jsonb_build_object('text', 'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest.', 'check', 'Ist der richtige Vitalwert ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. In Übungen nur Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Wert vollständig eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ und kontrolliere den neuen Wert in der Übersicht.', 'check', 'Ist der neue Vitalwert sichtbar?')
  ),
  '{}'::jsonb,
  'approved', 1, now(), 'durch Nutzer bestätigter Anschlussablauf', now(),
  'Anschlussablauf für den bereits geöffneten Bereich Vitalwerte aktualisiert.'
),
(
  'vitalwerte-sammelerfassung',
  'Mehrere Vitalwerte über die Sammelerfassung erfassen',
  array[
    'sammelerfassung vitalwerte', 'mehrere vitalwerte eingeben', 'mehrere vitalwerte erfassen',
    'vitalwerte gleichzeitig eingeben', 'vitalwerte sammelerfassung', 'vitalwerte sammel erfassung'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den gewünschten Bewohner aus.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle direkt „Vitalwerte Sammelerf.“.', 'check', 'Ist die Sammelerfassung geöffnet?', 'stuck', '„Vitalwerte“ und „Vitalwerte Sammelerf.“ sind zwei getrennte Einträge unter „Doku-Erweitert“.'),
    jsonb_build_object('text', 'Wähle die benötigten Vitalwerte für die gemeinsame Erfassung aus.', 'check', 'Sind alle benötigten Vitalwerte ausgewählt?'),
    jsonb_build_object('text', 'Prüfe Datum und Uhrzeit und trage die gemessenen Werte ein. In Übungen nur Fantasiewerte verwenden.', 'check', 'Sind Zeitpunkt und Werte vollständig eingetragen?'),
    jsonb_build_object('text', 'Bestätige mit „OK“ beziehungsweise „Speichern“ und kontrolliere die Werte in der Übersicht.', 'check', 'Sind die neuen Werte sichtbar?')
  ),
  jsonb_build_object('getrennter_einstieg', 'Für mehrere Werte wird unter „Doku-Erweitert“ direkt „Vitalwerte Sammelerf.“ geöffnet. Es ist ein eigener Menüpunkt.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Sammelerfassung als eigener Menüpunkt „Vitalwerte Sammelerf.“ bestätigt.'
),
(
  'vitalwerte-sammelerfassung-fortsetzen',
  'Sammelerfassung öffnen',
  array['sammelerfassung', 'mehrere werte', 'mehrere gleichzeitig'],
  jsonb_build_array(
    jsonb_build_object('text', 'Wechsle innerhalb von „Doku-Erweitert“ zu „Vitalwerte Sammelerf.“.', 'check', 'Ist die Sammelerfassung geöffnet?', 'stuck', '„Vitalwerte Sammelerf.“ ist ein eigener Eintrag neben „Vitalwerte“.'),
    jsonb_build_object('text', 'Wähle die benötigten Vitalwerte aus und trage die Werte ein. In Übungen nur Fantasiewerte verwenden.', 'check', 'Sind alle Werte vollständig eingetragen?'),
    jsonb_build_object('text', 'Bestätige und kontrolliere die neuen Werte.', 'check', 'Sind die Werte sichtbar?')
  ),
  '{}'::jsonb,
  'approved', 1, now(), 'durch Nutzer bestätigter Anschlussablauf', now(),
  'Anschluss führt zum getrennten Menüpunkt „Vitalwerte Sammelerf.“.'
),
(
  'anwesenheit',
  'An- oder Abwesenheit erfassen',
  array[
    'anwesenheit', 'abwesenheit', 'an und abwesenheit', 'an- und abwesenheit',
    'anwesenheit eintragen', 'abwesenheit eintragen', 'status erfassen', 'krankenhaus abwesenheit'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den gewünschten Bewohner aus.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle „An-/Abwesenheiten“.', 'check', 'Ist der Bereich „An-/Abwesenheiten“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf „Neu“.', 'check', 'Ist die Eingabemaske geöffnet?'),
    jsonb_build_object('text', 'Wähle den passenden Status aus, zum Beispiel „Abwesend“, „Abwesend – Krankenhaus“, „Aktiv“ oder das passende externe Angebot.', 'check', 'Ist der richtige Status ausgewählt?'),
    jsonb_build_object('text', 'Trage den Beginn bei „Von“ immer vollständig ein.', 'check', 'Ist „Von“ mit Datum und Uhrzeit eingetragen?'),
    jsonb_build_object('text', 'Fülle „Bis“ nur aus, wenn der genaue Endzeitpunkt zu 100 Prozent bekannt ist. Ist das Ende unsicher, lasse „Bis“ leer und schätze niemals.', 'check', 'Ist „Bis“ entweder sicher korrekt eingetragen oder bewusst leer geblieben?'),
    jsonb_build_object('text', 'Ergänze nur die tatsächlich benötigten weiteren Angaben, zum Beispiel Ziel, Begleitung oder Grund beziehungsweise Bemerkung.', 'check', 'Sind alle notwendigen Angaben vollständig?'),
    jsonb_build_object('text', 'Bestätige und kontrolliere den neuen An- oder Abwesenheitseintrag.', 'check', 'Ist der Eintrag sichtbar?')
  ),
  jsonb_build_object(
    'von_pflicht', '„Von“ wird immer eingetragen.',
    'bis_unsicher', '„Bis“ bleibt leer, wenn der genaue Endzeitpunkt nicht zu 100 Prozent bekannt ist. Niemals schätzen.'
  ),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Vollständige Erfassung einschließlich harter Von-/Bis-Regel ergänzt.'
),
(
  'medikation-ansehen',
  'Medikation ausschließlich ansehen',
  array['medikation ansehen', 'medikamente anschauen', 'medikationsplan öffnen', 'medikamente ansehen', 'wo ist die medikation'],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den gewünschten Bewohner aus.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle „Medikation“.', 'check', 'Ist die Medikamentenübersicht geöffnet?'),
    jsonb_build_object('text', 'Sieh die Medikation ausschließlich an. Nimm hier keinerlei Änderungen vor.', 'check', 'Hast du die benötigte Information gefunden, ohne etwas zu verändern?')
  ),
  jsonb_build_object(
    'nur_lesen', 'Dieser Ablauf ist ausschließlich zum Ansehen. Keine Dosierung ändern, nichts pausieren, fortsetzen, absetzen, korrigieren, ergänzen oder löschen.',
    'aenderungswunsch', 'DokoHilf darf bei diesem Ablauf nicht zu Änderungen an der Medikation anleiten.'
  ),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Nur-Lese-Weg', now(),
  'Menübezeichnung „Medikation“ und striktes Änderungsverbot bestätigt.'
),
(
  'formulare-anlegen',
  'Formular anlegen',
  array[
    'formular anlegen', 'formulare', 'neues formular', 'anfallsprotokoll', 'fallgespräch',
    'gesprächsprotokoll', 'sturzprotokoll', 'formular erstellen'
  ],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den gewünschten Bewohner aus.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Öffne „Doku-Erweitert“ und wähle „Formulare“.', 'check', 'Ist der Bereich „Formulare“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf „Neu“.', 'check', 'Ist das Fenster „Formular anlegen“ geöffnet?'),
    jsonb_build_object('text', 'Wähle das benötigte Formular aus, zum Beispiel Anfallsprotokoll, Fallgespräch, Gesprächsprotokoll oder Sturzprotokoll.', 'check', 'Ist das richtige Formular ausgewählt?'),
    jsonb_build_object('text', 'Bestätige mit „OK“.', 'check', 'Hat sich das gewählte Formular geöffnet?'),
    jsonb_build_object('text', 'Fülle das Formular nach der bei euch gültigen fachlichen Vorgabe aus. DokoHilf erfindet für noch nicht bestätigte Formularfelder keine Angaben.', 'check', 'Ist das Formular entsprechend der gültigen Vorgabe bearbeitet?')
  ),
  jsonb_build_object('felder_unbestaetigt', 'Die Auswahl des Formulars ist bestätigt. Für nicht bestätigte Felder oder fachliche Inhalte wird kein Klickweg erfunden.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Formularauswahl und bestätigte Beispiele ergänzt; unbekannte Formularfelder bleiben ausdrücklich offen.'
),
(
  'notfallblatt',
  'Notfallblatt in Word öffnen',
  array['notfallblatt', 'notfallblatt öffnen', 'notfallblatt ausdrucken', 'notfallblatt drucken', 'rotes kreuz', 'notfallblatt aufrufen'],
  jsonb_build_array(
    jsonb_build_object('text', 'Wähle zuerst den Bewohner aus, für den du das Notfallblatt benötigst.', 'check', 'Ist der richtige Bewohner ausgewählt?'),
    jsonb_build_object('text', 'Klicke ganz oben links auf das kleine rote Kreuz beziehungsweise den zugehörigen Pfeil.', 'check', 'Ist das Menü geöffnet?', 'stuck', 'Das rote Kreuz ist relativ klein und befindet sich ganz oben links.'),
    jsonb_build_object('text', 'Wähle „Notfallblatt aufrufen“.', 'check', 'Ist das Fenster für das Notfallblatt geöffnet?'),
    jsonb_build_object('text', '„Notfallblatt_Allgemein“ ist normalerweise bereits vorausgewählt. Lasse diese Auswahl bestehen.', 'check', 'Ist das allgemeine Notfallblatt ausgewählt?'),
    jsonb_build_object('text', 'Trage einen Grund der Einweisung nur ein, wenn er für den Vorgang benötigt wird.', 'check', 'Ist der Grund bei Bedarf eingetragen oder bewusst leer geblieben?'),
    jsonb_build_object('text', 'Bestätige mit „OK“.', 'check', 'Hat die Dokumenterstellung begonnen?'),
    jsonb_build_object('text', 'Warte, bis sich das Notfallblatt in Word öffnet. Das kann bis zu etwa drei Minuten dauern. Verhindere Standby und starte den Vorgang nicht mehrfach.', 'check', 'Hat sich Word mit dem Notfallblatt geöffnet?')
  ),
  jsonb_build_object('wartezeit', 'Bis zu etwa drei Minuten warten, Standby verhindern und nicht mehrfach auf OK klicken.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Menüpunkt „Notfallblatt aufrufen“, allgemeine Vorlage und optionaler Einweisungsgrund ergänzt.'
),
(
  'uebergabeformular',
  'Übergabe über „Was war los?“ anzeigen',
  array['übergabe', 'was war los', 'übergabe öffnen', 'schichtübergabe', 'übergabe ansehen', 'übergabe finden'],
  jsonb_build_array(
    jsonb_build_object('text', 'Öffne oben den Reiter „Analyse“.', 'check', 'Bist du bei „Analyse“?'),
    jsonb_build_object('text', 'Wähle „Was war los?“.', 'check', 'Ist „Was war los?“ geöffnet?'),
    jsonb_build_object('text', 'Klicke oben links auf „Alle anzeigen“.', 'check', 'Ist die Auswahl geöffnet?'),
    jsonb_build_object('text', 'Wähle „Alles ausklappen“, damit sämtliche Einträge vollständig sichtbar werden.', 'check', 'Sind alle Einträge ausgeklappt?'),
    jsonb_build_object('text', 'Passe den Zeitraum nur bei Bedarf an und aktualisiere anschließend die Anzeige.', 'check', 'Zeigt die Übersicht den benötigten Zeitraum?')
  ),
  jsonb_build_object('alles_ausklappen', 'Die Bezeichnung lautet „Alles ausklappen“ und erscheint nach „Alle anzeigen“.'),
  'approved', 1, now(), 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(),
  'Exakte Bezeichnung „Alles ausklappen“ und optionale Zeitraumaktualisierung ergänzt.'
)
on conflict (slug) do update set
  title = excluded.title,
  aliases = excluded.aliases,
  steps = excluded.steps,
  troubleshooting = excluded.troubleshooting,
  status = excluded.status,
  version = public.dokohilf_guides.version + 1,
  reviewed_at = excluded.reviewed_at,
  reviewed_role = excluded.reviewed_role,
  approved_at = coalesce(public.dokohilf_guides.approved_at, excluded.approved_at),
  change_note = excluded.change_note,
  updated_at = now();

insert into public.dokohilf_topics (
  slug, title, aliases, overview, capabilities, approved_guide_slugs,
  unconfirmed_actions, variant_note, status, source_basis, reviewed_at, updated_at
) values
(
  'formulare',
  'Formulare und Protokolle',
  array['formulare', 'formular', 'anfallsprotokoll', 'fallgespräch', 'gesprächsprotokoll', 'sturzprotokoll'],
  'Bestätigter Einstieg zum Anlegen eines Formulars. Nicht bestätigte Formularfelder werden nicht erfunden.',
  array['Formulare öffnen', 'Formular auswählen', 'bestätigtes Formular anlegen'],
  array['formulare-anlegen'],
  array['nicht bestätigte Formularfelder erklären', 'fachliche Inhalte vorgeben'],
  'Menünamen können je nach Berechtigung abweichen.',
  'approved', 'durch Nutzer anhand der lokalen Oberfläche bestätigter Klickweg', now(), now()
)
on conflict (slug) do update set
  title = excluded.title,
  aliases = excluded.aliases,
  overview = excluded.overview,
  capabilities = excluded.capabilities,
  approved_guide_slugs = excluded.approved_guide_slugs,
  unconfirmed_actions = excluded.unconfirmed_actions,
  variant_note = excluded.variant_note,
  status = excluded.status,
  source_basis = excluded.source_basis,
  reviewed_at = excluded.reviewed_at,
  updated_at = now();

update public.dokohilf_topics
set approved_guide_slugs = array['bericht-neu', 'bericht-folgebericht', 'bericht-durchstreichen', 'berichtssuche'],
    capabilities = array['neuen Bericht erfassen', 'Folgebericht erstellen', 'Bericht durchstreichen', 'automatisch zugeordnetes Protokoll prüfen oder entfernen', 'Berichte suchen und filtern'],
    updated_at = now()
where slug = 'berichte';

update public.dokohilf_topics
set approved_guide_slugs = array['anwesenheit'],
    capabilities = array['An- und Abwesenheit erfassen', 'Status auswählen', 'Von immer eintragen', 'Bis nur bei sicher bekanntem Ende eintragen'],
    unconfirmed_actions = array['Status stornieren', 'Statusübernahme durchführen'],
    updated_at = now()
where slug = 'anwesenheit';

update public.dokohilf_topics
set capabilities = array['Medikation ausschließlich ansehen'],
    unconfirmed_actions = array['Medikation ändern', 'Dosierung ändern', 'Medikation pausieren', 'Medikation absetzen', 'Medikation korrigieren oder löschen'],
    updated_at = now()
where slug = 'medikation';

update public.dokohilf_topics
set capabilities = array['Visiten öffnen', 'Bewohner nach Neu auswählen', 'bereits durchgeführte Visite dokumentieren', 'Visite als durchgeführt speichern'],
    updated_at = now()
where slug = 'visiten';

update public.dokohilf_topics
set capabilities = array['Vitalwerte öffnen', 'einzelnen Vitalwert über Neu erfassen', 'mehrere Vitalwerte über „Vitalwerte Sammelerf.“ erfassen', 'Verlauf ansehen'],
    updated_at = now()
where slug = 'vitalwerte';
