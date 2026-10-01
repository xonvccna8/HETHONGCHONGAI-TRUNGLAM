import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/src/auth/session";

const schema = z.object({
  idToken: z.string().min(100).max(10_000),
  name: z.string().trim().min(2).max(100).optional(),
});

interface FirebaseAccount {
  localId?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  disabled?: boolean;
  providerUserInfo?: Array<{ providerId?: string }>;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Phiên đăng nhập Firebase không hợp lệ." }, { status: 400 });
  const apiKey = process.env.FIREBASE_WEB_API_KEY ?? process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Firebase Authentication chưa được cấu hình." }, { status: 503 });

  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: parsed.data.idToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) return NextResponse.json({ error: "Phiên Firebase đã hết hạn hoặc không thuộc dự án này." }, { status: 401 });
    const body = await response.json() as { users?: FirebaseAccount[] };
    const account = body.users?.[0];
    if (!account?.localId || !account.email || account.disabled) {
      return NextResponse.json({ error: "Tài khoản không tồn tại hoặc đã bị vô hiệu hóa." }, { status: 401 });
    }
    const fallbackName = account.email.split("@")[0].replace(/[._-]+/g, " ").trim();
    await createSession({
      uid: account.localId,
      email: account.email,
      name: account.displayName?.trim() || parsed.data.name || fallbackName || "Người dùng ORIGIN AI",
      provider: account.providerUserInfo?.[0]?.providerId ?? "firebase",
      emailVerified: Boolean(account.emailVerified),
    });
    return NextResponse.json({ ok: true, emailVerified: Boolean(account.emailVerified) });
  } catch (error) {
    console.error("Firebase session exchange failed", error);
    return NextResponse.json({ error: "Không thể xác minh Firebase lúc này." }, { status: 502 });
  }
}
