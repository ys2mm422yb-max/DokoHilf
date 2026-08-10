export const COMPLETION_REVISION = '20260810-natural-guide-completions-v40-1';

const ACK = 'Alles klar. Wenn du noch etwas brauchst, sag einfach Bescheid.';
const ORIENTATION_ANALYSE = 'Super, dann bist du bei „Analyse“. Wenn du dort etwas Bestimmtes suchst, sag mir einfach, was.';
const ORIENTATION_DOKU = 'Super, dann bist du bei „Doku“. Wenn du dort etwas Bestimmtes suchst, sag mir einfach, was.';
const ORIENTATION_DOKU_EXT = 'Super, dann bist du bei „Doku-Erweitert“. Wenn du dort etwas Bestimmtes suchst, sag mir einfach, was.';
const ORIENTATION_PLANUNG = 'Super, dann bist du bei „Planung“. Wenn du dort etwas Bestimmtes suchst, sag mir einfach, was.';

const ANWESENHEIT_OFFER = 'Perfekt, dann hast du An-/Abwesenheiten gefunden. Möchtest du dort jetzt eine An- oder Abwesenheit eintragen?';
const ANWESENHEIT_RESIDENT = 'Bevor du die An- oder Abwesenheit einträgst: Ist der richtige Bewohner ausgewählt?';
const ANWESENHEIT_SELECT_RESIDENT = 'Wähle zuerst den gewünschten Bewohner aus. Sag mir Bescheid, wenn er für die An- oder Abwesenheit ausgewählt ist.';

const FORMULAR_OFFER = 'Perfekt, dann hast du die Formulare gefunden. Möchtest du jetzt ein Formular anlegen?';
const FORMULAR_RESIDENT = 'Bevor du das Formular anlegst: Ist der richtige Bewohner ausgewählt?';
const FORMULAR_SELECT_RESIDENT = 'Wähle zuerst den gewünschten Bewohner aus. Sag mir Bescheid, wenn er für das Formular ausgewählt ist.';

const BERICHT_OFFER = 'Perfekt, dann bist du bei den Berichten. Möchtest du jetzt einen neuen Bericht anlegen?';
const VISITE_OFFER = 'Perfekt, dann bist du bei den Visiten. Möchtest du jetzt eine Visite dokumentieren?';
const BEDARF_OFFER = 'Perfekt, dann hast du die Bedarfsmedikation geöffnet. Möchtest du jetzt eine Bedarfsmedikationsgabe dokumentieren?';
const WIRKSAMKEIT_OFFER = 'Perfekt, dann siehst du die fällige Wirksamkeitskontrolle. Möchtest du sie jetzt dokumentieren?';
const MASSNAHMEN_OFFER = 'Perfekt, dann hast du „Maßnahmen ohne Zeitangabe“ geöffnet. Möchtest du jetzt eine Maßnahme dokumentieren?';
const NOTFALL_OFFER = 'Perfekt, dann ist das Fenster für das Notfallblatt geöffnet. Möchtest du das Notfallblatt jetzt erstellen und in Word öffnen?';
const UEBERGABE_OFFER = 'Perfekt, dann hast du „Was war los?“ geöffnet. Möchtest du die Übergabe jetzt vollständig anzeigen?';
const BERICHT_NEU_NACH_KORREKTUR = 'Perfekt, dann ist der Bericht sichtbar durchgestrichen. Möchtest du den Inhalt jetzt korrekt als neuen Bericht dokumentieren?';

const VITAL_AREA_CHOICE = 'Perfekt, dann sind die Vitalwerte geöffnet. Möchtest du jetzt einen einzelnen Vitalwert oder mehrere Werte gleichzeitig erfassen?';
const VITAL_GENERIC_CHOICE = 'Okay. Möchtest du einen einzelnen Vitalwert oder mehrere Werte gleichzeitig erfassen?';
const VITAL_SINGLE_RESIDENT = 'Bevor du den Vitalwert erfasst: Ist der richtige Bewohner ausgewählt?';
const VITAL_SINGLE_SELECT_RESIDENT = 'Wähle zuerst den gewünschten Bewohner aus. Sag mir Bescheid, wenn er für den Vitalwert ausgewählt ist.';
const VITAL_BATCH_RESIDENT = 'Bevor du mehrere Vitalwerte erfasst: Ist der richtige Bewohner ausgewählt?';
const VITAL_BATCH_SELECT_RESIDENT = 'Wähle zuerst den gewünschten Bewohner aus. Sag mir Bescheid, wenn er für die Vitalwerte ausgewählt ist.';

const DURCHFUEHRUNG_CHOICE = 'Was möchtest du im Durchführungsnachweis machen: eine Bedarfsmedikation dokumentieren, eine Wirksamkeitskontrolle bearbeiten, eine Maßnahme ohne Zeitangabe dokumentieren, eine falsche Durchführung stornieren oder nur einen Nachweis ansehen?';
const DURCHFUEHRUNG_VIEW = 'Alles klar. Dann kannst du den benötigten Nachweis im geöffneten Durchführungsnachweis ansehen.';
const DURCHFUEHRUNG_UNKNOWN = 'Sag mir kurz, was du im Durchführungsnachweis machen möchtest: Bedarfsmedikation, Wirksamkeitskontrolle, Maßnahme ohne Zeitangabe, Storno oder nur ansehen.';

export const GUIDE_COMPLETIONS = Object.freeze({
  'analyse-finden': { reply: ORIENTATION_ANALYSE, spokenText: ORIENTATION_ANALYSE },
  'anwesenheit': { reply: 'Super, dann ist die An- oder Abwesenheit gespeichert und in der Übersicht sichtbar.', spokenText: 'Super, dann ist die An- oder Abwesenheit gespeichert und in der Übersicht sichtbar.' },
  'anwesenheiten-finden': { reply: ANWESENHEIT_OFFER, spokenText: ANWESENHEIT_OFFER },
  'bedarfsmedikation-finden': { reply: BEDARF_OFFER, spokenText: BEDARF_OFFER },
  'bedarfsmedikation-gabe': { reply: 'Perfekt, dann ist die Wirksamkeitskontrolle gespeichert.', spokenText: 'Perfekt, dann ist die Wirksamkeitskontrolle gespeichert.' },
  'bedarfsmedikation-wirksamkeitskontrolle': { reply: 'Perfekt, dann ist die Wirksamkeitskontrolle gespeichert.', spokenText: 'Perfekt, dann ist die Wirksamkeitskontrolle gespeichert.' },
  'bedarfsmedikation-wirksamkeitskontrolle-finden': { reply: WIRKSAMKEIT_OFFER, spokenText: WIRKSAMKEIT_OFFER },
  'bericht-durchstreichen': { reply: BERICHT_NEU_NACH_KORREKTUR, spokenText: BERICHT_NEU_NACH_KORREKTUR },
  'bericht-folgebericht': { reply: 'Super, dann ist der Folgebericht gespeichert und sichtbar.', spokenText: 'Super, dann ist der Folgebericht gespeichert und sichtbar.' },
  'bericht-neu': { reply: 'Super, dann ist der neue Bericht gespeichert und sichtbar.', spokenText: 'Super, dann ist der neue Bericht gespeichert und sichtbar.' },
  'berichte-finden': { reply: BERICHT_OFFER, spokenText: BERICHT_OFFER },
  'doku-erweitert-finden': { reply: ORIENTATION_DOKU_EXT, spokenText: ORIENTATION_DOKU_EXT },
  'doku-finden': { reply: ORIENTATION_DOKU, spokenText: ORIENTATION_DOKU },
  'durchfuehrung-storno': { reply: 'Alles klar, dann ist die Durchführung als storniert gekennzeichnet.', spokenText: 'Alles klar, dann ist die Durchführung als storniert gekennzeichnet.' },
  'durchfuehrungsnachweis-finden': { reply: DURCHFUEHRUNG_CHOICE, spokenText: DURCHFUEHRUNG_CHOICE },
  'durchfuehrungsnachweis-oeffnen': { reply: DURCHFUEHRUNG_CHOICE, spokenText: DURCHFUEHRUNG_CHOICE },
  'formulare-anlegen': { reply: 'Super, dann ist das Formular gespeichert.', spokenText: 'Super, dann ist das Formular gespeichert.' },
  'formulare-finden': { reply: FORMULAR_OFFER, spokenText: FORMULAR_OFFER },
  'massnahmen-ohne-zeitangabe': { reply: 'Super, dann ist die Maßnahme gespeichert.', spokenText: 'Super, dann ist die Maßnahme gespeichert.' },
  'massnahmen-ohne-zeitangabe-finden': { reply: MASSNAHMEN_OFFER, spokenText: MASSNAHMEN_OFFER },
  'medikation-ansehen': { reply: 'Perfekt, dann hast du die benötigte Information gefunden. Änderungen an der Medikation werden hier nicht angeleitet.', spokenText: 'Perfekt, dann hast du die benötigte Information gefunden. Änderungen an der Medikation werden hier nicht angeleitet.' },
  'medikation-finden': { reply: 'Perfekt, dann ist die Medikamentenübersicht geöffnet. Dort kannst du die Medikation ansehen. Änderungen werden hier nicht angeleitet.', spokenText: 'Perfekt, dann ist die Medikamentenübersicht geöffnet. Dort kannst du die Medikation ansehen. Änderungen werden hier nicht angeleitet.' },
  'notfallblatt': { reply: 'Perfekt, dann ist das Notfallblatt in Word geöffnet.', spokenText: 'Perfekt, dann ist das Notfallblatt in Word geöffnet.' },
  'notfallblatt-finden': { reply: NOTFALL_OFFER, spokenText: NOTFALL_OFFER },
  'planung-finden': { reply: ORIENTATION_PLANUNG, spokenText: ORIENTATION_PLANUNG },
  'stammdaten': { reply: 'Perfekt, dann sind die Stammdaten geöffnet.', spokenText: 'Perfekt, dann sind die Stammdaten geöffnet.' },
  'stammdaten-finden': { reply: 'Perfekt, dann sind die Stammdaten geöffnet.', spokenText: 'Perfekt, dann sind die Stammdaten geöffnet.' },
  'uebergabe-finden': { reply: UEBERGABE_OFFER, spokenText: UEBERGABE_OFFER },
  'uebergabeformular': { reply: 'Super, dann zeigt die Übersicht den benötigten Zeitraum.', spokenText: 'Super, dann zeigt die Übersicht den benötigten Zeitraum.' },
  'visite-anlegen': { reply: 'Perfekt, dann ist die Visite als „durchgeführt“ gespeichert.', spokenText: 'Perfekt, dann ist die Visite als „durchgeführt“ gespeichert.' },
  'visite-status-durchgefuehrt': { reply: 'Perfekt, dann ist für die Visite der richtige Status „durchgeführt“ gesetzt.', spokenText: 'Perfekt, dann ist für die Visite der richtige Status „durchgeführt“ gesetzt.' },
  'visiten-finden': { reply: VISITE_OFFER, spokenText: VISITE_OFFER },
  'visiten-oeffnen': { reply: VISITE_OFFER, spokenText: VISITE_OFFER },
  'vitalwerte': { reply: VITAL_AREA_CHOICE, spokenText: VITAL_AREA_CHOICE },
  'vitalwerte-einzelwert': { reply: 'Super, dann ist der neue Vitalwert gespeichert und sichtbar.', spokenText: 'Super, dann ist der neue Vitalwert gespeichert und sichtbar.' },
  'vitalwerte-einzelwert-fortsetzen': { reply: 'Super, dann ist der neue Vitalwert gespeichert und sichtbar.', spokenText: 'Super, dann ist der neue Vitalwert gespeichert und sichtbar.' },
  'vitalwerte-erfassen': { reply: VITAL_GENERIC_CHOICE, spokenText: VITAL_GENERIC_CHOICE },
  'vitalwerte-finden': { reply: VITAL_AREA_CHOICE, spokenText: VITAL_AREA_CHOICE },
  'vitalwerte-sammelerfassung': { reply: 'Super, dann sind die neuen Vitalwerte gespeichert und sichtbar.', spokenText: 'Super, dann sind die neuen Vitalwerte gespeichert und sichtbar.' },
  'vitalwerte-sammelerfassung-fortsetzen': { reply: 'Super, dann sind die neuen Vitalwerte gespeichert und sichtbar.', spokenText: 'Super, dann sind die neuen Vitalwerte gespeichert und sichtbar.' },
});

export const APPROVED_COMPLETION_SLUGS = Object.freeze(Object.keys(GUIDE_COMPLETIONS).sort());

export function normalizeCompletionText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function completionForGuide(slug) {
  return GUIDE_COMPLETIONS[String(slug || '')] || null;
}

function isPositive(value) {
  const n = normalizeCompletionText(value);
  return /^(ja|jap|jo|genau|okay|ok|passt|gerne|ja gerne|ja bitte|mach|machen wir|weiter|klar|naturlich|bitte)$/.test(n);
}

function isNegative(value) {
  const n = normalizeCompletionText(value);
  return /^(nein|nee|ne|nicht jetzt|spater|nur finden|nur ansehen|nur anschauen|nein danke|passt so)$/.test(n);
}

function isSingleVital(value) {
  const n = normalizeCompletionText(value);
  return /\b(einzel|einzeln|einzelwert|einen einzelnen wert|einen einzelnen|einzelnen wert|einen wert|ein wert|nur einen|ein vitalwert)\b/.test(n);
}

function isBatchVital(value) {
  const n = normalizeCompletionText(value);
  return /\b(mehrere|sammelerfassung|sammel erfassung|gleichzeitig|zusammen|mehrere werte|alle werte)\b/.test(n);
}

function start(guideSlug, stepIndex = 0) {
  return { kind: 'start', guideSlug, stepIndex };
}

function reply(text) {
  return { kind: 'reply', reply: text, spokenText: text };
}

function previousMatches(previousAssistant, text) {
  return normalizeCompletionText(previousAssistant) === normalizeCompletionText(text);
}

export function inferCompletionContinuation(previousAssistant, userText) {
  const user = normalizeCompletionText(userText);
  if (!user) return null;

  if (previousMatches(previousAssistant, ANWESENHEIT_OFFER)) {
    if (isPositive(user)) return reply(ANWESENHEIT_RESIDENT);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, ANWESENHEIT_RESIDENT)) {
    if (isPositive(user)) return start('anwesenheit', 2);
    if (isNegative(user)) return reply(ANWESENHEIT_SELECT_RESIDENT);
  }
  if (previousMatches(previousAssistant, ANWESENHEIT_SELECT_RESIDENT) && isPositive(user)) return start('anwesenheit', 2);

  if (previousMatches(previousAssistant, FORMULAR_OFFER)) {
    if (isPositive(user)) return reply(FORMULAR_RESIDENT);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, FORMULAR_RESIDENT)) {
    if (isPositive(user)) return start('formulare-anlegen', 2);
    if (isNegative(user)) return reply(FORMULAR_SELECT_RESIDENT);
  }
  if (previousMatches(previousAssistant, FORMULAR_SELECT_RESIDENT) && isPositive(user)) return start('formulare-anlegen', 2);

  if (previousMatches(previousAssistant, BERICHT_OFFER)) {
    if (isPositive(user) || /\b(bericht|anlegen|schreiben|erfassen)\b/.test(user)) return start('bericht-neu', 1);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, VISITE_OFFER)) {
    if (isPositive(user) || /\b(visite|sprechstunde|dokumentieren)\b/.test(user)) return start('visite-anlegen', 1);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, BEDARF_OFFER)) {
    if (isPositive(user) || /\b(bedarf|bedarfsmedikation|gabe|dokumentieren)\b/.test(user)) return start('bedarfsmedikation-gabe', 3);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, WIRKSAMKEIT_OFFER)) {
    if (isPositive(user) || /\b(wirksamkeit|wirkung|kontrolle|dokumentieren)\b/.test(user)) return start('bedarfsmedikation-wirksamkeitskontrolle', 3);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, MASSNAHMEN_OFFER)) {
    if (isPositive(user) || /\b(massnahme|dokumentieren|eintragen)\b/.test(user)) return start('massnahmen-ohne-zeitangabe', 3);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, NOTFALL_OFFER)) {
    if (isPositive(user) || /\b(notfallblatt|erstellen|word|offnen)\b/.test(user)) return start('notfallblatt', 3);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, UEBERGABE_OFFER)) {
    if (isPositive(user) || /\b(ubergabe|anzeigen|ausklappen)\b/.test(user)) return start('uebergabeformular', 2);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, BERICHT_NEU_NACH_KORREKTUR)) {
    if (isPositive(user) || /\b(neu|bericht|dokumentieren|schreiben)\b/.test(user)) return start('bericht-neu', 1);
    if (isNegative(user)) return reply(ACK);
  }

  if (previousMatches(previousAssistant, VITAL_AREA_CHOICE)) {
    if (isSingleVital(user)) return reply(VITAL_SINGLE_RESIDENT);
    if (isBatchVital(user)) return reply(VITAL_BATCH_RESIDENT);
    if (isPositive(user)) return reply(VITAL_AREA_CHOICE);
    if (isNegative(user)) return reply(ACK);
  }
  if (previousMatches(previousAssistant, VITAL_SINGLE_RESIDENT)) {
    if (isPositive(user)) return start('vitalwerte-einzelwert-fortsetzen', 0);
    if (isNegative(user)) return reply(VITAL_SINGLE_SELECT_RESIDENT);
  }
  if (previousMatches(previousAssistant, VITAL_SINGLE_SELECT_RESIDENT) && isPositive(user)) return start('vitalwerte-einzelwert-fortsetzen', 0);
  if (previousMatches(previousAssistant, VITAL_BATCH_RESIDENT)) {
    if (isPositive(user)) return start('vitalwerte-sammelerfassung-fortsetzen', 0);
    if (isNegative(user)) return reply(VITAL_BATCH_SELECT_RESIDENT);
  }
  if (previousMatches(previousAssistant, VITAL_BATCH_SELECT_RESIDENT) && isPositive(user)) return start('vitalwerte-sammelerfassung-fortsetzen', 0);

  if (previousMatches(previousAssistant, VITAL_GENERIC_CHOICE)) {
    if (isSingleVital(user)) return start('vitalwerte-einzelwert', 0);
    if (isBatchVital(user)) return start('vitalwerte-sammelerfassung', 0);
    if (isPositive(user)) return reply(VITAL_GENERIC_CHOICE);
    if (isNegative(user)) return reply(ACK);
  }

  if (previousMatches(previousAssistant, DURCHFUEHRUNG_CHOICE) || previousMatches(previousAssistant, DURCHFUEHRUNG_UNKNOWN)) {
    if (/\bwirksamkeit|wirksamkeitskontrolle|wirkungskontrolle\b/.test(user)) return start('bedarfsmedikation-wirksamkeitskontrolle-finden', 2);
    if (/\bbedarfsmedikation|bedarf|bedarfsgabe\b/.test(user)) return start('bedarfsmedikation-gabe', 2);
    if (/\bmassnahme|massnahmen|ohne zeitangabe\b/.test(user)) return start('massnahmen-ohne-zeitangabe', 2);
    if (/\b(storno|stornieren|falsch abgezeichnet|ruckgangig)\b/.test(user)) return start('durchfuehrung-storno', 2);
    if (/\b(ansehen|anschauen|nachweis|nur ansehen|nur anschauen)\b/.test(user)) return reply(DURCHFUEHRUNG_VIEW);
    if (isNegative(user)) return reply(ACK);
    if (isPositive(user)) return reply(DURCHFUEHRUNG_UNKNOWN);
  }

  return null;
}

export function allCompletionSpokenTexts() {
  const texts = new Set(Object.values(GUIDE_COMPLETIONS).map(item => item.spokenText));
  for (const text of [
    ACK,
    ANWESENHEIT_RESIDENT,
    ANWESENHEIT_SELECT_RESIDENT,
    FORMULAR_RESIDENT,
    FORMULAR_SELECT_RESIDENT,
    VITAL_SINGLE_RESIDENT,
    VITAL_SINGLE_SELECT_RESIDENT,
    VITAL_BATCH_RESIDENT,
    VITAL_BATCH_SELECT_RESIDENT,
    DURCHFUEHRUNG_VIEW,
    DURCHFUEHRUNG_UNKNOWN,
  ]) texts.add(text);
  return [...texts].sort();
}

export const FORBIDDEN_CONTINUATION_TARGETS = Object.freeze(['berichtssuche', 'easyplan', 'aufgaben-aktuelles']);
