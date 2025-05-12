import os
import re
import json
import requests
from bs4 import BeautifulSoup

# Path to the TypeScript file with podcast metadata
LEX_PODCASTS_PATH = os.path.join(os.path.dirname(__file__), '../site/src/app/lib/lex_podcasts.ts')
# Output directory for parsed transcripts
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '../site/public/transcripts')

# Regex to extract podcast objects from TypeScript
PODCAST_OBJ_RE = re.compile(r'\{[^}]*?transcript: "(https://lexfridman.com/[^"]+)"[^}]*?uuid: "([^"]+)"[^}]*?title: "([^"]+)"', re.DOTALL)

# Fallback: try to extract transcript, uuid, and title in any order
FLEX_OBJ_RE = re.compile(r'transcript: "(https://lexfridman.com/[^"]+)"[\s\S]*?uuid: "([^"]+)"[\s\S]*?title: "([^"]+)"', re.DOTALL)

# Extract all podcast metadata from the TypeScript file
def extract_podcasts(ts_path):
    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
    podcasts = []
    for match in re.finditer(r'\{([\s\S]*?)\}', content):
        obj = match.group(1)
        transcript_url = re.search(r'transcript: "(https://lexfridman.com/[^"]+)"', obj)
        uuid = re.search(r'uuid: "([^"]+)"', obj)
        title = re.search(r'title: "([^"]+)"', obj)
        if transcript_url and uuid and title:
            podcasts.append({
                'transcript': transcript_url.group(1),
                'uuid': uuid.group(1),
                'title': title.group(1)
            })
    return podcasts

def slugify(text):
    return re.sub(r'[^a-zA-Z0-9_-]', '_', text)

def parse_html_transcript(url):
    try:
        resp = requests.get(url, timeout=20)
        resp.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return []
    soup = BeautifulSoup(resp.text, 'html.parser')
    segments = []
    for i, div in enumerate(soup.find_all('div', class_='ts-segment')):
        speaker = div.find('span', class_='ts-name')
        timestamp = div.find('span', class_='ts-timestamp')
        text = div.find('span', class_='ts-text')
        if not (speaker and timestamp and text):
            continue
        ts_text = timestamp.get_text(strip=True)
        # Sometimes timestamp is wrapped in <a>
        if timestamp.a:
            ts_text = timestamp.a.get_text(strip=True)
        segments.append({
            'start': i * 2,  # mimic the example format (start, end)
            'end': i * 2 + 1,
            'speaker': speaker.get_text(strip=True),
            'timestamp': ts_text,
            'text': text.get_text(strip=True)
        })
    return segments

def main():
    podcasts = extract_podcasts(LEX_PODCASTS_PATH)
    print(f"Found {len(podcasts)} podcasts with transcripts.")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for i, pod in enumerate(podcasts):
        print(f"[{i+1}/{len(podcasts)}] Processing: {pod['title']} ({pod['uuid']})")
        segments = parse_html_transcript(pod['transcript'])
        if not segments:
            print(f"  Skipped (no segments found or fetch failed)")
            continue
        out_path = os.path.join(OUTPUT_DIR, f"{pod['uuid']}.json")
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(segments, f, indent=2, ensure_ascii=False)
        print(f"  Saved {len(segments)} segments to {out_path}")

if __name__ == '__main__':
    main() 