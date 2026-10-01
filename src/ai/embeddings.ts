import OpenAI from "openai";

export function cosineSimilarity(left: number[], right: number[]): number {
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  return leftNorm && rightNorm ? dot / Math.sqrt(leftNorm * rightNorm) : 0;
}

export async function embedTexts(texts: string[]): Promise<number[][] | null> {
  // Embeddings are an enhancement. Keep large documents on the deterministic
  // path instead of sending an oversized request or blocking a Vercel function.
  if (!process.env.OPENAI_API_KEY || !texts.length || texts.length > 512) return null;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000, maxRetries: 0 });
  const response = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-large",
    input: texts,
    encoding_format: "float",
    dimensions: Number(process.env.OPENAI_EMBEDDING_DIMENSIONS ?? 3072),
  });
  return response.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
}
