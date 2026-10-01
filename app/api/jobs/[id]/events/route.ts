import { getSession } from "@/src/auth/session";
import { getScanQueue } from "@/src/queue/scan-queue";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Phiên đăng nhập đã hết hạn." }, { status: 401 });
  const queue = getScanQueue();
  if (!queue) return Response.json({ error: "Hàng đợi đang không khả dụng." }, { status: 503 });
  const { id } = await context.params;
  const job = await queue.getJob(id);
  if (!job || job.data.ownerEmail !== session.email) return Response.json({ error: "Không tìm thấy tác vụ." }, { status: 404 });
  const encoder = new TextEncoder();
  let checking = false;
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      const interval = setInterval(async () => {
        if (checking) return;
        checking = true;
        try {
          const current = await queue.getJob(id);
          if (!current) { send({ type: "failed", error: "Tác vụ không còn tồn tại." }); clearInterval(interval); controller.close(); return; }
          const state = await current.getState();
          const progress = typeof current.progress === "object" ? current.progress as { percent?: number; stage?: string } : { percent: Number(current.progress || 0) };
          send({ type: "progress", state, percent: progress.percent ?? 0, stage: progress.stage ?? "Đang phân tích…" });
          if (state === "completed") { send({ type: "completed", result: current.returnvalue }); clearInterval(interval); controller.close(); }
          if (state === "failed") { send({ type: "failed", error: current.failedReason }); clearInterval(interval); controller.close(); }
        } catch (error) {
          send({ type: "failed", error: error instanceof Error ? error.message : "Không thể đọc tiến trình." });
          clearInterval(interval); controller.close();
        } finally { checking = false; }
      }, 700);
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
