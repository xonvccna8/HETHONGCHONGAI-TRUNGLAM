"use client";

import { Check, LoaderCircle, X } from "lucide-react";

const stages = [
  "Đang đọc tài liệu…",
  "Đang chia cấu trúc…",
  "Đang phân tích trùng lặp…",
  "Đang tìm nguồn…",
  "Đang phân tích ngữ nghĩa…",
  "Đang kiểm tra citation…",
  "Đang tạo báo cáo…",
];

export function ProgressOverlay({ open, percent, stage, onCancel }: { open: boolean; percent: number; stage: string; onCancel: () => void }) {
  if (!open) return null;
  const activeIndex = Math.min(stages.length - 1, Math.floor((percent / 100) * stages.length));
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#031018]/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Tiến trình quét">
      <div className="w-full max-w-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b222d] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-7 py-5"><div><span className="text-[11px] font-bold uppercase tracking-[.18em] text-[#5eead4]">Phân tích đang chạy</span><h2 className="serif mt-1 text-2xl">Đang kiểm tra tài liệu</h2></div><button onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300" aria-label="Ẩn tiến trình"><X size={18} /></button></div>
        <div className="p-7"><div className="flex items-end justify-between"><p className="font-semibold">{stage}</p><strong className="serif text-3xl font-normal text-[#5eead4]">{percent}%</strong></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5eead4] transition-all duration-500" style={{ width: `${percent}%` }} /></div>
          <ol className="mt-7 grid gap-3 sm:grid-cols-2">{stages.map((label, index) => <li key={label} className={`flex items-center gap-2 text-[13px] ${index <= activeIndex ? "text-white" : "text-slate-500"}`}><span className={`grid h-5 w-5 place-items-center rounded-full ${index < activeIndex ? "bg-[#2dd4bf] text-[#06202a]" : index === activeIndex ? "bg-white/10 text-[#5eead4]" : "bg-white/5"}`}>{index < activeIndex ? <Check size={12} strokeWidth={3} /> : index === activeIndex ? <LoaderCircle size={12} className="animate-spin" /> : index + 1}</span>{label}</li>)}</ol>
        </div>
      </div>
    </div>
  );
}
