import { embedTexts, cosineSimilarity } from "./embeddings";
import { discoverSources } from "./source-discovery";
import { analyzeSimilarity, type SemanticPairScores } from "@/src/core/similarity";
import { parseDocument } from "@/src/core/text";
import { runAiCouncil } from "@/src/agents/council";

export async function runScan(text: string) {
  const sources = await discoverSources(text);
  const parsed = parseDocument(text);
  const sourceTexts = sources.map((source) => source.snippet).filter(Boolean);
  const allTexts = [...parsed.sentences.map((sentence) => sentence.text), ...sourceTexts];
  const embeddings = await embedTexts(allTexts).catch(() => null);
  const semantic: SemanticPairScores = {};
  if (embeddings) {
    const sentenceCount = parsed.sentences.length;
    for (let left = 0; left < sentenceCount; left += 1) {
      for (let right = 0; right < allTexts.length; right += 1) {
        if (left === right) continue;
        const candidateId = right < sentenceCount ? parsed.sentences[right].id : sources[right - sentenceCount]?.id;
        if (candidateId) semantic[`${parsed.sentences[left].id}:${candidateId}`] = cosineSimilarity(embeddings[left], embeddings[right]);
      }
    }
  }
  const report = analyzeSimilarity(text, sources, semantic);
  const council = await runAiCouncil(text, report);
  return council ? { ...report, council } : report;
}
