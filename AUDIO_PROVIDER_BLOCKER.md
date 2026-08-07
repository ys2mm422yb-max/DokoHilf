# Frühere Cloud-TTS-Providergrenze – erledigt

**Stand:** 7. August 2026
**Status:** durch den kostenlosen Supertonic-F1-Releasepfad ersetzt

Der frühere Build-27-Ansatz versuchte, 93 statische Gacrux-Audios schrittweise über Gemini-TTS zu erzeugen. Provider-Limits und HTTP 429 verhinderten einen zuverlässigen vollständigen Aufbau. Dieser Ansatz ist kein aktueller DokoHilf-Sprachweg mehr.

## Aktuelle Lösung

- Der GitHub-Releasebuild erzeugt 93 bestätigte Guide-Sätze plus 18 feste Dialogsätze, insgesamt exakt 111 WAV-Dateien, mit Supertonic 3 / F1 / Deutsch.
- Die veröffentlichte PWA spielt diese Dateien statisch ab.
- Nur ein noch nicht vorbereiteter freier Satz darf zeitlich begrenzt lokal mit derselben Supertonic-F1-Stimme erzeugt werden.
- Die alte Cloud-TTS-Funktion, der alte Cloud-Audio-Builder und die alte Gacrux-Auslieferung sind nicht-generierende `410 Gone`-Ruhestandsendpunkte.
- Der alte Cron wird entfernt und der interne Builder bleibt deaktiviert.
- Es gibt keinen Gacrux-, Gemini-TTS- oder Systemstimmen-Rollbackpfad.

Damit existiert kein externer Audio-Providerblocker mehr. Maßgeblich sind jetzt der exakte 111-Dateien-Buildvertrag, die iOS-/Android-Prüfung und der reale Gerätetest nach Veröffentlichung.

Details: `PREBUILT_AUDIO.md` und `ACTIVE_WORK_VOICE_GUIDES_REPORT_CONDITIONAL_V28.md`.
