import Image from "next/image";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";
import { Check, Sparkles } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen bg-[var(--bg)] lg:grid-cols-[.82fr_1.18fr]">
      <section className="relative z-10 flex flex-col p-5 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between"><Brand /><ThemeToggle /></div>
        <div className="mx-auto my-auto w-full max-w-[430px] py-14">
          <span className="eyebrow"><Sparkles size={14} /> Private workspace</span>
          <h1 className="mt-6 text-[clamp(2.7rem,5vw,4.5rem)] font-black leading-[.94] tracking-[-.055em]">Sẵn sàng tạo khác biệt?</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Đăng nhập và bắt đầu phân tích.</p>
          <LoginForm startWithSample={params.sample === "1"} />
          <div className="mt-7 flex flex-wrap gap-4 text-[11px] font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Mã hóa</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Không huấn luyện</span>
            <span className="flex items-center gap-1.5"><Check size={13} className="text-[var(--brand)]" /> Tự động xóa</span>
          </div>
        </div>
        <p className="text-[10px] font-medium text-[var(--muted)]">ORIGIN AI · Intelligence Studio</p>
      </section>

      <section className="relative hidden overflow-hidden bg-[#080b24] p-6 lg:block">
        <div className="relative h-full min-h-[680px] overflow-hidden rounded-[32px] border border-white/10">
          <Image src="/origin-ai-hero.png" alt="ORIGIN AI phân tích tài liệu" fill priority className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080b24] via-[#080b24]/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-bold text-cyan-200 backdrop-blur"><Sparkles size={13} /> AI Council</div>
            <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[.96] tracking-[-.05em] text-white xl:text-6xl">Mỗi kết luận đều có bằng chứng.</h2>
            <div className="mt-7 flex gap-3 text-xs font-bold text-slate-300">
              {["7 agents", "3 lớp đối chiếu", "0 nguồn ảo"].map((item) => <span key={item} className="rounded-xl border border-white/15 bg-[#0c1030]/65 px-3 py-2 backdrop-blur">{item}</span>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
