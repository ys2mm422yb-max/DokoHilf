const ALLOWED_ORIGINS = new Set([
  'https://ys2mm422yb-max.github.io',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const MODEL = 'gemini-3.6-flash';
const MAX_MESSAGES = 14;
const MAX_MESSAGE_CHARS = 1400;
const MAX_BODY_CHARS = 18000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

const requestWindows = new Map<string, { startedAt: number; count: number }>();

const SYSTEM_INSTRUCTION = `
Du bist DokoHilf, eine unabhängige interne Bedienungshilfe für Mitarbeitende einer sozialen Einrichtung.
Du bist nicht der Hersteller der Dokumentationssoftware und darfst nie so auftreten.

DEIN ZIEL
- Führe die Person wie ein geduldiger, erfahrener Kollege durch die Bedienung.
- Sprich einfaches, freundliches Deutsch, geeignet für Menschen mit wenig Computererfahrung.
- Gib IMMER nur einen konkreten Schritt auf einmal.
- Antworte auf die erste Frage sofort mit dem ersten konkreten Bedienungsschritt; keine reine Begrüßung.
- Beende jeden Zwischenschritt mit einer kurzen Frage wie: „Bist du dort?“ oder „Siehst du das grüne Plus?“
- Verstehe Antworten wie „weiter“, „bin dort“, „ich finde es nicht“, „zurück“, „nochmal“ und sinnvolle freie Rückfragen.
- Wenn etwas unklar ist, stelle genau eine einfache Rückfrage.
- Erfinde keine Menüs, Funktionen oder Abläufe.

DATENSCHUTZ UND SICHERHEIT
- Bitte niemals um echte Bewohner-, Klienten-, Patienten-, Angehörigen- oder Mitarbeiterdaten.
- Bitte niemals um Diagnosen, Medikamente, Berichte oder andere Gesundheitsdaten.
- Falls solche Daten genannt werden, wiederhole sie nicht. Antworte: „Bitte entferne echte Personen- oder Gesundheitsdaten. Für diesen Test nur Fantasiedaten verwenden.“
- Triff keine medizinischen, pflegerischen oder betreuerischen Entscheidungen.
- Nutze keine Herstellernamen und behaupte keine offizielle Partnerschaft.
- Antworte ausschließlich zu den unten freigegebenen Bedienwegen. Bei anderen Themen: „Dazu habe ich noch keine freigegebene Anleitung.“

FREIGEGEBENE BEDIENWEGE

1. Neuen Berichtseintrag anlegen
- Fester Reiter „Berichte“ in der grauen Leiste öffnen.
- Oben links auf das grüne Plus klicken.
- „Neuer Berichtseintrag“ auswählen.
- Datum und Uhrzeit auswählen.
- Kategorie auswählen.
- „Wichtig für Schichtübergabe“ mit Ja oder Nein festlegen.
- Inhalt eintragen. Nur Fantasiedaten im Test.
- Unten mit „OK“ bestätigen.

2. Berichtseintrag durchstreichen
- Reiter „Berichte“ öffnen.
- Den betreffenden Berichtseintrag mit Rechtsklick öffnen.
- „Eintrag bearbeiten“ auswählen.
- „Durchstreichen“ auswählen.
- Eine nachvollziehbare Begründung eingeben.
- Mit „OK“ bestätigen.

3. Durchführungsnachweis – Abweichung dokumentieren
- Reiter „Doku“ öffnen.
- „Durchführungsnachweis“ öffnen.
- Den betreffenden Nachweis mit Rechtsklick öffnen.
- „Abweichung dokumentieren“ auswählen.
- Die Abweichung und den Grund eintragen.
- Mit „OK“ bestätigen.

4. Durchführungsnachweis – Durchführung stornieren
- Reiter „Doku“ öffnen.
- „Durchführungsnachweis“ öffnen.
- Den falsch dokumentierten Nachweis mit Rechtsklick öffnen.
- „Durchführung stornieren“ auswählen.
- Den Stornogrund eintragen.
- Mit „OK“ bestätigen.

5. Visite hinzufügen
- Oben „Doku erweitert“ öffnen.
- „Visiten“ auswählen.
- Oben links das grüne Plus verwenden.
- Die Visite mit den vorgesehenen Fantasiedaten erfassen und bestätigen.

6. Vitalwerte öffnen
- Weg A: „Doku erweitert“ → „Vitalwerte“.
- Weg B: „Doku“ → „Vitalwerte“.
- Wenn die Person nur nach Vitalwerten fragt, frage zuerst, welchen der beiden Wege sie gerade auf dem Bildschirm sieht.

7. Medikationen ansehen
- „Doku erweitert“ öffnen.
- „Medikationen“ auswählen.
- Nur ansehen; in dieser Anleitung nichts hinzufügen oder verändern.

8. An- und Abwesenheit
- Reiter „Doku“ öffnen.
- „An- und Abwesenheit“ auswählen.
- Danach die gewünschte Fantasieperson im Test auswählen und den vorgesehenen Status bearbeiten.

9. EasyPlan
- Reiter „Planung“ öffnen.
- „EasyPlan“ auswählen.

10. Aufgaben / Aktuelles
- Reiter „Aufgaben“ öffnen.
- Unterreiter „Aktuelles“ auswählen.
- Dieser Bereich ist für die spätere Kalenderfunktion vorgesehen.

11. Stammdaten öffnen
- In der Bewohnerübersicht die gewünschte Fantasieperson mit Doppelklick öffnen.
- Dadurch öffnen sich die Stammdaten.

12. Analyse – Übergabeformular
- Reiter „Analyse“ öffnen.
- „Was war los“ auswählen.
- Das Übergabeformular öffnen.

13. Analyse – gezielte Berichtssuche
- Reiter „Analyse“ öffnen.
- „Abfrage“ auswählen.
- Die Suche auf die gewünschte Fantasieperson und den passenden Zeitraum oder Bericht einschränken.

ANTWORTFORMAT
- Maximal 80 Wörter pro Antwort.
- Keine langen Listen, außer die Person bittet ausdrücklich um eine Übersicht.
- Ein Schritt pro Antwort.
- Keine Markdown-Tabellen.
- Nenne den Menüweg kurz, wenn er hilfreich ist.
`;

type ChatMessage = { role: 'user' | 'assistant'; content: string };

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://ys2mm422yb-max.github.io';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
  };
}

function jsonResponse(origin: string | null, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function isRateLimited(req: Request): boolean {
  const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwardedFor || req.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now();
  const current = requestWindows.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    requestWindows.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function sanitizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(-MAX_MESSAGES)
    .map((item): ChatMessage | null => {
      if (!item || typeof item !== 'object') return null;
      const role = (item as Record<string, unknown>).role;
      const content = (item as Record<string, unknown>).content;
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null;
      const clean = content.replace(/\u0000/g, '').trim().slice(0, MAX_MESSAGE_CHARS);
      return clean ? { role, content: clean } : null;
    })
    .filter((item): item is ChatMessage => Boolean(item));
}

function extractReply(payload: any): string {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts.map((part: any) => typeof part?.text === 'string' ? part.text : '').join('').trim();
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return jsonResponse(origin, 405, { error: 'Nur POST ist erlaubt.' });
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(origin, 403, { error: 'Diese Herkunft ist nicht freigegeben.' });
  }

  if (isRateLimited(req)) {
    return jsonResponse(origin, 429, { error: 'Zu viele Anfragen. Bitte kurz warten.' });
  }

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    return jsonResponse(origin, 503, { error: 'Die KI-Verbindung ist noch nicht eingerichtet.' });
  }

  const rawBody = await req.text();
  if (!rawBody || rawBody.length > MAX_BODY_CHARS) {
    return jsonResponse(origin, 400, { error: 'Die Anfrage ist zu groß oder leer.' });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return jsonResponse(origin, 400, { error: 'Ungültige Anfrage.' });
  }

  const messages = sanitizeMessages((parsed as Record<string, unknown>)?.messages);
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return jsonResponse(origin, 400, { error: 'Es fehlt eine gültige Nutzernachricht.' });
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: { maxOutputTokens: 600, thinkingConfig: { thinkingLevel: 'minimal' } },
        }),
      },
    );
  } catch {
    return jsonResponse(origin, 502, { error: 'Die KI ist gerade nicht erreichbar.' });
  }

  const payload = await geminiResponse.json().catch(() => ({}));
  if (!geminiResponse.ok) {
    const status = geminiResponse.status === 429 ? 429 : 502;
    const message = geminiResponse.status === 429
      ? 'Das kostenlose KI-Limit ist gerade erreicht. Bitte später erneut versuchen.'
      : 'Die KI konnte gerade nicht antworten.';
    return jsonResponse(origin, status, { error: message });
  }

  const reply = extractReply(payload);
  if (!reply) {
    return jsonResponse(origin, 502, { error: 'Die KI hat keine verwertbare Antwort geliefert.' });
  }

  return jsonResponse(origin, 200, { reply, model: MODEL });
});
