import { describe, expect, it } from "vitest";
import { extractCitations, protectCitations } from "@/src/core/citation";
import { compareFacts } from "@/src/core/fact-preservation";

describe("citation and fact guards", () => {
  it("extracts common academic citation styles", () => {
    const text = "Nguyễn et al. (2025) ghi nhận kết quả này [12].";
    expect(extractCitations(text)).toEqual(expect.arrayContaining(["Nguyễn et al. (2025)", "[12]"]));
  });

  it("locks and restores citations", () => {
    const protectedValue = protectCitations("Theo Nguyễn (2025), tỷ lệ là 42%.");
    expect(protectedValue.protectedText).toContain("⟦CITATION_0⟧");
    expect(protectedValue.restore(protectedValue.protectedText)).toContain("Nguyễn (2025)");
  });

  it("flags silent number changes", () => {
    const result = compareFacts("Năm 2025, tỷ lệ đạt 42%.", "Năm 2025, tỷ lệ đạt 47%.");
    expect(result.safe).toBe(false);
    expect(result.missingFacts).toContain("42%");
    expect(result.addedFacts).toContain("47%");
  });
});
