import { describe, expect, it } from "vitest";
import { analyzeSimilarity, fuzzySimilarity, jaccard, shingles, tokenCosine } from "@/src/core/similarity";

describe("multi-layer similarity", () => {
  const sentence = "Trí tuệ nhân tạo đang ngày càng đóng vai trò quan trọng trong giáo dục.";

  it("detects exact duplicated sentences", () => {
    const report = analyzeSimilarity(`${sentence}\n\n${sentence}`);
    expect(report.metrics.similarity).toBeGreaterThan(70);
    expect(report.sentences.every((item) => item.kind === "EXACT")).toBe(true);
  });

  it("gives partial credit to small word changes", () => {
    const changed = "Trí tuệ nhân tạo ngày càng giữ vai trò quan trọng đối với giáo dục.";
    expect(fuzzySimilarity(sentence, changed)).toBeGreaterThan(0.58);
    expect(jaccard(shingles(sentence), shingles(changed))).toBeGreaterThan(0.15);
  });

  it("keeps unrelated text far apart", () => {
    expect(tokenCosine(sentence, "Mưa lớn làm mực nước sông dâng nhanh trong đêm.")).toBeLessThan(0.2);
  });

  it("does not count cited content as uncited plagiarism", () => {
    const report = analyzeSimilarity("Theo Nguyễn et al. (2025), AI có thể hỗ trợ giáo viên trong đánh giá học tập.");
    expect(report.sentences[0].kind).toBe("CITED");
  });
});
