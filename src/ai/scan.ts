import { embedTexts, cosineSimilarity } from "./embeddings";
import { discoverSourcesDetailed } from "./source-discovery";
import { verifySimilarityMatches } from "./similarity-verifier";
import { analyzeSimilarity, type SemanticPairScores } from "@/src/core/similarity";
import { parseDocument, splitSentences } from "@/src/core/text";
import { runAiCouncil } from "@/src/agents/council";
import { analyzeWritingSignals } from "@/src/core/writing-signals";
import { runAuthorshipEnsemble } from "./authorship-detector";
import type { DiscoveredSource, WritingProvenance } from "@/src/core/types";

export interface SourcePassage { sourceId: string; text: string }

export function buildSourcePassages(sources: DiscoveredSource[]): SourcePassage[] {
  return sources.flatMap((source) => {
    const sentences = splitSentences(source.snippet).map((item) => item.text).filter(Boolean);
    if (!sentences.length) return source.snippet ? [{ sourceId: source.id, text: source.snippet.slice(0, 1_200) }] : [];
    const passages: SourcePassage[] = [];
    let cursor = 0;
    while (cursor < sentences.length && passages.length < 30) {
      const chunk: string[] = [];
      let size = 0;
      while (cursor < sentences.length && (size < 520 || chunk.length < 2) && size < 1_100) {
        chunk.push(sentences[cursor]);
        size += sentences[cursor].length;
        cursor += 1;
      }
      if (chunk.length) passages.push({ sourceId: source.id, text: chunk.join(" ") });
      if (chunk.length > 1) cursor -= 1;
    }
    return passages;
  });
}

export async function runScan(text: string, options: { provenance?: WritingProvenance } = {}) {
  const authorshipPromise = runAuthorshipEnsemble(text, analyzeWritingSignals(text), options.provenance);
  const discovery = await discoverSourcesDetailed(text);
  const parsed = parseDocument(text);
  const sourcePassages = buildSourcePassages(discovery.sources);
  const sentenceTexts = parsed.sentences.map((sentence) => sentence.text);
  const allTexts = [...sentenceTexts, ...sourcePassages.map((passage) => passage.text)];
  const embeddings = await embedTexts(allTexts).catch(() => null);
  const semantic: SemanticPairScores = {};
  if (embeddings) {
    const sentenceCount = parsed.sentences.length;
    for (let left = 0; left < sentenceCount; left += 1) {
      for (let right = 0; right < sentenceCount; right += 1) {
        if (left === right) continue;
        semantic[`${parsed.sentences[left].id}:${parsed.sentences[right].id}`] = cosineSimilarity(embeddings[left], embeddings[right]);
      }
      sourcePassages.forEach((passage, passageIndex) => {
        const score = cosineSimilarity(embeddings[left], embeddings[sentenceCount + passageIndex]);
        const key = `${parsed.sentences[left].id}:${passage.sourceId}`;
        const previous = semantic[key];
        const previousScore = typeof previous === "number" ? previous : previous?.score ?? -1;
        if (score > previousScore) semantic[key] = { score, passage: passage.text };
      });
    }
  }

  const baseReport = {
    ...analyzeSimilarity(text, discovery.sources, semantic),
    aiWriting: await authorshipPromise,
  };
  const verified = await verifySimilarityMatches(baseReport);
  const report = {
    ...verified.report,
    similarityEngine: {
      version: "evidence-graph-v2" as const,
      queryCount: discovery.queryCount,
      searchStrategies: discovery.strategies,
      candidatesRetrieved: discovery.candidatesRetrieved,
      sourcesVerified: discovery.sources.filter((source) => source.verified).length,
      passagesCompared: parsed.sentences.length * sourcePassages.length,
      semanticEnabled: Boolean(embeddings),
      aiVerificationEnabled: verified.ran,
    },
  };
  const council = await runAiCouncil(text, report);
  return council ? { ...report, council } : report;
}
