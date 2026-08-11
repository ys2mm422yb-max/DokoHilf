# DokoHilf – private Reichweitenstatistik

**Stand:** 11. August 2026  
**Sichtbarkeit:** ausschließlich technische Supabase-Verwaltung, nicht öffentlich in DokoHilf

DokoHilf zählt ausschließlich anonyme aggregierte Seitenaufrufe. Die Statistik erkennt weder Nutzer noch Geräte wieder.

## Gespeichert

- Allzeit-Gesamtzahl der Seitenaufrufe
- Tageszahl je Kalendertag in `Europe/Berlin`
- Tageswerte höchstens 400 Kalendertage

Nicht gespeichert werden Gerätekennung, Fingerprint, IP-Adresse in der DokoHilf-Statistik, User-Agent, Referrer, Session-ID, Konto, Identität, Gespräch, Bewohner-, Mitarbeiter-, Fall- oder Gesundheitsdaten.

## Schnellübersicht

In der technischen Supabase-SQL-Verwaltung des ausschließlich freigegebenen DokoHilf-Projekts `efifbuqctylsujiauabg`:

```sql
select * from public.dokohilf_usage_summary;
```

Die vier Werte sind:

- `today_views` – Aufrufe heute
- `last_7_days_views` – Aufrufe der letzten 7 Kalendertage einschließlich heute
- `last_30_days_views` – Aufrufe der letzten 30 Kalendertage einschließlich heute
- `total_views` – Aufrufe insgesamt seit Aktivierung der Statistik

## Tagesverlauf

```sql
select bucket, page_views
from public.dokohilf_usage_counters
where bucket <> 'all'
order by bucket desc
limit 30;
```

## Fachliche Bedeutung

Das sind **Seitenaufrufe, keine eindeutigen Personen oder Geräte**. Mehrere Neuladungen durch dasselbe Gerät werden mehrfach gezählt. Diese Grenze ist Absicht: DokoHilf verwendet keine Wiedererkennungskennung und kein Fingerprinting.

`anon` und `authenticated` besitzen weder Lesezugriff auf die Tabelle/Übersicht noch Ausführungsrecht auf die interne Increment-Funktion. Der öffentliche Browser erhält keine Statistikwerte zurück.
