# Externer Blocker der vollständigen Guide-Audiobibliothek

**Stand:** 6. August 2026  
**Ziel-Build:** `20260806-27`  
**Aktiver Release-PR:** `#52`

## Ziel

Für 92 eindeutige freigegebene Guide-Schritte und die allgemeine Begrüßung sollen insgesamt 93 statische WAV-Dateien mit der Stimme Gacrux erzeugt werden. Nutzer-, Bewohner- und Gesprächsdaten sind vollständig ausgeschlossen.

## TTS-Fehler behoben

Der vorherige Echtzeitfehler war nicht ausschließlich ein Providerproblem. TTS v19 suchte beim rohen Gemini-Interactions-REST-Response primär im SDK-Komfortfeld `output_audio`. Das echte REST-Audio liegt in `steps[].content[]`.

TTS v20 ist aktiv und:

- liest das rohe Audio mit Parser `raw-steps-content-v1`
- erzeugt gültige RIFF/WAVE-Dateien
- gibt echte Providerstatus weiter
- verwendet Gacrux und primär `gemini-3.1-flash-tts-preview`

Live nachgewiesen wurden HTTP 200, `audio/wav`, 101804 Bytes, Gacrux, Gemini 3.1, Interactions API und ein gültiger RIFF/WAVE-Anfang.

Damit ist die natürliche Live-Stimme technisch wieder funktionsfähig. Der verbleibende Blocker betrifft ausschließlich die schnelle vollständige Massenerzeugung von 93 unterschiedlichen Dateien.

## Nachgewiesene Providergrenze

1. Einzelne TTS-Anfragen können erfolgreich mit HTTP 200 antworten.
2. Weitere unterschiedliche Erzeugungen werden aktuell häufig mit HTTP 429 begrenzt.
3. Mehrere parallele oder schnelle Wiederholungen sind deshalb ungeeignet.
4. Offizielle Gemini-Batchversuche wurden mit `FAILED_PRECONDITION` abgewiesen.
5. Die aktuelle Batchnutzung steht mit dem verwendeten kostenlosen Google-Projekt nicht zur Verfügung.

## Sichere Teilrollout-Lösung

- private Speicherung im Supabase-Bucket `dokohilf-guide-audio`
- Registry `public.dokohilf_static_guide_audio`
- kontrollierter Leseendpunkt `dokohilf-guide-audio`
- token-geschützter Builder `dokohilf-guide-audio-build` v2
- zufälliges Token ausschließlich in `public.dokohilf_internal_build_control`
- externer Aufruf ohne Token liefert HTTP 403
- höchstens ein Versuch pro Stunde
- ausschließlich nächster fehlender Index
- keine erneute Erzeugung fertiger Dateien
- automatische Deaktivierung bei 93/93

Zuletzt verifiziert war 1/93 vollständig gespeichert. Dieser Wert ist veränderlich und muss live geprüft werden.

## Veröffentlichungsfolge

Der Blocker hält nicht länger die sichtbare Dark-UI zurück:

- vorhandene statische Dateien werden bevorzugt
- fehlende Dateien nutzen TTS v20
- nach rund 1,9 Sekunden greift die lokale Sofortstimme
- die App bleibt vollständig bedienbar

Build 27 darf nach vollständig grünen Fach-, Datenschutz-, TTS-, Build- und iPhone-Prüfungen veröffentlicht werden, auch wenn die private Bibliothek noch nicht 93/93 erreicht hat.

Der vollständige Audioabschluss bleibt separat streng prüfbar:

```bash
DOKOHILF_REQUIRE_COMPLETE_AUDIO=1 node scripts/live-static-guide-audio-smoke.mjs
```

## Unveränderte Qualitätsgrenze

Es werden niemals stumme Platzhalter, falsche Stimmen, ungeprüfte WAV-Dateien oder personenbezogene Audios veröffentlicht. Jeder vorhandene statische Eintrag benötigt gültigen RIFF/WAVE-Inhalt, Dateigröße, SHA-256, Gacrux, Modell-, API-, Parser- und Stilnachweis.
