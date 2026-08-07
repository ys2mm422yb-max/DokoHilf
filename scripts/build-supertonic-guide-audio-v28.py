#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

from supertonic import TTS


def clean_catalog_text(value: str) -> str:
    text = str(value or '').replace('**', ' ').strip()
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


def merged_entries(base_catalog: dict, extra_catalog: dict) -> list[dict]:
    merged: list[dict] = []
    seen: set[str] = set()
    for source in [base_catalog.get('entries') or [], extra_catalog.get('entries') or []]:
        for raw in source:
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
    parser.add_argument('--output-root', default='assets/audio/guides')
    parser.add_argument('--voice', default='F1')
    parser.add_argument('--steps', type=int, default=8)
    parser.add_argument('--speed', type=float, default=1.05)
    parser.add_argument('--limit', type=int, default=0)
    args = parser.parse_args()

    catalog_path = Path(args.catalog)
    base_catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    extra_catalog = json.loads(Path(args.extra_catalog).read_text(encoding='utf-8'))
    entries = merged_entries(base_catalog, extra_catalog)
    if len(entries) < 93:
        raise SystemExit(f'static speech catalog unexpectedly small: {len(entries)}')
    if args.limit > 0:
        entries = entries[:args.limit]

    output_root = Path(args.output_root)
    output_root.mkdir(parents=True, exist_ok=True)

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
        'baseGuideCount': len(base_catalog.get('entries') or []),
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
            'baseGuideCount': len(base_catalog.get('entries') or []),
            'count': len(generated),
            'entries': generated,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    print(f'Generated {len(generated)} static Supertonic speech audios in {output_root}')


if __name__ == '__main__':
    main()
