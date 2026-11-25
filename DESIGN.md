# 笔耕 · 视觉世界

## 模式

| 表面 | Impeccable 模式 | 要点 |
|------|-----------------|------|
| 首页 / 精选收录 | Read + 轻展示 | 网格纸、封面陈列、顶栏导航 |
| 文集内阅读 | Read | 面包屑、三栏、隐藏滚动条 |
| 编辑器 | Operate | 分栏工具、检查侧栏、克制控件 |

## 材质

- **纸面** `.shelf-paper`：`#f6f3ec` + 32px 浅棕网格。
- **工作面** `.work-surface`：略浅 `#faf8f4`，与纸面对比但不跳白。
- **强调**：图标底 `#f3e2b0`，字 `#8a5a12`（与顶栏 Logo 一致）。
- **线**：`border-stone-300/60`～`/70`，避免粗灰底和大阴影。

##  typography

- 单一 sans：`var(--font-noto)`（Noto Sans SC）。
- 页标题：`text-[28px] font-semibold tracking-tight`。
- 正文编辑/阅读：`15–16px`，行高 `leading-relaxed` / `leading-8`。

## 布局

- 内容最大宽 `1120px`（书架、首页）。
- 全屏工具（编辑器、阅读）用 `h-dvh` + 顶栏/面包屑 + `ResizeSplit`。
- 滚动：功能区加 `.scrollbar-none`，保留滚轮。

## 组件约定

- **SiteHeader**：粘性顶栏、居中导航、当前页 `border-b-2`。
- **按钮（Operate）**：描边为主；主操作用 `stone-900` 实心；不用大面积 `shadow-sm` 卡片堆叠。
- **检查建议卡**：圆角 + 细边框；选中态 ring，不用重阴影。

## 禁止（相对本品牌）

- 编辑器整页灰底 + 白卡片「后台感」。
- 与纸面无关的霓虹渐变、玻璃拟态装饰。
- 正文区粗系统滚动条（阅读器已隐藏）。