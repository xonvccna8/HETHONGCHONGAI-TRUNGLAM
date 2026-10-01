import { BookCheck, Fingerprint, Radar, ScanSearch } from "lucide-react";
import type { ScanMetrics, RiskLevel } from "@/src/core/types";

const riskLabel: Record<RiskLevel, string> = { "very-low": "Rất thấp", low: "Thấp", medium: "Trung bình", high: "Cao" };

export function MetricCards({ metrics, risk }: { metrics?: ScanMetrics; risk?: RiskLevel }) {
  const items = [
    { label: "Nguyên bản", value: metrics ? `${metrics.originality}%` : "—", icon: Fingerprint, tone: "brand" },
    { label: "Tương đồng", value: metrics ? `${metrics.similarity}%` : "—", icon: ScanSearch, tone: "coral" },
    { label: "Trích dẫn đúng", value: metrics ? `${metrics.properCitation}%` : "—", icon: BookCheck, tone: "violet" },
    { label: "Rủi ro AI-writing", value: risk ? riskLabel[risk] : "—", icon: Radar, tone: "amber" },
    { label: "Nguồn tìm thấy", value: metrics ? String(metrics.sourcesFound) : "—", icon: Radar, tone: "brand" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4"><div className="flex items-start justify-between"><span className="text-[13px] font-semibold text-[var(--muted)]">{label}</span><Icon size={16} style={{ color: `var(--${tone})` }} /></div><strong className="serif mt-4 block text-[28px] font-normal leading-none">{value}</strong></article>)}
    </div>
  );
}
