import { promises as fs } from 'fs';
import path from 'path';

/**
 * Get transcript context for the last N seconds before a given timestamp.
 * @param transcriptPath Path to the transcript JSON file (relative to project root or absolute).
 * @param timestamp Timestamp (in seconds) to get context before.
 * @param windowSeconds How many seconds of context to fetch (default: 300 = 5min).
 * @returns Concatenated transcript text for the window.
 */
export async function getTranscriptContext(
  transcriptPath: string,
  timestamp: number,
  windowSeconds: number = 300
): Promise<string> {
  // Resolve the path relative to the project root
  const absPath = path.isAbsolute(transcriptPath)
    ? transcriptPath
    : path.join(process.cwd(), transcriptPath);

  // Read and parse the transcript JSON
  const fileContent = await fs.readFile(absPath, 'utf-8');
  const segments = JSON.parse(fileContent);

  // Calculate window
  const windowStart = Math.max(0, timestamp - windowSeconds);

  // Filter segments within the window
  const contextSegments = segments.filter((seg: any) => {
    // Use 'end' if available, otherwise 'start'
    const segTime = typeof seg.end === 'number' ? seg.end : seg.start;
    return segTime > windowStart && segTime <= timestamp;
  });

  // Concatenate text
  return contextSegments.map((seg: any) => seg.text).join(' ');
}
