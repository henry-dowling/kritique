// Utility to parse Lex Fridman transcript HTML into segment JSON format

export type Segment = {
  start: number;
  end: number;
  speaker: string;
  timestamp: string;
  text: string;
};

/**
 * Fetches and parses a Lex Fridman transcript page into segment JSON format.
 * @param url The transcript page URL
 * @returns Promise<Segment[]>
 */
export async function parseLexTranscriptFromUrl(url: string): Promise<Segment[]> {
  const res = await fetch(url);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Try to find all paragraphs or divs that look like transcript lines
  // This selector may need to be adjusted for different transcript layouts
  const transcriptNodes = Array.from(doc.querySelectorAll("p, li, div"))
    .filter(node => /\(\d{1,2}:\d{2}:\d{2}\)/.test(node.textContent || ""));

  const segments: Segment[] = [];
  let idx = 0;

  for (const node of transcriptNodes) {
    const text = node.textContent?.trim() || "";
    // Regex: Speaker (timestamp) text
    const match = text.match(/^([A-Za-z .'-]+)\s*\((\d{1,2}:\d{2}:\d{2})\)\s*(.*)$/);
    if (match) {
      const [, speaker, timestamp, segmentText] = match;
      segments.push({
        start: idx,
        end: idx,
        speaker: speaker.trim(),
        timestamp: `(${timestamp})`,
        text: segmentText.trim(),
      });
      idx++;
    }
  }

  return segments;
}

/**
 * Helper to download segments as a JSON file from the browser.
 */
export function downloadSegments(segments: Segment[], filename = "segments.json") {
  const blob = new Blob([JSON.stringify(segments, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
} 