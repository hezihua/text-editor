import { BookOpen, PenLine } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "笔耕",
  description: "智能写作检查与 Markdown 阅读",
};

export default function HomePage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-[var(--background)] px-6">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          笔耕
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          改稿与阅读分开入口，各用其所。
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/editor"
            className="group flex flex-col items-start rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm transition hover:border-stone-300 hover:shadow-md"
          >
            <span className="mb-3 inline-flex rounded-lg bg-stone-900 p-2.5 text-white">
              <PenLine className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-stone-900">编辑器</span>
            <span className="mt-1 text-xs leading-relaxed text-stone-500">
              上传或撰写 Markdown，AI 检查与改稿。
            </span>
          </Link>

          <Link
            href="/reader"
            className="group flex flex-col items-start rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm transition hover:border-stone-300 hover:shadow-md"
          >
            <span className="mb-3 inline-flex rounded-lg bg-stone-100 p-2.5 text-stone-800">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold text-stone-900">阅读器</span>
            <span className="mt-1 text-xs leading-relaxed text-stone-500">
              浏览文集与内置课程笔记，表格、公式与目录导航。
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
