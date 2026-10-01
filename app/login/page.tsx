import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/features/auth/login-form";
import { BookOpenCheck } from "lucide-react";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sample?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mesh-bg grid min-h-screen lg:grid-cols-[.82fr_1.18fr]">
      <section className="flex flex-col border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_78%,transparent)] p-6 backdrop-blur lg:p-10">
        <div className="flex items-center justify-between"><Brand /><ThemeToggle /></div>
        <div className="mx-auto my-auto w-full max-w-[430px] py-16"><span className="text-[12px] font-bold uppercase tracking-[.2em] text-[var(--brand)]">Không gian nghiên cứu riêng tư</span><h1 className="serif mt-5 text-5xl leading-[1.04] tracking-[-.04em]">Bắt đầu từ văn bản của bạn.</h1><p className="mt-5 text-base leading-7 text-[var(--muted)]">Đăng nhập để lưu phiên bản, xem lịch sử chỉnh sửa và tiếp tục phân tích trên mọi thiết bị.</p><LoginForm startWithSample={params.sample === "1"} /></div>
        <p className="text-[12px] leading-5 text-[var(--muted)]">Bản cài đặt phát triển dùng tài khoản demo từ biến môi trường. Hệ thống production nên kết nối nhà cung cấp danh tính của tổ chức.</p>
      </section>
      <section className="relative hidden overflow-hidden bg-[#071f2a] p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div className="grid-pattern absolute inset-0 opacity-20" />
        <div className="absolute left-[18%] top-[16%] h-64 w-64 rounded-full bg-[#0d9488]/25 blur-[80px]" />
        <div className="relative max-w-2xl"><BookOpenCheck size={42} className="text-[#5eead4]" /><blockquote className="serif mt-7 text-[clamp(2.4rem,4vw,4.8rem)] leading-[1.05] tracking-[-.035em]">“Tính nguyên bản không nằm ở việc né tránh tương đồng, mà ở cách bạn kiến tạo và bảo vệ lập luận của mình.”</blockquote><p className="mt-8 max-w-xl text-base leading-7 text-slate-300">ORIGIN AI giúp bạn nhìn thấy mối quan hệ giữa văn bản, nguồn và tiếng nói cá nhân — trước khi đưa ra bất kỳ thay đổi nào.</p></div>
      </section>
    </main>
  );
}
