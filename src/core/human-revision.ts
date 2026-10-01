export interface RevisionRange {
  start: number;
  end: number;
  originalText: string;
  revisedText: string;
}

export function applyRevisionRanges(text: string, revisions: RevisionRange[]): string {
  const valid = revisions
    .filter((item) => item.start >= 0 && item.end > item.start && item.end <= text.length)
    .filter((item) => text.slice(item.start, item.end) === item.originalText)
    .sort((left, right) => right.start - left.start);
  let boundary = text.length;
  let revised = text;
  for (const item of valid) {
    if (item.end > boundary) continue;
    revised = `${revised.slice(0, item.start)}${item.revisedText}${revised.slice(item.end)}`;
    boundary = item.start;
  }
  return revised;
}
