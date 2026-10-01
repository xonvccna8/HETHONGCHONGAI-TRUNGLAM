"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Heading2, Italic, List, Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef } from "react";

export interface EditorActivity {
  inputCharacters: number;
  pastedCharacters: number;
  pasteEvents: number;
  editEvents: number;
}

function escape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function textToHtml(value: string) {
  return value.split(/\n{2,}/).map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`).join("");
}

function EditorButton({ active, label, onClick, children }: { active?: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`focus-ring grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)]"}`}>{children}</button>;
}

export function EditorPane({ value, onChange, onActivity }: { value: string; onChange: (value: string) => void; onActivity?: (activity: EditorActivity) => void }) {
  const previousText = useRef(value);
  const pendingPaste = useRef(0);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Dán nội dung hoặc tải lên tài liệu để bắt đầu…" })],
    content: textToHtml(value),
    editorProps: { attributes: { "aria-label": "Trình soạn thảo tài liệu" } },
    onUpdate: ({ editor }) => {
      const next = editor.getText({ blockSeparator: "\n\n" });
      const added = Math.max(0, next.length - previousText.current.length);
      const pastedCharacters = Math.min(pendingPaste.current, Math.max(added, pendingPaste.current));
      onActivity?.({ inputCharacters: Math.max(0, added - pastedCharacters), pastedCharacters, pasteEvents: pendingPaste.current > 0 ? 1 : 0, editEvents: 1 });
      pendingPaste.current = 0;
      previousText.current = next;
      onChange(next);
    },
  });

  useEffect(() => {
    previousText.current = value;
    if (editor && editor.getText({ blockSeparator: "\n\n" }) !== value) editor.commands.setContent(textToHtml(value), { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return <div className="h-[460px] animate-pulse rounded-2xl bg-[var(--surface-2)]" />;
  return (
    <div>
      <div className="flex items-center gap-1 border-b border-[var(--line)] px-4 py-2">
        <EditorButton label="Hoàn tác" onClick={() => editor.chain().focus().undo().run()}><Undo2 size={16} /></EditorButton>
        <EditorButton label="Làm lại" onClick={() => editor.chain().focus().redo().run()}><Redo2 size={16} /></EditorButton>
        <span className="mx-2 h-5 w-px bg-[var(--line)]" />
        <EditorButton label="In đậm" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></EditorButton>
        <EditorButton label="In nghiêng" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></EditorButton>
        <EditorButton label="Tiêu đề" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></EditorButton>
        <EditorButton label="Danh sách" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></EditorButton>
        <span className="ml-auto hidden text-[10px] font-semibold text-[var(--brand)] md:inline">● Đang ghi bằng chứng phiên</span>
        <span className="text-[12px] font-medium text-[var(--muted)]">{value.trim() ? value.trim().split(/\s+/).length : 0} từ</span>
      </div>
      <div onPasteCapture={(event) => { pendingPaste.current = event.clipboardData.getData("text/plain").length; }}>
        <EditorContent editor={editor} className="prose-editor scrollbar-thin max-h-[58vh] overflow-y-auto px-7 py-6" />
      </div>
    </div>
  );
}
