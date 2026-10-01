import type { DiscoveredSource } from "@/src/core/types";
import { getSearchProvider } from "./search-provider";
import { planSearchQueries, type PlannedSearchQuery, type SearchStrategy } from "./search-query-planner";

export interface SourceDiscoveryResult {
  sources: DiscoveredSource[];
  queryCount: number;
  strategies: SearchStrategy[];
  candidatesRetrieved: number;
}

function isPrivateHostname(hostname: string) {
  return hostname === "localhost"
    || hostname === "0.0.0.0"
    || hostname === "127.0.0.1"
    || hostname === "169.254.169.254"
    || hostname === "::1"
    || hostname.endsWith(".local")
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

async function fetchSourceText(source: DiscoveredSource): Promise<{ text: string; fetched: boolean }> {
  const url = new URL(source.url);
  if (isPrivateHostname(url.hostname)) return { text: source.snippet, fetched: false };
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "OriginAI-SourceVerifier/2.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(8_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) return { text: source.snippet, fetched: false };
    const html = (await response.text()).slice(0, 750_000);
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;|&apos;/g, "'")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40_000);
    return { text: text || source.snippet, fetched: Boolean(text) };
  } catch {
    return { text: source.snippet, fetched: false };
  }
}

function mergeSource(target: Map<string, DiscoveredSource>, source: DiscoveredSource, query?: PlannedSearchQuery) {
  const previous = target.get(source.url);
  const matchedQueries = [...new Set([
    ...(previous?.matchedQueries ?? []),
    ...(source.matchedQueries ?? []),
    ...(query ? [query.query] : []),
  ])];
  const retrievalStrategies = [...new Set([
    ...(previous?.retrievalStrategies ?? []),
    ...(source.retrievalStrategies ?? []),
    ...(query ? [query.strategy] : []),
  ])];
  target.set(source.url, {
    ...(previous ?? source),
    ...source,
    snippet: source.snippet || previous?.snippet || "",
    matchedQueries,
    retrievalStrategies,
  });
}

async function searchWithConcurrency(
  queries: PlannedSearchQuery[],
  task: (query: PlannedSearchQuery) => Promise<DiscoveredSource[]>,
  limit = 3,
) {
  const results: Array<{ query: PlannedSearchQuery; sources: DiscoveredSource[] }> = [];
  let cursor = 0;
  async function worker() {
    while (cursor < queries.length) {
      const query = queries[cursor];
      cursor += 1;
      try {
        results.push({ query, sources: await task(query) });
      } catch (error) {
        console.error(`Source search failed for ${query.strategy}`, error);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, queries.length) }, () => worker()));
  return results;
}

export async function discoverSourcesDetailed(text: string): Promise<SourceDiscoveryResult> {
  const provider = getSearchProvider();
  if (!provider) return { sources: [], queryCount: 0, strategies: [], candidatesRetrieved: 0 };
  const maxQueries = Math.max(3, Math.min(12, Number(process.env.SOURCE_DISCOVERY_MAX_QUERIES ?? 9)));
  const queries = (await planSearchQueries(text)).slice(0, maxQueries);
  const unique = new Map<string, DiscoveredSource>();

  if (provider.searchMany) {
    try {
      (await provider.searchMany(queries, 18)).forEach((source) => mergeSource(unique, source));
    } catch (error) {
      console.error("Multi-query source search failed", error);
    }
  } else {
    const batches = await searchWithConcurrency(queries, (query) => provider.search(query.query, 5));
    batches.forEach((batch) => batch.sources.forEach((source) => mergeSource(unique, source, batch.query)));
  }

  const candidatesRetrieved = unique.size;
  const maxSources = Math.max(4, Math.min(20, Number(process.env.SOURCE_DISCOVERY_MAX_SOURCES ?? 12)));
  const candidates = [...unique.values()].slice(0, maxSources);
  const enriched = await Promise.all(candidates.map(async (source) => {
    const fetched = await fetchSourceText(source);
    return { ...source, snippet: fetched.text, verified: fetched.fetched || Boolean(source.verified) };
  }));
  return {
    sources: enriched,
    queryCount: queries.length,
    strategies: [...new Set(queries.map((item) => item.strategy))],
    candidatesRetrieved,
  };
}

export async function discoverSources(text: string): Promise<DiscoveredSource[]> {
  return (await discoverSourcesDetailed(text)).sources;
}
