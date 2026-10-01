import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ORIGIN AI — Kiểm tra và nâng cao tính nguyên bản", template: "%s · ORIGIN AI" },
  description: "Phân tích trùng lặp, kiểm tra nguồn và hỗ trợ nâng cao tính nguyên bản của văn bản bằng AI.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi" suppressHydrationWarning><body>{children}</body></html>;
}
