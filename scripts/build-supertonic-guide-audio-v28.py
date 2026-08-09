#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

BASE_GUIDE_COUNT = 93
EXTRA_SPEECH_COUNT = 33
RELEASE_SPEECH_COUNT = 49
WORKFLOW_SPEECH_COUNT = 40
UI_SPEECH_COUNT = 1
NAVIGATION_SPEECH_COUNT = 17
STATIC_SPEECH_COUNT = BASE_GUIDE_COUNT + EXTRA_SPEECH_COUNT + RELEASE_SPEECH_COUNT + WORKFLOW_SPEECH_COUNT + UI_SPEECH_COUNT + NAVIGATION_SPEECH_COUNT

LONG_VOICE_GREETING = 'Hallo! Sag mir einfach, wobei du Hilfe brauchst. Ich antworte dir laut und höre danach weiter zu.'
SHORT_VOICE_GREETING = 'Hey! Wobei brauchst du Hilfe?'


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


def normalize_key(value: str) -> str:
    return re.sub(r'\s+', ' ', clean_catalog_text(value).lower()).strip()


def supertonic_text(value: str) -> str:
    text = clean_catalog_text(value)
    if text == LONG_VOICE_GREETING:
        text = SHORT_VOICE_GREETING
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
            text = clean_catalog_text(raw.get('text', ''))
            key = normalize_key(text)
            if not key or key in seen:
                continue
            seen.add(key)
            merged.append({**raw, 'text': text})
    return merged


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--catalog', default='assets/guide-audio-catalog.json')
    parser.add_argument('--extra-catalog', default='assets/voice-extra-catalog-v28.json')
    parser.add_argument('--release-catalog', default='assets/voice-release-catalog-v29.json')
    parser.add_argument('--workflow-catalog', default='assets/voice-durchfuehrung-catalog-v29.json')
    parser.add_argument('--ui-catalog', default='assets/voice-ui-catalog-v29.json')
    parser.add_argument('--navigation-catalog', default='assets/voice-navigation-catalog-v29.json')
    parser.add_argument('--output-root', default='assets/audio/guides')
    parser.add_argument('--voice', default='F1')
    parser.add_argument('--steps', type=int, default=8)
    parser.add_argument('--speed', type=float, default=1.05)
    parser.add_argument('--limit', type=int, default=0)
    parser.add_argument('--validate-only', action='store_true')
    args = parser.parse_args()

    catalog_path = Path(args.catalog)
    base_catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    extra_catalog = json.loads(Path(args.extra_catalog).read_text(encoding='utf-8'))
    release_catalog = json.loads(Path(args.release_catalog).read_text(encoding='utf-8'))
    workflow_catalog = json.loads(Path(args.workflow_catalog).read_text(encoding='utf-8'))
    ui_catalog = json.loads(Path(args.ui_catalog).read_text(encoding='utf-8'))
    navigation_catalog = json.loads(Path(args.navigation_catalog).read_text(encoding='utf-8'))
    base_entries = base_catalog.get('entries') or []
    extra_entries = extra_catalog.get('entries') or []
    release_entries = release_catalog.get('entries') or []
    workflow_entries = workflow_catalog.get('entries') or []
    ui_entries = ui_catalog.get('entries') or []
    navigation_entries = navigation_catalog.get('entries') or []
    if len(base_entries) != BASE_GUIDE_COUNT:
        raise SystemExit(f'expected {BASE_GUIDE_COUNT} base guide sentences, found {len(base_entries)}')
    if len(extra_entries) != EXTRA_SPEECH_COUNT:
        raise SystemExit(f'expected {EXTRA_SPEECH_COUNT} fixed dialog sentences, found {len(extra_entries)}')
    if len(release_entries) != RELEASE_SPEECH_COUNT:
        raise SystemExit(f'expected {RELEASE_SPEECH_COUNT} v29 release sentences, found {len(release_entries)}')
    if len(workflow_entries) != WORKFLOW_SPEECH_COUNT:
        raise SystemExit(f'expected {WORKFLOW_SPEECH_COUNT} Durchführung workflow sentences, found {len(workflow_entries)}')
    if len(ui_entries) != UI_SPEECH_COUNT:
        raise SystemExit(f'expected {UI_SPEECH_COUNT} UI speech sentence, found {len(ui_entries)}')
    if len(navigation_entries) != NAVIGATION_SPEECH_COUNT:
        raise SystemExit(f'expected {NAVIGATION_SPEECH_COUNT} navigation speech sentences, found {len(navigation_entries)}')
    entries = merged_entries(base_catalog, extra_catalog, release_catalog, workflow_catalog, ui_catalog, navigation_catalog)
    if len(entries) != STATIC_SPEECH_COUNT:
        raise SystemExit(f'expected {STATIC_SPEECH_COUNT} unique static speech sentences, found {len(entries)}')
    if args.validate_only:
        print(
            f'Validated {BASE_GUIDE_COUNT} base guide sentences + '
            f'{EXTRA_SPEECH_COUNT} fixed dialog sentences + '
            f'{RELEASE_SPEECH_COUNT} v29 guide/help sentences + '
            f'{WORKFLOW_SPEECH_COUNT} Durchführung workflow sentences + '
            f'{UI_SPEECH_COUNT} UI speech sentence + '
            f'{NAVIGATION_SPEECH_COUNT} navigation speech sentences = {STATIC_SPEECH_COUNT} static sentences'
        )
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
        catalog_text = clean_catalog_text(entry.get('text', ''))
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
        **base_catalog,
        'voice': f'Supertonic-{args.voice}',
        'generatedWith': 'Supertonic 3 static GitHub build',
        'baseGuideCount': BASE_GUIDE_COUNT,
        'extraSpeechCount': EXTRA_SPEECH_COUNT,
        'releaseSpeechCount': RELEASE_SPEECH_COUNT,
        'workflowSpeechCount': WORKFLOW_SPEECH_COUNT,
        'uiSpeechCount': UI_SPEECH_COUNT,
        'navigationSpeechCount': NAVIGATION_SPEECH_COUNT,
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
            'baseGuideCount': BASE_GUIDE_COUNT,
            'extraSpeechCount': EXTRA_SPEECH_COUNT,
            'releaseSpeechCount': RELEASE_SPEECH_COUNT,
            'workflowSpeechCount': WORKFLOW_SPEECH_COUNT,
            'uiSpeechCount': UI_SPEECH_COUNT,
            'navigationSpeechCount': NAVIGATION_SPEECH_COUNT,
            'staticSpeechCount': len(generated),
            'count': len(generated),
            'entries': generated,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    print(f'Generated {len(generated)} static Supertonic speech audios in {output_root}')


if __name__ == '__main__':
    main()
