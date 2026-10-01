"use client";

import { AlertCircle, ArrowUpRight, LoaderCircle } from "lucide-react";
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
    <form onSubmit={submit} className="mt-10 space-y-5">
      <label className="block"><span className="mb-2 block text-sm font-bold">Họ và tên</span><input name="name" defaultValue="Nhà nghiên cứu" autoComplete="name" className="focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-base" /></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Email</span><input required type="email" name="email" defaultValue="demo@origin.ai" autoComplete="email" className="focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-base" /></label>
      <label className="block"><span className="mb-2 block text-sm font-bold">Mật khẩu</span><input required minLength={6} type="password" name="password" defaultValue="origin2026" autoComplete="current-password" className="focus-ring w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-base" /></label>
      {error && <p role="alert" className="flex items-center gap-2 rounded-xl bg-[var(--coral-soft)] px-4 py-3 text-sm text-[var(--coral)]"><AlertCircle size={17} />{error}</p>}
      <button disabled={loading} className="focus-ring flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand)] px-5 py-4 text-sm font-bold text-white shadow-[0_12px_28px_rgba(13,148,136,.2)] disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <>Vào workspace <ArrowUpRight size={18} /></>}</button>
    </form>
  );
}
