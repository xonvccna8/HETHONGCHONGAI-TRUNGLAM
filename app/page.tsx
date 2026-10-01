import Link from "next/link";
import { ArrowUpRight, Check, FileSearch, Fingerprint, LockKeyhole, PenTool, Quote, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  { icon: ScanSearch, label: "Similarity Analysis", title: "Nhìn thấy điểm giao nhau", text: "Kết hợp exact, fuzzy và semantic matching để phân biệt sao chép, diễn đạt lại và kiến thức phổ biến." },
  { icon: FileSearch, label: "Source Discovery", title: "Nguồn thật, không bịa", text: "Truy xuất, xác minh và lập bản đồ nguồn để bạn hiểu mỗi kết luận đến từ đâu." },
  { icon: PenTool, label: "Smart Rewrite", title: "Tái cấu trúc, không spin text", text: "Giữ ý, dữ kiện và thuật ngữ; thay đổi cách lập luận thay vì chỉ đổi từ đồng nghĩa." },
  { icon: ShieldCheck, label: "Citation Protection", title: "Bảo vệ trích dẫn", text: "Nhận diện APA, MLA, IEEE và Vancouver; khóa trích dẫn khi chỉnh sửa và kiểm tra lại sau mỗi lần viết." },
];

export default function LandingPage() {
  return (
    <main className="mesh-bg min-h-screen overflow-hidden">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-[14px] font-semibold text-[var(--muted)] md:flex" aria-label="Điều hướng chính">
          <a href="#workflow" className="hover:text-[var(--ink)]">Cách hoạt động</a>
          <a href="#capabilities" className="hover:text-[var(--ink)]">Năng lực</a>
          <a href="#privacy" className="hover:text-[var(--ink)]">Quyền riêng tư</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="focus-ring rounded-xl bg-[var(--ink)] px-5 py-3 text-[14px] font-bold text-[var(--surface)] transition hover:-translate-y-0.5">Đăng nhập</Link>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[720px] max-w-[1200px] items-center gap-12 px-5 pb-20 pt-12 lg:grid-cols-[.92fr_1.08fr] lg:px-8 lg:pt-16">
        <div className="relative z-10 animate-rise">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] px-4 py-2 text-[13px] font-bold text-[var(--brand)] backdrop-blur">
            <Fingerprint size={16} /> Phân tích nguyên bản theo nhiều tầng
          </div>
          <h1 className="serif max-w-[700px] text-[clamp(3.3rem,7vw,6.8rem)] font-normal leading-[.88] tracking-[-.055em]">
            Kiểm tra.<br /><span className="text-[var(--brand)]">Hiểu.</span> Cải thiện.
          </h1>
          <p className="mt-8 max-w-[590px] text-[1.12rem] leading-8 text-[var(--muted)]">Phân tích trùng lặp, kiểm tra nguồn và hỗ trợ nâng cao tính nguyên bản của văn bản bằng AI — trong khi vẫn bảo toàn dữ kiện và tiếng nói của bạn.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/login" className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-6 py-4 text-[15px] font-bold text-white shadow-[0_14px_30px_rgba(13,148,136,.22)] transition hover:-translate-y-1">Bắt đầu kiểm tra <ArrowUpRight size={18} /></Link>
            <Link href="/login?sample=1" className="focus-ring rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-6 py-4 text-[15px] font-bold transition hover:border-[var(--brand)]">Thử văn bản mẫu</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-[13px] font-semibold text-[var(--muted)]">
            <span className="flex items-center gap-2"><Check size={15} className="text-[var(--brand)]" /> Không bịa nguồn</span>
            <span className="flex items-center gap-2"><Check size={15} className="text-[var(--brand)]" /> Không dùng để huấn luyện</span>
            <span className="flex items-center gap-2"><Check size={15} className="text-[var(--brand)]" /> Hỗ trợ tiếng Việt</span>
          </div>
        </div>

        <div className="relative min-h-[560px] animate-rise [animation-delay:.12s]">
          <div className="absolute inset-8 rotate-3 rounded-[42px] bg-[var(--brand-soft)]" />
          <div className="surface relative ml-auto mt-8 w-full max-w-[620px] overflow-hidden rounded-[32px]">
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
              <div><span className="text-[12px] font-bold uppercase tracking-[.16em] text-[var(--muted)]">Kết quả phân tích</span><h2 className="mt-1 text-[17px] font-bold">Bài nghiên cứu giáo dục số</h2></div>
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1.5 text-[12px] font-bold text-[var(--brand)]">Đã hoàn tất</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-[var(--line)] sm:grid-cols-4">
              {[['84%', 'Nguyên bản'], ['16%', 'Tương đồng'], ['92%', 'Trích dẫn đúng'], ['Thấp', 'Tín hiệu AI']].map(([value, label]) => <div key={label} className="bg-[var(--surface)] p-5"><strong className="serif block text-[28px] font-normal">{value}</strong><span className="mt-1 block text-[12px] text-[var(--muted)]">{label}</span></div>)}
            </div>
            <div className="grid gap-0 sm:grid-cols-[1.35fr_.65fr]">
              <div className="border-r border-[var(--line)] p-6">
                <div className="mb-5 flex items-center justify-between"><span className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--muted)]">Văn bản đã đánh dấu</span><Quote size={16} className="text-[var(--muted)]" /></div>
                <p className="serif text-[16px] leading-8">Trí tuệ nhân tạo đang <mark className="rounded bg-[var(--coral-soft)] px-1 text-[var(--coral)]">ngày càng đóng vai trò quan trọng trong giáo dục</mark>, đặc biệt khi các hệ thống thích ứng có thể hỗ trợ người học.</p>
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-2)] p-4"><div className="flex justify-between text-[12px] font-bold"><span>Tương đồng ngữ nghĩa</span><span className="text-[var(--coral)]">78%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--line)]"><div className="h-full w-[78%] rounded-full bg-[var(--coral)]" /></div><p className="mt-3 text-[12px] leading-5 text-[var(--muted)]">Cấu trúc khác nhưng luận điểm gần với Nguồn 01.</p></div>
              </div>
              <div className="p-6">
                <span className="text-[12px] font-bold uppercase tracking-[.15em] text-[var(--muted)]">Bản đồ nguồn</span>
                {[['01','unesco.org','12%'],['02','moet.gov.vn','7%'],['03','oecd.org','3%']].map(([n, d, p], i) => <div key={n} className="mt-5"><div className="flex items-center gap-2 text-[12px]"><span className="grid h-6 w-6 place-items-center rounded-lg bg-[var(--surface-2)] font-bold">{n}</span><span className="min-w-0 flex-1 truncate text-[var(--muted)]">{d}</span><b>{p}</b></div><div className="mt-2 h-1 rounded-full bg-[var(--line)]"><div className="h-full rounded-full bg-[var(--brand)]" style={{width: `${65 - i * 18}%`}} /></div></div>)}
              </div>
            </div>
          </div>
          <div className="surface absolute -bottom-2 -left-3 flex items-center gap-4 rounded-2xl p-4 sm:left-0"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--violet-soft)] text-[var(--violet)]"><Sparkles size={20} /></span><div><b className="block text-[13px]">Fact Preservation</b><span className="text-[12px] text-[var(--muted)]">Dữ kiện và trích dẫn được bảo toàn</span></div></div>
        </div>
      </section>

      <section id="workflow" className="bg-[#071f2a] px-5 py-24 text-white lg:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><div><span className="text-[12px] font-bold uppercase tracking-[.2em] text-[#5eead4]">Quy trình minh bạch</span><h2 className="serif mt-5 text-[clamp(2.5rem,5vw,4.4rem)] font-normal leading-[1.02]">Từ nghi ngờ đến quyết định có căn cứ.</h2></div><p className="max-w-2xl self-end text-[17px] leading-8 text-slate-300">Mỗi điểm số đều có lý do, nguồn liên quan và hành động gợi ý. Bạn quyết định thay đổi nào được áp dụng.</p></div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-[26px] bg-white/15 md:grid-cols-4">
            {[['01','Đọc cấu trúc','Nhận diện section, đoạn, câu và claim.'],['02','Đối chiếu','Kết hợp exact, fuzzy và semantic.'],['03','Xác minh','Tìm nguồn và kiểm tra trích dẫn.'],['04','Cải thiện','Xem trước, bảo toàn fact rồi quét lại.']].map(([n,t,d]) => <div key={n} className="bg-[#0b2a37] p-7"><span className="serif text-3xl text-[#5eead4]">{n}</span><h3 className="mt-12 text-lg font-bold">{t}</h3><p className="mt-3 text-sm leading-6 text-slate-300">{d}</p></div>)}
          </div>
        </div>
      </section>

      <section id="capabilities" className="mx-auto max-w-[1200px] px-5 py-24 lg:px-8">
        <div className="max-w-2xl"><span className="text-[12px] font-bold uppercase tracking-[.2em] text-[var(--brand)]">Tập trung vào chất lượng</span><h2 className="serif mt-5 text-[clamp(2.4rem,5vw,4rem)] font-normal leading-tight">Không chỉ là một con số tương đồng.</h2></div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {features.map(({icon: Icon,label,title,text}, index) => <article key={title} className="surface group rounded-[26px] p-7 transition hover:-translate-y-1"><div className="flex items-start justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand)]"><Icon size={22} /></span><span className="serif text-2xl text-[var(--line)]">0{index+1}</span></div><span className="mt-9 block text-[11px] font-bold uppercase tracking-[.18em] text-[var(--muted)]">{label}</span><h3 className="mt-3 text-xl font-bold">{title}</h3><p className="mt-3 max-w-lg text-[15px] leading-7 text-[var(--muted)]">{text}</p></article>)}
        </div>
      </section>

      <section id="privacy" className="mx-auto mb-20 max-w-[1200px] px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-[34px] bg-[var(--brand-soft)] p-8 md:p-14"><div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[45px] border-[color-mix(in_srgb,var(--brand)_12%,transparent)]" /><div className="relative grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--surface)] text-[var(--brand)] shadow-sm"><LockKeyhole size={28} /></span><div><h2 className="serif text-3xl">Tài liệu của bạn vẫn là của bạn.</h2><p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">Kiểm soát quyền sở hữu, truyền dữ liệu mã hóa và lựa chọn không lưu tài liệu sau xử lý. Không dùng nội dung để huấn luyện khi chưa có sự đồng ý rõ ràng.</p></div><Link href="/login" className="focus-ring relative rounded-xl border border-[var(--brand)] px-5 py-3 text-sm font-bold text-[var(--brand)]">Mở workspace</Link></div></div>
      </section>

      <footer className="border-t border-[var(--line)] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-[1200px] flex-col justify-between gap-5 text-sm text-[var(--muted)] sm:flex-row sm:items-center"><Brand /><span>© 2026 ORIGIN AI · Chỉ báo có căn cứ, không đưa ra phán quyết tuyệt đối.</span></div></footer>
    </main>
  );
}
