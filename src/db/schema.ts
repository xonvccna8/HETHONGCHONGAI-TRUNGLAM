import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const vector = customType<{ data: number[]; driverData: string }>({
  dataType(config: unknown) {
    const dimensions = typeof config === "object" && config && "dimensions" in config
      ? Number((config as { dimensions?: number }).dimensions ?? 3072)
      : 3072;
    return `vector(${dimensions})`;
  },
  toDriver(value) {
    return `[${value.join(",")}]`;
  },
  fromDriver(value) {
    return value.slice(1, -1).split(",").map(Number);
  },
});

export const documentStatus = pgEnum("document_status", ["DRAFT", "PROCESSING", "READY", "FAILED", "DELETED"]);
export const jobStatus = pgEnum("job_status", ["QUEUED", "RUNNING", "COMPLETED", "FAILED"]);
export const matchKind = pgEnum("match_kind", [
  "EXACT",
  "HIGH_SIMILARITY",
  "SEMANTIC_OVERLAP",
  "COMMON_KNOWLEDGE",
  "QUOTED",
  "CITED",
  "POSSIBLE_MISSING_CITATION",
  "ORIGINAL",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  displayName: varchar("display_name", { length: 160 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 300 }).notNull(),
  status: documentStatus("status").default("DRAFT").notNull(),
  latestVersion: integer("latest_version").default(1).notNull(),
  ephemeral: boolean("ephemeral").default(false).notNull(),
  sourceFilename: varchar("source_filename", { length: 500 }),
  storageKey: text("storage_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("documents_owner_updated_idx").on(table.ownerId, table.updatedAt)]);

export const documentVersions = pgTable("document_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  label: varchar("label", { length: 80 }).notNull(),
  content: text("content").notNull(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  wordCount: integer("word_count").notNull(),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("versions_document_number_idx").on(table.documentId, table.version),
  index("versions_fingerprint_idx").on(table.fingerprint),
]);

export const sections = pgTable("sections", {
  id: varchar("id", { length: 64 }).primaryKey(),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  heading: text("heading").notNull(),
  position: integer("position").notNull(),
});

export const paragraphs = pgTable("paragraphs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  sectionId: varchar("section_id", { length: 64 }).notNull().references(() => sections.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  position: integer("position").notNull(),
});

export const sentences = pgTable("sentences", {
  id: varchar("id", { length: 64 }).primaryKey(),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  paragraphId: varchar("paragraph_id", { length: 64 }).notNull().references(() => paragraphs.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  startOffset: integer("start_offset").notNull(),
  endOffset: integer("end_offset").notNull(),
  position: integer("position").notNull(),
});

export const chunks = pgTable("chunks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  sectionId: varchar("section_id", { length: 64 }).references(() => sections.id, { onDelete: "cascade" }),
  paragraphId: varchar("paragraph_id", { length: 64 }).references(() => paragraphs.id, { onDelete: "cascade" }),
  sentenceId: varchar("sentence_id", { length: 64 }).references(() => sentences.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  fingerprint: varchar("fingerprint", { length: 64 }).notNull(),
  tokenCount: integer("token_count").notNull(),
}, (table) => [index("chunks_version_fingerprint_idx").on(table.versionId, table.fingerprint)]);

export const embeddings = pgTable("embeddings", {
  id: uuid("id").defaultRandom().primaryKey(),
  chunkId: varchar("chunk_id", { length: 64 }).notNull().references(() => chunks.id, { onDelete: "cascade" }),
  model: varchar("model", { length: 120 }).notNull(),
  dimensions: integer("dimensions").notNull(),
  embedding: vector("embedding", { dimensions: 3072 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("embeddings_chunk_model_idx").on(table.chunkId, table.model)]);

export const scanJobs = pgTable("scan_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  status: jobStatus("status").default("QUEUED").notNull(),
  progress: integer("progress").default(0).notNull(),
  stage: varchar("stage", { length: 120 }).default("queued").notNull(),
  errorCode: varchar("error_code", { length: 100 }),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sources = pgTable("sources", {
  id: varchar("id", { length: 64 }).primaryKey(),
  url: text("url").notNull(),
  canonicalUrl: text("canonical_url").notNull(),
  title: text("title").notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  snippet: text("snippet"),
  contentHash: varchar("content_hash", { length: 64 }),
  verified: boolean("verified").default(false).notNull(),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("sources_canonical_url_idx").on(table.canonicalUrl)]);

export const similarityMatches = pgTable("similarity_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanJobId: uuid("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  sentenceId: varchar("sentence_id", { length: 64 }).notNull().references(() => sentences.id, { onDelete: "cascade" }),
  sourceId: varchar("source_id", { length: 64 }).references(() => sources.id),
  kind: matchKind("kind").notNull(),
  exactScore: real("exact_score").notNull(),
  fuzzyScore: real("fuzzy_score").notNull(),
  semanticScore: real("semantic_score").notNull(),
  weightedScore: real("weighted_score").notNull(),
  sourcePassage: text("source_passage"),
  explanation: text("explanation").notNull(),
}, (table) => [index("matches_job_score_idx").on(table.scanJobId, table.weightedScore)]);

export const citations = pgTable("citations", {
  id: uuid("id").defaultRandom().primaryKey(),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  sentenceId: varchar("sentence_id", { length: 64 }).references(() => sentences.id, { onDelete: "cascade" }),
  rawText: text("raw_text").notNull(),
  style: varchar("style", { length: 30 }).notNull(),
  valid: boolean("valid").default(false).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const aiAnalysis = pgTable("ai_analysis", {
  id: uuid("id").defaultRandom().primaryKey(),
  scanJobId: uuid("scan_job_id").notNull().references(() => scanJobs.id, { onDelete: "cascade" }),
  sentenceId: varchar("sentence_id", { length: 64 }).references(() => sentences.id, { onDelete: "cascade" }),
  riskLevel: varchar("risk_level", { length: 20 }).notNull(),
  confidence: real("confidence").notNull(),
  reasons: jsonb("reasons").$type<string[]>().notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  requiresCitation: boolean("requires_citation").default(false).notNull(),
});

export const rewriteSuggestions = pgTable("rewrite_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => documents.id, { onDelete: "cascade" }),
  versionId: uuid("version_id").notNull().references(() => documentVersions.id, { onDelete: "cascade" }),
  sentenceId: varchar("sentence_id", { length: 64 }).references(() => sentences.id, { onDelete: "cascade" }),
  mode: varchar("mode", { length: 30 }).notNull(),
  originalText: text("original_text").notNull(),
  proposedText: text("proposed_text").notNull(),
  factCheck: jsonb("fact_check").$type<Record<string, unknown>>().notNull(),
  accepted: boolean("accepted"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const writingProfiles = pgTable("writing_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 120 }).notNull(),
  sampleText: text("sample_text").notNull(),
  features: jsonb("features").$type<Record<string, number | string>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  operation: varchar("operation", { length: 80 }).notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  model: varchar("model", { length: 120 }),
  inputTokens: integer("input_tokens").default(0).notNull(),
  outputTokens: integer("output_tokens").default(0).notNull(),
  latencyMs: integer("latency_ms").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("usage_created_idx").on(table.createdAt)]);

export const documentRelations = relations(documents, ({ one, many }) => ({
  owner: one(users, { fields: [documents.ownerId], references: [users.id] }),
  versions: many(documentVersions),
  jobs: many(scanJobs),
}));

export const versionRelations = relations(documentVersions, ({ one, many }) => ({
  document: one(documents, { fields: [documentVersions.documentId], references: [documents.id] }),
  sections: many(sections),
  paragraphs: many(paragraphs),
  sentences: many(sentences),
  chunks: many(chunks),
}));
