"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  CHECK_DIRECTIONS,
  type CheckDirectionId,
} from "@/lib/check-directions";

type CheckDirectionSelectProps = {
  value: CheckDirectionId;
  onChange: (id: CheckDirectionId) => void;
  disabled?: boolean;
};

export function CheckDirectionSelect({
  value,
  onChange,
  disabled,
}: CheckDirectionSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = CHECK_DIRECTIONS.find((d) => d.id === value)!;

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
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="truncate font-medium text-stone-900">
          {selected.label}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-stone-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-20 mt-1 max-h-[min(420px,50vh)] overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
          {CHECK_DIRECTIONS.map((d) => {
            const active = d.id === value;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  onChange(d.id);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition hover:bg-stone-50 ${
                  active ? "bg-stone-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-900">
                    {d.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-stone-500">
                    {d.description}
                  </p>
                </div>
                {active && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-stone-800" />
                )}
              </button>
            );
          })}
          <div className="mt-1 border-t border-stone-100 px-3 py-2">
            <p className="text-center text-xs text-stone-400">
              自定义优化方式即将支持
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
