"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import {
  buildDocumentDiffPieces,
  buildOverlayPieces,
  lineCount,
  type DiffPart,
  type OverlayPiece,
} from "@/lib/check-highlights";
import type { CheckResult } from "@/lib/schemas";

export type DocumentEditorHandle = {
  focusRange: (start: number, end: number) => void;
};

type DocumentEditorProps = {
  text: string;
  onChange: (value: string) => void;
  placeholder?: string;
  checkIssues?: CheckResult["issues"];
  issueResolved?: Record<string, "applied" | "ignored">;
  showIssueUnderlines?: boolean;
  viewChanges?: boolean;
  checkBaselineText?: string | null;
  pendingIssueCount?: number;
  activeQuote?: string | null;
  activeIssueId?: string | null;
};

const EDITOR_CLASS =
  "w-full resize-none bg-transparent p-4 text-[15px] leading-relaxed outline-none";

export const DocumentEditor = forwardRef<
  DocumentEditorHandle,
  DocumentEditorProps
>(function DocumentEditor(
  {
    text,
    onChange,
    placeholder,
    checkIssues = [],
    issueResolved = {},
    showIssueUnderlines = false,
    viewChanges = false,
    checkBaselineText = null,
    pendingIssueCount = 0,
    activeQuote = null,
    activeIssueId = null,
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const overlayPieces: OverlayPiece[] = useMemo(() => {
    const plain: OverlayPiece[] = [
      {
        kind: "underline",
        text,
        marked: false,
        active: false,
        severity: null,
      },
    ];

    if (
      viewChanges &&
      checkBaselineText &&
      pendingIssueCount === 0 &&
      text !== checkBaselineText
    ) {
      return buildDocumentDiffPieces(checkBaselineText, text);
    }

    if (checkIssues.length === 0) return plain;

    if (viewChanges && pendingIssueCount > 0) {
      return buildOverlayPieces(text, checkIssues, issueResolved, {
        viewChanges: true,
        activeQuote,
        activeIssueId,
      });
    }

    if (showIssueUnderlines && pendingIssueCount > 0) {
      return buildOverlayPieces(text, checkIssues, issueResolved, {
        viewChanges: false,
        activeQuote,
        activeIssueId,
      });
    }

    return plain;
  }, [
    checkIssues,
    issueResolved,
    text,
    viewChanges,
    checkBaselineText,
    pendingIssueCount,
    showIssueUnderlines,
    activeQuote,
    activeIssueId,
  ]);

  const lines = useMemo(() => lineCount(text), [text]);
  const useDecoratedOverlay = useMemo(() => {
    if (!text.length) return false;
    if (
      viewChanges &&
      checkBaselineText &&
      (pendingIssueCount > 0 || text !== checkBaselineText)
    ) {
      return true;
    }
    return showIssueUnderlines && pendingIssueCount > 0;
  }, [
    text,
    viewChanges,
    checkBaselineText,
    pendingIssueCount,
    showIssueUnderlines,
  ]);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const top = ta.scrollTop;
    const left = ta.scrollLeft;
    if (backdropRef.current) {
      backdropRef.current.scrollTop = top;
      backdropRef.current.scrollLeft = left;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = top;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    focusRange(start: number, end: number) {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start, end);
      const lineHeight =
        parseInt(getComputedStyle(el).lineHeight, 10) || 24;
      const linesBefore = text.slice(0, start).split("\n").length - 1;
      el.scrollTop = Math.max(0, linesBefore * lineHeight - 80);
      syncScroll();
    },
  }));

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-50/50">
      <div
        ref={gutterRef}
        aria-hidden
        className="hidden shrink-0 overflow-hidden border-r border-stone-200 bg-stone-100/80 py-4 pr-2 pl-3 text-right sm:block"
      >
        <div className="font-mono text-[13px] leading-relaxed text-stone-400 select-none">
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="min-h-[1.625rem]">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        {useDecoratedOverlay && (
          <div
            ref={backdropRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words p-4 text-[15px] leading-relaxed text-stone-900"
          >
            {overlayPieces.map((piece, i) => (
              <OverlayPieceView key={i} piece={piece} />
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onScroll={useDecoratedOverlay ? syncScroll : undefined}
          placeholder={placeholder}
          spellCheck={false}
          className={`${EDITOR_CLASS} relative z-10 h-full caret-stone-900 selection:bg-sky-200/50 focus:ring-2 focus:ring-rose-500/30 ${
            useDecoratedOverlay ? "text-transparent" : "text-stone-900"
          }`}
        />
      </div>
    </div>
  );
});

function OverlayPieceView({ piece }: { piece: OverlayPiece }) {
  if (piece.kind === "diff") {
    return (
      <span
        className={
          piece.active ? "rounded-sm bg-amber-50/90 ring-1 ring-amber-200" : ""
        }
      >
        {piece.parts.map((part, i) => (
          <DiffPartSpan key={i} part={part} />
        ))}
      </span>
    );
  }

  return (
    <span className={underlineClassName(piece)}>
      {piece.text}
    </span>
  );
}

function DiffPartSpan({ part }: { part: DiffPart }) {
  if (part.tone === "remove") {
    return (
      <span className="rounded-sm bg-red-100 text-red-900 line-through decoration-red-400">
        {part.text}
      </span>
    );
  }
  if (part.tone === "add") {
    return (
      <span className="rounded-sm bg-emerald-100 text-emerald-900">
        {part.text}
      </span>
    );
  }
  return <span>{part.text}</span>;
}

function underlineClassName(piece: Extract<OverlayPiece, { kind: "underline" }>) {
  if (!piece.marked) return undefined;

  const severityDecoration = {
    high: "decoration-red-600 decoration-2",
    medium: "decoration-orange-500 decoration-2",
    low: "decoration-amber-500 decoration-2",
  } as const;

  const deco = piece.severity
    ? severityDecoration[piece.severity]
    : "decoration-red-500 decoration-2";

  return [
    "underline underline-offset-[3px]",
    deco,
    piece.active ? "rounded-sm bg-red-100/90" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
