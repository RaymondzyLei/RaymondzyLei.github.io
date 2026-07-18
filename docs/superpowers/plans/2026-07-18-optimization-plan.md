# 代码全面优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 零行为变更下补齐测试、收紧 lint/tsconfig、代码分割、清理工程卫生——打好下一步开发的基础。

**Architecture:** 9 项优化按依赖关系分组为 6 个独立 task。代码分割（lazy+manualChunks）先做——它改动面最大，后续 task 受影响最小。然后是 3 个纯函数测试（i18n/theme/revealSx），彼此无依赖可任意顺序。ESLint+tsconfig+Academic memo 一组，无测试依赖。CI 与工程卫生收尾组。

**Tech Stack:** Vite 8 + React 19 + TypeScript 6 + MUI v9 + Vitest + ESLint flat config

## Global Constraints

- 零运行时行为变更——不改任何组件视觉样式、交互逻辑、动画参数
- 不改 i18n 翻译内容、不改现有数据
- `pnpm` 管理依赖，不用 npm/yarn
- 代码风格：单引号、分号、2 空格、`trailingComma: all`、`printWidth: 100`（`.prettierrc` 是 single source of truth）
- TypeScript strict 模式（`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`）
- 所有 lenis 滚动用 `lenis?.scrollTo()`，禁止 `window.scrollTo()` / `element.scrollIntoView()`
- `git commit` 消息末尾不要加 `Co-Authored-By` 行
- 测试用 Vitest，纯函数优先

---

### Task 1: 代码分割——lazy 加载 404/Redirect + manualChunks

**Files:**
- Modify: `src/App.tsx`
- Modify: `vite.config.ts`

**Interfaces:**
- Produces: App.tsx 用 `React.lazy()` 动态导入 NotFound/RedirectPage，`<Suspense fallback={null}>` 包裹路由分发
- Produces: vite.config.ts 新增 `build.rollupOptions.output.manualChunks`（vendor-react / vendor-mui / vendor-i18n）

- [ ] **Step 1: 修改 App.tsx——lazy 导入 NotFound 和 RedirectPage**

将静态 import：
```tsx
import { NotFound } from './components/NotFound';
import { RedirectPage } from './components/RedirectPage';
```
替换为 lazy import（从 react 追加 `lazy, Suspense`）：
```tsx
import { useEffect, useState, lazy, Suspense } from 'react';

const NotFound = lazy(() => import('./components/NotFound'));
const RedirectPage = lazy(() => import('./components/RedirectPage'));
```

路由分发段（`Layout isNotFound={isNotFound}>` 内）包 `<Suspense>`：
```tsx
<Layout isNotFound={isNotFound}>
  <Suspense fallback={null}>
    {route.type === 'redirect' ? (
      <RedirectPage rule={route.rule} />
    ) : route.type === 'notFound' ? (
      <NotFound />
    ) : (
      <>
        <Hero />
        <Skills />
        <Qualifications />
        <Academic />
        <Portfolio />
        <Contact />
      </>
    )}
  </Suspense>
</Layout>
```

- [ ] **Step 2: 修改 vite.config.ts——加 manualChunks**

在 `defineConfig` 返回对象中追加 `build` 块（与 `plugins`、`base` 同级）：
```ts
export default defineConfig({
  plugins: [
    react(),
    { name: 'copy-404-html', closeBundle() { copyFileSync('dist/index.html', 'dist/404.html') } },
  ],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@mui/lab', '@mui/system'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
  },
});
```

- [ ] **Step 3: typecheck + build 验证**

```bash
pnpm run typecheck && pnpm run build
```

Expected: typecheck 全绿，build 成功。`dist/assets/` 下出现 `vendor-react-*.js`、`vendor-mui-*.js`、`vendor-i18n-*.js` 三个独立 chunk，主 chunk 不再有 514KB 警告。

- [ ] **Step 4: 提交**

```bash
git add src/App.tsx vite.config.ts
git commit -m "perf: lazy-load NotFound/RedirectPage, manualChunks for vendor deps"
```

---

### Task 2: i18n 测试——export isSupportedLanguage + 单元测试

**Files:**
- Modify: `src/i18n/i18n.ts`（加一个 `export`）
- Create: `src/i18n/i18n.test.ts`

**Interfaces:**
- Produces: `isSupportedLanguage` 从模块内函数变为模块导出函数（签名不变：`(value: string | null) => value is SupportedLanguage`）

- [ ] **Step 1: export isSupportedLanguage**

`src/i18n/i18n.ts` 第 9 行，把：
```ts
const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
```
改为：
```ts
export const isSupportedLanguage = (value: string | null): value is SupportedLanguage =>
```

- [ ] **Step 2: 写测试**

创建 `src/i18n/i18n.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { isSupportedLanguage } from './i18n';

describe('isSupportedLanguage', () => {
  it('accepts "en" and "zh"', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('zh')).toBe(true);
  });

  it('rejects null', () => {
    expect(isSupportedLanguage(null)).toBe(false);
  });

  it('rejects empty string and unsupported codes', () => {
    expect(isSupportedLanguage('')).toBe(false);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage('ja')).toBe(false);
  });
});
```

- [ ] **Step 3: 运行测试确认通过**

```bash
pnpm run test:run -- src/i18n/i18n.test.ts
```

Expected: 3 tests passed.

- [ ] **Step 4: typecheck + lint + 提交**

```bash
pnpm run typecheck && pnpm run lint
git add src/i18n/i18n.ts src/i18n/i18n.test.ts
git commit -m "test(i18n): add unit tests for isSupportedLanguage type guard"
```

---

### Task 3: theme + revealSx 纯函数测试

**Files:**
- Create: `src/theme.test.ts`
- Create: `src/styles/reveal.test.ts`

**Interfaces:**
- 不产生新导出——仅新增测试文件，测试已有公开 API `glass(theme)` 和 `revealSx(isVisible, delayMs)`

- [ ] **Step 1: 写 theme.test.ts**

创建 `src/theme.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { createTheme } from '@mui/material/styles';
import { glass } from './theme';

describe('glass', () => {
  const light = createTheme({ palette: { mode: 'light' } });
  const dark = createTheme({ palette: { mode: 'dark' } });

  it('returns backdrop blur and border for both modes', () => {
    for (const t of [light, dark]) {
      const g = glass(t);
      expect(g.backdropFilter).toContain('blur(20px)');
      expect(g.border).toBe('1px solid');
    }
  });

  it('has different boxShadow in light vs dark', () => {
    expect(glass(light).boxShadow).not.toBe(glass(dark).boxShadow);
  });

  it('background is semi-transparent', () => {
    expect(glass(light).backgroundColor).toMatch(/rgba?\(/);
    expect(glass(dark).backgroundColor).toMatch(/rgba?\(/);
  });
});
```

- [ ] **Step 2: 写 reveal.test.ts**

创建 `src/styles/reveal.test.ts`：
```ts
import { describe, it, expect } from 'vitest';
import { revealSx } from './reveal';

describe('revealSx', () => {
  it('visible: opacity 1, no y offset, no delay', () => {
    const s = revealSx(true, 0);
    expect(s.opacity).toBe(1);
    expect(s.transform).toBe('translate3d(0, 0, 0)');
    expect(s.transitionDelay).toBe('0ms');
  });

  it('hidden: opacity 0, translateY 24px', () => {
    const s = revealSx(false);
    expect(s.opacity).toBe(0);
    expect(s.transform).toBe('translate3d(0, 24px, 0)');
  });

  it('respects delayMs parameter for stagger', () => {
    expect(revealSx(true, 100).transitionDelay).toBe('100ms');
    expect(revealSx(false, 250).transitionDelay).toBe('250ms');
  });
});
```

- [ ] **Step 3: 运行全部测试确认通过**

```bash
pnpm run test:run
```

Expected: 所有现有 + 新增测试全通过（~16 tests）。

- [ ] **Step 4: 提交**

```bash
git add src/theme.test.ts src/styles/reveal.test.ts
git commit -m "test: add unit tests for glass() theme helper and revealSx()"
```

---

### Task 4: ESLint 收紧 + tsconfig noImplicitReturns + Academic useMemo

**Files:**
- Modify: `eslint.config.js`
- Modify: `tsconfig.app.json`
- Modify: `src/components/Academic.tsx`

**Interfaces:**
- 不产生新导出

- [ ] **Step 1: ESLint 加规则**

`eslint.config.js` 的 `defineConfig` 数组中追加一个 rules-only 配置对象（放在 `prettierConfig` 之前或作为独立元素）：

在 `prettierConfig` 之前插入：
```js
  {
    rules: {
      'no-restricted-globals': ['error', {
        name: 'scrollTo',
        message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
      }],
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },
```

- [ ] **Step 2: tsconfig 加 noImplicitReturns**

`tsconfig.app.json` compilerOptions 中追加一行（放在 `noFallthroughCasesInSwitch` 之后）：
```json
"noImplicitReturns": true,
```

- [ ] **Step 3: Academic.tsx 加 useMemo**

`src/components/Academic.tsx`：
- 把 `import React from 'react';` 改为 `import React, { useMemo } from 'react';`
- 把 `const groupedByCategory = achievementsData.reduce(...)` 包进 `useMemo`：

```tsx
const groupedByCategory = useMemo(
  () =>
    achievementsData.reduce(
      (acc, achievement) => {
        if (!acc[achievement.category]) {
          acc[achievement.category] = [];
        }
        acc[achievement.category].push(achievement);
        return acc;
      },
      {} as Record<string, Achievement[]>,
    ),
  [],
);
```

- [ ] **Step 4: typecheck + lint + test 全量验证**

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run
```

Expected: 全绿。`no-restricted-globals` 不报错（当前代码无 `scrollTo` 直接调用），`noImplicitReturns` 不报错（当前代码无隐式 return），`useMemo` 无类型错误。

- [ ] **Step 5: 提交**

```bash
git add eslint.config.js tsconfig.app.json src/components/Academic.tsx
git commit -m "chore: tighten eslint rules + tsconfig noImplicitReturns + Academic useMemo"
```

---

### Task 5: CI 加 test + format-check + 工程卫生

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `eslint.config.js`（ecmaVersion 2020→2022）
- Modify: `src/data/projects.ts`（删 46 行死代码）
- Modify: `src/data/timeline.ts`（删 5 行死代码）

- [ ] **Step 1: deploy-pages.yml 加 Test + Format check 步骤**

在 Lint step 与 Build step 之间插入两个新 step：

```yaml
      - name: Test
        run: pnpm test:run

      - name: Format check
        run: pnpm format:check
```

完整上下文（插在 `- name: Lint` 块之后、`- name: Build` 之前）：
```yaml
      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test:run

      - name: Format check
        run: pnpm format:check

      - name: Build
        run: pnpm build
```

- [ ] **Step 2: 删死代码**

`src/data/projects.ts`：删除第 15 行到文件末尾被注释的 46 行示例项目。文件头 `// TODO: add real projects` 和 `export const projectsData: Project[] = [];` 保留。

`src/data/timeline.ts`：删除第 30-34 行被注释的 5 行示例 timeline 条目（`// { id: '3', ...`）。

- [ ] **Step 3: 工程 hygiene**

`.gitignore` 末尾追加两行：
```
homepage-smoke.png
.env*
```

`package.json` 在 `"version": "1.0.0",` 之后、`"type": "module"` 之前插入：
```json
"engines": { "node": ">=24", "pnpm": ">=10" },
```

`eslint.config.js`：`ecmaVersion: 2020` → `ecmaVersion: 2022`

- [ ] **Step 4: Prettier 格式化**

```bash
pnpm run format
```

Expected: 修复当前 3 个格式不符文件（`useHashScroll.ts`、`useHashScroll.test.ts`、`setup.ts`）。

- [ ] **Step 5: typecheck + lint + test + format:check 全量验证**

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build
```

Expected: 全绿。`format:check` 返回 0 个不符文件。Build 产出多 chunk（无 514KB 单体 chunk 警告）。

- [ ] **Step 6: 提交**

```bash
git add .github/workflows/deploy-pages.yml .gitignore package.json eslint.config.js src/data/projects.ts src/data/timeline.ts
git add -u  # 包含 prettier 格式化的文件
git commit -m "chore: CI add test+format-check, delete dead code, hygiene (engines, gitignore, ecmaVersion)"
```

---

### Task 6: 浏览器冒烟验证 + CLAUDE.md 更新

**Files:**
- Modify: `CLAUDE.md`（更新测试文件列表 + ecmaVersion）

- [ ] **Step 1: 启动 dev 服务器验证所有路由**

```bash
pnpm run dev
```

浏览器验证清单：
1. `http://localhost:5173/` → 首页正常渲染（6 区块），0 console errors
2. `http://localhost:5173/#skills` → 自动滚到 Skills
3. `http://localhost:5173/#foobar` → 不滚动，无报错
4. `http://localhost:5173/xyz` → 404 页面正常显示（lazy 加载生效）
5. `http://localhost:5173/google` → Redirect 页面正常显示，倒计时后跳转（lazy 加载生效）
6. 点击导航按钮 → 滚动 + URL hash 更新
7. 控制台 0 errors, 0 warnings

- [ ] **Step 2: 更新 CLAUDE.md 架构树**

在 `CLAUDE.md` 架构树的 `hooks/` 块末尾补充测试文件的存在：
```
├── i18n/
│   ├── i18n.ts         # i18next 初始化，export isSupportedLanguage
│   ├── i18n.test.ts    # isSupportedLanguage 单元测试
│   ├── en.json
│   └── zh.json
```

在架构树末尾追加测试文件清单（`src/` 下 `.test.ts` 文件）：
```
├── routing.test.ts        # resolveRoute 测试
├── theme.test.ts          # glass() helper 测试
├── styles/
│   ├── reveal.ts
│   └── reveal.test.ts     # revealSx() 测试
├── hooks/
│   ├── useHashScroll.ts
│   └── useHashScroll.test.ts
```

- [ ] **Step 3: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with new test files after optimization"
```

---

## Verification

全部 6 个 task 完成后跑一次终验：

```bash
pnpm run format:check && pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build
```

Expected:
- `format:check`: 0 files
- `typecheck`: 全绿
- `lint`: 全绿（含 `no-restricted-globals`/`no-console`/`no-debugger` 不触发）
- `test:run`: 全部测试通过（预计 ~19 tests）
- `build`: 成功，产出 4+ chunks（主 chunk + vendor-react + vendor-mui + vendor-i18n + lazy chunks），无 514KB 警告