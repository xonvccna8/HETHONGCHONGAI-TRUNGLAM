const patterns = [
  /\([\p{L}][\p{L}\s.,&-]+,?\s+\d{4}[a-z]?\)/gu,
  /\[[0-9]+(?:\s*[-–,]\s*[0-9]+)*\]/g,
  /\b[\p{L}][\p{L}-]+\s+(?:et al\.\s*)?\(\d{4}[a-z]?\)/gu,
  /\b(?:doi:|https?:\/\/doi\.org\/)\S+/gi,
];

export function extractCitations(text: string): string[] {
  return [...new Set(patterns.flatMap((pattern) => text.match(pattern) ?? []))];
}

export function isQuoted(text: string): boolean {
  const value = text.trim();
  return value.length > 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("“") && value.endsWith("”")));
}

export function protectCitations(text: string): { protectedText: string; citations: string[]; restore: (value: string) => string } {
  const citations = extractCitations(text);
  let protectedText = text;
  citations.forEach((citation, index) => {
    protectedText = protectedText.replace(citation, `⟦CITATION_${index}⟧`);
  });
  return {
    protectedText,
    citations,
    restore: (value: string) => citations.reduce((result, citation, index) => result.replace(`⟦CITATION_${index}⟧`, citation), value),
  };
}
