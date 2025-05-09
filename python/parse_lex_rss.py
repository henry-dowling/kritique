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
        # Improved guest extraction logic
        guest = ""
        # Try to extract guest from title (between en dash and colon)
        m = re.match(r"^#[0-9]+\s+[–-]\s+([^:]+):", title)
        if m:
            guest = m.group(1).strip()
        else:
            # Try to extract guest after en dash if no colon
            m2 = re.match(r"^#[0-9]+\s+[–-]\s+(.+)$", title)
            if m2:
                guest = m2.group(1).strip()
            else:
                guest = title
        # Always generate a UUID for each episode
        ep_uuid = str(uuid.uuid4())
        # Get audio URL
        enclosure = item.find('enclosure')
        audio_url = enclosure.get('url') if enclosure is not None else ""
        # Generate transcript URL from guest name
        transcript_url = ""
        if guest:
            guest_slug = re.sub(r'[^a-z0-9\-]', '', guest.lower().replace(' ', '-'))
            transcript_url = f"https://lexfridman.com/{guest_slug}-transcript"
        episodes.append({
            'title': title,
            'guest': guest,
            'uuid': ep_uuid,
            'url': audio_url,
            'transcript': transcript_url
        })

    # Write to TypeScript file
    with open(TS_OUTPUT, 'w', encoding='utf-8') as f:
        f.write('export const lexPodcasts = [\n')
        for ep in episodes:
            f.write('  {\n')
            f.write(f'    title: "{ep["title"]}",\n')
            f.write(f'    guest: "{ep["guest"]}",\n')
            f.write(f'    uuid: "{ep["uuid"]}",\n')
            f.write(f'    url: "{ep["url"]}",\n')
            f.write(f'    transcript: "{ep["transcript"]}"\n')
            f.write('  },\n')
        f.write('];\n')

if __name__ == "__main__":
    main() 