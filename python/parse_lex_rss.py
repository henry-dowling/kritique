import requests
import xml.etree.ElementTree as ET
import re
import uuid

RSS_URL = "https://lexfridman.com/feed/podcast/"
TS_OUTPUT = "../site/src/app/lib/lex_podcasts.ts"

# Helper to clean HTML tags from titles/descriptions
TAG_RE = re.compile(r'<[^>]+>')
def clean(text):
    return TAG_RE.sub('', text).replace('"', '\"')

def main():
    resp = requests.get(RSS_URL)
    resp.raise_for_status()
    root = ET.fromstring(resp.content)

    channel = root.find('channel')
    items = channel.findall('item')
    episodes = []
    for item in items:
        title = clean(item.findtext('title', default="")).strip()
        # Try to extract guest from title (usually after a colon)
        guest = ""
        if ':' in title:
            parts = title.split(':', 1)
            guest = parts[1].strip()
        else:
            guest = title
        # Extract episode number from title (e.g., '#468 – ...'), else use uuid
        match = re.match(r'#(\d+)', title)
        if match:
            ep_id = match.group(1)
        else:
            ep_id = str(uuid.uuid4())
        # Get audio URL
        enclosure = item.find('enclosure')
        audio_url = enclosure.get('url') if enclosure is not None else ""
        episodes.append({
            'title': title,
            'guest': guest,
            'episode': ep_id,
            'url': audio_url
        })

    # Write to TypeScript file
    with open(TS_OUTPUT, 'w', encoding='utf-8') as f:
        f.write('export const lexPodcasts = [\n')
        for ep in episodes:
            f.write('  {\n')
            f.write(f'    title: "{ep["title"]}",\n')
            f.write(f'    guest: "{ep["guest"]}",\n')
            f.write(f'    episode: "{ep["episode"]}",\n')
            f.write(f'    url: "{ep["url"]}"\n')
            f.write('  },\n')
        f.write('];\n')

if __name__ == "__main__":
    main() 