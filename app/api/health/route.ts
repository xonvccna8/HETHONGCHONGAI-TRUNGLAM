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
      sourceDiscovery: (process.env.SEARCH_PROVIDER ?? "none") !== "none",
      database: Boolean(process.env.DATABASE_URL),
      queue: Boolean(process.env.REDIS_URL),
    },
  });
}
