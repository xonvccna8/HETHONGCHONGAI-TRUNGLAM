import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAuthorshipSegments, buildProvenanceEvidence, runAuthorshipEnsemble } from "@/src/ai/authorship-detector";
import { analyzeWritingSignals } from "@/src/core/writing-signals";

const originalEnvironment = {
  review: process.env.AI_AUTHORSHIP_REVIEW_ENABLED,
  email: process.env.COPYLEAKS_EMAIL,
  key: process.env.COPYLEAKS_API_KEY,
  faid: process.env.FAID_API_URL,
  viet: process.env.VIET_AI_DETECTOR_API_URL,
};
const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
  if (originalEnvironment.review === undefined) delete process.env.AI_AUTHORSHIP_REVIEW_ENABLED;
  else process.env.AI_AUTHORSHIP_REVIEW_ENABLED = originalEnvironment.review;
  if (originalEnvironment.email === undefined) delete process.env.COPYLEAKS_EMAIL;
  else process.env.COPYLEAKS_EMAIL = originalEnvironment.email;
  if (originalEnvironment.key === undefined) delete process.env.COPYLEAKS_API_KEY;
  else process.env.COPYLEAKS_API_KEY = originalEnvironment.key;
  if (originalEnvironment.faid === undefined) delete process.env.FAID_API_URL;
  else process.env.FAID_API_URL = originalEnvironment.faid;
  if (originalEnvironment.viet === undefined) delete process.env.VIET_AI_DETECTOR_API_URL;
  else process.env.VIET_AI_DETECTOR_API_URL = originalEnvironment.viet;
});

describe("AI-authorship ensemble", () => {
  it("keeps a transparent local fallback when external detectors are unavailable", async () => {
    process.env.AI_AUTHORSHIP_REVIEW_ENABLED = "false";
    delete process.env.COPYLEAKS_EMAIL;
    delete process.env.COPYLEAKS_API_KEY;
    delete process.env.FAID_API_URL;
    delete process.env.VIET_AI_DETECTOR_API_URL;
    const text = "Tôi đã quan sát lớp học trong ba tuần và ghi lại cách từng nhóm phản hồi. Kết quả có nhiều ngoại lệ nên chưa thể đưa ra kết luận chắc chắn.";
    const local = analyzeWritingSignals(text);
    const result = await runAuthorshipEnsemble(text, local);

    expect(result.method).toBe("stylometry");
    expect(result.label).toBe("inconclusive");
    expect(result.score).toBe(local.score);
    expect(result.detectors).toHaveLength(5);
    expect(result.detectors?.find((item) => item.id === "stylometry")?.status).toBe("completed");
    expect(result.detectors?.find((item) => item.id === "copyleaks")?.status).toBe("unavailable");
  });

  it("shows vocabulary repetition as risk rather than diversity as risk", () => {
    const result = analyzeWritingSignals("học tập học tập học tập học tập. học tập học tập học tập học tập.");
    const vocabulary = result.signals.find((item) => item.label === "Thiếu đa dạng từ vựng");
    expect(vocabulary?.score).toBeGreaterThan(50);
  });

  it("creates bounded, positioned segments for paragraph-level review", () => {
    const text = `${"Đây là câu thử nghiệm có đủ nội dung. ".repeat(30)}\n\n${"Đoạn thứ hai tiếp tục phân tích. ".repeat(30)}`;
    const segments = buildAuthorshipSegments(text, 6);
    expect(segments.length).toBeGreaterThan(1);
    expect(segments.length).toBeLessThanOrEqual(6);
    expect(segments.every((segment) => text.slice(segment.start, segment.end) === segment.text)).toBe(true);
  });

  it("keeps writing-process evidence separate and transparent", () => {
    const evidence = buildProvenanceEvidence({ sessionStartedAt: new Date().toISOString(), durationMs: 12 * 60_000, inputCharacters: 800, pastedCharacters: 100, importedCharacters: 0, aiAssistedCharacters: 100, pasteEvents: 1, editEvents: 18, revisionCount: 3, imported: false }, 900);
    expect(evidence.status).toBe("available");
    expect(evidence.typedShare).toBe(80);
    expect(evidence.evidenceStrength).toBeGreaterThan(50);
  });

  it("accepts a Vietnamese zero-shot detector endpoint as independent evidence", async () => {
    process.env.AI_AUTHORSHIP_REVIEW_ENABLED = "false";
    process.env.VIET_AI_DETECTOR_API_URL = "https://detector.example.test/check";
    delete process.env.COPYLEAKS_EMAIL;
    delete process.env.COPYLEAKS_API_KEY;
    delete process.env.FAID_API_URL;
    globalThis.fetch = vi.fn(async () => new Response(JSON.stringify({ ai_score: 0.82, label: "ai", model: "VietBinoculars-test" }), { status: 200, headers: { "Content-Type": "application/json" } })) as typeof fetch;
    const text = "Trí tuệ nhân tạo có thể hỗ trợ nhiều hoạt động học tập nhưng kết quả cần được kiểm chứng bằng dữ liệu thực tế và đánh giá độc lập.";
    const result = await runAuthorshipEnsemble(text, analyzeWritingSignals(text));
    const detector = result.detectors?.find((item) => item.id === "vietaidetector");
    expect(detector?.status).toBe("completed");
    expect(detector?.score).toBe(82);
    expect(result.method).toBe("multi-detector-ensemble");
  });
});
