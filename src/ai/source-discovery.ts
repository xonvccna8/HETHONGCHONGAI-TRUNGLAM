import { extractCharacteristicPhrases } from "@/src/core/text";
import type { DiscoveredSource } from "@/src/core/types";
import { getSearchProvider } from "./search-provider";

function isPrivateHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || /^10\./.test(hostname) || /^192\.168\./.test(hostname) || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
}

async function fetchSourceText(source: DiscoveredSource): Promise<string> {
  const url = new URL(source.url);
  if (isPrivateHostname(url.hostname)) return source.snippet;
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "OriginAI-SourceVerifier/1.0" },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || !contentType.includes("text/html")) return source.snippet;
    const html = (await response.text()).slice(0, 500_000);
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;|&#160;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 18_000) || source.snippet;
  } catch {
    return source.snippet;
  }
}

export async function discoverSources(text: string): Promise<DiscoveredSource[]> {
  const provider = getSearchProvider();
  if (!provider) return [];
  const phrases = extractCharacteristicPhrases(text, 3);
  const batches = await Promise.allSettled(phrases.map((phrase) => provider.search(`"${phrase}"`, 4)));
  const unique = new Map<string, DiscoveredSource>();
  batches.forEach((batch) => {
    if (batch.status === "fulfilled") batch.value.forEach((source) => unique.set(source.url, source));
  });
  const candidates = [...unique.values()].slice(0, 8);
  const enriched = await Promise.all(candidates.map(async (source) => ({ ...source, snippet: await fetchSourceText(source) })));
  return enriched;
}
