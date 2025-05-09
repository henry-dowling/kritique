import re
import json
import os

def parse_transcript(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Remove leading/trailing whitespace
    lines = [line.strip() for line in lines]
    # Find the start of the actual transcript text
    start_idx = 0
    for i, line in enumerate(lines):
        if line.startswith('Introduction') or line.startswith('Lex Fridman') or line.startswith('ThePrimeagen'):
            start_idx = i
            break
    lines = lines[start_idx:]

    segments = []
    i = 0
    while i < len(lines):
        # Look for a speaker line
        if re.match(r'^(Lex Fridman|ThePrimeagen)$', lines[i]):
            speaker = lines[i]
            # Next line should be a timestamp (possibly with text)
            if i+1 < len(lines) and re.match(r'^\(\d{2}:\d{2}:\d{2}\)', lines[i+1]):
                ts_line = lines[i+1]
                ts_match = re.match(r'^(\(\d{2}:\d{2}:\d{2}\))\s*(.*)$', ts_line)
                if ts_match:
                    timestamp = ts_match.group(1)
                    first_text = ts_match.group(2)
                else:
                    timestamp = lines[i+1]
                    first_text = ''
                # Collect all following lines until the next speaker or timestamp
                text_lines = []
                if first_text:
                    text_lines.append(first_text)
                j = i+2
                while j < len(lines) and not re.match(r'^(Lex Fridman|ThePrimeagen)$', lines[j]) and not re.match(r'^\(\d{2}:\d{2}:\d{2}\)', lines[j]):
                    text_lines.append(lines[j])
                    j += 1
                segment_text = ' '.join(text_lines)
                segments.append({
                    "start": i,
                    "end": j-1,
                    "speaker": speaker,
                    "timestamp": timestamp,
                    "text": segment_text
                })
                i = j
            else:
                # If no timestamp, treat as a short segment
                segments.append({
                    "start": i,
                    "end": i,
                    "speaker": speaker,
                    "timestamp": "",
                    "text": ""
                })
                i += 1
        else:
            i += 1

    return segments

if __name__ == "__main__":
    # Default transcript file name
    transcript_file = os.path.join(os.path.dirname(__file__), 'lex_primeagen_transcript.txt')
    segments = parse_transcript(transcript_file)
    # Save as JSON
    output_file = os.path.join(os.path.dirname(__file__), 'lex_primeagen_segments.json')
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(segments, f, indent=2, ensure_ascii=False)
    print(f"Extracted {len(segments)} segments. Output written to {output_file}") 