import { NextResponse } from "next/server";
import { z } from "zod";
import { runScan } from "@/src/ai/scan";
import { getSession } from "@/src/auth/session";
import { saveDocumentVersion } from "@/src/db/repositories/documents";
import { getScanQueue } from "@/src/queue/scan-queue";

export const maxDuration = 300;

const schema = z.object({
  text: z.string().trim().min(20).max(250_000),
  title: z.string().trim().min(1).max(300).default("Tài liệu chưa đặt tên"),
  documentId: z.string().uuid().optional(),
  ephemeral: z.boolean().default(false),
  forceInline: z.boolean().default(false),
  provenance: z.object({
    sessionStartedAt: z.string().datetime(),
    durationMs: z.number().int().min(0).max(31_536_000_000),
    inputCharacters: z.number().int().min(0).max(10_000_000),
    pastedCharacters: z.number().int().min(0).max(10_000_000),
    importedCharacters: z.number().int().min(0).max(10_000_000),
    aiAssistedCharacters: z.number().int().min(0).max(10_000_000),
    pasteEvents: z.number().int().min(0).max(100_000),
    editEvents: z.number().int().min(0).max(1_000_000),
    revisionCount: z.number().int().min(0).max(100_000),
    imported: z.boolean(),
  }).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập để bắt đầu quét." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Văn bản cần có ít nhất 20 ký tự.", details: parsed.error.flatten() }, { status: 400 });

  let persisted: Awaited<ReturnType<typeof saveDocumentVersion>> = null;
  try {
    persisted = await saveDocumentVersion({
      ownerEmail: session.email,
      ownerName: session.name,
      title: parsed.data.title,
      content: parsed.data.text,
      documentId: parsed.data.documentId,
      ephemeral: parsed.data.ephemeral,
    });
  } catch (error) {
    console.error("Unable to persist document version", error);
  }

  const queue = parsed.data.forceInline ? null : getScanQueue();
  if (queue) {
    const job = await queue.add("SCAN_DOCUMENT", {
      text: parsed.data.text,
      documentId: persisted?.documentId,
      ownerEmail: session.email,
      provenance: parsed.data.provenance,
    }, { removeOnComplete: { age: 3600 }, removeOnFail: { age: 86_400 } });
    return NextResponse.json({ queued: true, jobId: job.id, documentId: persisted?.documentId });
  }

  const report = await runScan(parsed.data.text, { provenance: parsed.data.provenance });
  return NextResponse.json({ queued: false, report, documentId: persisted?.documentId, persistence: persisted ? "database" : "session" });
}
