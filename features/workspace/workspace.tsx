"use client";

import { Bell, ChevronDown, FilePlus2, FileText, History, LayoutDashboard, Menu, MoreHorizontal, ScanLine, Settings, ShieldCheck, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnalysisViewer } from "./analysis-viewer";
import { AssistantPanel } from "./assistant-panel";
import { CompareView, type RevisionVersion } from "./compare-view";
import { EditorPane, type EditorActivity } from "./editor-pane";
import { MetricCards } from "./metric-cards";
import { ProgressOverlay } from "./progress-overlay";
import type { SessionUser } from "@/src/auth/session";
import type { RewriteMode, RewriteResult, ScanReport, SentenceAnalysis, WritingProvenance } from "@/src/core/types";

const sample = `Trí tuệ nhân tạo đang ngày càng đóng vai trò quan trọng trong giáo dục. Các hệ thống học tập thích ứng có thể phân tích tiến độ của người học và điều chỉnh nội dung phù hợp với nhu cầu cá nhân.

Tuy nhiên, việc sử dụng AI trong nhà trường cũng đặt ra những câu hỏi về quyền riêng tư, tính minh bạch và trách nhiệm. Theo Nguyễn et al. (2025), công nghệ chỉ tạo ra giá trị bền vững khi giáo viên vẫn giữ vai trò định hướng hoạt động học tập.

Trí tuệ nhân tạo đang ngày càng đóng vai trò quan trọng trong giáo dục. Vì vậy, các cơ sở đào tạo cần xây dựng quy trình đánh giá công cụ dựa trên bằng chứng thay vì chạy theo xu hướng.`;

type MainView = "edit" | "review" | "compare";

function createProvenance(imported = false, importedCharacters = 0): WritingProvenance {
  return { sessionStartedAt: new Date().toISOString(), durationMs: 0, inputCharacters: 0, pastedCharacters: 0, importedCharacters, aiAssistedCharacters: 0, pasteEvents: 0, editEvents: 0, revisionCount: 0, imported };
}

export function Workspace({ user, startWithSample }: { user: SessionUser; startWithSample: boolean }) {
  const initialText = startWithSample ? sample : "";
  const [text, setText] = useState(initialText);
  const [title, setTitle] = useState(startWithSample ? "AI trong giáo dục" : "Tài liệu chưa đặt tên");
  const [view, setView] = useState<MainView>("edit");
  const [report, setReport] = useState<ScanReport>();
  const [selected, setSelected] = useState<SentenceAnalysis>();
  const [rewrite, setRewrite] = useState<RewriteResult>();
  const [rewriting, setRewriting] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("Đang đọc tài liệu…");
  const [message, setMessage] = useState("");
  const [documentId, setDocumentId] = useState<string>();
  const [needsRescan, setNeedsRescan] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [writingSample, setWritingSample] = useState("");
  const [versions, setVersions] = useState<RevisionVersion[]>(initialText ? [{ id: "initial", label: "Original", text: initialText, createdAt: new Date(0).toISOString() }] : []);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const provenanceRef = useRef<WritingProvenance>(createProvenance(startWithSample, initialText.length));
  const originalText = versions[0]?.text ?? text;

  const updateProgress = useCallback((percent: number, label?: string) => {
    setProgress(percent);
    if (label) setStage(label);
  }, []);

  const recordActivity = useCallback((activity: EditorActivity) => {
    const current = provenanceRef.current;
    provenanceRef.current = {
      ...current,
      inputCharacters: current.inputCharacters + activity.inputCharacters,
      pastedCharacters: current.pastedCharacters + activity.pastedCharacters,
      pasteEvents: current.pasteEvents + activity.pasteEvents,
      editEvents: current.editEvents + activity.editEvents,
    };
  }, []);

  const pollJob = useCallback((jobId: string, signal: AbortSignal): Promise<ScanReport> => {
    return new Promise((resolve, reject) => {
      const events = new EventSource(`/api/jobs/${jobId}/events`);
      const cleanup = () => events.close();
      signal.addEventListener("abort", () => { cleanup(); reject(new DOMException("Cancelled", "AbortError")); }, { once: true });
      events.onmessage = (event) => {
        const body = JSON.parse(event.data);
        if (body.type === "progress") updateProgress(Math.max(8, Math.min(98, Number(body.percent ?? 0))), body.stage);
        if (body.type === "completed") { cleanup(); resolve(body.result as ScanReport); }
        if (body.type === "failed") { cleanup(); reject(new Error(body.error ?? "Tác vụ quét đã thất bại.")); }
      };
      events.onerror = () => { cleanup(); reject(new Error("Mất kết nối với tiến trình quét.")); };
    });
  }, [updateProgress]);

  const scanDocument = useCallback(async (overrideText?: string) => {
    const content = overrideText ?? text;
    if (content.trim().length < 20 || scanning) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setScanning(true); setMessage(""); setProgress(6); setStage("Đang đọc tài liệu…"); setRewrite(undefined);
    const stages = [[18,"Đang chia cấu trúc…"],[34,"Đang phân tích trùng lặp…"],[48,"Đang tìm nguồn…"],[63,"Đang phân tích ngữ nghĩa…"]] as const;
    let stageIndex = 0;
    const timer = window.setInterval(() => {
      if (stageIndex < stages.length) { updateProgress(stages[stageIndex][0], stages[stageIndex][1]); stageIndex += 1; }
    }, 520);
    try {
      const provenance = { ...provenanceRef.current, durationMs: Math.max(0, Date.now() - Date.parse(provenanceRef.current.sessionStartedAt)), revisionCount: versions.length };
      const response = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ text: content, title, documentId, ephemeral, provenance }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Không thể quét tài liệu.");
      if (body.documentId) setDocumentId(body.documentId);
      const nextReport = body.queued ? await pollJob(body.jobId, controller.signal) : body.report as ScanReport;
      updateProgress(100, "Hoàn tất");
      setReport(nextReport);
      setSelected(nextReport.sentences.find((item) => item.kind !== "ORIGINAL") ?? nextReport.sentences[0]);
      setView("review");
      setNeedsRescan(false);
      if (!versions.length) setVersions([{ id: crypto.randomUUID(), label: "Original", text: content, createdAt: new Date().toISOString() }]);
      window.setTimeout(() => setScanning(false), 350);
      return nextReport;
    } catch (error) {
      if ((error as Error).name !== "AbortError") setMessage((error as Error).message || "Đã có lỗi khi quét tài liệu.");
      setScanning(false);
      return undefined;
    } finally {
      window.clearInterval(timer);
      abortRef.current = null;
    }
  }, [documentId, ephemeral, pollJob, scanning, text, title, updateProgress, versions.length]);

  async function uploadFile(file: File) {
    setMessage("");
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: form });
    const body = await response.json();
    if (!response.ok) { setMessage(body.error ?? "Không thể đọc tệp."); return; }
    provenanceRef.current = createProvenance(true, body.text.length);
    setText(body.text); setTitle(body.filename.replace(/\.[^.]+$/, "")); setView("edit"); setReport(undefined); setVersions([]); setDocumentId(undefined);
  }

  async function requestRewrite(mode: RewriteMode) {
    if (!selected) return;
    setRewriting(true); setMessage("");
    try {
      const response = await fetch("/api/rewrite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: selected.text, context: text, mode, writingSample: mode === "personal" ? writingSample : undefined }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Không thể tạo đề xuất.");
      setRewrite(body as RewriteResult);
    } catch (error) { setMessage((error as Error).message); }
    finally { setRewriting(false); }
  }

  function acceptRewrite() {
    if (!selected || !rewrite?.factCheck.safe) return;
    const revised = text.replace(selected.text, rewrite.rewrittenText);
    if (revised === text) { setMessage("Không tìm thấy câu gốc trong phiên bản hiện tại."); return; }
    const version: RevisionVersion = { id: crypto.randomUUID(), label: `Revision ${Math.max(1, versions.length)}`, text: revised, createdAt: new Date().toISOString() };
    provenanceRef.current = { ...provenanceRef.current, aiAssistedCharacters: provenanceRef.current.aiAssistedCharacters + rewrite.rewrittenText.length };
    setText(revised); setVersions((items) => [...items, version]); setNeedsRescan(true); setView("compare"); setRewrite(undefined);
  }

  function restoreVersion(version: RevisionVersion) {
    setText(version.text); setVersions((items) => [...items, { id: crypto.randomUUID(), label: `Khôi phục ${version.label}`, text: version.text, createdAt: new Date().toISOString() }]); setReport(undefined); setSelected(undefined); setRewrite(undefined); setNeedsRescan(true); setView("edit");
  }

  function newDocument() {
    provenanceRef.current = createProvenance();
    setText(""); setTitle("Tài liệu chưa đặt tên"); setReport(undefined); setSelected(undefined); setRewrite(undefined); setVersions([]); setDocumentId(undefined); setNeedsRescan(false); setView("edit");
  }

  function downloadWordReport() {
    if (!report) return;
    const rows = report.sentences.map((item) => `<tr><td>${escapeHtml(item.text)}</td><td>${item.kind}</td><td>${item.similarity}%</td><td>${escapeHtml(item.reason)}</td></tr>`).join("");
    const detectors = report.aiWriting.detectors?.map((item) => `<li>${escapeHtml(item.name)}: <b>${item.score !== undefined ? `${item.score}%` : item.status}</b></li>`).join("") ?? "";
    const aiSegments = report.aiWriting.segments?.filter((item) => item.score >= 45).sort((left, right) => right.score - left.score).slice(0, 10).map((item) => `<tr><td>${escapeHtml(item.text)}</td><td>${item.label}</td><td>${item.score}%</td><td>${escapeHtml(item.reason)}</td></tr>`).join("") ?? "";
    const provenance = report.aiWriting.provenance ? `<p>Quá trình: nhập trực tiếp ${report.aiWriting.provenance.typedShare}% · dán ${report.aiWriting.provenance.pastedShare}% · nhập tệp ${report.aiWriting.provenance.importedShare}% · AI hỗ trợ ${report.aiWriting.provenance.aiAssistedShare}%.</p><p>${escapeHtml(report.aiWriting.provenance.summary)}</p>` : "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>ORIGIN AI Report</title><style>body{font-family:Arial;line-height:1.6;margin:40px;color:#15242d}h1{color:#0b776f}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccd8dc;padding:8px;text-align:left}</style></head><body><h1>ORIGIN AI — Originality Report</h1><h2>${escapeHtml(title)}</h2><p>Nguyên bản: <b>${report.metrics.originality}%</b> · Tương đồng: <b>${report.metrics.similarity}%</b> · Nguồn: <b>${report.metrics.sourcesFound}</b></p><h3>Chỉ báo AI tổng hợp</h3><p><b>${report.aiWriting.score}%</b> · Độ tin cậy ${report.aiWriting.confidence ?? "—"}% · Đồng thuận ${report.aiWriting.agreement?.score ?? "—"}%</p><ul>${detectors}</ul>${provenance}<p>${escapeHtml(report.aiWriting.disclaimer)}</p>${aiSegments ? `<h3>Đoạn cần xem lại</h3><table><tr><th>Đoạn</th><th>Phân loại</th><th>Điểm</th><th>Giải thích</th></tr>${aiSegments}</table>` : ""}<h3>Matched passages</h3><table><tr><th>Câu</th><th>Phân loại</th><th>Similarity</th><th>Giải thích</th></tr>${rows}</table></body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${slugify(title)}-origin-report.doc`; anchor.click(); URL.revokeObjectURL(url);
  }

  const reportSummary = useMemo(() => report ? `${report.metrics.originality}% nguyên bản · ${report.metrics.sourcesFound} nguồn` : "Chưa quét", [report]);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: "load_origin_sample", title: "Tải văn bản mẫu", description: "Điền văn bản mẫu tiếng Việt vào workspace ORIGIN AI để thử quy trình.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: async () => { provenanceRef.current = createProvenance(true, sample.length); setText(sample); setTitle("AI trong giáo dục"); setView("edit"); return { loaded: true, characters: sample.length }; } }, { signal: lifecycle.signal })).catch(() => undefined);
    void Promise.resolve(context.registerTool({ name: "scan_current_document", title: "Quét tài liệu hiện tại", description: "Chạy quy trình phân tích trùng lặp và nguồn trên văn bản đang mở trong ORIGIN AI.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: true }, execute: async () => { const result = await scanDocument(); return { completed: true, originality: result?.metrics.originality, similarity: result?.metrics.similarity, sourcesFound: result?.metrics.sourcesFound }; } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, [scanDocument]);

  return (
    <main className="workspace-bg min-h-screen bg-[var(--bg)]">
      <ProgressOverlay open={scanning} percent={progress} stage={stage} onCancel={() => { abortRef.current?.abort(); setScanning(false); }} />
      <header className="no-print sticky top-0 z-30 flex h-[72px] items-center border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-4 shadow-[0_8px_30px_rgba(38,32,94,.05)] backdrop-blur-xl lg:px-6">
        <div className="w-[230px]"><Brand /></div><button className="mr-3 rounded-lg p-2 text-[var(--muted)] lg:hidden" aria-label="Mở điều hướng"><Menu size={20} /></button>
        <div className="flex min-w-0 flex-1 items-center gap-3"><FileText size={18} className="shrink-0 text-[var(--brand)]" /><input value={title} onChange={(event) => setTitle(event.target.value)} aria-label="Tên tài liệu" className="min-w-0 max-w-[520px] flex-1 bg-transparent text-[15px] font-bold outline-none" /><span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:block ${needsRescan ? "bg-[var(--amber-soft)] text-[var(--amber)]" : "bg-[var(--surface-2)] text-[var(--muted)]"}`}>{needsRescan ? "Cần quét lại" : reportSummary}</span></div>
        <div className="flex items-center gap-2"><ThemeToggle /><button className="focus-ring hidden h-10 w-10 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] sm:grid" aria-label="Thông báo"><Bell size={17} /></button><button className="focus-ring flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1.5 pr-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand-soft)] text-[12px] font-bold text-[var(--brand)]">{user.name.slice(0,2).toUpperCase()}</span><ChevronDown size={14} className="text-[var(--muted)]" /></button></div>
      </header>

      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[76px_minmax(0,1fr)_360px] xl:grid-cols-[230px_minmax(0,1fr)_390px]">
        <aside className="no-print hidden border-r border-[var(--line)] bg-[var(--surface)] px-3 py-5 lg:flex lg:flex-col xl:px-4"><button onClick={newDocument} className="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--ink)] text-sm font-bold text-[var(--surface)] xl:px-4"><FilePlus2 size={17} /><span className="hidden xl:inline">Tài liệu mới</span></button><nav className="mt-7 space-y-2" aria-label="Workspace"><SideItem active={view !== "compare"} icon={LayoutDashboard} label="Workspace" onClick={() => setView(report ? "review" : "edit")} /><SideItem active={view === "edit"} icon={FileText} label="Soạn thảo" onClick={() => setView("edit")} /><SideItem active={view === "compare"} icon={History} label="Phiên bản" onClick={() => setView("compare")} /></nav><div className="mt-7 hidden xl:block"><p className="px-3 text-[11px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Gần đây</p><button className="mt-3 w-full rounded-xl bg-[var(--surface-2)] p-3 text-left"><span className="block truncate text-[13px] font-bold">{title}</span><span className="mt-1 block text-[11px] text-[var(--muted)]">{versions.length || 1} phiên bản</span></button></div><div className="mt-auto space-y-2"><SideItem icon={ShieldCheck} label="Quyền riêng tư" /><SideItem icon={Settings} label="Cài đặt" /><form action="/api/auth/logout" method="post" className="hidden pt-2 xl:block"><button className="text-[12px] font-semibold text-[var(--muted)] hover:text-[var(--coral)]">Đăng xuất · {user.email}</button></form></div></aside>

        <section className="min-w-0 p-4 lg:p-6 xl:p-7"><div className="mx-auto max-w-[1080px]">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><span className="text-[11px] font-bold uppercase tracking-[.18em] text-[var(--brand)]">ORIGINALITY WORKSPACE</span><h1 className="serif mt-1 text-[30px] font-normal">{view === "compare" ? "So sánh phiên bản" : view === "review" ? "Kết quả phân tích" : "Kiểm tra tài liệu"}</h1></div><div className="flex flex-wrap gap-2"><input ref={inputRef} type="file" accept=".docx,.pdf,.txt,.md" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.target.value = ""; }} /><button onClick={() => inputRef.current?.click()} className="focus-ring flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold"><Upload size={16} /> Tải tệp</button>{report && <button onClick={() => setView(view === "review" ? "edit" : "review")} className="focus-ring rounded-xl border border-[var(--line)] bg-[var(--surface)] px-4 py-2.5 text-sm font-bold">{view === "review" ? "Chỉnh sửa" : "Xem highlight"}</button>}<button onClick={() => void scanDocument()} disabled={text.trim().length < 20 || scanning} className="focus-ring flex items-center gap-2 rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(13,148,136,.18)] disabled:cursor-not-allowed disabled:opacity-40"><ScanLine size={17} /> {needsRescan ? "Quét lại" : "Quét tài liệu"}</button></div></div>
          {message && <div role="alert" className="mb-4 flex items-center justify-between rounded-xl bg-[var(--coral-soft)] px-4 py-3 text-sm text-[var(--coral)]"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Đóng">×</button></div>}
          <MetricCards metrics={report?.metrics} aiWriting={report?.aiWriting} />
          <div className="surface mt-5 overflow-hidden rounded-[22px]"><div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-3"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${view === "review" ? "bg-[var(--coral)]" : view === "compare" ? "bg-[var(--violet)]" : "bg-[var(--brand)]"}`} /><span className="text-[12px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">{view === "review" ? "Sentence-level review" : view === "compare" ? "Before / After" : "Document editor"}</span></div><div className="flex items-center gap-3"><label className="hidden items-center gap-2 text-[11px] text-[var(--muted)] sm:flex"><input type="checkbox" checked={ephemeral} onChange={(event) => setEphemeral(event.target.checked)} /> Không lưu sau xử lý</label><button className="rounded-lg p-1.5 text-[var(--muted)]" aria-label="Tùy chọn"><MoreHorizontal size={18} /></button></div></div>{view === "review" && report ? <AnalysisViewer report={report} selectedId={selected?.sentenceId} onSelect={(sentence) => { setSelected(sentence); setRewrite(undefined); }} /> : view === "compare" ? <CompareView original={originalText} current={text} versions={versions} onRestore={restoreVersion} /> : <EditorPane value={text} onActivity={recordActivity} onChange={(value) => { setText(value); if (report) setNeedsRescan(true); }} />}</div>
        </div></section>

        <AssistantPanel report={report} selected={selected} rewrite={rewrite} rewriting={rewriting} writingSample={writingSample} onWritingSample={setWritingSample} onRewrite={requestRewrite} onAccept={acceptRewrite} onPrint={() => window.print()} onDownload={downloadWordReport} />
      </div>
      {report && <section className="print-only hidden p-10"><h1 className="serif text-4xl">ORIGIN AI — Originality Report</h1><h2 className="mt-3 text-xl">{title}</h2><p className="mt-6">Nguyên bản: {report.metrics.originality}% · Tương đồng: {report.metrics.similarity}% · Trích dẫn đúng: {report.metrics.properCitation}% · Nguồn: {report.metrics.sourcesFound}</p><p className="mt-2">Chỉ báo AI: {report.aiWriting.score}% · Độ tin cậy: {report.aiWriting.confidence ?? "—"}%</p><h3 className="mt-8 text-lg font-bold">Đoạn đã phân tích</h3>{report.sentences.map((sentence) => <div key={sentence.sentenceId} className="mt-4 border-b pb-4"><b>{sentence.kind} · {sentence.similarity}%</b><p>{sentence.text}</p><small>{sentence.reason}</small></div>)}<p className="mt-8 text-sm">{report.aiWriting.disclaimer}</p></section>}
    </main>
  );
}

function SideItem({ icon: Icon, label, active, onClick }: { icon: typeof LayoutDashboard; label: string; active?: boolean; onClick?: () => void }) { return <button onClick={onClick} title={label} className={`focus-ring flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold xl:justify-start ${active ? "bg-[var(--brand-soft)] text-[var(--brand)]" : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"}`}><Icon size={18} /><span className="hidden xl:inline">{label}</span></button>; }
function escapeHtml(value: string) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function slugify(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "document"; }
