import {
  CHECK_DIRECTIONS,
  type CheckDirectionId,
} from "./check-directions";

/** 全部检查方向：全文改写 + 程序 diff */
export const REWRITE_DIRECTIONS = new Set<CheckDirectionId>(
  CHECK_DIRECTIONS.map((d) => d.id),
);

import { ANALYZE_MAX_CHARS } from "./analyze-limits";

/** @deprecated 使用 ANALYZE_MAX_CHARS */
export const REWRITE_MAX_CHARS = ANALYZE_MAX_CHARS;

export function usesRewriteMode(direction: CheckDirectionId): boolean {
  return REWRITE_DIRECTIONS.has(direction);
}
