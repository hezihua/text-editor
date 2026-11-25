import { BookOpen, PenLine } from "lucide-react";
import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "笔耕",
  description: "智能写作检查与 Markdown 阅读",
};

const ENTRIES = [
  {
    href: "/editor",
    kicker: "写作",
    title: "编辑器",
    description: "上传或撰写 Markdown，AI 检查与改稿。",
    icon: PenLine,
  },
  {
    href: "/reader",
    kicker: "阅读",
    title: "阅读器",
    description: "浏览文集与内置课程笔记，表格、公式与目录导航。",
    icon: BookOpen,
  },
] as const;

export default function HomePage() {
  return (
    <div className="shelf-paper flex h-dvh flex-col overflow-y-auto text-stone-900">
      <SiteHeader active="/" />
      <main className="mx-auto flex w-full max-w-[1120px] flex-1 items-center px-5 py-10 sm:px-8">
        <ul className="grid max-w-xl grid-cols-2 gap-x-8 gap-y-10">
          {ENTRIES.map((entry) => {
            const Icon = entry.icon;
            return (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-800"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f3e2b0] text-[#8a5a12] transition duration-200 group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[10px] font-semibold tracking-[0.14em] text-stone-400">
                    {entry.kicker}
                  </p>
                  <h2 className="mt-1 text-[15px] font-semibold leading-snug group-hover:underline">
                    {entry.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    {entry.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
