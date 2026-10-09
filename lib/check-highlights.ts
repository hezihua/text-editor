import type { CheckResult } from "./schemas";
import { findIssueRange } from "./issue-range";
import { diffSpans } from "./text-patch";
import type { CheckIssue } from "./schemas";

export type CheckHighlight = {
  issueId: string;
  start: number;
  end: number;
  severity: CheckResult["issues"][number]["severity"];
  quote: string;
};

export type MarkedSegment = {
  text: string;
  marked: boolean;
  active: boolean;
  severity: CheckResult["issues"][number]["severity"] | null;
};

export function collectCheckHighlights(
  text: string,
  issues: CheckIssue[],
  resolved: Record<string, "applied" | "ignored">,
): CheckHighlight[] {
  const highlights: CheckHighlight[] = [];

  for (const issue of issues) {
    if (resolved[issue.id]) continue;
    const range = findIssueRange(text, issue);
    if (!range) continue;
    highlights.push({
      issueId: issue.id,
      start: range[0],
      end: range[1],
      severity: issue.severity,
      quote: issue.quote,
    });
  }

  return highlights;
}

export function buildMarkedSegments(
  text: string,
  highlights: CheckHighlight[],
  activeQuote: string | null,
  activeIssueId: string | null = null,
): MarkedSegment[] {
  if (highlights.length === 0) {
    return [{ text, marked: false, active: false, severity: null }];
  }

  const boundaries = new Set<number>([0, text.length]);
  for (const h of highlights) {
    boundaries.add(h.start);
    boundaries.add(h.end);
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const segments: MarkedSegment[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    if (start >= end) continue;

    const covering = highlights.filter((h) => h.start <= start && h.end >= end);
    const marked = covering.length > 0;
    const active =
      (activeIssueId != null &&
        covering.some((h) => h.issueId === activeIssueId)) ||
      (activeQuote != null &&
        covering.some((h) => h.quote === activeQuote || activeQuote === h.quote));
    const severity = marked
      ? (covering.find((h) => h.severity === "high")?.severity ??
        covering.find((h) => h.severity === "medium")?.severity ??
        covering[0]!.severity)
      : null;

    segments.push({
      text: text.slice(start, end),
      marked,
      active,
      severity,
    });
  }

  return segments.length > 0
    ? segments
    : [{ text, marked: false, active: false, severity: null }];
}

export function lineCount(text: string): number {
  if (!text) return 1;
  return text.split("\n").length;
}

export type DiffTone = "plain" | "remove" | "add";

export type DiffPart = { text: string; tone: DiffTone };

export type OverlayPiece =
  | {
      kind: "underline";
      text: string;
      marked: boolean;
      active: boolean;
      severity: CheckResult["issues"][number]["severity"] | null;
    }
  | { kind: "diff"; parts: DiffPart[]; active: boolean };

export function diffDisplayParts(before: string, after: string): DiffPart[] {
  const { beforeHighlight, afterHighlight } = diffSpans(before, after);
  const parts: DiffPart[] = [];

  const removeStart = beforeHighlight?.[0] ?? before.length;
  const removeEnd = beforeHighlight?.[1] ?? before.length;

  if (removeStart > 0) {
    parts.push({ text: before.slice(0, removeStart), tone: "plain" });
  }
  if (removeEnd > removeStart) {
    parts.push({
      text: before.slice(removeStart, removeEnd),
      tone: "remove",
    });
  }
  if (afterHighlight && afterHighlight[1] > afterHighlight[0]) {
    parts.push({
      text: after.slice(afterHighlight[0], afterHighlight[1]),
      tone: "add",
    });
  }
  const afterPlainStart = removeEnd;
  if (afterPlainStart < before.length) {
    parts.push({ text: before.slice(afterPlainStart), tone: "plain" });
  }

  return parts.filter((p) => p.text.length > 0);
}

export function buildOverlayPieces(
  text: string,
  issues: CheckResult["issues"],
  resolved: Record<string, "applied" | "ignored">,
  options: {
    viewChanges: boolean;
    activeQuote: string | null;
    activeIssueId?: string | null;
  },
): OverlayPiece[] {
  const highlights = collectCheckHighlights(text, issues, resolved);
  if (highlights.length === 0) {
    return [
      {
        kind: "underline",
        text,
        marked: false,
        active: false,
        severity: null,
      },
    ];
  }

  if (!options.viewChanges) {
    return buildMarkedSegments(
      text,
      highlights,
      options.activeQuote,
      options.activeIssueId ?? null,
    ).map(
      (seg) => ({
        kind: "underline" as const,
        text: seg.text,
        marked: seg.marked,
        active: seg.active,
        severity: seg.severity,
      }),
    );
  }

  const issueById = new Map(issues.map((i) => [i.id, i]));
  const boundaries = new Set<number>([0, text.length]);
  for (const h of highlights) {
    boundaries.add(h.start);
    boundaries.add(h.end);
  }
  const points = [...boundaries].sort((a, b) => a - b);
  const pieces: OverlayPiece[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i]!;
    const end = points[i + 1]!;
    if (start >= end) continue;

    const slice = text.slice(start, end);
    const covering = highlights.filter((h) => h.start <= start && h.end >= end);
    const issue = covering[0]
      ? issueById.get(covering[0].issueId)
      : undefined;
    const active =
      (options.activeIssueId != null &&
        covering.some((h) => h.issueId === options.activeIssueId)) ||
      (options.activeQuote != null &&
        covering.some((h) => h.quote === options.activeQuote));

    if (issue && covering.length > 0) {
      pieces.push({
        kind: "diff",
        parts: diffDisplayParts(slice, issue.suggestion),
        active,
      });
    } else {
      pieces.push({
        kind: "underline",
        text: slice,
        marked: false,
        active: false,
        severity: null,
      });
    }
  }

  return pieces.length > 0
    ? pieces
    : [
        {
          kind: "underline",
          text,
          marked: false,
          active: false,
          severity: null,
        },
      ];
}

/** 检查完成后对比「应用前原文」与「当前正文」，用于全部应用后的查看变更 */
export function buildDocumentDiffPieces(
  baseline: string,
  current: string,
): OverlayPiece[] {
  if (baseline === current) {
    return [
      {
        kind: "underline",
        text: current,
        marked: false,
        active: false,
        severity: null,
      },
    ];
  }

  const parts: DiffPart[] = [];
  const baselineLines = baseline.split("\n");
  const currentLines = current.split("\n");
  const lineCount = Math.max(baselineLines.length, currentLines.length);

  for (let i = 0; i < lineCount; i++) {
    const before = baselineLines[i] ?? "";
    const after = currentLines[i] ?? "";
    if (before === after) {
      if (after.length > 0 || i < lineCount - 1) {
        parts.push({ text: after, tone: "plain" });
      }
    } else {
      parts.push(...diffDisplayParts(before, after));
    }
    if (i < lineCount - 1) {
      parts.push({ text: "\n", tone: "plain" });
    }
  }

  return [{ kind: "diff", parts, active: false }];
}
