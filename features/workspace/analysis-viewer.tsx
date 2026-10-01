"use client";

import { AlertTriangle, BookOpen, CheckCircle2, ExternalLink, Quote, Sparkles } from "lucide-react";
import type { MatchKind, ScanReport, SentenceAnalysis } from "@/src/core/types";

const kindMeta: Record<MatchKind, { label: string; className: string }> = {
  EXACT: { label: "Trùng khớp", className: "bg-[var(--coral-soft)] border-[color-mix(in_srgb,var(--coral)_35%,var(--line))]" },
  HIGH_SIMILARITY: { label: "Tương đồng cao", className: "bg-[var(--amber-soft)] border-[color-mix(in_srgb,var(--amber)_35%,var(--line))]" },
  SEMANTIC_OVERLAP: { label: "Trùng ý nghĩa", className: "bg-[var(--violet-soft)] border-[color-mix(in_srgb,var(--violet)_35%,var(--line))]" },
  COMMON_KNOWLEDGE: { label: "Kiến thức phổ biến", className: "bg-[var(--surface-2)] border-[var(--line)]" },
  QUOTED: { label: "Trích dẫn trực tiếp", className: "bg-[var(--brand-soft)] border-[color-mix(in_srgb,var(--brand)_28%,var(--line))]" },
  CITED: { label: "Đã dẫn nguồn", className: "bg-[var(--brand-soft)] border-[color-mix(in_srgb,var(--brand)_28%,var(--line))]" },
  POSSIBLE_MISSING_CITATION: { label: "Có thể thiếu nguồn", className: "bg-[var(--amber-soft)] border-[color-mix(in_srgb,var(--amber)_35%,var(--line))]" },
  ORIGINAL: { label: "Nguyên bản", className: "bg-transparent border-transparent" },
};

export function AnalysisViewer({ report, selectedId, onSelect }: { report: ScanReport; selectedId?: string; onSelect: (sentence: SentenceAnalysis) => void }) {
  return (
    <div className="grid min-h-[530px] lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="scrollbar-thin max-h-[62vh] overflow-y-auto border-r border-[var(--line)] p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap gap-3 text-[11px] font-semibold text-[var(--muted)]">
          {[['var(--coral)','Trùng khớp'],['var(--amber)','Tương đồng cao'],['var(--violet)','Trùng ý nghĩa'],['var(--brand)','Đã dẫn nguồn']].map(([color,label]) => <span key={label} className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm" style={{background:color}} />{label}</span>)}
        </div>
        <div className="space-y-3">
          {report.sentences.map((sentence, index) => {
            const meta = kindMeta[sentence.kind];
            return <button key={sentence.sentenceId} onClick={() => onSelect(sentence)} className={`focus-ring group block w-full rounded-2xl border p-4 text-left transition ${meta.className} ${selectedId === sentence.sentenceId ? "ring-2 ring-[var(--brand)] ring-offset-2 ring-offset-[var(--surface)]" : "hover:-translate-y-0.5"}`}>
              <div className="mb-2 flex items-center justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-[.1em] text-[var(--muted)]">Câu {index + 1}</span>{sentence.kind !== "ORIGINAL" && <span className="rounded-full bg-[var(--surface)]/70 px-2.5 py-1 text-[11px] font-bold">{meta.label} · {sentence.similarity}%</span>}</div>
              <p className="serif text-[16px] leading-7">{sentence.text}</p>
            </button>;
          })}
        </div>
      </div>
      <SourceMap report={report} />
    </div>
  );
}

function SourceMap({ report }: { report: ScanReport }) {
  return <aside className="p-5"><div className="flex items-center gap-2"><BookOpen size={16} className="text-[var(--brand)]" /><h3 className="text-[12px] font-bold uppercase tracking-[.13em]">Bản đồ nguồn</h3></div>
    {report.similarityEngine && <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-2)] p-3 text-center"><div><b className="serif block text-lg">{report.similarityEngine.queryCount}</b><span className="text-[9px] text-[var(--muted)]">TRUY VẤN</span></div><div><b className="serif block text-lg">{report.similarityEngine.sourcesVerified}</b><span className="text-[9px] text-[var(--muted)]">NGUỒN XÁC MINH</span></div><div><b className="serif block text-lg">{report.similarityEngine.passagesCompared}</b><span className="text-[9px] text-[var(--muted)]">CẶP ĐOẠN</span></div><div><b className="serif block text-lg">{report.similarityEngine.aiVerificationEnabled ? "AI✓" : "—"}</b><span className="text-[9px] text-[var(--muted)]">KIỂM CHỨNG</span></div></div>}
    {report.sources.length ? <div className="mt-5 space-y-5">{report.sources.map((source, index) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="group block"><div className="flex items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--surface-2)] text-[11px] font-bold">{String(index+1).padStart(2,'0')}</span><div className="min-w-0 flex-1"><span className="block truncate text-[12px] font-bold">{source.domain}</span><span className="text-[11px] text-[var(--muted)]">{source.contribution}% liên quan</span></div><ExternalLink size={13} className="text-[var(--muted)] opacity-0 transition group-hover:opacity-100" /></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.min(100, source.contribution * 4)}%` }} /></div></a>)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-[var(--line)] p-4 text-center"><AlertTriangle size={20} className="mx-auto text-[var(--amber)]" /><p className="mt-2 text-[12px] leading-5 text-[var(--muted)]">Không tìm thấy nguồn đáng tin cậy hoặc nhà cung cấp tìm kiếm chưa được cấu hình.</p></div>}
    <div className="mt-7 border-t border-[var(--line)] pt-5"><h3 className="text-[12px] font-bold uppercase tracking-[.13em]">Phân bố nội dung</h3><div className="mt-4 flex h-2 overflow-hidden rounded-full"><i className="bg-[var(--coral)]" style={{width:`${report.metrics.composition.exact}%`}} /><i className="bg-[var(--violet)]" style={{width:`${report.metrics.composition.semantic}%`}} /><i className="bg-[var(--brand)]" style={{width:`${report.metrics.composition.cited + report.metrics.composition.quotes}%`}} /><i className="bg-[var(--line)]" style={{width:`${report.metrics.composition.original}%`}} /></div><div className="mt-3 space-y-2 text-[11px] text-[var(--muted)]"><Row icon={Sparkles} label="Trùng / semantic" value={report.metrics.composition.exact + report.metrics.composition.semantic} /><Row icon={Quote} label="Dẫn nguồn / quote" value={report.metrics.composition.cited + report.metrics.composition.quotes} /><Row icon={CheckCircle2} label="Nội dung nguyên bản" value={report.metrics.composition.original} /></div></div>
  </aside>;
}

function Row({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: number }) { return <div className="flex items-center gap-2"><Icon size={12} /><span className="flex-1">{label}</span><b className="text-[var(--ink)]">{value}%</b></div>; }
