# Externer Blocker der statischen Guide-Audioerzeugung

**Stand:** 6. August 2026  
**Betroffener Ziel-Build:** `20260806-27`  
**Betroffener PR:** `#50`

## Ziel

Für 92 eindeutige freigegebene Guide-Schritte und die allgemeine Begrüßung sollen insgesamt 93 statische WAV-Dateien mit der Stimme Gacrux erzeugt werden. Nutzer-, Bewohner- und Gesprächsdaten sind davon vollständig ausgeschlossen.

## Technischer Stand

- TTS-Funktion `dokohilf-tts` ist in Supabase als Version 19 aktiv.
- Primärweg: Gemini Interactions API mit `gemini-3.1-flash-tts-preview`.
- Fallback: Gemini 2.5 Flash TTS und danach der bisherige Generate-Content-Weg.
- Live-Antworten weisen Stimme, Modell, API-Weg, Stil, Cache und Laufzeit in Response-Headern aus.
- Die App fällt bei freien Antworten nach rund 1,9 Sekunden auf die lokale Sofortstimme zurück.

## Nachgewiesene Providerprobleme

1. Einzelne Echtzeit-TTS-Anfragen schwankten zwischen HTTP 200, 429, 502 und 504.
2. Mehrere parallele oder wiederholte Erzeugungsversuche führten zu HTTP 429. Bereits erfolgreiche Teildateien werden im aktuellen Generator deshalb dauerhaft checkpoint-basiert gesichert.
3. Fünf offizielle Gemini-Batchversuche für die Bereiche 0–19, 20–39, 40–59, 60–79 und 80–92 wurden mit `FAILED_PRECONDITION` abgewiesen.
4. Die aktuelle offizielle Gemini-Preisdokumentation weist die Batch API ausschließlich für die kostenpflichtige Stufe aus; in der kostenlosen Stufe ist sie nicht verfügbar.
5. Sowohl `gemini-3.1-flash-tts-preview` als auch `gemini-2.5-flash-preview-tts` unterstützen grundsätzlich die Batch API. Das aktuelle Google-Projekt erfüllt jedoch die Abrechnungs-/Freischaltungsvoraussetzung nicht.

## Konsequenz

- Die 93 statischen Audiodateien sind noch nicht vollständig erzeugt.
- PR #50 bleibt Draft und darf nicht gemergt oder veröffentlicht werden.
- Die Oberfläche, Dialoglogik und mobile Darstellung werden unabhängig davon vollständig geprüft.
- Ein finaler Audioerzeugungslauf ist erst sinnvoll, wenn entweder die kostenpflichtige Gemini-Stufe für den verwendeten API-Schlüssel aktiviert wurde oder die Echtzeit-Quota nachweislich genügend Kapazität für eine langsam checkpoint-basierte Erzeugung bietet.
- Es werden keine stummen Platzhalter, falschen Stimmen oder ungeprüften Audiodateien veröffentlicht.

## Aufgeräumte temporäre Infrastruktur

- Die temporären Supabase-Hilfstabellen und das interne Export-Schema wurden wieder gelöscht.
- Die temporären Audio-Export-, Batch-, Store- und Batch-Submit-Edge-Functions antworten nur noch mit HTTP 410 und führen keine Erzeugung mehr aus.
- Die produktive Routerfunktion und `dokohilf-tts` Version 19 bleiben aktiv.

## Harte Abschlussbedingung

Vor einem Merge müssen exakt 93 gültige Gacrux-WAV-Dateien einschließlich vollständigem Manifest, Dateigröße, SHA-256 und RIFF-/WAVE-Prüfung im Branch liegen. Danach muss der exakte PR-Head alle Fach-, Datenschutz-, Audio-, Build- und iPhone-Renderprüfungen bestehen.
