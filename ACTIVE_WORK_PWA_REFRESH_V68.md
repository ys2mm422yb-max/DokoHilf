# DokoHilf – PWA-Refresh für v34 / v68

**Stand:** 3. September 2026
**Status:** Umsetzung und Freigabe über separaten Pull Request
**Fachliche Basis:** PR #186 / `c0634b133a24e097397184ab60bfe353635d83c5`
**Ziel:** App-Version `v34`, Build `20260903-42`, Release `progressive-voice-navigation-v68`

## Ausgangslage

PR #186 wurde vollständig geprüft, gemergt und anschließend auf `gh-pages` sowie am festen öffentlichen Hauptlink verifiziert. Der veröffentlichte Stand enthielt bereits v34/v68 und 316 statische Supertonic-F1-Sätze, verwendete aber weiterhin die ältere Build-ID `20260812-41`.

Die installierte PWA vergleicht für ihre automatische Aktualisierung die Build-ID. Eine geänderte App-Version bei unveränderter Build-ID löst deshalb keinen eindeutigen Versionswechsel aus. Der PWA-Refresh wird bewusst getrennt vom fachlichen v68-PR veröffentlicht.

## Umsetzung

- Build-ID in `version.json`, `index.html` und `service-worker.js` auf `20260903-42` anheben.
- Alle aktiven Asset-URLs in App-Shell und Service Worker auf dieselbe Build-ID setzen.
- Shell-Cache mit `20260903-progressive-navigation-v68-1` rotieren.
- Den v68-Revisionsmarker über Update- und Cache-Nachrichten ausgeben.
- Tests dürfen eine gültige zukünftige Build-ID nicht mehr unnötig auf `20260812-41` festnageln.
- Der PWA-Übergangstest belegt ausdrücklich, dass der neue Build neuer als `20260812-41` ist.
- Aktuelle Audio-Statusdokumente auf v34 / Build `20260903-42` synchronisieren.

## Unveränderte Grenzen

- Keine neuen oder geänderten Bedienwege, Feldnamen oder fachlichen Informationen.
- Keine Supabase-Migration und kein Edge-Function-Deploy.
- Keine App-Konten, Personenprofile oder Echtdaten.
- Ausschließlich statische Supertonic-3/F1-Sprachausgabe; keine Browser-, System-, Geräte-, Cloud- oder Bezahlstimme.
- Berichtssuche, Easy-Plan und Aufgaben · Aktuelles bleiben fachlich offen.

## Freigabe

Branch → Pull Request → alle Pflichtprüfungen auf exakt demselben Head → manueller Merge mit erwartetem Head-SHA → Main-Deploy → `gh-pages` → feste öffentliche Seite. `Live` gilt erst, wenn Build `20260903-42`, v34/v68, der neue Service-Worker-Cache und der statische Supertonic-F1-Bestand tatsächlich ausgeliefert werden.
