import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { analyzeSimilarity } from "../src/core/similarity";

interface Example { id: string; kind: string; original: string; candidate: string; positive: boolean }

async function main() {
  const dataset = JSON.parse(await readFile(new URL("../tests/fixtures/evaluation.vi.json", import.meta.url), "utf8")) as Example[];
  let tp = 0; let fp = 0; let fn = 0; let tn = 0;
  const started = performance.now();
  for (const example of dataset) {
    const report = analyzeSimilarity(example.candidate, [{
      id: `benchmark-${example.id}`,
      title: "Benchmark source",
      url: `https://benchmark.invalid/${example.id}`,
      domain: "benchmark.invalid",
      snippet: example.original,
      retrievedAt: new Date(0).toISOString(),
      verified: true,
    }]);
    const predicted = ["EXACT", "HIGH_SIMILARITY", "SEMANTIC_OVERLAP", "POSSIBLE_MISSING_CITATION"]
      .includes(report.sentences[0]?.kind);
    if (predicted && example.positive) tp += 1;
    else if (predicted) fp += 1;
    else if (example.positive) fn += 1;
    else tn += 1;
  }
  const latency = performance.now() - started;
  const precision = tp / Math.max(tp + fp, 1);
  const recall = tp / Math.max(tp + fn, 1);
  const f1 = 2 * precision * recall / Math.max(precision + recall, Number.EPSILON);
  const falsePositiveRate = fp / Math.max(fp + tn, 1);
  console.log(JSON.stringify({ samples: dataset.length, truePositive: tp, falsePositive: fp, falseNegative: fn, trueNegative: tn, precision, recall, f1, falsePositiveRate, latencyMs: latency }, null, 2));
}

void main();
