#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

from supertonic import TTS


def clean_spoken_text(value: str) -> str:
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--catalog', default='assets/guide-audio-catalog.json')
    parser.add_argument('--output-root', default='assets/audio/guides')
    parser.add_argument('--voice', default='F1')
    parser.add_argument('--steps', type=int, default=8)
    parser.add_argument('--speed', type=float, default=1.05)
    parser.add_argument('--limit', type=int, default=0)
    args = parser.parse_args()

    catalog = json.loads(Path(args.catalog).read_text(encoding='utf-8'))
    entries = list(catalog.get('entries') or [])
    if not entries:
        raise SystemExit('guide audio catalog is empty')
    if args.limit > 0:
        entries = entries[:args.limit]

    output_root = Path(args.output_root)
    output_root.mkdir(parents=True, exist_ok=True)

    tts = TTS(auto_download=True)
    style = tts.get_voice_style(voice_name=args.voice)

    generated = []
    for index, entry in enumerate(entries):
        text = clean_spoken_text(entry.get('text', ''))
        if not text:
            raise RuntimeError(f'empty spoken text at index {index}')
        file_name = Path(str(entry.get('file') or f'{index:03d}.wav')).name
        destination = output_root / file_name
        wav, duration = tts.synthesize(
            text=text,
            lang='de',
            voice_style=style,
            total_steps=args.steps,
            speed=args.speed,
        )
        tts.save_audio(wav, str(destination))
        if not destination.is_file() or destination.stat().st_size <= 44:
            raise RuntimeError(f'invalid wav generated for {file_name}')
        generated.append({
            'index': index,
            'file': file_name,
            'text': text,
            'bytes': destination.stat().st_size,
            'duration': float(duration[0]) if hasattr(duration, '__len__') else float(duration),
        })

    (output_root / 'build-summary.json').write_text(
        json.dumps({
            'engine': 'Supertonic 3',
            'voice': args.voice,
            'language': 'de',
            'steps': args.steps,
            'speed': args.speed,
            'count': len(generated),
            'entries': generated,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )
    print(f'Generated {len(generated)} static Supertonic guide audios in {output_root}')


if __name__ == '__main__':
    main()
