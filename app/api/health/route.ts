import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    capabilities: {
      localSimilarity: true,
      openai: Boolean(process.env.OPENAI_API_KEY),
      aiCouncil: process.env.AI_COUNCIL_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY),
      authorshipEnsemble: true,
      openaiAuthorshipReviewer: process.env.AI_AUTHORSHIP_REVIEW_ENABLED !== "false" && Boolean(process.env.OPENAI_API_KEY),
      copyleaks: Boolean(process.env.COPYLEAKS_EMAIL && process.env.COPYLEAKS_API_KEY),
      faid: Boolean(process.env.FAID_API_URL),
      vietAiDetector: Boolean(process.env.VIET_AI_DETECTOR_API_URL),
      writingProvenance: true,
      segmentAuthorship: true,
      sourceDiscovery: (process.env.SEARCH_PROVIDER ?? "none") !== "none",
      multiQueryDiscovery: (process.env.SEARCH_PROVIDER ?? "none") !== "none",
      similarityEvidenceGraph: true,
      crossLanguageSimilarity: Boolean(process.env.OPENAI_API_KEY),
      aiSimilarityVerifier: process.env.AI_SIMILARITY_VERIFIER_ENABLED !== "false" && Boolean(process.env.OPENAI_API_KEY),
      database: Boolean(process.env.DATABASE_URL),
      queue: Boolean(process.env.REDIS_URL),
    },
  });
}
