#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

EXPECTED_SOURCE_COUNTS = {
    'base': 130,
    'extra': 33,
    'release': 49,
    'workflow': 39,
    'ui': 1,
    'navigation': 17,
    'context': 10,
}

LONG_VOICE_GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.'
SHORT_VOICE_GREETING = 'Hey! Wobei brauchst du Hilfe?'

FORBIDDEN_BASE_SENTENCES = {
    'Öffne „Doku erweitert“.',
    'Öffne beim gewünschten Bewohner entweder „Doku erweitert“ oder „Doku“.',
    'Öffne oben den Reiter „Aufgaben“.',
    'Wähle darunter „Aktuelles“.',
    'Wähle „Easy-Plan“.',
}

REQUIRED_BASE_SENTENCES = {
    '„Planung“ findest du ganz oben in der festen grünen Hauptleiste. Öffne dort „Planung“. Danach erscheinen direkt darunter die zugehörigen Unterpunkte beziehungsweise Symbole.',
    '„Wichtig für Schichtübergabe“ ist bei Bedarfsmedikation bereits automatisch ausgewählt. Lass den Haken so. In das Textfeld darunter trägst du kurz den Anlass der Gabe ein.',
    'Öffne beim gewünschten Bewohner ganz oben in der festen grünen Leiste „Doku-Erweitert“.',
    'Wenn die Maßnahme für die nächste Schicht wichtig ist, hake „Wichtig für Schichtübergabe“ an. Wenn nicht, lässt du den Haken frei. In das große Textfeld darunter schreibst du kurz, was passiert ist und was du gemacht beziehungsweise durchgeführt hast.',
}


def clean_catalog_text(value: str) -> str:
    text = str(value or '').replace('**', ' ').strip()
    rewrites = {
        'Fülle das Formular nach der bei euch gültigen fachlichen Vorgabe aus. DokoHilf erfindet für noch nicht bestätigte Formularfelder keine Angaben.':
            'Fülle das geöffnete Formular wie gewohnt aus.',
        'Die Auswahl des Formulars ist bestätigt. Für nicht bestätigte Felder oder fachliche Inhalte wird kein Klickweg erfunden.':
            'Wenn du bei einem Feld unsicher bist, kläre die fachliche Angabe bitte im Team.',
        'DokoHilf darf bei diesem Ablauf nicht zu Änderungen an der Medikation anleiten.':
            'Hier geht es nur um das Ansehen der Medikation. Änderungen klärst du bitte über den dafür vorgesehenen Weg.',
        'Dafür habe ich keinen bestätigten Weg. Frag bitte kurz eine Kollegin oder einen Kollegen.':
            'Dazu habe ich keine passende Anleitung. Frag bitte kurz eine Kollegin oder einen Kollegen.',
        'Wähle im Feld „Arzt“ die Ärztin oder den Arzt aus, die beziehungsweise der die Visite durchgeführt hat.':
            'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.',
        'Den durchführenden Arzt auswählen. Nur wenn er beim Bewohner fehlt, rechts daneben das kleine Filtersymbol aktivieren und aus allen systemweit hinterlegten Ärzten wählen.':
            'Den beim Bewohner hinterlegten durchführenden Arzt auswählen.',
        'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt oder telefonisch.':
            'Trage den Grund ein, zum Beispiel „Kontrollbesuch“, und wähle den Ort: Einrichtung, beim Arzt, telefonisch oder per Mail.',
        'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest.':
            'Wähle im Pop-up den Vitalwert aus, den du erfassen möchtest, zum Beispiel Blutdruck, Puls, Sauerstoffsättigung, Blutzucker, Temperatur, Atemfrequenz oder Atemalkohol.',
        'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Bei Blutdruck sind beispielsweise Systole und Diastole erforderlich.':
            'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder. Bei Blutdruck sind zum Beispiel Systole und Diastole erforderlich.',
        'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein.':
            'Prüfe Datum und Uhrzeit und trage den gemessenen Wert ein. Je nach ausgewähltem Vitalwert erscheinen die passenden Eingabefelder.',
        'Kontrolliere, ob der Bericht sichtbar durchgestrichen ist.':
            'Kontrolliere, ob der Bericht sichtbar durchgestrichen ist. Soll der Inhalt korrekt neu dokumentiert werden, legst du anschließend einen neuen Bericht an. Ein Folgebericht korrigiert den ursprünglichen Bericht nicht.',
    }
    text = rewrites.get(text, text)
    notices = [
        r'\s*In Übungen ausschließlich Fantasiedaten verwenden\.?',
        r'\s*In Übungen nur Fantasiedaten verwenden\.?',
        r'\s*In Übungen nur Fantasiewerte verwenden\.?',
        r'\s*Im öffentlichen Test ausschließlich Fantasiedaten verwenden\.?',
        r'\s*Im öffentlichen Test nur vollständig erfundene Personen verwenden\.?',
        r'\s*Verwende in Übungen ausschließlich Fantasiedaten\.?',
        r'\s*Verwende dabei nur Fantasiedaten\.?',
    ]
    for pattern in notices:
        text = re.sub(pattern, '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s+([,.!?])', r'\1', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


def canonical_catalog_text(value: str) -> str:
    text = clean_catalog_text(value)
    if text == LONG_VOICE_GREETING:
        return SHORT_VOICE_GREETING
    return text


def normalize_key(value: str) -> str:
    return re.sub(r'\s+', ' ', canonical_catalog_text(value).lower()).strip()


def supertonic_text(value: str) -> str:
    text = canonical_catalog_text(value)
    replacements = {
        '„': '', '“': '', '”': '', '«': '', '»': '', '‹': '', '›': '', '"': '',
        '‚': '', '‘': '', '’': '', '´': '', '`': '',
        '–': '-', '—': '-', '−': '-', '…': '...',
        '→': ' zu ', '×': ' mal ', '&': ' und ', '/': ' oder ', '+': ' plus ', '%': ' Prozent ',
        '(': ' ', ')': ' ', '[': ' ', ']': ' ', '{': ' ', '}': ' ',
    }
    for source, target in replacements.items():
        text = text.replace(source, target)
    text = re.sub(r'[^A-Za-zÄÖÜäöüß0-9 .,!?;:\-]', ' ', text)
    text = re.sub(r'\s+([,.!?;:])', r'\1', text)
    return re.sub(r'\s{2,}', ' ', text).strip()


def merged_entries(*catalogs: dict) -> list[dict]:
    merged: list[dict] = []
    seen: set[str] = set()
    for catalog in catalogs:
        for raw in catalog.get('entries') or []:
            if not isinstance(raw, dict):
                continue
            text = canonical_catalog_text(raw.get('text', ''))
            key = normalize_key(text)
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append({**raw, 'text': text})
    return merged


def load_catalog(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding='utf-8'))


def validate_base_catalog(catalog: dict) -> None:
    entries = catalog.get('entries') or []
    raw_texts = {str(entry.get('text', '')).strip() for entry in entries if isinstance(entry, dict)}
    forbidden = sorted(FORBIDDEN_BASE_SENTENCES.intersection(raw_texts))
    if forbidden:
        raise SystemExit(f'legacy base speech sentences are forbidden: {forbidden}')
    missing = sorted(REQUIRED_BASE_SENTENCES.difference(raw_texts))
    if missing:
        raise SystemExit(f'current approved base speech sentences are missing: {missing}')
    if any('Doku erweitert' in text for text in raw_texts):
        raise SystemExit('legacy spelling "Doku erweitert" is forbidden in the base speech catalog')
    generated_from = str(catalog.get('generatedFrom') or '')
    if '40 approved dokohilf_guides' not in generated_from or '129 unique approved step texts' not in generated_from:
        raise SystemExit('base speech catalog provenance/count metadata is stale')


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--catalog', default='assets/guide-audio-catalog.json')
    parser.add_argument('--extra-catalog', default='assets/voice-extra-catalog-v28.json')
    parser.add_argument('--release-catalog', default='assets/voice-release-catalog-v29.json')
    parser.add_argument('--workflow-catalog', default='assets/voice-durchfuehrung-catalog-v29.json')
    parser.add_argument('--ui-catalog', default='assets/voice-ui-catalog-v29.json')
    parser.add_argument('--navigation-catalog', default='assets/voice-navigation-catalog-v29.json')
    parser.add_argument('--context-catalog', default='assets/voice-context-help-catalog-v29.json')
    parser.add_argument('--output-root', default='assets/audio/guides')
    parser.add_argument('--voice', default='F1')
    parser.add_argument('--steps', type=int, default=8)
    parser.add_argument('--speed', type=float, default=1.05)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()

    catalog_path = Path(args.catalog)
    catalogs = {
        'base': load_catalog(args.catalog),
        'extra': load_catalog(args.extra_catalog),
        'release': load_catalog(args.release_catalog),
        'workflow': load_catalog(args.workflow_catalog),
        'ui': load_catalog(args.ui_catalog),
        'navigation': load_catalog(args.navigation_catalog),
        'context': load_catalog(args.context_catalog),
    }

    source_counts = {name: len(catalog.get('entries') or []) for name, catalog in catalogs.items()}
    for name, expected in EXPECTED_SOURCE_COUNTS.items():
        actual = source_counts.get(name, 0)
        if actual != expected:
            raise SystemExit(f'expected {expected} {name} speech sentences, found {actual}')

    validate_base_catalog(catalogs['base'])

    entries = merged_entries(*catalogs.values())
    static_speech_count = len(entries)
    if not static_speech_count:
        raise SystemExit('static speech catalog is empty')
    published_texts = {str(entry.get('text') or '') for entry in entries}
    if SHORT_VOICE_GREETING not in published_texts:
        raise SystemExit('approved short voice greeting is missing from the published static catalog')
    if LONG_VOICE_GREETING in published_texts:
        raise SystemExit('legacy long voice greeting must not remain a published static catalog key')

    if args.validate_only:
        parts = ' + '.join(f'{source_counts[name]} {name}' for name in catalogs)
        print(f'Validated {parts}; {static_speech_count} unique static Supertonic sentences')
        return
    if args.limit > 0:
        entries = entries[:args.limit]

    output_root = Path(args.output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    from supertonic import TTS

    tts = TTS(auto_download=True)
    style = tts.get_voice_style(voice_name=args.voice)

    generated = []
    published_entries = []
    for index, entry in enumerate(entries):
        catalog_text = canonical_catalog_text(entry.get('text', ''))
        spoken_text = supertonic_text(catalog_text)
        if not spoken_text:
            raise RuntimeError(f'empty spoken text at index {index}')
        file_name = f'{index:03d}.wav'
        public_file = f'assets/audio/guides/{file_name}'
        destination = output_root / file_name
        wav, duration = tts.synthesize(
            text=spoken_text,
            lang='de',
            voice_style=style,
            total_steps=args.steps,
            speed=args.speed,
        )
        tts.save_audio(wav, str(destination))
        if not destination.is_file() or destination.stat().st_size <= 44:
            raise RuntimeError(f'invalid wav generated for {file_name}')
        published_entries.append({
            **{key: value for key, value in entry.items() if key != 'file'},
            'file': public_file,
            'text': catalog_text,
        })
        generated.append({
            'index': index,
            'file': public_file,
            'text': catalog_text,
            'synthesizedText': spoken_text,
            'bytes': destination.stat().st_size,
            'duration': float(duration[0]) if hasattr(duration, '__len__') else float(duration),
        })

    published_catalog = {
        **catalogs['base'],
        'voice': f'Supertonic-{args.voice}',
        'generatedWith': 'Supertonic 3 static GitHub build',
        'sourceCounts': source_counts,
        'staticSpeechCount': len(published_entries),
        'entries': published_entries,
    }
    catalog_path.write_text(json.dumps(published_catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    (output_root / 'build-summary.json').write_text(
        json.dumps({
            'engine': 'Supertonic 3',
            'voice': args.voice,
            'language': 'de',
            'steps': args.steps,
            'speed': args.speed,
            'sourceCounts': source_counts,
            'staticSpeechCount': len(generated),
            'count': len(generated),
            'entries': generated,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    print(f'Generated {len(generated)} unique static Supertonic speech audios in {output_root}')


if __name__ == '__main__':
    main()
