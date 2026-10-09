/** 将 Turbopack/开发态模块加载错误转为用户可读提示 */
export function toUserFacingApiError(raw: string): string {
  if (/is not a function/i.test(raw) || /TURBOPACK__imported__module/i.test(raw)) {
    return "服务模块加载异常（常见于 dev 热更新）。请刷新页面；若仍失败，请重启 pnpm dev 后再试。";
  }
  return raw;
}
