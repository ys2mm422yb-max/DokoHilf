# DokoHilf – aktiver Arbeitsstand v27

**Status:** In Bearbeitung  
**Beginn:** 6. August 2026  
**Branch:** `fix/dark-ui-voice-recovery-v27`

## Verbindlicher Ausgangspunkt

- Ausschließliches Repository: `ys2mm422yb-max/DokoHilf`
- Ausschließliches Supabase-Projekt: `efifbuqctylsujiauabg`
- Fester öffentlicher Hauptlink: `https://ys2mm422yb-max.github.io/DokoHilf/`
- Kein Auto-Merge und keine automatische Branch-Löschung.
- Nie direkt auf `main` arbeiten.
- Bilder und Screenshots aus dem Nutzerchat bleiben ausschließlich im Chat und werden nicht in GitHub, Supabase, Tests oder Artefakte übernommen.
- `CONFIRMED_WORKFLOWS.md` bleibt die verbindliche fachliche Quelle. Bestätigte Klickwege werden nicht verändert oder neu erfunden.

## Vom Nutzer bestätigter tatsächlicher Live-Stand

Der auf dem iPhone sichtbare Build ist `KI · v26`, aber die veröffentlichte Oberfläche ist weiterhin hell. Das zuvor gezeigte dunkle Bild war ausschließlich das gewünschte Zielbild und wurde noch nie live umgesetzt.

Die Aussage, die dunkle Oberfläche sei bereits veröffentlicht, war falsch. Der veröffentlichte Code bestätigt den hellen Zustand: `assets/premium-ui-v25.css` setzt helle Seiten- und Flächenfarben ausdrücklich mit `!important`.

## Offene Fehler

### 1. Dunkles Ziel-Design fehlt

- Startseite, Chat und Sprachmodus müssen dem bestätigten dunklen Zielbild entsprechen.
- Bestehende Inhalte, Navigationswege und Sicherheitsgrenzen bleiben erhalten.
- Die Umsetzung muss auf dem iPhone tatsächlich gerendert und nicht nur statisch behauptet werden.
- Text, Mikrofonanimation, Karten und Bedienelemente dürfen auf kleinen und niedrigen iPhones nicht überlappen oder abgeschnitten werden.

### 2. Natürliche Stimme fällt aktuell aus

- Der iPhone-Screenshot zeigt dauerhaft `Stimme lädt` und anschließend nur die Gerätestimme als Ersatz.
- Die aktuellen Supabase-Edge-Function-Logs zeigen für `dokohilf-tts` Version 16 wiederholte HTTP-502-Antworten.
- `dokohilf-ai-router` Version 11 antwortet gleichzeitig mit HTTP 200; der Fehler liegt damit im TTS-Pfad, nicht im Dialogrouter.
- Der Sprachmodus darf bei einem externen TTS-Ausfall nicht sichtbar hängen bleiben.
- Nach kurzem, klar begrenztem Versuch muss automatisch und verständlich auf die Gerätestimme gewechselt werden.
- Der sichtbare Status muss den tatsächlichen Zustand anzeigen und darf nicht dauerhaft `Stimme lädt` zeigen.

## Aktueller Arbeitsauftrag

1. Dunkles Design als neue Build-Version umsetzen.
2. Sprachlade- und Fallback-Logik robust machen.
3. Bestehende Klickwege und Routerregeln vollständig unverändert regressionsprüfen.
4. Mobile Darstellung anhand künstlicher Testoberflächen prüfen.
5. TTS-Fehlerfall und erfolgreichen Rückfall auf Gerätestimme testen.
6. Alle Änderungen, Ursachen, Tests, Screenshots mit Fantasiedaten und Restprobleme im Pull Request und anschließend in `PROJECT_HANDOFF.md` dokumentieren.
7. Nur einen vollständig geprüften exakten PR-Head manuell mergen.
8. Danach `main`, `gh-pages`, Supabase und ausschließlich den festen Hauptlink prüfen.

## Pflicht für nachfolgende Chats

Vor weiterer Arbeit zuerst vollständig lesen:

1. `README.md`
2. `PROJECT_RULES.md`
3. `CONFIRMED_WORKFLOWS.md`
4. `PROJECT_HANDOFF.md`
5. solange dieser Arbeitsblock offen ist: `ACTIVE_WORK.md`

Danach den tatsächlichen GitHub-, Actions-, Pages- und Supabase-Stand prüfen. Aussagen aus älteren Chats oder Übergaben niemals ungeprüft als Live-Zustand übernehmen.
