# 前端质感打磨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 spec `docs/superpowers/specs/2026-08-23-frontend-polish-design.md` 完成 5 项纯视觉打磨：文本层级色板、紫调 hover 阴影统一 + 两处对比度修复、卡片节奏统一、动效收敛 + 环境细节（::selection/滚动条）、SoftChip 柔和填充系统。

**Architecture:** 全部改动落在既有架构面上——token 进 `src/theme.ts`（新导出 `glassHoverShadow` + 新增 `MuiCssBaseline.styleOverrides`），组件级小改 6 个文件，新建共享组件 `SoftChip`。零行为变化、零布局变化。

**Tech Stack:** Vite 8 + React 19 + TS 6 (strict/noUnusedLocals/noUnusedParameters/verbatimModuleSyntax) + MUI v9 + Vitest 4 (jsdom)。包管理只用 pnpm。

**Spec:** `docs/superpowers/specs/2026-08-23-frontend-polish-design.md`（已批准，commit 00ab765）

## Global Constraints

- 零行为变化：布局结构、字体、玻璃风格、区块划分、动效**种类**全部不变。
- 签名动效不动：scroll-reveal 1200ms / tilt ±5° / Lenis 曲线 / View Transitions 换肤。
- **绝不**在 `MuiCssBaseline.styleOverrides` 里写 `html` 的 `font-size`（emotion 运行时注入优先级高于静态 fonts.css，会反向覆盖全局 rem 基准）。只允许伪元素/装饰性规则。
- 不碰：ResumePage、`secondary` 调色板 TODO、BackgroundOrbs 光球、`projects.ts` 占位内容。
- 毛玻璃表面 hover 反馈只动 `boxShadow`/`border`/`color`，不改 `backgroundColor`（CLAUDE.md 约定）。
- 每个 commit 末尾加：`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- 每个任务的验证链（下文简写「全套验证」）：
  ```bash
  pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build
  ```
  预期全绿。测试基线约 **54 tests / 14 files**（执行前先跑一次实测记录）；除 Task 5 净增 2 tests / +1 file 外，其余任务测试数不变。

## 分支

在 main（commit `00ab765`）上创建并切换：

```bash
git checkout main && git checkout -b feat/frontend-polish
```

---

### Task 1: 文本层级色板（zinc 灰阶）

**Files:**
- Modify: `src/theme.ts`（colorSchemes 内两处 `text` 块）

**Interfaces:**
- Consumes: 无
- Produces: 无（纯常量值变化；`theme.test.ts` 不断言文本色，无需改测试）

- [ ] **Step 1: 修改亮色 `text`**

`src/theme.ts` light palette 中：

```diff
         text: {
-          primary: '#000000',
-          secondary: '#333333',
+          primary: '#18181b',
+          secondary: '#52525b',
         },
```

- [ ] **Step 2: 修改暗色 `text`**

同文件 dark palette 中：

```diff
         text: {
-          primary: '#ffffff',
-          secondary: '#e5e7eb',
+          primary: '#f4f4f5',
+          secondary: '#a1a1aa',
         },
```

- [ ] **Step 3: 全套验证**

预期：全绿，测试数与基线一致。

- [ ] **Step 4: Commit**

```bash
git add src/theme.ts
git commit -m "feat(theme): soften text hierarchy palette (zinc scale)" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: glassHoverShadow 统一 + 两处 contrastText 修复

**Files:**
- Modify: `src/theme.ts`（新增导出）
- Modify: `src/components/GlassCard.tsx`
- Modify: `src/components/Portfolio.tsx`
- Modify: `src/components/Academic.tsx`
- Modify: `src/components/Contact.tsx:158`
- Modify: `src/components/Qualifications.tsx:121`

**Interfaces:**
- Consumes: 无
- Produces: `glassHoverShadow(theme: Theme): string`（从 `src/theme.ts` 导出；本任务内 3 处消费，后续任务不依赖）

- [ ] **Step 1: 在 `src/theme.ts` 的 `glass()` 之后新增导出**

```ts
/**
 * Hover shadow for glass surfaces -- same violet family as glass()'s static
 * shadow, deepened one notch. Replaces MUI's neutral grey shadows on hover
 * (GlassCard / StyledProjectCard / StyledAccordion).
 */
export const glassHoverShadow = (theme: Theme): string =>
  theme.palette.mode === 'dark'
    ? 'inset 0 1px 0 0 rgba(255,255,255,0.10), 0 12px 36px rgba(167,139,250,0.10)'
    : '0 12px 40px rgba(124,58,237,0.16)';
```

- [ ] **Step 2: GlassCard hover 换紫调阴影**

`src/components/GlassCard.tsx`：import 行改为

```ts
import { glass, glassHoverShadow } from '../theme';
```

hover 块改为：

```diff
   '&:hover': {
-    boxShadow: theme.shadows[8],
+    boxShadow: glassHoverShadow(theme),
   },
```

- [ ] **Step 3: StyledProjectCard hover 换紫调阴影**

`src/components/Portfolio.tsx`：import 行改为

```ts
import { glass, glassHoverShadow } from '../theme';
```

hover 块改为（`::before` 扫光部分保持原样）：

```diff
   '&:hover': {
-    boxShadow: theme.shadows[16],
+    boxShadow: glassHoverShadow(theme),
     '&::before': {
       transform: 'translateX(100%)',
     },
   },
```

- [ ] **Step 4: StyledAccordion hover 换紫调阴影**

`src/components/Academic.tsx` 顶部加 import（该文件当前未从 theme 引入任何东西）：

```ts
import { glassHoverShadow } from '../theme';
```

StyledAccordion hover 改为：

```diff
   '&:hover': {
-    boxShadow: theme.shadows[4],
+    boxShadow: glassHoverShadow(theme),
   },
```

- [ ] **Step 5: Contact 图标块颜色修复（暗色对比 bug）**

`src/components/Contact.tsx` 实用链接行的图标方块：

```diff
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
-                      color: 'background.paper',
+                      color: 'primary.contrastText',
```

- [ ] **Step 6: TimelineDot 图标颜色修复（亮色对比 bug）**

`src/components/Qualifications.tsx` 桌面时间线：

```diff
-                <TimelineDot sx={{ bgcolor: 'primary.main', boxShadow: 1 }}>
+                <TimelineDot sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 1 }}>
```

- [ ] **Step 7: 全套验证**

预期：全绿，测试数不变。

- [ ] **Step 8: Commit**

```bash
git add src/theme.ts src/components/GlassCard.tsx src/components/Portfolio.tsx src/components/Academic.tsx src/components/Contact.tsx src/components/Qualifications.tsx
git commit -m "fix(ui): violet hover shadow token + two contrastText fixes" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 卡片 padding 统一 p:3 + disabled 文本提级

**Files:**
- Modify: `src/components/Qualifications.tsx`
- Modify: `src/components/Academic.tsx`

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: DesktopTimelineItem padding 与日期提级**

`src/components/Qualifications.tsx` `DesktopTimelineItem` 内：

```diff
-      <GlassCard accent="left" ref={tiltRef} sx={{ p: 2 }}>
+      <GlassCard accent="left" ref={tiltRef} sx={{ p: 3 }}>
```

```diff
-        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
+        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
           {t(`${p}.date`)}
         </Typography>
```

- [ ] **Step 2: MobileTimelineItem 日期提级**

同文件 `MobileTimelineItem` 内（p:3 已达标，只改色）：

```diff
-          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
+          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
             {t(`${p}.date`)}
           </Typography>
```

- [ ] **Step 3: AchievementCardView 对齐 p:3 节奏 + details 提级**

`src/components/Academic.tsx` `AchievementCardView` 内：

```diff
       <GlassCard accent="top" ref={tiltRef}>
       <CardHeader
         title={title}
         subheader={date}
+        sx={{ px: 3, pt: 3, pb: 1 }}
         slotProps={{
```

```diff
-      <CardContent>
+      <CardContent sx={{ px: 3, pt: 1 }}>
```

（CardContent 的 `&:last-child` 默认 `padding-bottom: 24px` 恰为 p:3，不需要覆盖。）

details 提级：

```diff
         {details && (
-          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
+          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
             {details}
           </Typography>
         )}
```

- [ ] **Step 4: 全套验证**

预期：全绿，测试数不变。（`GlassCard.test.tsx` 渲染冒烟不涉及 padding。）

- [ ] **Step 5: Commit**

```bash
git add src/components/Qualifications.tsx src/components/Academic.tsx
git commit -m "style(ui): unify card padding to p:3, lift disabled-level copy" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 动效收敛 + ::selection + 自定义滚动条

**Files:**
- Modify: `src/components/Hero.tsx`（AnimatedAvatar hover）
- Modify: `src/components/LiquidGlassButton.tsx`（focus offset）
- Modify: `src/theme.ts`（MuiCssBaseline.styleOverrides）

**Interfaces:**
- Consumes: 无
- Produces: 无

- [ ] **Step 1: 头像 hover 收敛**

`src/components/Hero.tsx` `AnimatedAvatar`：

```diff
   cursor: 'pointer',
   '&:hover': {
-    transform: 'scale(1.3) rotateZ(5deg)',
+    transform: 'scale(1.06)',
     boxShadow: theme.shadows[12],
   },
```

（reduced-motion 块保持原样。）

- [ ] **Step 2: LiquidGlassButton 焦点环对齐**

`src/components/LiquidGlassButton.tsx`：

```diff
   '&:focus-visible': {
     outline: `2px solid ${theme.palette.primary.main}`,
-    outlineOffset: 4,
+    outlineOffset: 2,
   },
```

- [ ] **Step 3: theme.ts 新增 MuiCssBaseline 装饰性全局样式**

在 `components` 对象内、`MuiAccordionSummary` 条目之后追加（注意：**不含任何 html font-size 规则**）：

```ts
    // Decorative global styles: violet selection tint + slim rounded scrollbar.
    // color-mix() against CSS vars follows light/dark automatically. Pseudo-
    // elements only -- NEVER set html font-size here (emotion would override
    // the static fonts.css rem baseline).
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

- [ ] **Step 4: 全套验证**

预期：全绿，测试数不变（`theme.test.ts` 只断言既有组件条目，新增条目无影响）。

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.tsx src/components/LiquidGlassButton.tsx src/theme.ts
git commit -m "feat(ui): violet selection, slim scrollbar, calmer avatar hover" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: SoftChip 柔和填充系统（TDD）

**Files:**
- Create: `src/components/SoftChip.test.tsx`
- Create: `src/components/SoftChip.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/components/Academic.tsx`
- Modify: `src/components/Portfolio.tsx`

**Interfaces:**
- Consumes: `renderWithTheme`（已存在，`src/test/render.tsx`）
- Produces: `SoftChip`（`styled(Chip)`，props 同 MUI Chip；Skills 用默认尺寸，Academic/Portfolio 用 `size="small"`）

- [ ] **Step 1: 写失败测试**

`src/components/SoftChip.test.tsx`（镜像 `GlassCard.test.tsx` 的模式）：

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { SoftChip } from './SoftChip';
import { renderWithTheme } from '../test/render';

afterEach(cleanup);

describe('SoftChip', () => {
  it('renders its label', () => {
    renderWithTheme(<SoftChip label="C++" />);
    expect(screen.getByText('C++')).toBeInTheDocument();
  });

  it('forwards size="small" without crashing', () => {
    renderWithTheme(<SoftChip size="small" label="竞赛" />);
    expect(screen.getByText('竞赛')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm run test:run -- src/components/SoftChip.test.tsx`
Expected: FAIL —— `Cannot find module './SoftChip'`。

- [ ] **Step 3: 实现 SoftChip**

`src/components/SoftChip.tsx`：

```tsx
import Chip from '@mui/material/Chip';
import { alpha, styled } from '@mui/material/styles';

/**
 * Shared soft-filled chip (2026-08-23 frontend-polish spec §5): tinted
 * primary background + hairline inset ring + primary text. Replaces the
 * three divergent chip styles (solid in Skills/Academic, outlined in
 * Portfolio) with one language. Hover deepens the tint one notch; focus ring
 * comes from the global MuiChip styleOverride.
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

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm run test:run -- src/components/SoftChip.test.tsx`
Expected: PASS（2 个用例）。

- [ ] **Step 5: 替换 Skills.tsx**

删除整个 `SkillChip` styled 定义及其 `import Chip` / `import { styled }`（该文件不再使用二者），新增 `import { SoftChip } from './SoftChip';`，用法改为：

```diff
           {skills.map((skill) => (
-            <SkillChip
-              key={skill.id}
-              label={skill.name}
-              sx={{
-                backgroundColor: 'primary.main',
-                color: 'primary.contrastText',
-                fontWeight: 500,
-                '&:hover': {
-                  backgroundColor: 'primary.dark',
-                },
-              }}
-            />
+            <SoftChip key={skill.id} label={skill.name} />
           ))}
```

注意 `noUnusedLocals`：删定义后必须同步清掉 `Chip`、`styled` 两个 import，否则 typecheck 失败。

- [ ] **Step 6: 替换 Academic.tsx 分类标签**

`AchievementCardView` 内：

```diff
-          <Chip
-            label={t(`data.achievements.category.${category}`)}
-            size="small"
-            sx={{
-              backgroundColor: 'primary.main',
-              color: 'primary.contrastText',
-            }}
-          />
+          <SoftChip label={t(`data.achievements.category.${category}`)} size="small" />
```

删 `import Chip from '@mui/material/Chip';`（文件内已无其他 Chip 用法），新增 `import { SoftChip } from './SoftChip';`。

- [ ] **Step 7: 替换 Portfolio.tsx 技术栈标签**

`ProjectCardView` 内：

```diff
           {project.technologies.map((tech) => (
-            <Chip
-              key={tech}
-              label={tech}
-              size="small"
-              variant="outlined"
-              sx={{
-                borderColor: 'primary.main',
-                color: 'primary.main',
-              }}
-            />
+            <SoftChip key={tech} label={tech} size="small" />
           ))}
```

删 `import Chip from '@mui/material/Chip';`（文件内已无其他 Chip 用法），新增 `import { SoftChip } from './SoftChip';`。

- [ ] **Step 8: 全套验证**

预期：全绿，**54+2 ≈ 56 tests / 15 files**（以实测为准）。

- [ ] **Step 9: Commit**

```bash
git add src/components/SoftChip.tsx src/components/SoftChip.test.tsx src/components/Skills.tsx src/components/Academic.tsx src/components/Portfolio.tsx
git commit -m "feat(components): shared SoftChip replaces three divergent chip styles" -m "Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 收尾：目视验收（无 commit）

全部任务完成后，`pnpm run dev` 启动并请用户目视验收：

- 亮/暗两模式各过一遍首页 6 区块 + `/xxx`（404）+ 任一 redirect 页
- 重点：Chip 形态（三处应同为柔和填充）、卡片 hover 紫调阴影、暗色滚动条、`::selection` 选中文字为淡紫、头像 hover 幅度、时间线圆点图标白色、Contact 图标块暗色可读
- reduced-motion 下头像 hover 不位移（transform: none 生效）

验收通过后走 superpowers:finishing-a-development-branch 决定合并方式。
