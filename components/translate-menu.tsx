"use client";

import { ChevronDown, Languages, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { TranslateTarget } from "@/lib/translate";

type TranslateMenuProps = {
  disabled?: boolean;
  loading?: boolean;
  onTranslate: (target: TranslateTarget) => void;
};

export function TranslateMenu({
  disabled,
  loading,
  onTranslate,
}: TranslateMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Languages className="h-3.5 w-3.5" />
        )}
        {loading ? "翻译中…" : "翻译"}
        {!loading && (
          <ChevronDown
            className={`h-3 w-3 text-stone-500 transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && !loading && (
        <div className="absolute top-full right-0 z-30 mt-1 min-w-[140px] rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-stone-50"
            onClick={() => {
              onTranslate("en");
              setOpen(false);
            }}
          >
            译为 English
          </button>
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-xs text-stone-800 hover:bg-stone-50"
            onClick={() => {
              onTranslate("zh");
              setOpen(false);
            }}
          >
            译为 中文
          </button>
        </div>
      )}
    </div>
  );
}
