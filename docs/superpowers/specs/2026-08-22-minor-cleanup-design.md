# Minor 清理设计 — homepage

> 日期：2026-08-22
> 状态：已批准，待用户审阅 spec → 转 writing-plans 出实施计划
> 范围：4 项非 bug 的 Minor 清理。零新功能、零行为变化（Grid 间距/列数视觉等价）。

## 背景与动机

前序 code-health-cleanup（20 任务）+ F 类测试补全（18 测试）已合并 main。本轮处理经一手核实仍存在的 4 个 Minor 代码异味。它们均非 bug，但其中 Grid 冲突一项有实际影响（`spacing` prop 在 `display:grid` 下静默失效），其余三项纯一致性/防御性。顺手清理使代码库更一致，为下一步开发扫清障碍。

## 已确认的取舍决策

| 决策点 | 选择 |
|---|---|
| 范围 | 全做 4 项（Grid 冗余 + ecmaVersion + root 断言 + typeof window guard） |
| Grid 方案 | **A：Box + CSS grid**（MUI v9 官方建议；删 Grid import；spacing→gap） |
| `<title>` ASCII 撇号 | **不动**（HTML 文本内容里 `'` 合法，旧 memory #28 为误判） |
| `theme.ts` secondary==primary | **不动**（上轮明确决定保留待用，有 TODO） |
| bundle 体积 | **不动**（Vite 8 已自动拆 chunk，build 无 warning） |

## Commit 策略

方案：4 项各一个 commit，按风险从低到高（ecmaVersion → root → typeof window → Grid）。Grid 改动需目视确认，放最后。每项独立 verify。

## 改动项

### 1. eslint ecmaVersion 2022 → 2023

**文件：** `eslint.config.js:20`

当前 `ecmaVersion: 2022`，而 `tsconfig.app.json` 的 `target: "ES2023"`。偏低一档，不报错但不对齐。改为 `2023`。

```diff
   languageOptions: {
-    ecmaVersion: 2022,
+    ecmaVersion: 2023,
     globals: globals.browser,
   },
```

### 2. `getElementById('root')!` → 显式校验

**文件：** `src/main.tsx:12`

当前用非空断言 `!`，若模板编辑误删 `<div id="root">` 会静默失败。改为显式校验，抛出明确错误。

```diff
-ReactDOM.createRoot(document.getElementById('root')!).render(
+const root = document.getElementById('root');
+if (!root) throw new Error('Root element #root not found');
+ReactDOM.createRoot(root).render(
   <React.StrictMode>
     <App />
   </React.StrictMode>,
 );
```

### 3. 删 `typeof window` 冗余 guard

**文件：** `src/components/BackgroundOrbs.tsx:39-40`

`getInitialOrbs` 在纯 CSR SPA 中运行，`window` 必然存在。guard 是 SSR 残留假设，删后行为零变化。

```diff
 const getInitialOrbs = (): OrbData[] => {
-  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
-  const h = typeof window !== 'undefined' ? window.innerHeight : 800;
+  const w = window.innerWidth;
+  const h = window.innerHeight;
   const maxX = Math.max(0, w - ORB_SIZE);
   const maxY = Math.max(0, h - ORB_SIZE);
```

### 4. Grid → Box + CSS grid（Contact + Portfolio）

**文件：** `src/components/Contact.tsx:27-31`、`src/components/Portfolio.tsx:176-183`、及两文件 import 区

**根因：** MUI v9 `Grid` 基于 CSS flexbox（`display:flex` + `gap`，见 context7 v9.2.0 文档）。当前代码 `<Grid container spacing sx={{display:'grid'}}>` 把 flexbox 覆盖成 CSS grid —— `spacing` prop 在 `display:grid` 下静默失效（flexbox 的 `gap` 才用 spacing），实际列宽靠 `gridTemplateColumns` 的 `1fr` 间无 gap 生成，`<Grid>` 沦为空壳。MUI 官方明确建议 CSS grid 布局用 `Box` 而非 `Grid`。

**Contact.tsx** 当前：
```tsx
<Grid container spacing={4} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
```
改为：
```tsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
```
删 `import Grid from '@mui/material/Grid'`（`Box` 已 import）。

**Portfolio.tsx** 当前：
```tsx
<Grid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
```
改为：
```tsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
```
删 `import Grid from '@mui/material/Grid'`，确认 `Box` 已 import（Portfolio:3 已有 `import Box`）。

**间距等价性：** `spacing={4}` = MUI spacing 4 × 8px = 32px。CSS grid 下 `gap: 4`（sx 数字走 MUI spacing）同样 = 32px。**视觉零变化**。但注意：当前冲突态下 spacing 实际未生效（flexbox gap 被覆盖），gridTemplateColumns 的 `1fr` 间无 gap → 改后 `gap:4` 会**新增**间距。这是修正原有缺陷（spacing 本就该生效），非引入回归。Grid 项需浏览器目视确认：改前卡片可能贴边，改后有 32px 间距 —— 这正是预期（原代码意图 spacing=4 却未生效）。

## 验证策略

每项后执行：`pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`。

Grid 项额外需浏览器目视：Contact（两列卡片间距）与 Portfolio（三列卡片间距）的列数与间距符合预期。本轮所用 API 不支持图像输入，依靠代码审查 + build + typecheck + 人工目视保证，不进行截图回归。

## Out of Scope

- `<title>` ASCII 撇号 —— 伪问题，不动。
- `theme.ts` secondary 调色板 —— 保留待用（有 TODO）。
- bundle 体积 / manualChunks —— Vite 8 已自愈，不动。
- 大规模重构 —— 不在本轮。
