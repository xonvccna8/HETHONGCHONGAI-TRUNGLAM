import { NextResponse } from "next/server";
import { getSession } from "@/src/auth/session";

export const runtime = "nodejs";
export const maxDuration = 30;

const maxUploadBytes = 4 * 1024 * 1024;
const maxExtractedCharacters = 1_000_000;
const supported = new Set(["text/plain", "text/markdown", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Chưa chọn tệp." }, { status: 400 });
    if (file.size > maxUploadBytes) return NextResponse.json({ error: "Tệp vượt quá giới hạn 4 MB trên Vercel." }, { status: 413 });
    if (!supported.has(file.type) && !/\.(txt|md|pdf|docx)$/i.test(file.name)) {
      return NextResponse.json({ error: "Định dạng chưa được hỗ trợ. Hãy dùng DOCX, PDF, TXT hoặc MD." }, { status: 415 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    if (/\.docx$/i.test(file.name) || file.type.includes("wordprocessingml")) {
      const { default: mammoth } = await import("mammoth");
      text = (await mammoth.extractRawText({ buffer })).value;
    } else if (/\.pdf$/i.test(file.name) || file.type === "application/pdf") {
      const { PDFParse } = await import("pdf-parse");
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
    const extractedText = text.trim();
    if (extractedText.length > maxExtractedCharacters) {
      return NextResponse.json({ error: "Văn bản trong tệp quá dài. Hãy dùng tệp có tối đa 1 triệu ký tự." }, { status: 413 });
    }
    return NextResponse.json({ filename: file.name, text: extractedText });
  } catch (error) {
    console.error("Document extraction failed", error);
    return NextResponse.json({ error: "Không thể tải hoặc đọc tệp. Hãy kiểm tra tệp DOCX và thử lại." }, { status: 500 });
  }
}
