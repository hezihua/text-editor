import {
  CHECK_DIRECTIONS,
  type CheckDirectionId,
} from "./check-directions";

/** 全部检查方向：全文改写 + 程序 diff */
export const REWRITE_DIRECTIONS = new Set<CheckDirectionId>(
  CHECK_DIRECTIONS.map((d) => d.id),
);

/** 全文改写总字数上限（内部分段调用） */
export const REWRITE_MAX_CHARS = 48_000;

export function usesRewriteMode(direction: CheckDirectionId): boolean {
  return REWRITE_DIRECTIONS.has(direction);
}
