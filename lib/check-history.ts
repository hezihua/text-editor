import type { CheckDirectionId } from "./check-directions";
import { getCheckDirection } from "./check-directions";

const STORAGE_KEY = "text-editor-check-history";
const MAX_ENTRIES = 8;

export type CheckHistoryEntry = {
  id: string;
  at: number;
  direction: CheckDirectionId;
  directionLabel: string;
  summary: string;
  issueCount: number;
  textLength: number;
};

export function loadCheckHistory(): CheckHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CheckHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : [];
  } catch {
    return [];
  }
}

export function appendCheckHistory(entry: {
  direction: CheckDirectionId;
  summary: string;
  issueCount: number;
  textLength: number;
}): CheckHistoryEntry[] {
  const next: CheckHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: Date.now(),
    direction: entry.direction,
    directionLabel: getCheckDirection(entry.direction).label,
    summary: entry.summary.slice(0, 280),
    issueCount: entry.issueCount,
    textLength: entry.textLength,
  };
  const prev = loadCheckHistory();
  const merged = [next, ...prev].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
