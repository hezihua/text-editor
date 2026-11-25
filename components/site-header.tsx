import { BookOpen } from "lucide-react";
import Link from "next/link";

const READER_NAV = [{ href: "/reader", label: "精选收录" }] as const;

export type SiteNavHref = "/" | "/editor" | "/reader";

export function SiteHeader({ active }: { active: SiteNavHref }) {
  const nav = active === "/reader" ? READER_NAV : [];

  return (
    <header className="sticky top-0 z-20 border-b border-stone-300/70 bg-[#f6f3ec]/90 backdrop-blur-md">
      <div className="grid h-14 w-full grid-cols-[1fr_auto_1fr] items-stretch px-5 sm:px-8">
        <Link
          href="/"
          aria-label="回到首页"
          className="flex items-center gap-2 justify-self-start"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3e2b0] text-[#8a5a12]">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">笔耕</span>
        </Link>

        <nav className="flex items-stretch gap-5 text-sm sm:gap-8">
          {nav.map((item) => {
            const current = item.href === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center border-b-2 ${
                  current
                    ? "border-stone-900 font-medium text-stone-900"
                    : "border-transparent text-stone-500 hover:text-stone-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <span />
      </div>
    </header>
  );
}