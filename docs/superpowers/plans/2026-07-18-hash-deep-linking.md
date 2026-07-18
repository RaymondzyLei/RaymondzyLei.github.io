# Hash 深链接滚动 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让访问 `raymondzylei.me/#skills` 等带 hash 的 URL 自动平滑滚动到对应区块，同时点击导航按钮静默更新 URL hash（replaceState），实现双向深链接。

**Architecture:** 新增 `useHashScroll` hook 挂在 `Layout` 上（位于 `ReactLenis` 上下文内），监听 `hashchange` 并在 lenis 实例就绪后用 `lenis.scrollTo` 滚动。hash→元素的查找抽成纯函数 `getHashTarget` 便于单测。导航点击在现有 `lenis.scrollTo` 之后追加 `history.replaceState` 回写 hash（replaceState 不触发 hashchange，避免循环滚动）。无效 hash（不匹配任何 section）静默忽略。

**Tech Stack:** React 19, Lenis 1.x (`lenis/react`), MUI v9 `useMediaQuery`, Vitest + Testing Library + jsdom

## Global Constraints

- 滚动一律用 `lenis?.scrollTo(element, { duration })`，**禁止** `element.scrollIntoView()` / `window.scrollTo()`（CLAUDE.md 导航滚动约定）
- 尊重 `prefers-reduced-motion: reduce`：reduced 时 `duration: 0`（与 `BackToTopButton` 一致）
- `lenis.scrollTo(element)` 默认处理 sticky AppBar offset，**不要**手动传 offset（与 `Navbar.handleNavClick` 一致）
- 无效 hash 静默忽略，不报错、不滚动到顶部
- 不引入路由库；不动 i18n 翻译；不改现有视觉/动画参数
- 代码风格：Prettier（单引号、分号、2 空格、`printWidth: 100`）；类型严格（`noUnusedLocals` 等）

## File Structure

- **Create:** `src/hooks/useHashScroll.ts` — 导出纯函数 `getHashTarget(hash)` + `useHashScroll()` hook
- **Create:** `src/hooks/useHashScroll.test.ts` — `getHashTarget` 单元测试 + hook 行为测试
- **Modify:** `src/test/setup.ts` — 补 `window.matchMedia` mock（MUI `useMediaQuery` 在 jsdom 需要）
- **Modify:** `src/components/Layout.tsx` — 调用 `useHashScroll()`
- **Modify:** `src/components/layout/Navbar.tsx` — `handleNavClick` 追加 `history.replaceState`
- **Modify:** `CLAUDE.md` — 在「导航滚动约定」补 hash 深链接说明 + 架构树补 `useHashScroll`

---

### Task 1: `getHashTarget` 纯函数 + 单元测试

**Files:**
- Create: `src/hooks/useHashScroll.ts`
- Test: `src/hooks/useHashScroll.test.ts`

**Interfaces:**
- Produces: `getHashTarget(hash: string): HTMLElement | null` — 去掉前导 `#`，空 id 返回 `null`，否则返回 `document.getElementById(id)`（无匹配则 `null`）

- [ ] **Step 1: 写失败测试**

```ts
// src/hooks/useHashScroll.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getHashTarget } from './useHashScroll';

describe('getHashTarget', () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="skills"></section><section id="hero"></section>';
  });

  it('returns the element for a valid hash', () => {
    const el = getHashTarget('#skills');
    expect(el).not.toBeNull();
    expect(el?.id).toBe('skills');
  });

  it('returns null for an empty hash', () => {
    expect(getHashTarget('')).toBeNull();
    expect(getHashTarget('#')).toBeNull();
  });

  it('returns null for a hash with no matching element', () => {
    expect(getHashTarget('#foobar')).toBeNull();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm run test:run -- src/hooks/useHashScroll.test.ts`
Expected: FAIL（`getHashTarget` 未导出 / 模块找不到）

- [ ] **Step 3: 写最小实现**

```ts
// src/hooks/useHashScroll.ts
/**
 * Resolve a URL hash to a DOM element, or null if it doesn't target a real
 * section. Strips a single leading `#`; empty hash -> null; unknown id -> null
 * (the "invalid hash is silently ignored" rule).
 */
export const getHashTarget = (hash: string): HTMLElement | null => {
  const id = hash.replace(/^#/, '');
  return id ? document.getElementById(id) : null;
};
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm run test:run -- src/hooks/useHashScroll.test.ts`
Expected: PASS（3 tests）

- [ ] **Step 5: typecheck + 提交**

```bash
pnpm run typecheck
git add src/hooks/useHashScroll.ts src/hooks/useHashScroll.test.ts
git commit -m "feat(hash): add getHashTarget pure helper with tests"
```

---

### Task 2: `useHashScroll` hook + Layout 集成

**Files:**
- Modify: `src/hooks/useHashScroll.ts`（追加 hook）
- Modify: `src/test/setup.ts`（补 matchMedia mock）
- Modify: `src/components/Layout.tsx`
- Test: `src/hooks/useHashScroll.test.ts`（追加 hook 测试）

**Interfaces:**
- Consumes: `getHashTarget` from Task 1
- Produces: `useHashScroll(): void` — 在 `ReactLenis` 子树内调用；mount/lenis-ready 时读当前 hash 滚动一次，并订阅 `hashchange` 持续响应。无效 hash 忽略。

- [ ] **Step 1: 补 setup 的 matchMedia mock**

MUI `useMediaQuery` 在 jsdom 下需要 `window.matchMedia`。追加到 setup 文件：

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// jsdom lacks matchMedia; MUI useMediaQuery needs it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}
```

- [ ] **Step 2: 写 hook 的失败测试**

追加到 `src/hooks/useHashScroll.test.ts`：

```ts
import { renderHook } from '@testing-library/react';
import { useHashScroll } from './useHashScroll';
import { vi } from 'vitest';

// Mock lenis/react so the hook gets a fake lenis instance with a spy.
const scrollTo = vi.fn();
vi.mock('lenis/react', () => ({
  useLenis: () => ({ scrollTo }),
}));

describe('useHashScroll', () => {
  beforeEach(() => {
    scrollTo.mockClear();
    document.body.innerHTML = '<section id="skills"></section>';
  });

  it('scrolls to the section matching the current hash on mount', () => {
    window.location.hash = 'skills';
    renderHook(() => useHashScroll());
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo.mock.calls[0][0]).toBe(document.getElementById('skills'));
  });

  it('scrolls when hashchange fires at runtime', () => {
    window.location.hash = '';
    renderHook(() => useHashScroll());
    expect(scrollTo).not.toHaveBeenCalled();
    window.location.hash = 'skills';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it('ignores an invalid hash', () => {
    window.location.hash = 'foobar';
    renderHook(() => useHashScroll());
    expect(scrollTo).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 运行测试确认失败**

Run: `pnpm run test:run -- src/hooks/useHashScroll.test.ts`
Expected: FAIL（`useHashScroll` 未导出）

- [ ] **Step 4: 写 hook 实现**

追加到 `src/hooks/useHashScroll.ts`（在 `getHashTarget` 之后）：

```ts
import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';

/**
 * Scroll to the section named by `window.location.hash`, and keep responding
 * to `hashchange` at runtime. Must be called inside a <ReactLenis> subtree so
 * `useLenis()` resolves. Invalid/empty hashes are ignored. On mount and when
 * the lenis instance becomes available, the current hash is applied once.
 */
export const useHashScroll = (): void => {
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const duration = reducedMotion ? 0 : 1.2;

  useEffect(() => {
    const scrollToHash = () => {
      const el = getHashTarget(window.location.hash);
      if (el) lenis?.scrollTo(el, { duration });
    };
    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, [lenis, duration]);
};
```

- [ ] **Step 5: 运行测试确认通过**

Run: `pnpm run test:run -- src/hooks/useHashScroll.test.ts`
Expected: PASS（6 tests）

- [ ] **Step 6: Layout 接入 hook**

修改 `src/components/Layout.tsx`：

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import { BackgroundOrbs } from './BackgroundOrbs';
import { Navbar } from './layout/Navbar';
import { BackToTopButton } from './layout/BackToTopButton';
import { useHashScroll } from '../hooks/useHashScroll';

interface LayoutProps {
  children: React.ReactNode;
  isNotFound?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isNotFound = false }) => {
  useHashScroll();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar isNotFound={isNotFound} />
      <BackgroundOrbs />
      <Box component="main" sx={{ flex: 1, width: '100%' }}>
        {children}
      </Box>
      <BackToTopButton />
    </Box>
  );
};
```

- [ ] **Step 7: typecheck + lint + 提交**

```bash
pnpm run typecheck && pnpm run lint
git add src/hooks/useHashScroll.ts src/hooks/useHashScroll.test.ts src/test/setup.ts src/components/Layout.tsx
git commit -m "feat(hash): add useHashScroll hook, wire into Layout"
```

---

### Task 3: Navbar 点击回写 hash（replaceState）

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: 现有 `handleNavClick`、`lenis`
- Produces: 点击导航按钮后 URL hash 静默更新为 `#<sectionId>`（`replaceState` 不触发 `hashchange`，不会与 Task 2 的监听循环）

- [ ] **Step 1: 修改 handleNavClick 追加 replaceState**

`src/components/layout/Navbar.tsx` 第 66-72 行的 `handleNavClick` 改为：

```ts
const handleNavClick = (sectionId: string) => {
  setMobileMenuOpen(false);
  const element = document.getElementById(sectionId);
  if (element) {
    lenis?.scrollTo(element);
    history.replaceState(null, '', `#${sectionId}`);
  }
};
```

> 说明：`replaceState` 改 hash **不**触发 `hashchange`，所以 `useHashScroll` 不会重复滚动。仅当用户手动改地址栏 / 前进后退到不同 hash 时才触发 hashchange → 滚动。

- [ ] **Step 2: 手动验证（dev 服务器）**

```bash
pnpm run dev
```

在浏览器验证：
1. 访问 `http://localhost:5173/#skills` → 页面平滑滚到 Skills 区块
2. 访问 `http://localhost:5173/#foobar` → 不滚动，无报错
3. 在首页点击导航 "Academic" → 滚动 + 地址栏变为 `#academic`，浏览器历史栈不增加条目（按后退仍离开站点而非在 section 间跳）
4. 在地址栏手动把 `#academic` 改成 `#contact` 回车 → 滚到 Contact
5. 控制台无 error/warning

- [ ] **Step 3: typecheck + lint + 提交**

```bash
pnpm run typecheck && pnpm run lint
git add src/components/layout/Navbar.tsx
git commit -m "feat(hash): update URL hash on nav click via replaceState"
```

---

### Task 4: 文档更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 架构树补 useHashScroll**

在 `CLAUDE.md` 架构树的 `hooks/` 下追加：

```
│   ├── useHashScroll.ts  # hash 深链接：监听 hashchange + lenis.scrollTo，无效 hash 忽略
```

- [ ] **Step 2: 导航滚动约定补 hash 说明**

在 `CLAUDE.md`「导航滚动约定」小节末尾追加一段：

```
**Hash 深链接**（`useHashScroll`，挂在 `Layout`）：访问 `/#skills` 等会在 lenis 就绪后滚到对应区块，并订阅 `hashchange` 持续响应；无效 hash 静默忽略。导航点击用 `history.replaceState` 回写 hash（不触发 hashchange，避免与监听循环），因此浏览器前进/后退不在 section 间跳转——这是有意为之，保持历史栈干净。
```

- [ ] **Step 3: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: document hash deep-linking behavior"
```

---

## Verification

全部任务完成后跑一次全量验证：

```bash
pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run build
```

Expected: 全绿，`routing.test.ts`(3) + `useHashScroll.test.ts`(6) 共 9 tests 通过。

冒烟测试（dev + 浏览器）：
1. `/#skills` 首屏直达 Skills
2. `/#contact` 首屏直达 Contact
3. `/#foobar` 无效 hash 不动
4. 点击导航各按钮 → 滚动 + 地址栏 hash 更新 + 历史栈不增长
5. 地址栏手改 hash → 滚动
6. 404 页面（如 `/xyz`）→ 正常显示 404，hash 逻辑 no-op
7. `prefers-reduced-motion` 下滚动即时（duration 0）
