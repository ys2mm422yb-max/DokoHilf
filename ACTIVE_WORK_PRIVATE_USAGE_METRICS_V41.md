# DokoHilf – private anonyme Reichweitenmessung

**Stand:** 11. August 2026  
**Status:** in Arbeit / noch nicht veröffentlicht  
**Branch:** `agent/private-usage-metrics-v41`  
**Pull Request:** `#135`  
**PWA-Revision:** `20260811-private-usage-metrics-v41-1`

## Nutzerentscheidung

DokoHilf soll intern zeigen können, wie häufig die öffentliche Seite tatsächlich aufgerufen wird. Die Statistik darf nicht öffentlich in der App erscheinen und darf kein Gerät oder Nutzer wiedererkennen.

Verbindliche Datenschutzgrenze:

- keine Geräte-ID;
- kein Fingerprinting;
- keine IP-Speicherung durch DokoHilf;
- kein User-Agent in der Statistik;
- kein Referrer in der Statistik;
- keine Session-ID;
- keine Cookies oder neue Browser-Speicherkennung;
- keine Nutzer-, Gesprächs-, Bewohner-, Mitarbeiter-, Fall- oder Gesundheitsdaten;
- ausschließlich aggregierte Seitenaufrufe.

## Technische Umsetzung

### Browser

`assets/release-polish-v29.js` sendet genau einmal pro neu geladenem Produktionsdokument einen leeren POST an `dokohilf-usage-counter`.

- nur auf `https://ys2mm422yb-max.github.io`;
- `credentials: omit`;
- keine Kennung im Body;
- keine lokale Persistenz für Statistik;
- lokaler CI-/Entwicklungsrender zählt nicht.

### Edge Function

`supabase/functions/dokohilf-usage-counter/index.ts`:

- `verify_jwt=false`, weil die App öffentlich und kontenfrei ist;
- akzeptiert nur den festen DokoHilf-GitHub-Pages-Origin;
- verwendet keine IP-basierte Geräte- oder Nutzererkennung;
- besitzt nur ein globales flüchtiges Rate-Limit im Prozess;
- nutzt `SUPABASE_SERVICE_ROLE_KEY` ausschließlich serverseitig;
- gibt keine Zählerwerte öffentlich zurück;
- Health-Mode prüft nur die interne Datenverbindung und liefert ausschließlich `ok`.

### Datenbank

Migration `20260811225800_private_usage_metrics_v41.sql`:

- `public.dokohilf_usage_counters`: nur `bucket` + `page_views`;
- ein Bucket `all` für Gesamtaufrufe;
- ein ISO-Tagesbucket pro Kalendertag in `Europe/Berlin`;
- RLS aktiv;
- `anon` und `authenticated`: keine Rechte;
- nur `service_role`: notwendige Rechte;
- `dokohilf_increment_page_view()` läuft `SECURITY INVOKER` und zählt atomar;
- Tageswerte älter als 400 Kalendertage werden beim Zählen automatisch entfernt;
- `dokohilf_usage_summary` ist eine `security_invoker`-View für intern: heute, 7 Tage, 30 Tage, gesamt.

Die Statistik wird nicht in DokoHilf angezeigt. Sie ist ausschließlich über die technische Supabase-Verwaltung einsehbar.

## Bereits ausgeführte Prüfungen

Produktives Supabase-Projekt vor Änderung:

- keine vorhandene Tabelle `dokohilf_usage_counters`;
- keine vorhandene View `dokohilf_usage_summary`;
- keine vorhandene Funktion `dokohilf_increment_page_view()`.

DDL-Dry-Run wurde vollständig in einer Transaktion mit `ROLLBACK` ausgeführt:

- Schema ließ sich fehlerfrei anlegen;
- `service_role` konnte den Zähler ausführen;
- `anon` konnte weder lesen noch inkrementieren;
- `authenticated` konnte weder Statistik noch Counter lesen;
- ein künstlicher alter Tagesbucket wurde durch die 400-Tage-Retention entfernt;
- nach `ROLLBACK` waren Tabelle, View und Funktion produktiv weiterhin nicht vorhanden.

### GitHub-Freigabe

Auf PR-Head `562629fed82993ace0d1ccede4ae3e72c631479d` waren sieben der acht Pflichtworkflows erfolgreich, darunter Exact Head, Datenschutz-/Fachtests sowie iOS- und Android-Prüfungen. Nur `Deploy DokoHilf` blieb nach allen vorherigen grünen Schritten ungewöhnlich lange im unveränderten Pflichtschritt `Generate all confirmed static speech with Supertonic` aktiv. Der unmittelbar vorherige erfolgreiche Release benötigte für denselben Sprachbuild knapp vier Minuten; dieser Lauf überschritt das deutlich ohne Fehlermeldung oder Fortschrittsdaten.

Da `pages.yml` pro PR `cancel-in-progress: true` verwendet, wird dieser Status-Commit bewusst als sauberer neuer exakter PR-Head genutzt. Dadurch beendet GitHub den festhängenden alten Deploylauf und startet die vollständige Freigabe erneut, ohne Produkt-, Datenschutz- oder Sprachlogik zu verändern.

## Noch erforderlich

1. Neuen exakten PR-#135-Head feststellen.
2. Alle acht Pflichtworkflows auf exakt diesem Head grün prüfen; als Produktänderung gilt weiterhin die iOS-/Android-Freigaberegel.
3. Erst danach manuell mergen.
4. Produktive Supabase-Migration erst nach Merge anwenden.
5. Edge Function erst nach Merge produktiv deployen.
6. Security Advisor und Zugriffstests erneut prüfen.
7. `main`, `gh-pages`, festen Hauptlink und echten Statistikpfad verifizieren.
8. `PROJECT_HANDOFF.md` auf den tatsächlichen Abschlussstand aktualisieren.
