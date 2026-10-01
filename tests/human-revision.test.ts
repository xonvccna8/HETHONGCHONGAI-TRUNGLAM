import { describe, expect, it } from "vitest";
import { applyRevisionRanges } from "@/src/core/human-revision";

describe("human revision range safety", () => {
  it("applies verified non-overlapping revisions without moving surrounding content", () => {
    const text = "Đoạn đầu giữ nguyên. Đoạn hai cần sửa. Đoạn cuối giữ nguyên.";
    const originalText = "Đoạn hai cần sửa.";
    const start = text.indexOf(originalText);
    expect(applyRevisionRanges(text, [{ start, end: start + originalText.length, originalText, revisedText: "Đoạn hai được diễn đạt rõ hơn." }]))
      .toBe("Đoạn đầu giữ nguyên. Đoạn hai được diễn đạt rõ hơn. Đoạn cuối giữ nguyên.");
  });

  it("rejects stale ranges whose source text no longer matches", () => {
    const text = "Nội dung hiện tại đã được chỉnh sửa.";
    expect(applyRevisionRanges(text, [{ start: 0, end: 8, originalText: "Văn bản", revisedText: "Đề xuất" }])).toBe(text);
  });

  it("does not apply overlapping revisions twice", () => {
    const text = "Một hai ba bốn.";
    const revised = applyRevisionRanges(text, [
      { start: 0, end: 10, originalText: "Một hai ba", revisedText: "A" },
      { start: 4, end: 14, originalText: "hai ba bốn", revisedText: "B" },
    ]);
    expect(revised).toBe("Một B.");
  });
});
