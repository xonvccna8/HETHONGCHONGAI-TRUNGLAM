import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";
import { listVersions } from "@/src/db/repositories/documents";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  const { id } = await context.params;
  try {
    return NextResponse.json({ versions: await listVersions(session.email, id) });
  } catch (error) {
    console.error("Version list failed", error);
    return NextResponse.json({ error: "Chưa thể tải lịch sử phiên bản." }, { status: 503 });
  }
}
