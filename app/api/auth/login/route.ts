import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/src/auth/session";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
  name: z.string().trim().min(2).max(100).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Thông tin đăng nhập chưa hợp lệ." }, { status: 400 });
  const expectedEmail = process.env.DEMO_LOGIN_EMAIL ?? (process.env.NODE_ENV === "production" ? "" : "demo@origin.ai");
  const expectedPassword = process.env.DEMO_LOGIN_PASSWORD ?? (process.env.NODE_ENV === "production" ? "" : "origin2026");
  if (!expectedEmail || !expectedPassword || parsed.data.email !== expectedEmail || parsed.data.password !== expectedPassword) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng." }, { status: 401 });
  }
  await createSession({ email: parsed.data.email, name: parsed.data.name ?? "Nhà nghiên cứu" });
  return NextResponse.json({ ok: true });
}
