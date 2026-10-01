import { extractCitations, isQuoted } from "./citation";
import { lexicalTokens, normalizeText, parseDocument, stableId } from "./text";
import type { DiscoveredSource, ScanReport, SentenceAnalysis } from "./types";
import { analyzeWritingSignals } from "./writing-signals";

const commonKnowledgePatterns = [
  /trái đất quay quanh mặt trời/i,
  /nước sôi ở 100(?:°| độ)?c/i,
  /hà nội là thủ đô/i,
  /việt nam nằm ở đông nam á/i,
];

export function shingles(value: string, size = 3): Set<string> {
  const tokens = lexicalTokens(value);
  const result = new Set<string>();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    result.add(tokens.slice(index, index + size).join(" "));
  }
  if (!result.size && tokens.length) result.add(tokens.join(" "));
  return result;
}

export function jaccard(left: Set<string>, right: Set<string>): number {
  if (!left.size && !right.size) return 1;
  const intersection = [...left].filter((item) => right.has(item)).length;
  const union = new Set([...left, ...right]).size;
  return union ? intersection / union : 0;
}

export function levenshtein(left: string, right: string): number {
  const a = normalizeText(left);
  const b = normalizeText(right);
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = old;
    }
  }
  return previous[b.length];
}

export function fuzzySimilarity(left: string, right: string): number {
  const maxLength = Math.max(normalizeText(left).length, normalizeText(right).length, 1);
  const edit = 1 - levenshtein(left, right) / maxLength;
  const token = jaccard(new Set(lexicalTokens(left)), new Set(lexicalTokens(right)));
  return Math.max(0, Math.min(1, edit * 0.58 + token * 0.42));
}

export function tokenCosine(left: string, right: string): number {
  const a = lexicalTokens(left);
  const b = lexicalTokens(right);
  const vocabulary = new Set([...a, ...b]);
  const fa = new Map<string, number>();
  const fb = new Map<string, number>();
  a.forEach((word) => fa.set(word, (fa.get(word) ?? 0) + 1));
  b.forEach((word) => fb.set(word, (fb.get(word) ?? 0) + 1));
  let dot = 0;
  let na = 0;
  let nb = 0;
  vocabulary.forEach((word) => {
    const x = fa.get(word) ?? 0;
    const y = fb.get(word) ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  });
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

function comparePassages(left: string, right: string, semanticOverride?: number) {
  const exact = jaccard(shingles(left), shingles(right));
  const fuzzy = fuzzySimilarity(left, right);
  const semantic = semanticOverride ?? tokenCosine(left, right);
  const lengthBalance = Math.min(left.length, right.length) / Math.max(left.length, right.length, 1);
  const weighted = exact * 0.42 + fuzzy * 0.28 + semantic * 0.25 + lengthBalance * 0.05;
  return { exact, fuzzy, semantic, weighted: Math.min(1, weighted) };
}

function classify(text: string, scores: ReturnType<typeof comparePassages>, hasSource: boolean) {
  const citations = extractCitations(text);
  if (isQuoted(text)) return { kind: "QUOTED" as const, reason: "Đoạn này được đặt trong dấu trích dẫn." };
  if (citations.length) return { kind: "CITED" as const, reason: "Đoạn có trích dẫn cần được bảo toàn khi chỉnh sửa." };
  if (commonKnowledgePatterns.some((pattern) => pattern.test(text))) {
    return { kind: "COMMON_KNOWLEDGE" as const, reason: "Nội dung có dấu hiệu là kiến thức phổ biến." };
  }
  if (scores.exact >= 0.72 && scores.weighted >= 0.76) return { kind: "EXACT" as const, reason: "Chuỗi từ và cấu trúc câu trùng ở mức rất cao." };
  if (scores.fuzzy >= 0.62 && scores.weighted >= 0.58) return { kind: "HIGH_SIMILARITY" as const, reason: "Câu có thay đổi từ ngữ nhưng cấu trúc vẫn tương đồng rõ." };
  if (scores.semantic >= 0.68 && scores.weighted >= 0.48) return { kind: "SEMANTIC_OVERLAP" as const, reason: "Cách diễn đạt khác nhưng nội dung có độ tương đồng ngữ nghĩa cao." };
  if (hasSource && scores.weighted >= 0.38) return { kind: "POSSIBLE_MISSING_CITATION" as const, reason: "Có nguồn liên quan nhưng chưa thấy trích dẫn trong câu." };
  return { kind: "ORIGINAL" as const, reason: "Chưa phát hiện trùng lặp đáng kể trong phạm vi nguồn đã kiểm tra." };
}

export interface SemanticPairScores {
  [key: string]: number;
}

export function analyzeSimilarity(
  text: string,
  sources: DiscoveredSource[] = [],
  semanticScores: SemanticPairScores = {},
): ScanReport {
  const parsed = parseDocument(text);
  const candidates = [
    ...sources.flatMap((source) => source.snippet ? [{ id: source.id, text: source.snippet, source }] : []),
    ...parsed.sentences.map((sentence) => ({ id: sentence.id, text: sentence.text, source: undefined })),
  ];

  const sentences: SentenceAnalysis[] = parsed.sentences.map((sentence) => {
    let best: { scores: ReturnType<typeof comparePassages>; id?: string; text?: string; source?: DiscoveredSource } = {
      scores: { exact: 0, fuzzy: 0, semantic: 0, weighted: 0 },
    };
    for (const candidate of candidates) {
      if (candidate.id === sentence.id) continue;
      const semantic = semanticScores[`${sentence.id}:${candidate.id}`];
      const scores = comparePassages(sentence.text, candidate.text, semantic);
      if (scores.weighted > best.scores.weighted) best = { scores, id: candidate.id, text: candidate.text, source: candidate.source };
    }
    const classification = classify(sentence.text, best.scores, Boolean(best.source));
    const similarity = Math.round(best.scores.weighted * 100);
    return {
      sentenceId: sentence.id,
      text: sentence.text,
      kind: classification.kind,
      similarity,
      exactScore: Math.round(best.scores.exact * 100),
      fuzzyScore: Math.round(best.scores.fuzzy * 100),
      semanticScore: Math.round(best.scores.semantic * 100),
      sourceId: best.source?.id,
      sourceText: best.text,
      internalMatchSentenceId: best.source ? undefined : best.id,
      reason: classification.reason,
      suggestedAction:
        classification.kind === "CITED" || classification.kind === "QUOTED"
          ? "Kiểm tra định dạng và giữ nguyên nguồn."
          : similarity >= 55
            ? "Tái cấu trúc lập luận, bổ sung phân tích riêng và dẫn nguồn khi cần."
            : "Không cần thay đổi bắt buộc.",
      citationProtected: extractCitations(sentence.text).length > 0,
    };
  });

  const suspicious = sentences.filter((item) => ["EXACT", "HIGH_SIMILARITY", "SEMANTIC_OVERLAP", "POSSIBLE_MISSING_CITATION"].includes(item.kind));
  const totalWeight = sentences.reduce((sum, item) => sum + Math.max(1, lexicalTokens(item.text).length), 0);
  const similarity = totalWeight
    ? Math.round(sentences.reduce((sum, item) => sum + item.similarity * Math.max(1, lexicalTokens(item.text).length), 0) / totalWeight)
    : 0;
  const share = (kind: string) => Math.round((sentences.filter((item) => item.kind === kind).length / Math.max(sentences.length, 1)) * 100);
  const cited = share("CITED");
  const quotes = share("QUOTED");
  const exact = share("EXACT") + share("HIGH_SIMILARITY");
  const semantic = share("SEMANTIC_OVERLAP") + share("POSSIBLE_MISSING_CITATION");
  const original = Math.max(0, 100 - exact - semantic - cited - quotes);
  const sourceContributions = sources.map((source) => ({
    ...source,
    contribution: Math.round(sentences.filter((item) => item.sourceId === source.id).reduce((sum, item) => sum + item.similarity, 0) / Math.max(sentences.length, 1)),
  })).filter((source) => source.contribution > 0);

  return {
    id: stableId("scan", `${parsed.fingerprint}:${Date.now()}`),
    createdAt: new Date().toISOString(),
    fingerprint: parsed.fingerprint,
    metrics: {
      originality: Math.max(0, 100 - similarity),
      similarity,
      properCitation: Math.round((cited + quotes) / Math.max(cited + quotes + suspicious.length, 1) * 100),
      sourcesFound: sourceContributions.length,
      composition: { exact, semantic, cited, quotes, original },
    },
    sentences,
    sources: sourceContributions.sort((a, b) => b.contribution - a.contribution),
    aiWriting: analyzeWritingSignals(text),
    limitations: [
      sources.length ? "Kết quả nguồn chỉ phản ánh các trang truy xuất được tại thời điểm quét." : "Chưa cấu hình nguồn tìm kiếm Internet; hệ thống chỉ kiểm tra trùng lặp nội bộ.",
      "Chỉ báo văn bản do AI hỗ trợ là phân tích thống kê, không chứng minh tác giả của văn bản.",
    ],
  };
}
