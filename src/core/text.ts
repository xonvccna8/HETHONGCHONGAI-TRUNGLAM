import { createHash } from "node:crypto";
import type { ParsedDocument, ParsedParagraph, ParsedSection, ParsedSentence } from "./types";

const headingPattern = /^(#{1,6}\s+.+|[A-ZÀ-Ỹ][A-ZÀ-Ỹ\d\s:–—-]{5,}|\d+(?:\.\d+)*[.)]?\s+.{3,80})$/u;

export function normalizeText(value: string): string {
  return value
    .normalize("NFC")
    .toLocaleLowerCase("vi")
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}\s%.,;:!?()\[\]"'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lexicalTokens(value: string): string[] {
  return normalizeText(value).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function fingerprint(value: string): string {
  return createHash("sha256").update(normalizeText(value)).digest("hex");
}

export function stableId(prefix: string, value: string, index = 0): string {
  return `${prefix}_${createHash("sha1").update(`${index}:${value}`).digest("hex").slice(0, 12)}`;
}

export function splitSentences(text: string): Array<{ text: string; start: number; end: number }> {
  const clean = text.replace(/\r\n/g, "\n");
  const protectedText = clean.replace(/et al\./giu, "et al∯");
  const segmenter = new Intl.Segmenter("vi", { granularity: "sentence" });
  return [...segmenter.segment(protectedText)]
    .map((part) => ({ text: part.segment.replaceAll("∯", ".").trim(), start: part.index, end: part.index + part.segment.length }))
    .filter((part) => part.text.length > 1);
}

export function parseDocument(text: string): ParsedDocument {
  const clean = text.replace(/\r\n/g, "\n").trim();
  const sections: ParsedSection[] = [];
  const paragraphs: ParsedParagraph[] = [];
  const sentences: ParsedSentence[] = [];
  let sectionIndex = 0;
  let section: ParsedSection = { id: stableId("sec", "Mở đầu", sectionIndex), heading: "Mở đầu", paragraphIds: [] };
  sections.push(section);

  for (const [paragraphIndex, raw] of clean.split(/\n{2,}/).entries()) {
    const paragraphText = raw.replace(/\n/g, " ").trim();
    if (!paragraphText) continue;
    if (headingPattern.test(paragraphText) && paragraphText.length < 120) {
      sectionIndex += 1;
      section = {
        id: stableId("sec", paragraphText, sectionIndex),
        heading: paragraphText.replace(/^#{1,6}\s+/, ""),
        paragraphIds: [],
      };
      sections.push(section);
      continue;
    }

    const paragraphId = stableId("par", paragraphText, paragraphIndex);
    const sentenceIds: string[] = [];
    const baseOffset = clean.indexOf(raw);
    for (const [sentenceIndex, item] of splitSentences(paragraphText).entries()) {
      const id = stableId("sen", item.text, sentenceIndex + paragraphIndex * 1000);
      sentenceIds.push(id);
      sentences.push({
        id,
        text: item.text,
        start: Math.max(0, baseOffset) + item.start,
        end: Math.max(0, baseOffset) + item.end,
        paragraphId,
        sectionId: section.id,
      });
    }
    const paragraph: ParsedParagraph = { id: paragraphId, text: paragraphText, sentenceIds, sectionId: section.id };
    paragraphs.push(paragraph);
    section.paragraphIds.push(paragraphId);
  }

  return { fingerprint: fingerprint(clean), sections, paragraphs, sentences };
}

export function extractCharacteristicPhrases(text: string, limit = 3): string[] {
  const tokens = lexicalTokens(text).filter((token) => token.length > 2);
  const phrases: Array<{ value: string; score: number }> = [];
  for (let size = 8; size >= 5; size -= 1) {
    for (let index = 0; index <= tokens.length - size; index += Math.max(1, size - 3)) {
      const slice = tokens.slice(index, index + size);
      const diversity = new Set(slice).size / size;
      const lengthScore = slice.join("").length / 50;
      phrases.push({ value: slice.join(" "), score: diversity + Math.min(1, lengthScore) });
    }
  }
  return phrases
    .sort((a, b) => b.score - a.score)
    .filter((item, index, all) => all.findIndex((candidate) => candidate.value.includes(item.value) || item.value.includes(candidate.value)) === index)
    .slice(0, limit)
    .map((item) => item.value);
}
