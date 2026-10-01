import { NextResponse } from "next/server";
import { z } from "zod";
import { rewritePassage } from "@/src/ai/reviewer";
import { getSession } from "@/src/auth/session";

export const maxDuration = 60;

const schema = z.object({
  text: z.string().trim().min(5).max(12_000),
  context: z.string().max(30_000).optional(),
  mode: z.enum(["light", "deep", "personal", "academic"]).default("deep"),
  writingSample: z.string().max(20_000).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Yêu cầu viết lại chưa hợp lệ." }, { status: 400 });
  try {
    return NextResponse.json(await rewritePassage(parsed.data));
  } catch (error) {
    console.error("Rewrite failed", error);
    return NextResponse.json({ error: "Chưa thể tạo đề xuất lúc này. Nội dung gốc vẫn được giữ nguyên." }, { status: 502 });
  }
}
