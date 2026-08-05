const STOP_WORDS = new Set([
  'wie','wo','was','wer','wann','warum','ich','du','der','die','das','den','dem','ein','eine','einen','einer',
  'und','oder','zu','zur','zum','in','im','am','auf','mit','fur','bitte','komme','mochte','möchte','muss','kann',
  'kannst','mir','machen','offnen','finden','gehen','zeigen','soll','denn','doch','gar','nichts','nicht','habe','hab',
  'es','noch','will',
]);

const GREETINGS = ['guten morgen','guten abend','guten tag','hallo','servus','moin','hey','hi'];

export function normalize(value) {
  let normalized = String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const repairs = new Map([
    ['durch fuhrung', 'durchfuhrung'],
    ['pflege visite', 'pflegevisite'],
    ['berict', 'bericht'],
    ['viste', 'visite'],
    ['durchfurung', 'durchfuhrung'],
  ]);
  for (const [wrong, repaired] of repairs) normalized = normalized.replaceAll(wrong, repaired);
  return normalized;
}

function stripLeadingGreeting(value) {
  let normalized = normalize(value);
  for (const greeting of GREETINGS) {
    if (normalized.startsWith(`${greeting} `)) {
      normalized = normalized.slice(greeting.length).trim();
      break;
    }
  }
  return normalized;
}

function levenshteinAtMostOne(left, right) {
  if (Math.abs(left.length - right.length) > 1) return false;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= right.length; j += 1) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length] <= 1;
}

function words(value) {
  return normalize(value)
    .split(' ')
    .filter(word => word.length >= 3 && !STOP_WORDS.has(word));
}

function scoreCandidate(text, candidate) {
  const normalizedText = normalize(text);
  const normalizedCandidate = normalize(candidate);
  if (!normalizedCandidate) return 0;
  let score = 0;
  if (normalizedText === normalizedCandidate) score += 100;
  else if (normalizedCandidate.length >= 5 && (
    normalizedText.includes(normalizedCandidate) || normalizedCandidate.includes(normalizedText)
  )) score += 50;

  const inputWords = words(text);
  for (const candidateWord of words(candidate)) {
    if (inputWords.includes(candidateWord)) score += candidateWord.length >= 8 ? 11 : 7;
    else if (candidateWord.length >= 5 && inputWords.some(inputWord => levenshteinAtMostOne(candidateWord, inputWord))) {
      score += 5;
    }
  }
  return score;
}

function scoreGuide(text, guide) {
  return [guide.title, ...(guide.aliases || [])]
    .reduce((best, candidate) => Math.max(best, scoreCandidate(text, candidate)), 0);
}

function guideCommand(normalized) {
  if (/^(weiter|ja|ok|okay|gemacht|fertig|passt|erledigt|hab ich|habe ich|bin dort|ich bin da|ich bin dort)(\s|$)/.test(normalized)) {
    return 'command-next';
  }
  if (/^(nochmal|erneut|wiederholen|noch einmal)(\s|$)/.test(normalized)) return 'command-repeat';
  if (/^(zuruck|einen schritt zuruck)(\s|$)/.test(normalized)) return 'command-back';
  if (
    /\b(finde|sehe|erkenne|entdecke)\b.*\b(nicht|nirgends)\b/.test(normalized)
    || ['ich finde es nicht','ich finde das nicht','finde ich nicht','sehe ich nicht'].includes(normalized)
  ) return 'command-stuck';
  return null;
}

function isBasicConversation(normalized) {
  return GREETINGS.includes(normalized)
    || /\b(danke|vielen dank|was kannst du|wer bist du|wie geht es dir)\b/.test(normalized);
}

function isAmbiguousCorrection(normalized) {
  const hasReport = /\b(bericht|berichtseintrag|pflegebericht)\w*\b/.test(normalized);
  const hasExecution = /\b(durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme)\w*\b/.test(normalized);
  const fixedPhrase = /\b(falsch dokumentiert|falsch eingetragen|falsch erfasst|etwas stornieren|etwas loschen|eintrag korrigieren|eintrag wegmachen|dokumentation ruckgangig|dokumentation zurucknehmen)\b/.test(normalized);
  const genericWrong = /\b(eintrag|dokumentation|das|etwas)\b/.test(normalized)
    && /\b(falsch|storn|losch|wegmach|ruckgang)\w*\b/.test(normalized);
  return (fixedPhrase || genericWrong) && !hasReport && !hasExecution;
}

function explicitGuide(normalized) {
  const report = /\b(bericht|berichtseintrag|pflegebericht|eintrag)\w*\b/.test(normalized);
  const execution = /\b(durchfuhrung|durchfuhrungsnachweis|nachweis|massnahme|durchfuhrungsliste|nachweise)\w*\b/.test(normalized);
  const visit = /\b(visite|visiten|pflegevisite|arztvisite)\w*\b/.test(normalized);

  if (visit && /\b(status|fertig|abschliess|schliess|beend|durchgefuhrt|markier|bearbeitet)\w*\b/.test(normalized)) {
    return 'visite-status-durchgefuehrt';
  }
  if (visit && /\b(anleg|leg|erstell|hinzufug|fug|eintrag|dokumentier|erfass|neue)\w*\b/.test(normalized)) {
    return 'visite-anlegen';
  }
  if (visit && /\b(offn|anseh|find|liste|ubersicht|bereich|wo|zeig)\w*\b/.test(normalized)) {
    return 'visiten-oeffnen';
  }

  const destructive = /\b(storn|losch|entfern|weg|ruckgang|korrig|falsch|verschrieben|durchstreich|streich|versehentlich)\w*\b/;
  const create = /\b(schreib|verfass|anleg|leg|erstell|erfass|dokumentier|mach)\w*\b/;
  if (execution && destructive.test(normalized)) return 'durchfuehrung-storno';
  if (report && destructive.test(normalized)) return 'bericht-durchstreichen';
  if (report && create.test(normalized)) return 'bericht-neu';
  if (execution && /\b(offn|anseh|anschauen|find|liste|nur|zeig)\w*\b/.test(normalized)) {
    return 'durchfuehrungsnachweis-oeffnen';
  }

  if (/\b(vitalwert|blutdruck|puls|temperatur|gewicht|werte)\w*\b/.test(normalized)) return 'vitalwerte';
  if (/\b(notfallblatt|notfallbogen|rotes kreuz)\w*\b/.test(normalized)) return 'notfallblatt';
  if (/\b(easyplan|easy plan|easy-plan|planungsbereich)\b/.test(normalized)) return 'easyplan';
  if (/\b(medikation|medikament|medikationsplan)\w*\b/.test(normalized)) return 'medikation-ansehen';
  if (/\b(stammdaten|personenstammdaten|bewohnerdaten|bewohnerubersicht)\w*\b/.test(normalized)) return 'stammdaten';
  if (/\b(ubergabe|ubergabeformular|schichtubergabe|was war los)\w*\b/.test(normalized)) return 'uebergabeformular';
  if (/\b(bericht|pflegebericht|dokumentation)\w*\b/.test(normalized)
    && /\b(such|find|auswert|abfrage|durchsuch|alt)\w*\b/.test(normalized)) return 'berichtssuche';
  if (/\b(anwesenheit|abwesenheit|anwesenheitskalender|anwesenheitsstatus)\w*\b/.test(normalized)) return 'anwesenheit';
  if (/\b(kalender|aktuelles|aufgabe|termin)\w*\b/.test(normalized)) return 'aufgaben-aktuelles';
  if (/\b(planung)\w*\b/.test(normalized)) return 'easyplan';
  return null;
}

export function routeContract(text, guides) {
  const original = normalize(text);
  const command = guideCommand(original);
  if (command) return { kind: command, guideSlug: null, confidence: 1 };
  if (isBasicConversation(original)) return { kind: 'basic', guideSlug: null, confidence: 1 };

  const normalized = stripLeadingGreeting(text);
  if (isAmbiguousCorrection(normalized)) return { kind: 'clarify', guideSlug: null, confidence: 1 };

  const explicit = explicitGuide(normalized);
  if (explicit) {
    const exists = guides.some(guide => guide.slug === explicit);
    return exists
      ? { kind: 'guide', guideSlug: explicit, confidence: 1 }
      : { kind: 'missing-guide', guideSlug: explicit, confidence: 0 };
  }

  const ranked = guides
    .map(guide => ({ guideSlug: guide.slug, score: scoreGuide(normalized, guide) }))
    .sort((left, right) => right.score - left.score);
  if (!ranked.length || ranked[0].score < 7) return { kind: 'unknown', guideSlug: null, confidence: 0 };
  return {
    kind: 'guide',
    guideSlug: ranked[0].guideSlug,
    confidence: Math.min(1, ranked[0].score / 100),
  };
}

export function evaluateCases(cases, guides) {
  return cases.map(testCase => {
    const actual = routeContract(testCase.input, guides);
    const passed = actual.kind === testCase.expectedKind
      && actual.guideSlug === testCase.expectedGuide;
    return { ...testCase, actualKind: actual.kind, actualGuide: actual.guideSlug, passed };
  });
}
