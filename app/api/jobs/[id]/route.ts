import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { getScanQueue } from "@/src/queue/scan-queue";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  const queue = getScanQueue();
  if (!queue) return NextResponse.json({ error: "Hàng đợi đang không khả dụng." }, { status: 503 });
  const { id } = await context.params;
  const job = await queue.getJob(id);
  if (!job || job.data.ownerEmail !== session.email) return NextResponse.json({ error: "Không tìm thấy tác vụ." }, { status: 404 });
  const state = await job.getState();
  return NextResponse.json({ id, state, progress: job.progress, result: state === "completed" ? job.returnvalue : undefined, error: job.failedReason || undefined });
}
