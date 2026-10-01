import Image from "next/image";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";
import { Check, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { getSession } from "@/src/auth/session";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  if (await getSession()) redirect("/workspace");
  const params = await searchParams;
  return (
    <main className="mesh-bg grid min-h-screen lg:grid-cols-[.86fr_1.14fr]">
      <section className="relative z-10 flex flex-col p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between"><Brand /><ThemeToggle /></div>
        <div className="mx-auto my-auto w-full max-w-[470px] py-12">
          <span className="eyebrow"><Sparkles size={14} /> Firebase secure access</span>
          <h1 className="mt-6 text-[clamp(2.35rem,4vw,3.45rem)] font-black leading-[.94] tracking-[-.055em]">Không gian nghiên cứu của bạn.</h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">Đăng nhập an toàn để phân tích nguồn, độ nguyên bản và lịch sử biên tập trong một nơi.</p>
          <div className="mt-7 rounded-[28px] border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] p-4 shadow-[0_28px_80px_rgba(50,42,140,.12)] backdrop-blur-xl sm:p-6"><LoginForm startWithSample={params.sample === "1"} /></div>
          <div className="mt-7 flex flex-wrap gap-4 text-[11px] font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Firebase Auth</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Cookie HTTP-only</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Không lưu mật khẩu</span>
          </div>
        </div>
        <p className="text-[10px] font-medium text-[var(--muted)]">ORIGIN AI · Intelligence Studio</p>
      </section>

      <section className="relative hidden overflow-hidden bg-[#080b24] p-6 lg:block">
        <div className="relative h-full min-h-[680px] overflow-hidden rounded-[32px] border border-white/10">
          <Image src="/origin-ai-hero.png" alt="ORIGIN AI phân tích tài liệu" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b24] via-[#080b24]/15 to-violet-950/10" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-cyan-200 backdrop-blur"><Sparkles size={13} /> ORIGIN INTELLIGENCE</div>
            <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[.96] tracking-[-.05em] text-white xl:text-6xl">Mỗi tài liệu.<br />Một hồ sơ bằng chứng.</h2>
            <div className="mt-7 flex gap-3 text-xs font-bold text-slate-300">
              {["7 AI agents", "Đối chiếu đa tầng", "Nguồn thật", "Dữ kiện được bảo toàn"].map((item) => <span key={item} className="rounded-xl border border-white/15 bg-[#0c1030]/65 px-3 py-2 backdrop-blur">{item}</span>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
