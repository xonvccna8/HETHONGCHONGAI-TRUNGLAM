import { NextResponse } from "next/server";
import { z } from "zod";
import { createHumanRevision } from "@/src/ai/human-revision";
import { getSession } from "@/src/auth/session";

export const maxDuration = 90;

const schema = z.object({
  text: z.string().min(20).max(100_000),
  writingSample: z.string().trim().min(80).max(20_000),
  segments: z.array(z.object({
    id: z.string().min(1).max(100),
    start: z.number().int().min(0),
    end: z.number().int().positive(),
    text: z.string().min(20).max(12_000),
    score: z.number().min(0).max(100),
    reason: z.string().max(500),
  })).min(1).max(12),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Cần mẫu văn thật tối thiểu 80 ký tự và ít nhất một đoạn hợp lệ." }, { status: 400 });
  }
  try {
    return NextResponse.json(await createHumanRevision(parsed.data));
  } catch (error) {
    console.error("Human revision failed", error);
    return NextResponse.json({ error: "Chưa thể tạo bản biên tập. Nội dung gốc vẫn được giữ nguyên." }, { status: 502 });
  }
}
