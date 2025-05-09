// Utilities to get the context of the conversation

export type TranscriptEntry = {
  start: number;
  end: number;
  speaker: string;
  timestamp: string; // e.g., "(00:00:46)"
  text: string;
};

export function getRollingContext(
  data: TranscriptEntry[],
  targetTimestampSec: number,
  contextWindowSec: number = 120
): TranscriptEntry[] {
  // Convert timestamp like "(00:00:46)" to seconds (46)
  const toSeconds = (ts: string): number => {
    const clean = ts.replace(/[()]/g, "");
    const [hh, mm, ss] = clean.split(":").map(Number);
    return hh * 3600 + mm * 60 + ss;
  };

  const lowerBound = Math.max(0, targetTimestampSec - contextWindowSec);

  return data.filter((entry) => {
    const entrySeconds = toSeconds(entry.timestamp);
    return entrySeconds >= lowerBound && entrySeconds <= targetTimestampSec;
  });
}

export function contextToText(context: TranscriptEntry[]): string {
  return context.map((entry) => `${entry.speaker}: ${entry.text}`).join("\n");
}
