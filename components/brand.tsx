import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-xl" aria-label="ORIGIN AI — Trang chủ">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[13px] bg-[#071f2a] shadow-[0_8px_20px_rgba(13,148,136,.2)]">
        <span className="h-4 w-5 rounded-full border-[3px] border-[#5eead4]" />
        <span className="absolute bottom-[8px] left-[7px] h-2.5 w-2.5 rounded-full bg-[#fb7185]" />
      </span>
      {!compact && (
        <span className="leading-none">
          <strong className="block tracking-[.16em] text-[15px]">ORIGIN AI</strong>
          <small className="mt-1 block text-[10px] font-bold tracking-[.15em] text-[var(--muted)]">ORIGINALITY STUDIO</small>
        </span>
      )}
    </Link>
  );
}
