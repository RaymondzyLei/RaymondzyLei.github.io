# Minor 清理 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 清理 4 项非 bug 的 Minor 代码异味(eslint parser 版本、root 非空断言、冗余 typeof window guard、Grid flex/CSS-grid 冲突),零新功能、其余 3 项行为零变化,Grid 项修正 spacing 失效缺陷。

**Architecture:** 4 个独立任务,按风险从低到高执行(ecmaVersion → root → typeof window → Grid),每任务一 commit,各自完整验证。无任务间依赖。Grid 项放最后因其需浏览器目视确认且视觉会变(spacing 从失效→生效)。

**Tech Stack:** Vite 8 + React 19 + TS 6 + MUI v9 + ESLint 10 + Vitest 4。pnpm。

## Global Constraints

- 包管理只用 pnpm(禁止 npm/yarn,见 CLAUDE.md)
- TS strict/noUnusedLocals/noUnusedParameters/verbatimModuleSyntax/erasableSyntaxOnly 全开(`tsconfig.app.json`)
- 提交信息末尾接 `Co-Authored-By: Claude <noreply@anthropic.com>`
- 每任务后执行:`pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`,全绿才提交
- 不动生产逻辑,4 项均为纯清理;Grid 项 spacing→gap 是修正原有缺陷(spacing 本就该生效却被 display:grid 覆盖),非引入回归
- Prettier 配置:单引号、分号、2 空格、`trailingComma: all`、`printWidth: 100`

---

### Task 1: eslint ecmaVersion 2022 → 2023

**Files:**
- Modify: `eslint.config.js:20`

**Interfaces:** 无(配置项变更,不涉及跨任务接口)。

- [ ] **Step 1: 改 ecmaVersion**

`eslint.config.js` 第 20 行,把 `2022` 改为 `2023`(对齐 `tsconfig.app.json` 的 `target: "ES2023"`):

```diff
     languageOptions: {
-      ecmaVersion: 2022,
+      ecmaVersion: 2023,
       globals: globals.browser,
     },
```

- [ ] **Step 2: 验证全绿**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: 全部 exit 0,54 tests pass。

- [ ] **Step 3: Commit**

```bash
git add eslint.config.js
git commit -m "chore(lint): bump ecmaVersion to 2023 to match tsconfig target" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: `getElementById('root')!` → 显式校验

**Files:**
- Modify: `src/main.tsx:12`

**Interfaces:** 无(入口文件局部变更)。

- [ ] **Step 1: 改为显式校验**

`src/main.tsx` 第 12 行,把非空断言 `!` 改为显式 `if (!root) throw`,避免模板编辑误删 `<div id="root">` 时静默失败:

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

- [ ] **Step 2: 验证全绿**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: 全部 exit 0,54 tests pass。

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "refactor(main): replace root non-null assertion with explicit guard" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: 删 `typeof window` 冗余 guard

**Files:**
- Modify: `src/components/BackgroundOrbs.tsx:39-40`

**Interfaces:** 无(`getInitialOrbs` 模块级私有函数,无导出)。

- [ ] **Step 1: 删 SSR guard**

`src/components/BackgroundOrbs.tsx` 第 39-40 行,`getInitialOrbs` 在纯 CSR SPA 中运行,`window` 必然存在,删 `typeof window` 三元:

```diff
 const getInitialOrbs = (): OrbData[] => {
-  const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
-  const h = typeof window !== 'undefined' ? window.innerHeight : 800;
+  const w = window.innerWidth;
+  const h = window.innerHeight;
   const maxX = Math.max(0, w - ORB_SIZE);
   const maxY = Math.max(0, h - ORB_SIZE);
```

- [ ] **Step 2: 验证全绿**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: 全部 exit 0,54 tests pass。

- [ ] **Step 3: Commit**

```bash
git add src/components/BackgroundOrbs.tsx
git commit -m "refactor(background-orbs): drop redundant typeof window SSR guard" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Grid → Box + CSS grid(Contact + Portfolio)

**Files:**
- Modify: `src/components/Contact.tsx`(import 区删 Grid、第 27-31 行改 Box、第 187 行闭合标签)
- Modify: `src/components/Portfolio.tsx`(import 区删 Grid、第 176-183 行改 Box、第 187 行闭合标签)

**Interfaces:** 无(布局容器局部变更)。

**根因说明(给 implementer):** MUI v9 `Grid` 基于 CSS flexbox(`display:flex` + `gap`)。当前代码 `<Grid container spacing sx={{display:'grid'}}>` 用 sx 把 flexbox 覆盖成 CSS grid,导致 `spacing` prop 静默失效(flexbox 的 gap 才用 spacing),实际列宽靠 `gridTemplateColumns` 的 `1fr` 间无 gap 生成。MUI 官方建议 CSS grid 布局用 `Box`。改后 `spacing` → `gap`(`gap: 4` 在 CSS grid 下走 MUI spacing = 32px,等价原 `spacing={4}` 意图),**spacing 重新生效,卡片间出现 32px 间距**(改前贴边)。这是修正缺陷,非回归。

- [ ] **Step 1: 改 Contact.tsx**

`src/components/Contact.tsx`:

(a) 删 Grid import(第 6 行):
```diff
-import Grid from '@mui/material/Grid';
```
(`Box` 已在第 3 行 import,无需加。)

(b) 第 27-31 行,`<Grid container spacing={4} sx={...}>` 改 `<Box sx={...}>`:
```diff
-      <Grid
-        container
-        spacing={4}
-        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
-      >
+      <Box
+        sx={{
+          display: 'grid',
+          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
+          gap: 4,
+        }}
+      >
```

(c) 第 187 行闭合标签:
```diff
-      </Grid>
+      </Box>
```

- [ ] **Step 2: 改 Portfolio.tsx**

`src/components/Portfolio.tsx`:

(a) 删 Grid import(第 5 行):
```diff
-import Grid from '@mui/material/Grid';
```
(`Box` 已在第 3 行 import,无需加。)

(b) 第 176-183 行,`<Grid container spacing={3} sx={...}>` 改 `<Box sx={...}>`:
```diff
-      <Grid
-        container
-        spacing={3}
-        sx={{
-          display: 'grid',
-          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
-        }}
-      >
+      <Box
+        sx={{
+          display: 'grid',
+          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
+          gap: 3,
+        }}
+      >
```

(c) 第 187 行闭合标签:
```diff
-      </Grid>
+      </Box>
```

- [ ] **Step 3: 验证全绿**

Run: `pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`
Expected: 全部 exit 0,54 tests pass。

- [ ] **Step 4: 浏览器目视确认**

启动 `pnpm run dev`,访问首页:
- **Contact 区块**:两列卡片(mobile 单列),列数不变,卡片间应有 32px 间距(`gap: 4`)。改前若卡片贴边属预期缺陷,改后出现间距正确。
- **Portfolio 区块**:桌面三列 / 平板两列 / 移动单列,列数不变,卡片间应有 24px 间距(`gap: 3`)。

确认布局符合预期。若 spacing 过大/过小或列数错,回退此 commit。

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.tsx src/components/Portfolio.tsx
git commit -m "refactor(grid): replace flex/grid-conflicting Grid with Box + CSS grid" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 开始前

当前在 `main`(含已提交的 spec,commit `6212c60`)。遵循 default-branch-branch-first 约定,Task 1 前先建分支:

```bash
git checkout -b minor-cleanup
```

4 个代码 commit 落在 `minor-cleanup` 分支上,不直接污染 main。

## 完成后

4 commit 落库。执行 `git log --oneline -6` 确认提交序列。然后用 superpowers:finishing-a-development-branch 选合并/PR/保留方式。spec commit `6212c60` 已在 main,分支从此处出发,merge 时 main fast-forward(无重复提交)。
