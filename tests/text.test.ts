import { describe, expect, it } from "vitest";
import { parseDocument, splitSentences } from "@/src/core/text";

describe("Vietnamese document parser", () => {
  it("preserves hierarchy and stable sentence offsets", () => {
    const text = "# Mở đầu\n\nTrí tuệ nhân tạo hỗ trợ giáo dục. Giáo viên vẫn giữ vai trò định hướng.\n\n## Kết luận\n\nCông nghệ cần được đánh giá cẩn trọng.";
    const parsed = parseDocument(text);
    expect(parsed.sections).toHaveLength(3);
    expect(parsed.paragraphs).toHaveLength(2);
    expect(parsed.sentences).toHaveLength(3);
    expect(parsed.sentences[0].text).toContain("Trí tuệ nhân tạo");
    expect(parsed.sentences[0].end).toBeGreaterThan(parsed.sentences[0].start);
  });

  it("segments Vietnamese punctuation", () => {
    expect(splitSentences("Đây là câu một. Đây là câu hai! Câu cuối?")).toHaveLength(3);
  });
});
