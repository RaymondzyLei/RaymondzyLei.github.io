# 前端质感打磨设计 — homepage

> 日期：2026-08-23
> 状态：设计已逐节批准，待用户审阅 spec → 转 writing-plans 出实施计划
> 范围：首页 6 区块 + 公共部分（Navbar/背景光球/返回顶部）+ 404/RedirectPage。**不含** ResumePage。
> 性质：纯视觉/微交互打磨。布局结构、字体、玻璃风格、区块划分、动效种类全部不变。

## 背景与动机

站点骨架已健康：`glass()` 玻璃系统、全局 focus-visible、easing/duration token、reduced-motion 全覆盖、scroll-reveal + stagger、View Transitions 换肤均已就位。本轮通读全部组件后发现的短板集中在**色彩层级、细节一致性与环境级质感**：文本层级拉不开、Chip 形态三种并存、hover 阴影与玻璃紫调断裂、两处对比度 bug、卡片 padding 不齐、缺 `::selection` 与滚动条定制。目标：不换风格的前提下，让整体观感更舒适、细节更「处处是同一套设计」。

## 已确认的取舍决策

| 决策点 | 选择 |
|---|---|
| 打磨模式 | 亮色 + 暗色**两模式都做**，同一套标准 |
| 改动尺度 | 允许局部重排；实际选定方案 B（色彩体系 + 组件细节精修），未用装饰性重排 |
| 动效边界 | **仅参数微调**（头像 hover 幅度、焦点环 offset），不增删动效种类 |
| Chip 形态 | **B · 柔和填充**（视觉伴侣三选一确定：淡紫底 + 细描边 + 紫字，全站统一） |
| 文本色板 | zinc 灰阶（中性不偏色，与紫色主色不冲突） |
| scroll-reveal 1200ms / tilt ±5° / Lenis / VT 换肤 | **不动**（站点签名） |
| ResumePage | 不动（硬编码浅色打印主题，风格独立） |
| `secondary` 调色板 | 不动（保留 TODO） |

## Commit 策略

5 项各一个 commit，按「风险低 → 视觉变化大」排序：① 文本色板 → ② 阴影统一+对比度修复 → ③ 卡片节奏 → ④ 动效收敛+环境细节 → ⑤ Chip 柔和填充（视觉变化最大，放最后便于目视确认与回退）。每项独立 verify。

## 改动项

### 1. 文本层级色板（`src/theme.ts`）

现状：亮色 `#000000`/`#333333` 两档几乎无层级差且纯黑刺眼；暗色 secondary `#e5e7eb` 几乎与白字同亮，标题正文糊在一起。

```diff
     light: {
       palette: {
         text: {
-          primary: '#000000',
-          secondary: '#333333',
+          primary: '#18181b',   // zinc-900 近黑
+          secondary: '#52525b', // zinc-600（白底对比 ≈ 7.2:1）
         },
       },
     },
     dark: {
       palette: {
         text: {
-          primary: '#ffffff',
-          secondary: '#e5e7eb',
+          primary: '#f4f4f5',   // zinc-100 去纯白刺眼感
+          secondary: '#a1a1aa', // zinc-400（暗底对比 ≈ 8:1，真正退后一步）
         },
       },
     },
```

### 2. hover 阴影紫调统一 + 两处对比度修复

**2a. `glassHoverShadow` token（`src/theme.ts` 新导出）**

现状：玻璃表面静态带紫色软投影，hover 却切到 MUI 中性灰 `shadows[4]/[8]/[16]`，气质断裂。

```ts
/** Hover shadow for glass surfaces — same violet family as glass() 静态投影, deepened one notch. */
export const glassHoverShadow = (theme: Theme): string =>
  theme.palette.mode === 'dark'
    ? 'inset 0 1px 0 0 rgba(255,255,255,0.10), 0 12px 36px rgba(167,139,250,0.10)'
    : '0 12px 40px rgba(124,58,237,0.16)';
```

消费方（3 处，hover boxShadow 替换 MUI 灰阶阴影）：
- `src/components/GlassCard.tsx`：`shadows[8]` → `glassHoverShadow(theme)`
- `src/components/Portfolio.tsx` `StyledProjectCard`：`shadows[16]` → `glassHoverShadow(theme)`
- `src/components/Academic.tsx` `StyledAccordion`：`shadows[4]` → `glassHoverShadow(theme)`

**2b. 对比度修复（小 bug）**

- `src/components/Contact.tsx:158`：链接图标块 `color: 'background.paper'` → `'primary.contrastText'`（暗色模式现为紫底深灰图标，几乎不可见）。
- `src/components/Qualifications.tsx:121`：桌面时间线 `TimelineDot` sx 补 `color: 'primary.contrastText'`（亮色模式现为紫底黑图标）。

### 3. 卡片节奏与文本层级

**3a. 卡片内边距统一 `p: 3`（24px）**

- `src/components/Qualifications.tsx` `DesktopTimelineItem`：`sx={{ p: 2 }}` → `sx={{ p: 3 }}`（现状最挤的一张）。
- `src/components/Academic.tsx` `AchievementCardView`：CardHeader/CardContent 走 MUI 默认 16px，与其它 p:3 卡片不一致。改 `CardHeader sx={{ px: 3, pt: 3, pb: 1 }}`、`CardContent sx={{ px: 3, pt: 1 }}`（CardContent `:last-child` 默认 pb 24px 恰为 p:3，无需覆盖）。
- Skills / Contact / MobileTimelineItem 已是 p:3，不动。

**3b. 「需要读的信息」不用 `text.disabled`**

日期与补充说明提级为 `text.secondary`（配合第 1 项新 secondary 值，可读但不抢标题）：
- `Qualifications.tsx` 桌面/移动时间线日期 caption（`text.disabled` → `text.secondary`）
- `Academic.tsx` details caption（同上）

`text.disabled` 此后仅用于纯装饰场景。

### 4. 动效收敛 + 全局环境细节

**4a. 头像 hover 收敛（`src/components/Hero.tsx`）**

`scale(1.3) rotateZ(5deg)` → `scale(1.06)`，去旋转（1.3 倍跳变与全站克制动效不协调）。boxShadow 保留。

**4b. 焦点环统一（`src/components/LiquidGlassButton.tsx`）**

`outlineOffset: 4` → `2`，与 Button/IconButton/Chip/AccordionSummary 的全局 offset 2 对齐。

**4c. `::selection` + 自定义滚动条（`src/theme.ts` 新增 `MuiCssBaseline.styleOverrides`）**

项目已启用 MUI CSS variables（`focusVisibleRing` 已用 `var(--mui-palette-primary-main)`），用 `color-mix` 引用变量即可自动跟随亮/暗模式，无需分模式写两份：

```ts
MuiCssBaseline: {
  styleOverrides: {
    '::selection': {
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)',
    },
    '*': {
      scrollbarWidth: 'thin',
      scrollbarColor:
        'color-mix(in srgb, var(--mui-palette-text-primary) 18%, transparent) transparent',
    },
    '::-webkit-scrollbar': { width: 10, height: 10 },
    '::-webkit-scrollbar-track': { background: 'transparent' },
    '::-webkit-scrollbar-thumb': {
      borderRadius: 999,
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 18%, transparent)',
    },
    '::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'color-mix(in srgb, var(--mui-palette-text-primary) 28%, transparent)',
    },
  },
},
```

注意：只写伪元素/装饰性规则，**不碰 `html` 的 font-size**（CLAUDE.md 已知坑）。`color-mix` 为 Baseline 2023 特性，目标浏览器（现代 evergreen）均支持。

### 5. Chip 柔和填充系统（视觉变化最大）

新建共享组件 `src/components/SoftChip.tsx`，三处消费统一替换：

```tsx
import Chip from '@mui/material/Chip';
import { alpha, styled } from '@mui/material/styles';

/**
 * Shared soft-filled chip (2026-08-23 frontend-polish spec §5): tinted
 * primary background + hairline inset ring + primary text. Replaces the
 * three divergent chip styles (solid in Skills/Academic, outlined in
 * Portfolio) with one language.
 */
export const SoftChip = styled(Chip)(({ theme }) => {
  const dark = theme.palette.mode === 'dark';
  return {
    backgroundColor: alpha(theme.palette.primary.main, dark ? 0.12 : 0.09),
    color: dark ? theme.palette.primary.light : theme.palette.primary.dark,
    boxShadow: `inset 0 0 0 1px ${alpha(theme.palette.primary.main, dark ? 0.26 : 0.22)}`,
    fontWeight: 500,
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter,
    }),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, dark ? 0.18 : 0.14),
    },
  };
});
```

消费方替换：
- `src/components/Skills.tsx`：删 `SkillChip` styled 定义（含 hover scale/translateY 与 reduced-motion 块）；用法 `<SoftChip key={skill.id} label={skill.name} />`——原 sx 的 backgroundColor/color/hover 全部删除（SoftChip 已内置同语义样式，fontWeight 500 在 SoftChip 内声明）。
- `src/components/Academic.tsx`：分类 `Chip` → `SoftChip size="small"`（删实心 sx）。
- `src/components/Portfolio.tsx`：技术栈 `Chip variant="outlined"` → `SoftChip size="small"`（删描边 sx）。

全局 `MuiChip` 的 focusVisibleRing styleOverrides 不受影响，自动生效。

## 验证策略

每个 commit 后：`pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`。

现有测试预期零改动（`glass()`、`revealSx()`、i18n 对称、组件渲染冒烟均不触及本轮改动面；`GlassCard` 渲染测试不受 hover 阴影变化影响）。

全部完成后 `pnpm run dev` 目视验收：亮/暗两模式 × 首页 6 区块 + 404 + redirect，重点看 Chip 形态、hover 阴影、暗色滚动条、头像 hover。

## Out of Scope

- ResumePage（硬编码浅色打印主题）。
- 区块标题装饰、卡片信息层级重排等方案 C 项（本轮未选）。
- reveal 1200ms / tilt ±5° / Lenis 曲线 / View Transitions 签名动效。
- 光球颜色/透明度/数量。
- `projects.ts` 占位内容、`secondary` 调色板 TODO、奖状文件补传（各有独立 TODO）。
