"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ResizeSplitProps = {
  first: ReactNode;
  second: ReactNode;
  /** 左/上侧占比 0–1 */
  initialRatio?: number;
  minFirstPx?: number;
  minSecondPx?: number;
  storageKey?: string;
  className?: string;
  /** 宽度不足 lg 时改为上下堆叠且不可拖 */
  stackBelowLg?: boolean;
};

function readStoredRatio(key: string | undefined, fallback: number) {
  if (typeof window === "undefined" || !key) return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
}

export function ResizeSplit({
  first,
  second,
  initialRatio = 0.5,
  minFirstPx = 240,
  minSecondPx = 240,
  storageKey,
  className = "",
  stackBelowLg = true,
}: ResizeSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ratioRef = useRef(readStoredRatio(storageKey, initialRatio));
  const [ratio, setRatio] = useState(ratioRef.current);
  const [isDesktop, setIsDesktop] = useState(true);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!stackBelowLg) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [stackBelowLg]);

  const onPointerMove = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      let next = (clientX - rect.left) / rect.width;
      const minR = minFirstPx / rect.width;
      const maxR = 1 - minSecondPx / rect.width;
      next = Math.max(minR, Math.min(maxR, next));
      ratioRef.current = next;
      setRatio(next);
    },
    [minFirstPx, minSecondPx],
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current) return;
      onPointerMove(e.clientX);
    }
    function onMouseUp() {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (storageKey) {
        localStorage.setItem(storageKey, String(ratioRef.current));
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onPointerMove, storageKey]);

  function startDrag() {
    draggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }

  if (stackBelowLg && !isDesktop) {
    return (
      <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
        <div className="min-h-0 min-w-0 flex-1">{first}</div>
        <div className="min-h-0 min-w-0 flex-1">{second}</div>
      </div>
    );
  }

  const firstWidth = `${ratio * 100}%`;

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 w-full flex-1 ${className}`}
    >
      <div
        className="min-h-0 min-w-0 shrink-0 overflow-hidden"
        style={{ width: firstWidth }}
      >
        {first}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="拖动调整宽度"
        onMouseDown={(e) => {
          e.preventDefault();
          startDrag();
        }}
        className="group relative z-10 flex w-3 shrink-0 cursor-col-resize items-center justify-center px-0.5"
      >
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-stone-200 transition group-hover:bg-stone-400" />
        <div className="relative flex h-12 w-2 flex-col items-center justify-center gap-0.5 rounded-full border border-stone-200 bg-white shadow-sm transition group-hover:border-stone-300 group-hover:bg-stone-50">
          <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
          <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
          <span className="h-0.5 w-0.5 rounded-full bg-stone-400" />
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{second}</div>
    </div>
  );
}
