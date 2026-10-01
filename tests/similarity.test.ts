import { describe, expect, it } from "vitest";
import { analyzeSimilarity, bestPassageWindow, containment, fuzzySimilarity, jaccard, shingles, tokenCosine } from "@/src/core/similarity";
import { parseDocument } from "@/src/core/text";

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

  it("finds a copied sentence buried inside a long source page", () => {
    const sourceText = `${"Thời tiết hôm nay thay đổi thất thường. ".repeat(12)}${sentence} ${"Nội dung tiếp theo không liên quan. ".repeat(12)}`;
    const passage = bestPassageWindow(sentence, sourceText);
    expect(passage).toContain("Trí tuệ nhân tạo");
    const report = analyzeSimilarity(sentence, [{
      id: "source-1", title: "Nguồn", url: "https://example.com/article", domain: "example.com",
      snippet: sourceText, retrievedAt: new Date(0).toISOString(), verified: true,
    }]);
    expect(report.sentences[0].similarity).toBeGreaterThan(70);
    expect(report.sentences[0].sourceText?.length).toBeLessThan(sourceText.length);
  });

  it("uses containment to detect a passage included inside a larger window", () => {
    const small = shingles("một phương pháp đặc trưng giúp phát hiện sao chép văn bản", 3);
    const large = shingles("nghiên cứu đề xuất một phương pháp đặc trưng giúp phát hiện sao chép văn bản trong giáo dục", 3);
    expect(containment(small, large)).toBeGreaterThan(0.8);
  });

  it("marks strong cross-language semantic evidence for verification", () => {
    const crossLanguage = "Trí tuệ nhân tạo đang thay đổi cách giáo viên đánh giá việc học.";
    const sentenceId = parseDocument(crossLanguage).sentences[0].id;
    const report = analyzeSimilarity(crossLanguage, [{
      id: "source-en", title: "English source", url: "https://example.com/en", domain: "example.com",
      snippet: "Artificial intelligence is changing how teachers assess student learning.", retrievedAt: new Date(0).toISOString(), verified: true,
    }], { [`${sentenceId}:source-en`]: { score: 0.9, passage: "Artificial intelligence is changing how teachers assess student learning." } });
    const item = report.sentences[0];
    expect(item.semanticScore).toBe(90);
    expect(item.crossLanguageLikely).toBe(true);
  });
});
