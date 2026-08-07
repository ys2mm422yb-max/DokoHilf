# DokoHilf – dauerhaft kontenfreies Produkt

**Stand:** 7. August 2026

**Branch:** `fix/remove-editor-accounts-v28-20260807`

## Verbindliches Ziel

DokoHilf bleibt dauerhaft eine reine erklärende Bedienhilfe. Die App besitzt weder jetzt noch später Konten, Anmeldung, Personenprofile, Rollenprofile, Fallakten oder personenbezogene Eingabemasken.

## Geprüfte Ausgangslage

Vor dem Rückbau wurde im ausschließlich freigegebenen Supabase-Projekt geprüft:

- `auth.users`: 0 Zeilen
- `public.dokohilf_user_roles`: 0 Zeilen
- `public.dokohilf_editor_audit`: 0 Zeilen
- Konto-Referenzen in Guides und Guide-Versionen: vollständig `null`
- `public.dokohilf_guides`: 25 allgemeine Guide-Inhalte
- `public.dokohilf_guide_versions`: 38 allgemeine, unpersönliche Versionszeilen

Die 38 Guide-Versionen sind keine Konten-, Personen- oder Falldaten und bleiben erhalten.

## Technischer Zielzustand

- `editor.html`, Editor-JavaScript, Editor-CSS und die frühere Rollout-Anleitung werden nicht mehr ausgeliefert.
- Der statische Build und CI brechen ab, wenn Konto- oder Login-Artefakte erneut auftauchen.
- Die frühere Edge Function `dokohilf-editor` enthält nur noch einen datenfreien `410 Gone`-Ruhestandscode und verlangt zusätzlich ein JWT.
- Die leeren Rollen- und Audit-Tabellen, Rollenfunktionen, Editor-Policies und personengebundenen Spalten werden entfernt.
- Der technische Versionsverlauf allgemeiner Guides bleibt ohne Personenbezug bestehen.
- Explizite restriktive RLS-Policies verweigern `anon` und `authenticated` jeden Zugriff auf Guides und Guide-Versionen.
- Ein aktiver `BEFORE INSERT`-Trigger auf `auth.users` blockiert jede Kontoerstellung serverseitig, einschließlich direkter Signups und Admin-Einladungen.
- Die lokale Supabase-Konfiguration deaktiviert globale, anonyme, E-Mail- und SMS-Signups zusätzlich. Der Live-Schutz bleibt der datenbankseitige Trigger, weil die gehostete Auth-Konfiguration nicht durch eine SQL-Migration gesteuert wird.
- Blocker und Guide-Archivierung liegen als `SECURITY INVOKER` in einem nicht exponierten technischen Schema; der Rückbau führt keine privilegierte Funktion im öffentlichen Schema ein.
- Die Migration bricht ab, falls vor ihrer Ausführung unerwartet doch Konten oder Personenreferenzen vorhanden sind.

## Pflichtprüfungen

1. vollständige lokale Node-Testmatrix
2. statischer QA-Build ohne Editor- oder Auth-Artefakte
3. exakt 111 validierte Supertonic-F1-Audios
4. iOS `393 × 852` und Android `412 × 915`
5. grüner exakter PR-Head vor Live-Migration und manuellem Merge
6. synthetischer Signup-Versuch scheitert; `auth.users` bleibt danach bei 0 Zeilen
7. Guide-Versionen besitzen vor und nach der Migration dieselbe Zeilenzahl
8. Security Advisor und Performance Advisor werden nach der Migration geprüft

Live-Zustände, PR-Head, Merge und Veröffentlichung werden nach Ausführung zusätzlich in der PR-Beschreibung und in `PROJECT_HANDOFF.md` festgehalten.
