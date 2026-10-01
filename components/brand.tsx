import Link from "next/link";
import { Fingerprint } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-xl" aria-label="ORIGIN AI — Trang chủ">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[13px] bg-gradient-to-br from-violet-600 via-indigo-500 to-cyan-400 text-white shadow-[0_10px_28px_rgba(99,91,255,.28)]">
        <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-white/35 blur-sm" />
        <Fingerprint size={21} strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="leading-none">
          <strong className="block tracking-[.12em] text-[15px] font-black">ORIGIN AI</strong>
          <small className="mt-1 block text-[9px] font-extrabold tracking-[.18em] text-[var(--muted)]">INTELLIGENCE STUDIO</small>
        </span>
      )}
    </Link>
  );
}
