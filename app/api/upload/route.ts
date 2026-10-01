import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getSession } from "@/src/auth/session";

export const runtime = "nodejs";
export const maxDuration = 30;

const supported = new Set(["text/plain", "text/markdown", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Chưa chọn tệp." }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Tệp vượt quá giới hạn 10 MB." }, { status: 413 });
  if (!supported.has(file.type) && !/\.(txt|md|pdf|docx)$/i.test(file.name)) {
    return NextResponse.json({ error: "Định dạng chưa được hỗ trợ. Hãy dùng DOCX, PDF, TXT hoặc MD." }, { status: 415 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    let text = "";
    if (/\.docx$/i.test(file.name) || file.type.includes("wordprocessingml")) {
      text = (await mammoth.extractRawText({ buffer })).value;
    } else if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      try {
        text = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    } else {
      text = buffer.toString("utf8");
    }
    if (!text.trim()) return NextResponse.json({ error: "Không đọc được nội dung văn bản trong tệp." }, { status: 422 });
    return NextResponse.json({ filename: file.name, text: text.trim() });
  } catch (error) {
    console.error("Document extraction failed", error);
    return NextResponse.json({ error: "Tệp có thể bị hỏng hoặc không chứa văn bản có thể đọc." }, { status: 422 });
  }
}
