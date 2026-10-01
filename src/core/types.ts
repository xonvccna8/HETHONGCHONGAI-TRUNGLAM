export const matchKinds = [
  "EXACT",
  "HIGH_SIMILARITY",
  "SEMANTIC_OVERLAP",
  "COMMON_KNOWLEDGE",
  "QUOTED",
  "CITED",
  "POSSIBLE_MISSING_CITATION",
  "ORIGINAL",
] as const;

export type MatchKind = (typeof matchKinds)[number];
export type RiskLevel = "very-low" | "low" | "medium" | "high";
export type AuthorshipLabel = "human" | "mixed" | "ai" | "inconclusive";
export type DetectorStatus = "completed" | "unavailable" | "skipped" | "failed";

export interface WritingProvenance {
  sessionStartedAt: string;
  durationMs: number;
  inputCharacters: number;
  pastedCharacters: number;
  importedCharacters: number;
  aiAssistedCharacters: number;
  pasteEvents: number;
  editEvents: number;
  revisionCount: number;
  imported: boolean;
}

export interface AuthorshipSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  label: AuthorshipLabel;
  score: number;
  confidence: number;
  reason: string;
  detector: string;
}

export interface ParsedSentence {
  id: string;
  text: string;
  start: number;
  end: number;
  paragraphId: string;
  sectionId: string;
}

export interface ParsedParagraph {
  id: string;
  text: string;
  sentenceIds: string[];
  sectionId: string;
}

export interface ParsedSection {
  id: string;
  heading: string;
  paragraphIds: string[];
}

export interface ParsedDocument {
  fingerprint: string;
  sections: ParsedSection[];
  paragraphs: ParsedParagraph[];
  sentences: ParsedSentence[];
}

export interface DiscoveredSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  retrievedAt: string;
  verified: boolean;
}

export interface SentenceAnalysis {
  sentenceId: string;
  text: string;
  kind: MatchKind;
  similarity: number;
  exactScore: number;
  fuzzyScore: number;
  semanticScore: number;
  sourceId?: string;
  sourceText?: string;
  reason: string;
  suggestedAction: string;
  citationProtected: boolean;
  internalMatchSentenceId?: string;
}

export interface AiWritingSignals {
  risk: RiskLevel;
  score: number;
  confidence?: number;
  label?: AuthorshipLabel;
  flaggedShare?: number;
  method?: "stylometry" | "multi-detector-ensemble";
  agreement?: {
    score: number;
    status: "strong" | "moderate" | "weak";
    completedDetectors: number;
    message: string;
  };
  provenance?: {
    status: "available" | "partial" | "unavailable";
    evidenceStrength: number;
    typedShare: number;
    pastedShare: number;
    importedShare: number;
    aiAssistedShare: number;
    durationMinutes: number;
    editEvents: number;
    revisionCount: number;
    summary: string;
  };
  segments?: AuthorshipSegment[];
  disclaimer: string;
  signals: Array<{ label: string; score: number; detail: string }>;
  detectors?: Array<{
    id: "stylometry" | "openai-reviewer" | "copyleaks" | "faid" | "vietaidetector";
    name: string;
    status: DetectorStatus;
    score?: number;
    confidence?: number;
    label: AuthorshipLabel;
    detail: string;
    model?: string;
  }>;
}

export interface ScanMetrics {
  originality: number;
  similarity: number;
  properCitation: number;
  sourcesFound: number;
  composition: {
    exact: number;
    semantic: number;
    cited: number;
    quotes: number;
    original: number;
  };
}

export interface ScanReport {
  id: string;
  createdAt: string;
  fingerprint: string;
  metrics: ScanMetrics;
  sentences: SentenceAnalysis[];
  sources: Array<DiscoveredSource & { contribution: number }>;
  aiWriting: AiWritingSignals;
  council?: CouncilReview;
  limitations: string[];
}

export type CouncilAgentRole =
  | "document-analyst"
  | "similarity-critic"
  | "source-auditor"
  | "citation-guardian"
  | "writing-coach"
  | "risk-reviewer"
  | "quality-reviewer";

export interface CouncilFinding {
  type: "support" | "warning" | "disagreement" | "recommendation";
  sentenceId?: string;
  summary: string;
  evidence: string;
  confidence: number;
  agent: CouncilAgentRole;
}

export interface CouncilAgentRun {
  role: CouncilAgentRole;
  model: string;
  status: "completed" | "failed" | "skipped";
  latencyMs: number;
  findingCount: number;
}

export interface CouncilReview {
  mode: "deterministic-council";
  summary: string;
  confidence: number;
  consensus: string[];
  disagreements: string[];
  priorities: string[];
  findings: CouncilFinding[];
  agents: CouncilAgentRun[];
  completedAt: string;
}

export interface FactCheckResult {
  safe: boolean;
  missingFacts: string[];
  addedFacts: string[];
  changedFacts: string[];
  preservedCitations: boolean;
  citationsBefore: string[];
  citationsAfter: string[];
}

export type RewriteMode = "light" | "deep" | "personal" | "academic";

export interface RewriteResult {
  rewrittenText: string;
  rationale: string;
  changes: string[];
  factCheck: FactCheckResult;
  confidence: number;
}
