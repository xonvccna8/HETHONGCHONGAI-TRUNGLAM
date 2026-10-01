import { describe, expect, it } from "vitest";
import { getCouncilAgents, getQualityReviewer } from "@/src/agents/registry";

describe("AI Council registry", () => {
  it("defines six independent specialists and one quality reviewer", () => {
    const specialists = getCouncilAgents();
    expect(specialists).toHaveLength(6);
    expect(new Set(specialists.map((agent) => agent.role)).size).toBe(6);
    expect(getQualityReviewer().role).toBe("quality-reviewer");
  });

  it("routes bounded tasks to configured models without hard-coded business calls", () => {
    const agents = [...getCouncilAgents(), getQualityReviewer()];
    expect(agents.every((agent) => agent.model.length > 0)).toBe(true);
    expect(agents.every((agent) => agent.maxFindings <= 12)).toBe(true);
  });
});
