"use client";

import { RotateCcw } from "lucide-react";

export interface RevisionVersion { id: string; label: string; text: string; createdAt: string }

export function CompareView({ original, current, versions, onRestore }: { original: string; current: string; versions: RevisionVersion[]; onRestore: (version: RevisionVersion) => void }) {
  return <div className="grid min-h-[520px] lg:grid-cols-[1fr_1fr_220px]">
    <TextColumn label="Original" value={original} tone="coral" />
    <TextColumn label="Revised" value={current} tone="brand" />
    <aside className="border-l border-[var(--line)] p-5"><h3 className="text-[12px] font-bold uppercase tracking-[.14em] text-[var(--muted)]">Lịch sử phiên bản</h3><div className="mt-4 space-y-3">{versions.map((version, index) => <button key={version.id} onClick={() => onRestore(version)} className="focus-ring group w-full rounded-xl border border-[var(--line)] p-3 text-left hover:border-[var(--brand)]"><div className="flex items-center justify-between"><b className="text-[12px]">{version.label}</b><RotateCcw size={13} className="text-[var(--muted)] opacity-0 group-hover:opacity-100" /></div><span className="mt-1 block text-[11px] text-[var(--muted)]">{index === versions.length - 1 ? "Bản hiện tại" : new Date(version.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></button>)}</div></aside>
  </div>;
}

function TextColumn({ label, value, tone }: { label: string; value: string; tone: "coral" | "brand" }) {
  return <section className="border-r border-[var(--line)]"><div className="border-b border-[var(--line)] px-6 py-3"><span className={`rounded-full bg-[var(--${tone}-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-[var(--${tone})]`}>{label}</span></div><div className="scrollbar-thin max-h-[62vh] overflow-y-auto whitespace-pre-wrap p-6 font-serif text-[16px] leading-8">{value || "Chưa có nội dung."}</div></section>;
}
