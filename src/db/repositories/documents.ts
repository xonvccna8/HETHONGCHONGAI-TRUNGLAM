import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../client";
import { documents, documentVersions, users } from "../schema";
import { fingerprint, lexicalTokens } from "@/src/core/text";

export async function ensureUser(email: string, displayName: string) {
  const db = getDb();
  if (!db) return null;
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) return existing;
  const [created] = await db.insert(users).values({ email, displayName }).returning();
  return created;
}

export async function saveDocumentVersion(input: {
  ownerEmail: string;
  ownerName: string;
  title: string;
  content: string;
  documentId?: string;
  label?: string;
  ephemeral?: boolean;
}) {
  const db = getDb();
  if (!db) return null;
  const user = await ensureUser(input.ownerEmail, input.ownerName);
  if (!user) return null;
  let documentId = input.documentId;
  let version = 1;
  if (documentId) {
    const owned = await db.query.documents.findFirst({ where: and(eq(documents.id, documentId), eq(documents.ownerId, user.id)) });
    if (!owned) throw new Error("DOCUMENT_NOT_FOUND");
    version = owned.latestVersion + 1;
    await db.update(documents).set({ latestVersion: version, updatedAt: new Date(), status: "READY" }).where(eq(documents.id, documentId));
  } else {
    const [created] = await db.insert(documents).values({ ownerId: user.id, title: input.title, ephemeral: input.ephemeral ?? false, status: "READY" }).returning();
    documentId = created.id;
  }
  const [saved] = await db.insert(documentVersions).values({
    documentId,
    version,
    label: input.label ?? (version === 1 ? "Original" : `Revision ${version - 1}`),
    content: input.content,
    fingerprint: fingerprint(input.content),
    wordCount: lexicalTokens(input.content).length,
    createdBy: user.id,
  }).returning();
  return { documentId, version: saved };
}

export async function listVersions(ownerEmail: string, documentId: string) {
  const db = getDb();
  if (!db) return [];
  const user = await db.query.users.findFirst({ where: eq(users.email, ownerEmail) });
  if (!user) return [];
  const owned = await db.query.documents.findFirst({ where: and(eq(documents.id, documentId), eq(documents.ownerId, user.id)) });
  if (!owned) return [];
  return db.select().from(documentVersions).where(eq(documentVersions.documentId, documentId)).orderBy(desc(documentVersions.version));
}
