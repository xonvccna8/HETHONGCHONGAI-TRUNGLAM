import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Check,
  FileSearch2,
  Fingerprint,
  LockKeyhole,
  Network,
  PenLine,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: ScanSearch, title: "Đối chiếu đa tầng", text: "Exact · Fuzzy · Semantic", tone: "from-violet-500 to-indigo-500" },
  { icon: FileSearch2, title: "Nguồn có thật", text: "Truy xuất và xác minh", tone: "from-cyan-400 to-blue-500" },
  { icon: ShieldCheck, title: "Giữ nguyên dữ kiện", text: "Citation Guard", tone: "from-emerald-400 to-teal-500" },
  { icon: PenLine, title: "Viết lại thông minh", text: "Giữ đúng giọng văn", tone: "from-orange-400 to-rose-500" },
];

const agents = ["DA", "SC", "SA", "CG", "WC", "RR", "QR"];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bg)]">
      <header className="relative z-30 mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-8 text-[13px] font-bold text-[var(--muted)] md:flex" aria-label="Điều hướng chính">
          <a href="#features" className="transition hover:text-[var(--brand)]">Năng lực</a>
          <a href="#council" className="transition hover:text-[var(--brand)]">AI Council</a>
          <a href="#workflow" className="transition hover:text-[var(--brand)]">Quy trình</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login" className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--ink)] px-4 text-[13px] font-bold text-[var(--surface)] transition hover:-translate-y-0.5">
            Bắt đầu <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section className="px-3 pb-6 sm:px-5 lg:px-8">
        <div className="hero-noise relative mx-auto min-h-[710px] max-w-[1320px] overflow-hidden rounded-[30px] bg-[#080b24] text-white shadow-[0_30px_90px_rgba(40,30,120,.24)] lg:rounded-[42px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(99,91,255,.30),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(34,211,238,.15),transparent_30%)]" />
          <div className="absolute -left-24 bottom-[-180px] h-[430px] w-[430px] rounded-full bg-fuchsia-500/20 blur-[100px]" />
          <div className="relative grid min-h-[710px] items-center gap-10 px-7 py-16 md:px-12 lg:grid-cols-[.9fr_1.1fr] lg:px-16 lg:py-14">
            <div className="relative z-10 max-w-[620px] animate-rise">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3.5 py-2 text-[12px] font-bold text-violet-100 backdrop-blur-xl">
                <Sparkles size={14} className="text-cyan-300" /> 7 AI agents · 1 kết luận
              </div>
              <h1 className="mt-7 text-[clamp(3.2rem,6vw,6.4rem)] font-black leading-[.9] tracking-[-.065em]">
                Viết có chiều sâu.<br />
                <span className="bg-gradient-to-r from-violet-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Nguồn gốc rõ ràng.</span>
              </h1>
              <p className="mt-7 max-w-[530px] text-[16px] leading-7 text-slate-300 sm:text-[18px]">
                Phân tích trùng lặp, nguồn và dấu hiệu AI trong một workspace duy nhất.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/login" className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-[14px] font-black text-[#11152f] shadow-[0_12px_36px_rgba(255,255,255,.18)] transition hover:-translate-y-1">
                  Quét tài liệu <Zap size={17} className="fill-violet-500 text-violet-500" />
                </Link>
                <Link href="/login?sample=1" className="focus-ring inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-5 py-3.5 text-[14px] font-bold backdrop-blur transition hover:bg-white/15">
                  Xem bản mẫu <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[12px] font-semibold text-slate-400">
                {["Không bịa nguồn", "Bảo toàn dữ kiện", "Tiếng Việt"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><Check size={14} className="text-cyan-300" />{item}</span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[690px] animate-rise [animation-delay:.12s]">
              <div className="absolute -inset-8 rounded-full bg-violet-500/20 blur-[80px]" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 p-2 shadow-[0_32px_90px_rgba(0,0,0,.4)] backdrop-blur sm:rounded-[36px]">
                <Image src="/origin-ai-hero.png" alt="Mạng lưới AI phân tích tài liệu và nguồn" width={1536} height={1024} priority className="aspect-[1.32] w-full rounded-[22px] object-cover object-right sm:rounded-[29px]" />
                <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-[#0b1030]/75 p-3 backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-4">
                  {[
                    ["92%", "Nguyên bản"],
                    ["7", "AI agents"],
                    ["0", "Nguồn ảo"],
                  ].map(([value, label]) => (
                    <div key={label} className="text-center"><strong className="block text-xl font-black sm:text-2xl">{value}</strong><span className="mt-1 block text-[9px] font-bold uppercase tracking-[.12em] text-slate-400 sm:text-[10px]">{label}</span></div>
                  ))}
                </div>
              </div>
              <div className="absolute -left-3 top-10 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-xl backdrop-blur-xl sm:flex">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#091027]"><Fingerprint size={20} /></span>
                <div><b className="block text-xs">Semantic match</b><span className="text-[10px] text-slate-300">Phân tích theo ngữ cảnh</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1260px] px-5 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><span className="eyebrow"><WandSparkles size={14} /> Bộ công cụ thông minh</span><h2 className="mt-5 max-w-2xl text-[clamp(2.2rem,5vw,4.4rem)] font-black leading-[.98] tracking-[-.05em]">Ít thao tác.<br />Nhiều bằng chứng.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">Một lần quét. Toàn bộ tín hiệu quan trọng.</p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text, tone }) => (
            <article key={title} className="surface group rounded-[26px] p-6 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_55px_rgba(57,45,160,.14)]">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg`}><Icon size={22} /></span>
              <h3 className="mt-8 text-[17px] font-black">{title}</h3>
              <p className="mt-2 text-[13px] text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="council" className="px-3 sm:px-5 lg:px-8">
        <div className="relative mx-auto max-w-[1260px] overflow-hidden rounded-[34px] bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 px-7 py-12 text-white md:px-12 md:py-16">
          <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[55px] border-white/10" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[.2em] text-cyan-200"><Network size={15} /> AI Council</span>
              <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-.045em] md:text-6xl">7 góc nhìn.<br />Một quyết định tốt hơn.</h2>
              <div className="mt-7 flex flex-wrap gap-2">
                {["Nội dung", "Tương đồng", "Nguồn", "Trích dẫn", "Giọng văn", "Rủi ro", "Chất lượng"].map((label) => <span key={label} className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold backdrop-blur">{label}</span>)}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7 lg:grid-cols-4">
              {agents.map((agent, index) => <span key={agent} className={`grid h-14 w-14 place-items-center rounded-2xl border border-white/20 text-xs font-black shadow-xl backdrop-blur ${index % 3 === 0 ? "bg-cyan-300 text-indigo-950" : index % 3 === 1 ? "bg-white/15" : "bg-rose-300 text-indigo-950"}`}>{agent}</span>)}
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-indigo-700 shadow-xl"><BrainCircuit size={25} /></span>
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-[1260px] px-5 py-24 lg:px-8">
        <div className="text-center"><span className="eyebrow"><BadgeCheck size={14} /> Quy trình 3 bước</span><h2 className="mt-5 text-[clamp(2.2rem,5vw,4rem)] font-black tracking-[-.05em]">Nhanh. Rõ. Kiểm soát được.</h2></div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["01", "Đưa tài liệu vào", "DOCX · PDF · TXT"],
            ["02", "AI Council phân tích", "Nhiều tầng tín hiệu"],
            ["03", "Duyệt và cải thiện", "Bạn luôn quyết định"],
          ].map(([number, title, text]) => (
            <article key={number} className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-7">
              <span className="absolute -right-2 -top-6 text-[92px] font-black tracking-[-.08em] text-[var(--surface-2)]">{number}</span>
              <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-[var(--ink)] text-xs font-black text-[var(--surface)]">{number}</span>
              <h3 className="relative mt-10 text-xl font-black">{title}</h3><p className="relative mt-2 text-sm text-[var(--muted)]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-3 pb-8 sm:px-5 lg:px-8">
        <div className="mx-auto flex max-w-[1260px] flex-col items-center justify-between gap-7 overflow-hidden rounded-[34px] bg-[#0c1029] px-8 py-12 text-center text-white md:flex-row md:px-12 md:text-left">
          <div><div className="flex items-center justify-center gap-2 text-cyan-300 md:justify-start"><LockKeyhole size={17} /><span className="text-[11px] font-black uppercase tracking-[.18em]">Privacy-first</span></div><h2 className="mt-3 text-3xl font-black tracking-[-.04em] md:text-4xl">Tài liệu của bạn. Quyền kiểm soát của bạn.</h2></div>
          <Link href="/login" className="focus-ring inline-flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-4 text-sm font-black shadow-[0_16px_40px_rgba(99,91,255,.38)] transition hover:-translate-y-1">Mở workspace <ArrowRight size={17} /></Link>
        </div>
      </section>

      <footer className="px-5 py-9 lg:px-8"><div className="mx-auto flex max-w-[1260px] flex-col justify-between gap-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center"><Brand /><span>© 2026 ORIGIN AI · Evidence over assumptions.</span></div></footer>
    </main>
  );
}
