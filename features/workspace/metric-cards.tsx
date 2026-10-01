import { BookCheck, Fingerprint, Radar, ScanSearch } from "lucide-react";
import type { AiWritingSignals, ScanMetrics } from "@/src/core/types";

export function MetricCards({ metrics, aiWriting }: { metrics?: ScanMetrics; aiWriting?: AiWritingSignals }) {
  const items = [
    { label: "Nguyên bản", value: metrics ? `${metrics.originality}%` : "—", icon: Fingerprint, tone: "brand", gradient: "from-violet-500 to-indigo-500" },
    { label: "Tương đồng", value: metrics ? `${metrics.similarity}%` : "—", icon: ScanSearch, tone: "coral", gradient: "from-orange-400 to-rose-500" },
    { label: "Trích dẫn", value: metrics ? `${metrics.properCitation}%` : "—", icon: BookCheck, tone: "violet", gradient: "from-cyan-400 to-blue-500" },
    { label: "Chỉ báo AI", value: aiWriting ? `${aiWriting.score}%` : "—", icon: Radar, tone: "amber", gradient: "from-amber-400 to-orange-500" },
    { label: "Nguồn", value: metrics ? String(metrics.sourcesFound) : "—", icon: Radar, tone: "brand", gradient: "from-emerald-400 to-teal-500" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(({ label, value, icon: Icon, tone, gradient }) => <article key={label} className="group relative overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"><div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} /><div className="flex items-start justify-between"><span className="text-[12px] font-bold text-[var(--muted)]">{label}</span><span className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}><Icon size={15} /></span></div><strong className="mt-4 block text-[27px] font-black leading-none" style={{ color: `var(--${tone})` }}>{value}</strong></article>)}
    </div>
  );
}
