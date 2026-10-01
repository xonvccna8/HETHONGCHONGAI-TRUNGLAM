import { afterEach, describe, expect, it } from "vitest";
import { runAuthorshipEnsemble } from "@/src/ai/authorship-detector";
import { analyzeWritingSignals } from "@/src/core/writing-signals";

const originalEnvironment = {
  review: process.env.AI_AUTHORSHIP_REVIEW_ENABLED,
  email: process.env.COPYLEAKS_EMAIL,
  key: process.env.COPYLEAKS_API_KEY,
  faid: process.env.FAID_API_URL,
};

afterEach(() => {
  if (originalEnvironment.review === undefined) delete process.env.AI_AUTHORSHIP_REVIEW_ENABLED;
  else process.env.AI_AUTHORSHIP_REVIEW_ENABLED = originalEnvironment.review;
  if (originalEnvironment.email === undefined) delete process.env.COPYLEAKS_EMAIL;
  else process.env.COPYLEAKS_EMAIL = originalEnvironment.email;
  if (originalEnvironment.key === undefined) delete process.env.COPYLEAKS_API_KEY;
  else process.env.COPYLEAKS_API_KEY = originalEnvironment.key;
  if (originalEnvironment.faid === undefined) delete process.env.FAID_API_URL;
  else process.env.FAID_API_URL = originalEnvironment.faid;
});

describe("AI-authorship ensemble", () => {
  it("keeps a transparent local fallback when external detectors are unavailable", async () => {
    process.env.AI_AUTHORSHIP_REVIEW_ENABLED = "false";
    delete process.env.COPYLEAKS_EMAIL;
    delete process.env.COPYLEAKS_API_KEY;
    delete process.env.FAID_API_URL;
    const text = "Tôi đã quan sát lớp học trong ba tuần và ghi lại cách từng nhóm phản hồi. Kết quả có nhiều ngoại lệ nên chưa thể đưa ra kết luận chắc chắn.";
    const local = analyzeWritingSignals(text);
    const result = await runAuthorshipEnsemble(text, local);

    expect(result.method).toBe("stylometry");
    expect(result.label).toBe("inconclusive");
    expect(result.score).toBe(local.score);
    expect(result.detectors).toHaveLength(4);
    expect(result.detectors?.find((item) => item.id === "stylometry")?.status).toBe("completed");
    expect(result.detectors?.find((item) => item.id === "copyleaks")?.status).toBe("unavailable");
  });

  it("shows vocabulary repetition as risk rather than diversity as risk", () => {
    const result = analyzeWritingSignals("học tập học tập học tập học tập. học tập học tập học tập học tập.");
    const vocabulary = result.signals.find((item) => item.label === "Thiếu đa dạng từ vựng");
    expect(vocabulary?.score).toBeGreaterThan(50);
  });
});
