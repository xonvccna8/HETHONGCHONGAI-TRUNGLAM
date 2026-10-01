import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    capabilities: {
      localSimilarity: true,
      openai: Boolean(process.env.OPENAI_API_KEY),
      aiCouncil: process.env.AI_COUNCIL_ENABLED === "true" && Boolean(process.env.OPENAI_API_KEY),
      sourceDiscovery: (process.env.SEARCH_PROVIDER ?? "none") !== "none",
      database: Boolean(process.env.DATABASE_URL),
      queue: Boolean(process.env.REDIS_URL),
    },
  });
}
