import { extractCitations } from "./citation";
import type { FactCheckResult } from "./types";

function extractFacts(text: string): string[] {
  const numberFacts = text.match(/\b\d+(?:[.,]\d+)?(?:\s*%|\s*(?:năm|tháng|ngày|triệu|tỷ|km|kg)\b)?/giu) ?? [];
  const namedFacts = text.match(/\b[A-ZÀ-Ỹ][\p{L}-]+(?:\s+[A-ZÀ-Ỹ][\p{L}-]+){0,4}\b/gu) ?? [];
  return [...new Set([...numberFacts, ...namedFacts].map((item) => item.trim()))];
}

export function compareFacts(original: string, rewritten: string): FactCheckResult {
  const before = extractFacts(original);
  const after = extractFacts(rewritten);
  const citationsBefore = extractCitations(original);
  const citationsAfter = extractCitations(rewritten);
  const missingFacts = before.filter((fact) => !after.includes(fact));
  const addedFacts = after.filter((fact) => !before.includes(fact));
  const preservedCitations = citationsBefore.every((citation) => citationsAfter.includes(citation));
  return {
    safe: !missingFacts.length && !addedFacts.length && preservedCitations,
    missingFacts,
    addedFacts,
    changedFacts: [],
    preservedCitations,
    citationsBefore,
    citationsAfter,
  };
}
