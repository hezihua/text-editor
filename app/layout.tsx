import type { Metadata } from "next";
import { Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_SC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "笔耕 — 智能写作检查",
  description: "中文写作文案的语法、表达与风格检查，体裁不限",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSans.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden font-sans">{children}</body>
    </html>
  );
}
