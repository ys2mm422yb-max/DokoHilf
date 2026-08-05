# DokoHilf – sicherer Redaktions-Rollout

## Aktueller Umfang

Der Redaktionsbereich ist technisch vorbereitet, aber nicht für einen echten betrieblichen Rollout freigegeben. Er enthält keine realen Nutzerkonten, keine Bewohnerdaten und keine Gesundheitsdaten.

## Zugang

- Es gibt im Frontend ausschließlich **Anmelden**, keine Registrierung.
- Ein gültiges Supabase-Konto allein reicht nicht aus.
- Zugriff entsteht erst durch einen aktiven Eintrag in `public.dokohilf_user_roles`.
- Rollen werden niemals aus `user_metadata` übernommen.
- Die JWT-geschützte Edge Function prüft die Rolle bei jeder Anfrage erneut.
- Nicht zugewiesene oder deaktivierte Konten erhalten keinen Zugriff auf Redaktionsinhalte.

## Rollen

- `staff`: normales eingeladenes Konto, kein Redaktionszugriff.
- `editor`: Entwürfe bearbeiten und als geprüft markieren.
- `admin`: zusätzlich freigeben, sperren und Rollen administrativ zuweisen.

Es gibt keine automatische Standardrolle bei der Kontoerstellung.

## Öffentliche Selbstregistrierung

Die Datenbankmigration enthält `public.dokohilf_reject_public_signup(event jsonb)` für den Supabase-Hook **Before User Created**. Vor einem realen Rollout muss dieser Hook im Supabase-Auth-Dashboard aktiviert werden. Er lässt nur Einladungsvorgänge zu.

Auch vor der Hook-Aktivierung kann ein nicht zugewiesenes Konto keine Redaktionsdaten lesen oder verändern, weil Rolle, RLS und Edge Function den Zugriff unabhängig blockieren.

## Freigaben vor echten Konten

Vor dem Anlegen oder Einladen realer Mitarbeitender sind erforderlich:

- Arbeitgeber beziehungsweise Einrichtungsleitung;
- IT;
- Datenschutzbeauftragte Stelle;
- Rollen- und Offboarding-Prozess;
- Festlegung, wer fachlich prüft und wer freigibt;
- Aktivierung und Test des Before-User-Created-Hooks;
- Prüfung der Auth-Einstellungen und E-Mail-Vorlagen;
- dokumentierter Notfall- und Abschaltprozess.

## Fachliche Pflege

- Neue Inhalte beginnen als `draft`.
- Redaktion kann `draft` und `reviewed` setzen.
- Nur Administration kann `approved` und `blocked` setzen.
- Jede Änderung benötigt eine Änderungsbegründung.
- Vor jeder Änderung wird die alte Version automatisch archiviert.
- Prüfintervalle liegen zwischen 30 und 730 Tagen.
- Überfällige Anleitungen werden sichtbar markiert, aber nicht automatisch verändert oder gesperrt.

## Datenschutz

- Keine echten Personen-, Fall-, Bewohner-, Klienten- oder Gesundheitsdaten.
- Keine realen Berichtstexte.
- Vorschauen verwenden ausschließlich „Beispielperson A“ und neutrale Fantasieangaben.
- Der öffentliche statische Editor enthält keine Anleitungen; Inhalte werden erst nach JWT- und Rollenprüfung geladen.
- Zugriffstoken werden nur im `sessionStorage` der laufenden Sitzung gehalten.
- Service-Role-Schlüssel bleiben ausschließlich serverseitig in Supabase.

## Veröffentlichung

Fester öffentlicher DokoHilf-Hauptlink:

`https://ys2mm422yb-max.github.io/DokoHilf/`

Keine Vorschau-, Branch-, Cache- oder Ausweichlinks verwenden.
