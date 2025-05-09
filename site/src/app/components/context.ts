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
  // Subtract 10 minutes (600 seconds) to account for ads
  const adjustedTargetTimestampSec = Math.max(0, targetTimestampSec - 600);
  // Convert timestamp like "(00:00:46)" to seconds (46)
  const toSeconds = (ts: string): number => {
    const clean = ts.replace(/[()]/g, "");
    const [hh, mm, ss] = clean.split(":").map(Number);
    return hh * 3600 + mm * 60 + ss;
  };

  console.log('targetTimeStamp is', adjustedTargetTimestampSec)
  const lowerBound = Math.max(0, adjustedTargetTimestampSec - contextWindowSec);

  return data.filter((entry) => {
    const entrySeconds = toSeconds(entry.timestamp);
    return entrySeconds >= lowerBound && entrySeconds <= adjustedTargetTimestampSec;
  });
}

export function contextToText(context: TranscriptEntry[]): string {
  return context.map((entry) => `${entry.speaker}: ${entry.text}`).join("\n");
}
