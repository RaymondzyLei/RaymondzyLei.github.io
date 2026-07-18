# 代码全面优化设计文档

> **目标：** 在零行为变更的前提下，补齐测试、收紧 lint/tsconfig、代码分割、清理工程卫生，为下一步开发做好准备。

## 概览

9 项优化分 3 组，全部不改变运行时行为：

| 组 | 项目 | 来源 |
|----|------|------|
| 性能 | H1: 代码分割（lazy + manualChunks） | 架构审计 |
| 质量 | H2: 补核心纯函数测试 | 测试审计 |
| 质量 | H3: ESLint 强制 CLAUDE.md 约定 | 测试审计 |
| 质量 | M4: Academic.tsx groupedByCategory 加 useMemo | 架构审计 |
| 质量 | tsconfig 加 noImplicitReturns | 测试审计 |
| 工程 | M1: CI 加 test:run + format:check | 配置审计 |
| 工程 | M2: 3 文件 Prettier 格式修复 | 配置审计 |
| 工程 | M3: 删除 51 行注释死代码 | 测试审计 |
| 工程 | M5-M6: .gitignore + engines + ecmaVersion | 配置审计 |

---

## 组 1：性能——代码分割

### App.tsx

`NotFound`（86 行）和 `RedirectPage`（141 行）只在 404/短链接路由下渲染，首屏从不访问。改为 `React.lazy()` 动态导入，路由分发处包 `<Suspense fallback={null}>`：

```tsx
import { lazy, Suspense } from 'react';
const NotFound = lazy(() => import('./components/NotFound'));
const RedirectPage = lazy(() => import('./components/RedirectPage'));

// 路由分发处：
<Suspense fallback={null}>
  {route.type === 'redirect' ? <RedirectPage rule={route.rule} /> : ...}
</Suspense>
```

### vite.config.ts

新增 `build.rollupOptions.output.manualChunks`，把 react、MUI、i18next 拆为独立 vendor chunk：

```ts
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
```

预期首屏 JS 缩小 20-40KB gzip，vendor chunk 可被浏览器缓存。

---

## 组 2：质量——测试 + ESLint + tsconfig

### 新增测试文件（3 个）

**`src/i18n/i18n.test.ts`**——`isSupportedLanguage` 类型守卫：

```ts
import { describe, it, expect } from 'vitest';

// i18n.ts 导出 isSupportedLanguage（当前未导出，需加 export）
import { isSupportedLanguage } from './i18n';

describe('isSupportedLanguage', () => {
  it('accepts "en" and "zh"', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('zh')).toBe(true);
  });
  it('rejects null, empty string, and unsupported codes', () => {
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage('')).toBe(false);
    expect(isSupportedLanguage('fr')).toBe(false);
  });
});
```

> `isSupportedLanguage` 当前未 export。测试驱动：先 export 该函数（零行为变化，纯加一行 `export`），再写测试。

**`src/theme.test.ts`**——`glass()` helper：

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
    // alpha colors in MUI v9 are rgba() strings
    expect(glass(light).backgroundColor).toMatch(/rgba?\(/);
  });
});
```

MUI v9 的 `createTheme({ palette: { mode: 'dark' } })` 直接创建完整主题对象，无需额外配置。

**`src/styles/reveal.test.ts`**——`revealSx()` 纯函数：

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

  it('respects delayMs parameter', () => {
    expect(revealSx(true, 100).transitionDelay).toBe('100ms');
  });
});
```

### ESLint 收紧

`eslint.config.js` 追加 rules：

```js
rules: {
  'no-restricted-globals': ['error', {
    name: 'scrollTo',
    message: 'Use lenis?.scrollTo instead of window.scrollTo (see CLAUDE.md)',
  }],
  'no-console': 'warn',
  'no-debugger': 'error',
},
```

### tsconfig 加 noImplicitReturns

`tsconfig.app.json` compilerOptions 加 `"noImplicitReturns": true`。

### Academic.tsx memo

`groupedByCategory` 包 `useMemo(() => ..., [])`，从 `react` 直接 import `useMemo`（遵循 CLAUDE.md 的 import 约定）。

---

## 组 3：工程——CI + 格式化 + 死代码 + hygiene

### deploy-pages.yml

在 `lint` 与 `build` step 之间插入两个 step：

```yaml
- name: Test
  run: pnpm test:run

- name: Format check
  run: pnpm format:check
```

### 死代码删除

- `src/data/projects.ts`：删除第 15-60 行 46 行被注释的示例项目数据
- `src/data/timeline.ts`：删除第 30-34 行 5 行被注释的示例 timeline 条目

### 工程 hygiene

- `pnpm run format` 修复当前 3 个格式不符文件
- `.gitignore` 追加 `homepage-smoke.png` 和 `.env*`
- `package.json` 加 `"engines": { "node": ">=24", "pnpm": ">=10" }`
- `eslint.config.js` 的 `ecmaVersion` 从 `2020` → `2022`

---

## 不做的事（边界）

- 不改任何组件视觉样式、交互逻辑、动画参数
- 不引入路由库、不重构现有组件结构
- 不升级依赖版本
- 不处理低优项（OG 图、sourcemap、vite 调优等）
- M2（Academic useMemo）是唯一的运行时行为例外——但结果完全等价，纯性能优化

## 验证

全部完成后运行：

```bash
pnpm run format:check  # 0 个格式不符
pnpm run typecheck     # 全绿
pnpm run lint          # 全绿
pnpm run test:run      # 所有测试通过（原 10 + 新增约 9 = ~19 tests）
pnpm run build         # 构建成功，产多个 chunk（无 514KB 单体 chunk）
```

浏览器冒烟：`pnpm run dev` → `/` 首页 / `/#skills` / `/#foobar` / 404 页面 / redirect 页面各检查一遍，0 console errors。