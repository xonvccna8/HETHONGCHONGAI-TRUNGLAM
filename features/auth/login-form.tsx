"use client";

import { AlertCircle, ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm({ startWithSample = false }: { startWithSample?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Không thể đăng nhập."); setLoading(false); return; }
    router.push(startWithSample ? "/workspace?sample=1" : "/workspace");
    router.refresh();
  }
  return (
    <form onSubmit={submit} className="mt-9 space-y-3">
      <label className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 transition focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_var(--brand-soft)]"><UserRound size={18} className="text-[var(--muted)] group-focus-within:text-[var(--brand)]" /><span className="sr-only">Họ và tên</span><input name="name" defaultValue="Nhà nghiên cứu" autoComplete="name" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none" /></label>
      <label className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 transition focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_var(--brand-soft)]"><Mail size={18} className="text-[var(--muted)] group-focus-within:text-[var(--brand)]" /><span className="sr-only">Email</span><input required type="email" name="email" defaultValue="test@origin.ai" autoComplete="email" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none" /></label>
      <label className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 transition focus-within:border-[var(--brand)] focus-within:shadow-[0_0_0_4px_var(--brand-soft)]"><LockKeyhole size={18} className="text-[var(--muted)] group-focus-within:text-[var(--brand)]" /><span className="sr-only">Mật khẩu</span><input required minLength={6} type="password" name="password" placeholder="Mật khẩu" autoComplete="current-password" className="h-14 min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:font-medium placeholder:text-[var(--muted)]" /></label>
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl bg-[var(--coral-soft)] px-4 py-3 text-sm text-[var(--coral)]"><AlertCircle size={17} />{error}</p>}
      <button disabled={loading} className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-4 text-sm font-black text-white shadow-[0_14px_32px_rgba(99,91,255,.28)] transition hover:-translate-y-0.5 disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>Vào workspace <ArrowRight size={18} /></>}</button>
    </form>
  );
}
