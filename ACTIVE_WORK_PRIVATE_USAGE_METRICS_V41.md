# DokoHilf – private anonyme Reichweitenmessung

**Stand:** 12. August 2026  
**Status:** abgeschlossen / historische Abschlussdokumentation – kein aktiver Arbeitsblock  
**Produkt-PR:** `#135`  
**Produkt-Head:** `edc2a95ccf685232ad35b2ad1f85521b108af87d`  
**Produkt-Merge:** `1aec5d1f36a633337254d845f0d9427035987f6f`  
**Hardening-PR:** `#136`  
**Hardening-Head:** `e3de641ff387455a083b2180bb9da176552ebe43`  
**Hardening-Merge:** `2d608f03848b60fb9095c0cc27c98706f744bdf1`  
**PWA-Revision:** `20260811-private-usage-metrics-v41-1`

> Diese Datei bleibt als Abschlussnachweis erhalten. Der aktuelle Gesamtstand steht in `PROJECT_HANDOFF.md`; die Statistikbedienung steht in `USAGE_METRICS.md`.

## Nutzerentscheidung

DokoHilf soll intern zeigen können, wie häufig die öffentliche Seite aufgerufen wird. Die Statistik ist nicht öffentlich in der App sichtbar und erkennt weder Nutzer noch Geräte wieder.

Verbindliche Datenschutzgrenze:

- keine Geräte-ID;
- kein Fingerprinting;
- keine IP-Adresse in der DokoHilf-Statistik;
- kein User-Agent in der Statistik;
- kein Referrer in der Statistik;
- keine Session-ID;
- keine Cookies oder neue Browser-Speicherkennung für Statistik;
- keine Nutzer-, Gesprächs-, Bewohner-, Mitarbeiter-, Fall- oder Gesundheitsdaten;
- ausschließlich aggregierte Seitenaufrufe.

Das Ergebnis ist bewusst **kein Unique-User- oder Unique-Device-Zähler**. Mehrere echte Neuladungen oder PWA-Neustarts desselben Geräts können mehrfach zählen.

## Veröffentlichte Browserlogik

`assets/release-polish-v29.js` sendet pro neu geladenem Produktionsdokument höchstens einen leeren POST an `dokohilf-usage-counter`.

- nur auf Origin `https://ys2mm422yb-max.github.io`;
- `credentials: omit`;
- Body ausschließlich `{}`;
- keine Statistikkennung im Browser;
- keine lokale Persistenz für Statistik;
- lokale CI-/Entwicklungsrender zählen nicht.

Der veröffentlichte `gh-pages`-Stand enthält den produktiven Counter-Aufruf und `service-worker.js` enthält `USAGE_METRICS_REVISION = '20260811-private-usage-metrics-v41-1'`.

## Produktive Edge Function

`dokohilf-usage-counter` im ausschließlich freigegebenen Supabase-Projekt `efifbuqctylsujiauabg`:

- Version 1 beim Abschluss des Arbeitsblocks;
- Status `ACTIVE` beim Abschluss des Arbeitsblocks;
- `verify_jwt=false`, weil die App öffentlich und kontenfrei ist;
- akzeptiert ausschließlich den festen DokoHilf-GitHub-Pages-Origin;
- kein IP-/Geräte-/Nutzertracking in der DokoHilf-Logik;
- globales flüchtiges Prozess-Rate-Limit;
- `SUPABASE_SERVICE_ROLE_KEY` ausschließlich serverseitig;
- keine öffentlichen Zählerwerte;
- Health-Mode gibt nur `ok` zurück.

Veränderliche Function-Versionen bei späterer Arbeit live prüfen.

## Produktive Datenbank

Migration `private_usage_metrics_v41` ist angewendet.

`public.dokohilf_usage_counters` enthält ausschließlich:

- `bucket` – `all` oder Tagesdatum `YYYY-MM-DD` in `Europe/Berlin`;
- `page_views` – aggregierte Anzahl.

Weitere Regeln:

- RLS aktiv;
- `anon` und `authenticated` besitzen keine Tabellenrechte;
- `dokohilf_increment_page_view()` ist `SECURITY INVOKER`;
- `anon` und `authenticated` besitzen kein EXECUTE darauf;
- `dokohilf_usage_summary` ist eine `security_invoker`-View;
- nur `service_role` besitzt den technischen Zugriff;
- Tageswerte älter als 400 Kalendertage werden automatisch entfernt;
- der Allzeit-Zähler bleibt nur solange die Reichweitenmessung aktiviert ist.

Hardening-Migration `usage_metrics_explicit_deny_policy_v41` ist nach PR #136 angewendet:

- Policy `deny_public_usage_counter_access_v41`;
- Rollen `{anon,authenticated}`;
- Befehl `ALL`;
- `USING (false)`;
- `WITH CHECK (false)`.

Damit bestehen sowohl die expliziten `REVOKE`-Sperren als auch eine RLS-Deny-All-Sperre.

## Verifikation

### Vor Produktivmigration

Vollständiger DDL-Dry-Run in Transaktion mit `ROLLBACK`:

- Tabelle, Funktion und View fehlerfrei anlegbar;
- `service_role` konnte inkrementieren;
- öffentliche Rollen konnten weder lesen noch inkrementieren;
- künstlicher alter Tagesbucket wurde durch die 400-Tage-Retention entfernt;
- nach `ROLLBACK` keine produktiven Objekte zurückgelassen.

### PR #135

Finaler exakter Head `edc2a95ccf685232ad35b2ad1f85521b108af87d` bestand alle acht Produkt-Pflichtworkflows grün, einschließlich Exact Head, Fach-/Privacy-Verträgen, iOS-/Android-Prüfung, statischer Supertonic-F1-Erzeugung, aktivem Router und exaktem Releasebuild.

Erst danach wurde manuell gemergt. Migration und Edge Function wurden erst nach Merge produktiv ausgeführt.

### Live Endpoint

Mit synthetischen technischen Requests geprüft:

- falscher Origin → HTTP 403;
- erlaubter DokoHilf-Origin mit Health-Body → HTTP 200, kein Zähleranstieg;
- erlaubter DokoHilf-Origin mit leerem Body → HTTP 200, exakt +1 in heute / 7 Tage / 30 Tage / gesamt;
- der eine synthetische Testaufruf wurde anschließend exakt wieder aus den Aggregaten entfernt.

### PR #136

Explizite Deny-All-Policy zunächst in einer Transaktion erstellt und zurückgerollt. Danach PR #136 auf exaktem Head `e3de641ff387455a083b2180bb9da176552ebe43` mit allen durch die Pfadfilter ausgelösten Pflichtworkflows grün geprüft und manuell gemergt.

Nach produktiver Migration:

- `anon` Counter SELECT: false;
- `authenticated` Counter SELECT: false;
- `anon` Summary SELECT: false;
- `authenticated` Summary SELECT: false;
- `anon` Increment EXECUTE: false;
- `authenticated` Increment EXECUTE: false;
- Supabase Security Advisor: **0 Lints**;
- Performance Advisor: unverändert nur INFO zum bisher ungenutzten Index `dokohilf_guide_versions_guide_version_idx`; nicht ungeprüft entfernen.

## Veröffentlichung

Am 12. August 2026 gegen GitHub verifiziert:

- `main`: `2d608f03848b60fb9095c0cc27c98706f744bdf1`;
- `gh-pages`: `3a90315f7225d5e99cd3893d2c450882290cf7cf`;
- gh-pages-Commit: `Publish DokoHilf 2d608f03848b60fb9095c0cc27c98706f744bdf1`.

Damit ist auch der PR-#136-Stand veröffentlicht.

## Statistik ansehen

Verbindlich dokumentiert in `USAGE_METRICS.md`.

Schnellübersicht in der technischen Supabase-SQL-Verwaltung:

```sql
select * from public.dokohilf_usage_summary;
```

Werte:

- `today_views`
- `last_7_days_views`
- `last_30_days_views`
- `total_views`

Tagesverlauf:

```sql
select bucket, page_views
from public.dokohilf_usage_counters
where bucket <> 'all'
order by bucket desc
limit 30;
```

## Abschluss

Die Reichweitenmessung ist technisch abgeschlossen. Sie verändert keine fachlichen Guides, keinen Chat-Ablauf, keine Sprachlogik und keine Kontenregel. Berichtssuche, Easy-Plan und Aufgaben/Aktuelles bleiben unverändert fachlich offen. Dieser Arbeitsblock ist **nicht mehr aktiv**.