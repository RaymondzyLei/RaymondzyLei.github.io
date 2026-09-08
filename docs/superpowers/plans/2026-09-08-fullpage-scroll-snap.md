# 整屏翻页滚动系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 桌面端「滚一下立刻翻一屏」的 fullpage 体验：自写 PageSnap 状态机 + 幻灯片式区块排版 + 运行时计算的混合停留点（短区块 1 站、长区块多站）。

**Architecture:** 排版层（Section 外壳 min-height + 垂直居中）→ 纯函数 `computeStops`（offsetTop 链计算停留点，rAF 合帧重算）→ PageSnap Context.Provider（wheel/键盘状态机，lock 动画，API 中断）→ 消费方迁移（Navbar/Hero/hash/BackToTop 统一走 `usePageSnap()`）。`useScrollToSection` 删除。Deep link 归 `useHashScroll`（PageSnap 不管 hash 的 mount 直达，避免双滚动竞态）。

**Tech Stack:** React 19 + TypeScript strict、MUI v9、lenis 1.3.23（`lenis/react`）、Vitest + Testing Library。

**Spec:** `docs/superpowers/specs/2026-09-08-fullpage-scroll-snap-design.md`

## Global Constraints

- TypeScript strict + `noUnusedLocals` / `noUnusedParameters` / `verbatimModuleSyntax`：type-only 导入必须 `import type`；未用变量/参数编译失败
- Prettier：单引号、分号、2 空格、`trailingComma: 'all'`、printWidth 100
- 本计划无新增面向用户文案；若执行中确需新增，走 `t()` 并 en/zh 同步
- 动效遵守 `prefers-reduced-motion` 门控；`pointer: coarse` 不启用翻页
- transform 写入隔离：reveal（translate3d）外层 wrapper、tilt（rotate3d）内层卡片
- 禁止 `element.scrollIntoView()` / `window.scrollTo()`；home 路由程序化滚动统一走 `usePageSnap()` API
- 包管理只用 pnpm；Windows + PowerShell 环境
- lenis 1.3.23 已验证事实（源码 `node_modules/lenis/dist/lenis.mjs`，实现者不必重验）：
  - `Animate.fromTo` 的 `onStart` **同步**调用 → `scrollTo(..., { lock: true })` 返回后 `isLocked` 已置位，同一 tick 后续 wheel 被锁检查挡住，无需延迟一帧
  - `virtual-scroll` 事件在锁定期间仍发射（emit 在锁检查之前）
  - `scrollTo` 的 `force: true` 穿透 `isLocked` / `isStopped` 重启动画，旧动画的 `onComplete` 不再触发（`reset()` 清动画）
  - `scrollTo` 元素目标走 `getBoundingClientRect()`（被 reveal translateY 污染）——**滚动目标一律传数值**
- jsdom 测试事实：
  - `getBoundingClientRect()` 恒 0 —— AppBar 高度等几何测量用 `offsetHeight`（可 `Object.defineProperty` stub，与 offsetTop 链语义一致）
  - `offsetTop` / `offsetHeight` 恒 0 —— 测试用 `Object.defineProperty(el, 'offsetTop', {...})` 注入
  - `ResizeObserver` 不存在 —— 测试 stub（见 Task 3 harness）
- 测试基建：`src/test/setup.ts` 已 stub matchMedia（默认 fine pointer、无 reduced motion）；渲染用 `src/test/render.tsx` 的 `renderWithTheme`；mock `lenis/react` 模式参考将删除的 `src/components/ScrollSnap.test.tsx`

---

### Task 1: 纯函数 computeStops

**Files:**
- Create: `src/scrollStops.ts`
- Test: `src/scrollStops.test.ts`

**Interfaces:**
- Consumes: 无（纯函数，零依赖）
- Produces:
  ```ts
  export interface StopGeometry { top: number; height: number }
  export const MIN_STOP_SPACING = 0.4; // 相邻站距低于此视口高比例时合并
  export const computeStops = (
    sections: StopGeometry[],
    viewportH: number,
    appbarH: number,
  ): number[];
  ```

- [ ] **Step 1: 写失败测试**

```ts
// src/scrollStops.test.ts
import { describe, it, expect } from 'vitest';
import { computeStops, MIN_STOP_SPACING } from './scrollStops';

// 常用场景：视口 800px，AppBar 64px → 有效屏高 736px，最小站距 320px
const VH = 800;
const BAR = 64;

describe('computeStops', () => {
  it('零区块返回空数组', () => {
    expect(computeStops([], VH, BAR)).toEqual([]);
  });

  it('短区块（≤ 有效屏高）单站，= top - appbarH', () => {
    expect(computeStops([{ top: 0, height: 736 }], VH, BAR)).toEqual([-64]);
  });

  it('height 恰好等于有效屏高仍是短区块（严格大于才多站）', () => {
    expect(computeStops([{ top: 0, height: 736 }], VH, BAR)).toHaveLength(1);
    expect(computeStops([{ top: 0, height: 737 }], VH, BAR)).toHaveLength(2);
  });

  it('长区块多站：首站顶对齐，步进 = 有效屏高，末站底对齐', () => {
    // 首站 1600-64=1536；step 1536+736=2272 < last 2800 → 中间站；
    // next step 3008 ≥ 2800 → 停；末站 1600+2000-800=2800。
    // 间距 736、528 均 ≥ 320 → 全保留。
    expect(computeStops([{ top: 1600, height: 2000 }], VH, BAR)).toEqual([1536, 2272, 2800]);
  });

  it('略超一屏（末站与首站间距 < 最小站距）→ 末站被合并，仅留首站', () => {
    // height 1000：首站 -64；step 672 < last 200? 否 → 无中间站；末站 0+1000-800=200。
    // 排序 [-64, 200]，间距 264 < 320 → 合并（保留较早的首站——标题可见优先）。
    expect(computeStops([{ top: 0, height: 1000 }], VH, BAR)).toEqual([-64]);
  });

  it('长区块末站与中间站过近 → 末站被合并', () => {
    // height 1600：首站 -64；step 672 < last 800 → 中间站 672；step 1408 ≥ 800 → 停；
    // 末站 800。排序 [-64, 672, 800]；672→800 间距 128 < 320 → 末站合并。
    expect(computeStops([{ top: 0, height: 1600 }], VH, BAR)).toEqual([-64, 672]);
  });

  it('站值升序输出（区块乱序传入也有序）', () => {
    expect(
      computeStops(
        [
          { top: 2000, height: 736 },
          { top: 0, height: 736 },
        ],
        VH,
        BAR,
      ),
    ).toEqual([-64, 1936]);
  });

  it('MIN_STOP_SPACING 临界值：间距恰等于阈值保留，差 1px 合并', () => {
    const threshold = MIN_STOP_SPACING * VH; // 320
    // 前块 { top: 0, height: 1120 }：首站 -64，末站 0+1120-800=320 → [-64, 320]
    // 后块 { top: 704, height: 700 }：首站 704-64=640；640-320=320 = 阈值 → 保留
    const stopsExact = computeStops(
      [
        { top: 0, height: VH + threshold },
        { top: 2 * threshold + BAR, height: 700 },
      ],
      VH,
      BAR,
    );
    expect(stopsExact).toEqual([-64, 320, 640]);

    // 后块上移 1px：首站 639；639-320=319 < 阈值 → 合并
    const stopsJustUnder = computeStops(
      [
        { top: 0, height: VH + threshold },
        { top: 2 * threshold + BAR - 1, height: 700 },
      ],
      VH,
      BAR,
    );
    expect(stopsJustUnder).toEqual([-64, 320]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm run test:run -- scrollStops`
Expected: FAIL（`Cannot find module './scrollStops'`）

- [ ] **Step 3: 实现 computeStops**

```ts
// src/scrollStops.ts
/**
 * Homepage scroll-stop computation for the fullpage paging system.
 *
 * Pure geometry: sections are described by offsetTop/offsetHeight (transform-
 * immune — the reveal translateY never pollutes these, unlike
 * getBoundingClientRect). Short sections produce one stop (section top aligned
 * just below the AppBar); tall sections (content > viewport minus AppBar)
 * produce intermediate stops stepping by the effective viewport height, with
 * the last stop bottom-aligning the section.
 */

/** Adjacent stops closer than this fraction of the viewport height are merged. */
export const MIN_STOP_SPACING = 0.4;

export interface StopGeometry {
  /** Section offsetTop (layout position, transform-immune). */
  top: number;
  /** Section offsetHeight. */
  height: number;
}

export const computeStops = (
  sections: StopGeometry[],
  viewportH: number,
  appbarH: number,
): number[] => {
  if (sections.length === 0) return [];

  const effectiveH = viewportH - appbarH;
  const minSpacing = MIN_STOP_SPACING * viewportH;

  const raw: number[] = [];
  for (const { top, height } of sections) {
    // First stop: section top just below the AppBar.
    raw.push(top - appbarH);
    if (height > effectiveH) {
      // Tall section: intermediate stops step by one effective viewport.
      let step = top - appbarH + effectiveH;
      const last = top + height - viewportH;
      while (step < last) {
        raw.push(step);
        step += effectiveH;
      }
      // Final stop: section bottom aligned with viewport bottom.
      raw.push(last);
    }
  }

  // Sort ascending, then merge stops closer than minSpacing — keep the earlier
  // stop (section top visibility wins over the trimmed bottom tail; the
  // trimmed content is bounded by minSpacing, i.e. < 40% of the viewport).
  const sorted = [...raw].sort((a, b) => a - b);
  const merged: number[] = [];
  for (const stop of sorted) {
    if (merged.length > 0 && stop - merged[merged.length - 1]! < minSpacing) continue;
    merged.push(stop);
  }
  return merged;
};
```

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm run test:run -- scrollStops`
Expected: PASS（8 个用例全绿）

- [ ] **Step 5: 提交**

```bash
git add src/scrollStops.ts src/scrollStops.test.ts
git commit -m "feat(scroll): pure computeStops for fullpage paging stops"
```

---

### Task 2: Section 排版改幻灯片式 + Hero 统一

**Files:**
- Modify: `src/components/Section.tsx`（外层 Box sx）
- Modify: `src/components/Hero.tsx`（外层 Box sx，约 62-74 行）

**Interfaces:**
- Consumes: 无
- Produces: 6 个 section 根元素均为 `minHeight: calc(100vh - AppBar)` + 内容垂直居中；长区块自然超高（`minHeight` 不裁剪）——这是 computeStops 长区块判定的运行时来源。无导出变化。

- [ ] **Step 1: 修改 Section.tsx 的 sx**

`src/components/Section.tsx` 外层 Box sx 改为：

```tsx
<Box
  id={id}
  ref={ref}
  component="section"
  sx={{
    // Slide layout: each section fills at least one viewport below the sticky
    // AppBar; short sections center their content vertically. minHeight (not
    // height) lets tall sections (Qualifications/Academic) extend naturally —
    // that overflow is what computeStops turns into intermediate stops.
    minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    py: 8,
    // Browser-native anchor jumps (initial-load deep links) reserve the
    // sticky AppBar's height; runtime scrolls go through lenis offsets.
    scrollMarginTop: { xs: '56px', md: '64px' },
    ...revealSx(isVisible, revealDelay),
  }}
>
```

说明：`Container` 保持唯一子元素；不设 `alignItems`（默认 stretch，水平居中由 Container 的 `maxWidth` 负责）。

- [ ] **Step 2: 修改 Hero.tsx 的 sx**

`src/components/Hero.tsx` 外层 Box sx 从 `py: { xs: 8, md: 12 }` + `alignItems: 'center'` + `minHeight: '90vh'` 改为与 Section 同款：

```tsx
sx={{
  minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  py: 8,
  scrollMarginTop: { xs: '56px', md: '64px' },
  ...revealSx(heroVisible),
}}
```

- [ ] **Step 3: 全量验证**

Run: `pnpm run test:run && pnpm run typecheck`
Expected: PASS

Run: `pnpm run dev`，浏览器目检：6 个区块每个至少占一屏、短区块内容垂直居中、Qualifications/Academic 超高自然滚动（此时尚无翻页，自由滚动）。

- [ ] **Step 4: 提交**

```bash
git add src/components/Section.tsx src/components/Hero.tsx
git commit -m "feat(layout): slide-style sections — min-viewport height + vertical centering"
```

---

### Task 3: PageSnap 控制器（状态机 + Context API）

**Files:**
- Create: `src/components/PageSnap.tsx`
- Test: `src/components/PageSnap.test.tsx`

**Interfaces:**
- Consumes: `computeStops` / `StopGeometry` / `MIN_STOP_SPACING`（Task 1）、`SECTION_IDS`（`src/sections.ts` 现有）
- Produces:
  ```ts
  export interface PageSnapApi {
    goToSection: (id: string) => void;
    goToTop: () => void;
    goToStops: (index: number) => void;
  }
  export const usePageSnap = (): PageSnapApi | null; // Provider 外返回 null
  ```
  `<PageSnap>` 接收 `children`，以 Context.Provider 形态渲染（App.tsx 在 Task 4 接入）。**deep link 不在此组件**（归 useHashScroll，Task 4）。

手感常量（模块级，供测试断言与后续调参）：

```ts
const SNAP_DURATION = 0.9;   // 翻页动画时长（秒）
const COOLDOWN_MS = 200;     // 动画完成后的冷却
const QUIET_WINDOW_MS = 100; // 末次 wheel 距今 < 此值 → 冷却 re-arm
const WHEEL_THRESHOLD = 0;   // 触发阈值：0 = 一滚就翻
```

- [ ] **Step 1: 写失败测试**

```tsx
// src/components/PageSnap.test.tsx
import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { cleanup, act } from '@testing-library/react';
import React from 'react';

import { PageSnap, usePageSnap } from './PageSnap';
import { renderWithTheme } from '../test/render';

// ---- lenis stub ----
type ScrollToOptions = {
  duration?: number;
  immediate?: boolean;
  force?: boolean;
  lock?: boolean;
  onComplete?: () => void;
};

const makeLenis = () => {
  const instance = {
    scroll: 0,
    scrollTo: vi.fn((_target: number, _options?: ScrollToOptions) => {}),
    listeners: {} as Record<string, ((e: unknown) => void)[]>,
    on: vi.fn((event: string, cb: (e: unknown) => void) => {
      (instance.listeners[event] ??= []).push(cb);
    }),
    off: vi.fn((event: string, cb: (e: unknown) => void) => {
      instance.listeners[event] = (instance.listeners[event] ?? []).filter((f) => f !== cb);
    }),
    emitVirtualScroll: (deltaY: number) => {
      for (const cb of instance.listeners['virtual-scroll'] ?? []) {
        cb({ deltaY, deltaX: 0, event: { type: 'wheel' } });
      }
    },
  };
  return instance;
};
type LenisStub = ReturnType<typeof makeLenis>;

let lenisStub: LenisStub;
vi.mock('lenis/react', () => ({ useLenis: () => lenisStub }));

// ---- jsdom geometry helpers ----
const setGeometry = (id: string, top: number, height: number) => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`missing #${id}`);
  Object.defineProperty(el, 'offsetTop', { configurable: true, value: top });
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: height });
};

// Standard layout: 6 short sections, 736px each, stacked 736px apart.
// Stops = [-64, 672, 1408, 2144, 2880, 3616].
const setDefaults = () => {
  setGeometry('hero', 0, 736);
  setGeometry('skills', 736, 736);
  setGeometry('qualifications', 1472, 736);
  setGeometry('academic', 2208, 736);
  setGeometry('portfolio', 2944, 736);
  setGeometry('contact', 3680, 736);
};

class ROStub {
  static instances: ROStub[] = [];
  callback: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.callback = cb;
    ROStub.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
const flushRO = () => {
  for (const ro of ROStub.instances) {
    ro.callback([] as unknown as ResizeObserverEntry[], ro as unknown as ResizeObserver);
  }
};

// ---- probe ----
let captured: { api: ReturnType<typeof usePageSnap> } | null = null;
const Probe: React.FC = () => {
  captured = { api: usePageSnap() };
  return null;
};

const renderPageSnap = () =>
  renderWithTheme(
    <PageSnap>
      {['hero', 'skills', 'qualifications', 'academic', 'portfolio', 'contact'].map((id) => (
        <section key={id} id={id} />
      ))}
      <Probe />
    </PageSnap>,
  );

beforeEach(() => {
  lenisStub = makeLenis();
  captured = null;
  ROStub.instances = [];
  vi.stubGlobal('ResizeObserver', ROStub);
  vi.stubGlobal('innerHeight', 800);
  // rAF 同步执行：measure 经 scheduleRaf 调度，同步跑让 stops 立即可用。
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(performance.now());
    return 0;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {});
  const appbar = document.createElement('div');
  appbar.className = 'MuiAppBar-root';
  Object.defineProperty(appbar, 'offsetHeight', { configurable: true, value: 64 });
  document.body.appendChild(appbar);
  vi.spyOn(history, 'replaceState').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  document.body.innerHTML = '';
  ROStub.instances = [];
  cleanup();
});

describe('PageSnap', () => {
  it('Provider 内 usePageSnap 返回三方法 API', () => {
    setDefaults();
    renderPageSnap();
    expect(captured?.api).not.toBeNull();
    expect(typeof captured?.api?.goToSection).toBe('function');
    expect(typeof captured?.api?.goToTop).toBe('function');
    expect(typeof captured?.api?.goToStops).toBe('function');
  });

  it('reducedMotion 下 usePageSnap 返回 null 且不监听 virtual-scroll', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    setDefaults();
    renderPageSnap();
    expect(captured?.api).toBeNull();
    expect(lenisStub.on).not.toHaveBeenCalled();
  });

  it('coarsePointer 下同样禁用', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(pointer: coarse)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    setDefaults();
    renderPageSnap();
    expect(captured?.api).toBeNull();
  });

  it('goToSection 滚到目标区块首站（数值目标 + force + lock + duration）', () => {
    setDefaults();
    renderPageSnap();
    act(() => captured.api!.goToSection('contact'));
    expect(lenisStub.scrollTo).toHaveBeenCalledWith(3616, {
      duration: 0.9,
      lock: true,
      force: true,
      onComplete: expect.any(Function),
    });
  });

  it('goToTop 滚到 0（数值目标）', () => {
    setDefaults();
    renderPageSnap();
    act(() => captured.api!.goToTop());
    expect(lenisStub.scrollTo).toHaveBeenCalledWith(0, expect.objectContaining({ force: true }));
  });

  it('wheel 正向触发翻到下一站', () => {
    setDefaults();
    renderPageSnap();
    // lenis.scroll = 0 → 最近站 index 0（-64）→ 正向翻到 index 1（672）
    act(() => lenisStub.emitVirtualScroll(120));
    expect(lenisStub.scrollTo).toHaveBeenCalledTimes(1);
    expect(lenisStub.scrollTo).toHaveBeenCalledWith(672, expect.anything());
  });

  it('wheel 反向翻到上一站', () => {
    setDefaults();
    renderPageSnap();
    lenisStub.scroll = 700; // 位于站 1（672）附近
    act(() => lenisStub.emitVirtualScroll(-120));
    expect(lenisStub.scrollTo).toHaveBeenCalledWith(672, expect.anything());
  });

  it('animating 期间 wheel 被忽略', () => {
    setDefaults();
    renderPageSnap();
    act(() => lenisStub.emitVirtualScroll(120));
    act(() => lenisStub.emitVirtualScroll(120));
    expect(lenisStub.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('onComplete 后 cooldown 内 wheel 被忽略，冷却结束恢复', () => {
    vi.useFakeTimers();
    try {
      setDefaults();
      renderPageSnap();
      act(() => lenisStub.emitVirtualScroll(120));
      const { onComplete } = lenisStub.scrollTo.mock.calls[0][1] as ScrollToOptions;
      act(() => onComplete?.());
      act(() => lenisStub.emitVirtualScroll(120)); // cooldown 内
      expect(lenisStub.scrollTo).toHaveBeenCalledTimes(1);
      act(() => vi.advanceTimersByTime(200 + 100 + 50)); // COOLDOWN + QUIET + margin
      act(() => lenisStub.emitVirtualScroll(120));
      expect(lenisStub.scrollTo).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cooldown 到期时若最近仍有 wheel（惯性尾巴）则 re-arm 而不恢复 idle', () => {
    vi.useFakeTimers();
    try {
      setDefaults();
      renderPageSnap();
      act(() => lenisStub.emitVirtualScroll(120));
      const { onComplete } = lenisStub.scrollTo.mock.calls[0][1] as ScrollToOptions;
      act(() => onComplete?.());
      act(() => vi.advanceTimersByTime(150)); // COOLDOWN-50
      act(() => lenisStub.emitVirtualScroll(50)); // 惯性尾巴落在冷却尾段
      act(() => vi.advanceTimersByTime(200)); // 原 timer 已到期，但 lastWheel < QUIET → re-arm
      act(() => lenisStub.emitVirtualScroll(120));
      expect(lenisStub.scrollTo).toHaveBeenCalledTimes(1); // 仍在冷却
      act(() => vi.advanceTimersByTime(200 + 100 + 50)); // re-arm 周期走完且静默
      act(() => lenisStub.emitVirtualScroll(120));
      expect(lenisStub.scrollTo).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('animating 中 API 调用立即中断转向（force: true）', () => {
    setDefaults();
    renderPageSnap();
    act(() => lenisStub.emitVirtualScroll(120)); // 翻到站 1
    act(() => captured.api!.goToSection('hero')); // 中断，转向 hero 站
    expect(lenisStub.scrollTo).toHaveBeenCalledTimes(2);
    expect(lenisStub.scrollTo).toHaveBeenLastCalledWith(-64, expect.anything());
  });

  it('键盘 PageDown / PageUp / Home / End 映射翻页', () => {
    setDefaults();
    renderPageSnap();
    const press = (key: string) =>
      act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key })));
    press('PageDown');
    expect(lenisStub.scrollTo).toHaveBeenLastCalledWith(672, expect.anything());
    press('PageUp');
    expect(lenisStub.scrollTo).toHaveBeenLastCalledWith(-64, expect.anything());
    press('End');
    expect(lenisStub.scrollTo).toHaveBeenLastCalledWith(3616, expect.anything());
    press('Home');
    expect(lenisStub.scrollTo).toHaveBeenLastCalledWith(-64, expect.anything());
  });

  it('可编辑元素聚焦时所有翻页键被跳过', () => {
    setDefaults();
    const { container } = renderPageSnap();
    const input = document.createElement('input');
    container.appendChild(input);
    input.focus();
    const press = (key: string) =>
      act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key })));
    for (const key of ['PageDown', 'PageUp', ' ', 'Home', 'End']) {
      press(key);
    }
    expect(lenisStub.scrollTo).not.toHaveBeenCalled();
  });

  it('按钮聚焦时 Space 被跳过但 PageDown 生效', () => {
    setDefaults();
    const { container } = renderPageSnap();
    const button = document.createElement('button');
    container.appendChild(button);
    button.focus();
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })));
    expect(lenisStub.scrollTo).not.toHaveBeenCalled();
    act(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' })));
    expect(lenisStub.scrollTo).toHaveBeenCalledTimes(1);
  });

  it('翻页完成后 replaceState 回写目标区块 hash', () => {
    setDefaults();
    renderPageSnap();
    act(() => lenisStub.emitVirtualScroll(120)); // 站 1 → skills
    const { onComplete } = lenisStub.scrollTo.mock.calls[0][1] as ScrollToOptions;
    act(() => onComplete?.());
    expect(history.replaceState).toHaveBeenCalledWith(null, '', '#skills');
  });

  it('goToTop 不回写 hash', () => {
    setDefaults();
    renderPageSnap();
    act(() => captured.api!.goToTop());
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it('ResizeObserver 触发重算：区块变高后 goToStops 落点改变', () => {
    setDefaults();
    renderPageSnap();
    act(() => captured.api!.goToStops(2));
    const before = lenisStub.scrollTo.mock.calls[0][0];
    // academic 变为 2000px 长区块 → stops 数量增加、后部落点后移
    setGeometry('qualifications', 1472, 2000);
    act(() => flushRO());
    act(() => captured.api!.goToStops(2));
    const after = lenisStub.scrollTo.mock.calls[1][0];
    expect(after).not.toBe(before);
  });

  it('unmount 清理 virtual-scroll 监听', () => {
    setDefaults();
    const { unmount } = renderPageSnap();
    expect(lenisStub.on).toHaveBeenCalledWith('virtual-scroll', expect.any(Function));
    unmount();
    expect(lenisStub.off).toHaveBeenCalledWith('virtual-scroll', expect.any(Function));
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `pnpm run test:run -- PageSnap`
Expected: FAIL（`Cannot find module './PageSnap'`）

- [ ] **Step 3: 实现 PageSnap.tsx**

```tsx
// src/components/PageSnap.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';
import { computeStops, type StopGeometry } from '../scrollStops';
import { SECTION_IDS } from '../sections';

/** Feel constants — tune on real hardware (spec §7 appendix checklist). */
const SNAP_DURATION = 0.9;
const COOLDOWN_MS = 200;
const QUIET_WINDOW_MS = 100;
const WHEEL_THRESHOLD = 0;

interface PageSnapApi {
  goToSection: (id: string) => void;
  goToTop: () => void;
  goToStops: (index: number) => void;
}

const PageSnapContext = createContext<PageSnapApi | null>(null);

/** null outside the provider (404 / redirect routes). Consumers fall back. */
export const usePageSnap = (): PageSnapApi | null => useContext(PageSnapContext);

type Phase = 'idle' | 'animating' | 'cooldown';

const appbarHeight = (): number => {
  const appbar = document.querySelector('.MuiAppBar-root');
  return appbar ? (appbar as HTMLElement).offsetHeight : 0;
};

const nearestStopIndex = (stops: number[], target: number): number => {
  if (stops.length === 0) return 0;
  let nearest = 0;
  for (let i = 1; i < stops.length; i++) {
    if (Math.abs(stops[i]! - target) < Math.abs(stops[nearest]! - target)) nearest = i;
  }
  return nearest;
};

/** The section a stop belongs to: the last section whose first stop is <= it. */
const sectionIdForStop = (stop: number): string => {
  let owner = SECTION_IDS[0] ?? '';
  for (const id of SECTION_IDS) {
    const el = document.getElementById(id);
    if (el && el.offsetTop - appbarHeight() <= stop) owner = id;
  }
  return owner;
};

/**
 * Fullpage wheel/keyboard paging controller (spec: 2026-09-08-fullpage-scroll-
 * snap-design.md). Wheel flick = instant animated jump to the next scroll
 * stop; input locks during the animation and a cooldown with quiet-window
 * re-arm absorbs trackpad inertia tails. Programmatic API calls interrupt
 * mid-animation (force:true) so nav clicks always respond immediately.
 *
 * Scroll targets are NUMBERS (computed stop values), never element refs —
 * lenis measures element targets with getBoundingClientRect, which the reveal
 * translateY would pollute. Deep links are NOT handled here (useHashScroll
 * owns them — mount-time immediate jump + runtime hashchange).
 */
export const PageSnap: React.FC<{ children: ReactNode }> = ({ children }) => {
  const lenis = useLenis();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const enabled = !reducedMotion && !coarsePointer;

  const [stops, setStops] = useState<number[]>([]);
  const phaseRef = useRef<Phase>('idle');
  const lastWheelAtRef = useRef(0);
  const cooldownTimerRef = useRef(0);
  const rafRef = useRef(0);
  const stopsRef = useRef<number[]>([]);
  stopsRef.current = stops;

  // --- stop recomputation (rAF-coalesced: RO bursts within one frame run once) ---
  useEffect(() => {
    if (!enabled) return undefined;

    const measure = () => {
      const geometries: StopGeometry[] = [];
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el) geometries.push({ top: el.offsetTop, height: el.offsetHeight });
      }
      setStops(computeStops(geometries, window.innerHeight, appbarHeight()));
    };

    const scheduleRaf = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(measure);
    };

    const observers = SECTION_IDS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const ro = new ResizeObserver(scheduleRaf);
      ro.observe(el);
      return ro;
    }).filter((ro): ro is ResizeObserver => ro !== null);
    window.addEventListener('resize', scheduleRaf);
    measure(); // offsetTop/offsetHeight are transform-immune — safe on mount

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', scheduleRaf);
      for (const ro of observers) ro.disconnect();
    };
  }, [enabled]);

  const scrollToStop = useCallback(
    (value: number, writeHash?: string) => {
      if (!lenis) return;
      phaseRef.current = 'animating';
      lenis.scrollTo(value, {
        duration: SNAP_DURATION,
        lock: true,
        force: true, // interrupts an in-flight page animation; wins over any lock
        onComplete:
          writeHash === undefined
            ? undefined
            : () => {
                phaseRef.current = 'cooldown';
                history.replaceState(null, '', `#${writeHash}`);
                const rearm = () => {
                  // Quiet-window: a wheel event landed recently (inertia tail) —
                  // re-arm instead of returning to idle.
                  if (performance.now() - lastWheelAtRef.current < QUIET_WINDOW_MS) {
                    cooldownTimerRef.current = window.setTimeout(rearm, COOLDOWN_MS);
                    return;
                  }
                  phaseRef.current = 'idle';
                };
                window.clearTimeout(cooldownTimerRef.current);
                cooldownTimerRef.current = window.setTimeout(rearm, COOLDOWN_MS);
              },
      });
    },
    [lenis],
  );

  // --- wheel (virtual-scroll) + keyboard wiring ---
  useEffect(() => {
    if (!enabled || !lenis || stops.length === 0) return undefined;

    const jump = (dir: 1 | -1, toIndex?: number) => {
      const current = stopsRef.current;
      if (current.length === 0) return;
      let nearest = nearestStopIndex(current, lenis.scroll ?? 0);
      if (toIndex === undefined) {
        const targetIndex = nearest + dir;
        if (targetIndex < 0 || targetIndex >= current.length) return; // at edge
        nearest = targetIndex;
      } else {
        nearest = Math.max(0, Math.min(toIndex, current.length - 1));
      }
      const target = current[nearest]!;
      scrollToStop(target, sectionIdForStop(target));
    };

    const onVirtualScroll = (e: { deltaY?: number; deltaX?: number }) => {
      lastWheelAtRef.current = performance.now();
      if (phaseRef.current !== 'idle') return;
      const deltaY = e.deltaY ?? 0;
      if (Math.abs(deltaY) <= WHEEL_THRESHOLD) return; // deltaX-only gestures fall out here
      jump(deltaY > 0 ? 1 : -1);
    };

    const isEditable = (el: Element | null): boolean =>
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement ||
      el?.isContentEditable === true;

    const onKeyDown = (e: KeyboardEvent) => {
      if (phaseRef.current !== 'idle') return;
      const active = document.activeElement;
      if (isEditable(active)) return; // all paging keys yield to text entry
      const isSpace = e.key === ' ' || e.code === 'Space';
      if (isSpace && active instanceof HTMLElement && active.matches('button, a')) return;
      const dirMap: Record<string, 1 | -1> = {
        PageDown: 1,
        ArrowDown: 1,
        PageUp: -1,
        ArrowUp: -1,
      };
      if (e.key in dirMap) {
        e.preventDefault();
        jump(dirMap[e.key]!);
      } else if (e.key === 'Home') {
        e.preventDefault();
        jump(1, 0);
      } else if (e.key === 'End') {
        e.preventDefault();
        jump(-1, stopsRef.current.length - 1);
      } else if (isSpace) {
        e.preventDefault();
        jump(1);
      }
    };

    lenis.on('virtual-scroll', onVirtualScroll);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      lenis.off('virtual-scroll', onVirtualScroll);
      window.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(cooldownTimerRef.current);
    };
  }, [enabled, lenis, stops, scrollToStop]);

  const api = useMemo<PageSnapApi>(
    () => ({
      goToSection: (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        const firstStop = el.offsetTop - appbarHeight();
        const index = nearestStopIndex(stopsRef.current, firstStop);
        const target = stopsRef.current[index] ?? firstStop;
        scrollToStop(target, id);
      },
      goToTop: () => {
        scrollToStop(0); // no hash write — top of page needs no anchor
      },
      goToStops: (index: number) => {
        const clamped = Math.max(0, Math.min(index, stopsRef.current.length - 1));
        const target = stopsRef.current[clamped];
        if (target === undefined) return;
        scrollToStop(target, sectionIdForStop(target));
      },
    }),
    [scrollToStop],
  );

  return <PageSnapContext.Provider value={api}>{children}</PageSnapContext.Provider>;
};
```

> **实现者注意：**
> 1. 若 fake-timer 用例（cooldown re-arm）不稳定，优先检查 `performance.now()` 在 fake timers 下的行为——vitest 的 `vi.useFakeTimers()` 默认也 mock `performance.now()`，`emitVirtualScroll` 更新 `lastWheelAtRef` 的时刻因此可控
> 2. `stop - merged[merged.length - 1]!` 的非空断言、`current[nearest]!` 等处若 lint 报 `noNonNullAssertion`（本项目 ESLint 未启用该规则，理论无碍），改为显式 undefined 检查
> 3. `goToSection` 在 stops 尚未算出（首帧前调用）时回退用 `firstStop` 原始值——语义正确（首站计算式与 computeStops 一致）

- [ ] **Step 4: 运行测试确认通过**

Run: `pnpm run test:run -- PageSnap`
Expected: PASS（17 个用例全绿）

Run: `pnpm run typecheck`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/PageSnap.tsx src/components/PageSnap.test.tsx
git commit -m "feat(scroll): PageSnap fullpage paging controller with context API"
```

---

### Task 4: App 接入 + 消费方迁移 + 删除 ScrollSnap

**Files:**
- Modify: `src/App.tsx`（ReactLenis 子树结构）
- Modify: `src/components/layout/Navbar.tsx`（handleNavClick + logo click）
- Modify: `src/components/Hero.tsx`（handleContactClick）
- Modify: `src/hooks/useHashScroll.ts`
- Modify: `src/components/layout/BackToTopButton.tsx`
- Delete: `src/components/ScrollSnap.tsx`、`src/components/ScrollSnap.test.tsx`、`src/hooks/useScrollToSection.ts`

**Interfaces:**
- Consumes: `usePageSnap(): PageSnapApi | null`（Task 3）
- Produces: home 路由所有程序化滚动经 PageSnap；`useScrollToSection` / `ScrollSnap` 引用清零；现有 `useHashScroll.test.ts` 4 个用例无需修改（mount 仍断言元素目标、hashchange 无 Provider 时走回退裸 scrollTo，断言兼容）

- [ ] **Step 1: App.tsx 用 PageSnap 包裹 home 子树**

`src/App.tsx`：删除 `import { ScrollSnap } from './components/ScrollSnap'`，新增 `import { PageSnap } from './components/PageSnap'`。`<ReactLenis>` 子树改为：

```tsx
<ColorSchemeAttrSync />
<Suspense fallback={null}>
  {route.type === 'resume' ? (
    <ResumePage />
  ) : route.type === 'home' ? (
    <PageSnap>
      <Layout>
        {SECTIONS.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </Layout>
    </PageSnap>
  ) : (
    <Layout isNotFound>
      {route.type === 'redirect' ? <RedirectPage rule={route.rule} /> : <NotFound />}
    </Layout>
  )}
</Suspense>
```

（PageSnap 是 Provider，必须包裹 home 的 Layout——Navbar/Hero/useHashScroll/BackToTop 都在其子树内才能消费 context。非 home 路由不包裹。）

- [ ] **Step 2: Navbar 迁移**

`src/components/layout/Navbar.tsx`：删除 `import { useScrollToSection } from '../../hooks/useScrollToSection'` 与 `const scrollToSection = useScrollToSection()`，新增：

```tsx
import { usePageSnap } from '../../components/PageSnap';
// 组件内：
const pageSnap = usePageSnap();

const handleNavClick = (sectionId: string) => {
  setMobileMenuOpen(false);
  pageSnap?.goToSection(sectionId); // hash 回写在 PageSnap 内部
};
```

logo 点击改为 `onClick: () => pageSnap?.goToSection('hero')`（原 `handleNavClick('hero')` 保留亦可——统一用 `pageSnap?.goToSection('hero')`）。

- [ ] **Step 3: Hero CTA 迁移**

`src/components/Hero.tsx`：删除 `useScrollToSection` 导入与调用，新增：

```tsx
import { usePageSnap } from './PageSnap';
// 组件内：
const pageSnap = usePageSnap();
const handleContactClick = () => pageSnap?.goToSection('contact');
```

- [ ] **Step 4: useHashScroll 迁移（mount immediate 直达 + 运行时动画）**

`src/hooks/useHashScroll.ts` 改为（`getHashTarget` 与现有测试兼容性保持不变）：

```ts
import { useEffect } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLenis } from 'lenis/react';
import { usePageSnap } from '../components/PageSnap';

/**
 * Resolve a URL hash to a DOM element, or null if it doesn't target a real
 * section. Strips a single leading `#`; empty hash -> null; unknown id -> null.
 */
export const getHashTarget = (hash: string): HTMLElement | null => {
  const id = hash.replace(/^#/, '');
  return id ? document.getElementById(id) : null;
};

/**
 * Scroll to the section named by `window.location.hash`:
 * - initial load: immediate (no animation — the user asked for this position
 *   and should not watch the page fly there)
 * - runtime hashchange: animated, through PageSnap when available (home route)
 * Outside the PageSnap provider (404/redirect) falls back to bare lenis.scrollTo.
 */
export const useHashScroll = (): void => {
  const lenis = useLenis();
  const pageSnap = usePageSnap();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const duration = reducedMotion ? 0 : 1.2;

  useEffect(() => {
    const appbarOffset = () => {
      const appbar = document.querySelector('.MuiAppBar-root');
      return appbar ? -appbar.getBoundingClientRect().height : 0;
    };

    const scrollToHashImmediate = () => {
      const el = getHashTarget(window.location.hash);
      if (el) lenis?.scrollTo(el, { immediate: true, force: true });
    };
    const scrollToHashAnimated = () => {
      const el = getHashTarget(window.location.hash);
      if (!el) return;
      if (pageSnap) pageSnap.goToSection(el.id);
      else lenis?.scrollTo(el, { duration, offset: appbarOffset() });
    };

    // Defer the initial scroll past two rAFs: first-paint layout (images,
    // fonts) hasn't settled before that. Runtime hashchange scrolls immediately.
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(scrollToHashImmediate);
    });
    window.addEventListener('hashchange', scrollToHashAnimated);
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      window.removeEventListener('hashchange', scrollToHashAnimated);
    };
  }, [lenis, pageSnap, duration]);
};
```

> 注意（保留既有权衡）：mount 分支的 `el` 元素目标走 getBoundingClientRect，若该区块尚未 reveal 完成（translateY 24px）会有 24px 偏差；Section 的 `scrollMarginTop`（56/64px，lenis 元素目标会读取 scroll-margin-top）兜底 AppBar offset，24px 偏差在首帧（opacity 仍 0）不可见。**Task 6 目检确认，若偏差可见则改为按 id 查 `offsetTop - offsetHeight` 链的数值目标。**

- [ ] **Step 5: BackToTopButton 迁移**

`src/components/layout/BackToTopButton.tsx`：

```tsx
import { usePageSnap } from '../PageSnap';
// 组件内新增（lenis/useLenis 保留——opacity 订阅仍需要）：
const pageSnap = usePageSnap();
// handleClick 改为：
const handleClick = () => {
  if (pageSnap) pageSnap.goToTop();
  else lenis?.scrollTo(0, { duration: reducedMotion ? 0 : 1.2 });
};
```

- [ ] **Step 6: 删除旧文件**

```bash
git rm src/components/ScrollSnap.tsx src/components/ScrollSnap.test.tsx src/hooks/useScrollToSection.ts
```

- [ ] **Step 7: 全量验证**

Run: `pnpm run test:run && pnpm run typecheck && pnpm run lint`
Expected: 全绿。另确认无残留引用：`rg "useScrollToSection|ScrollSnap" src/` 输出为空。

Run: `pnpm run dev`，浏览器手动验证 spec 附录验收清单的滚轮/触控板 8 项。

- [ ] **Step 8: 提交**

```bash
git add -A
git commit -m "feat(scroll): wire PageSnap into App; migrate Navbar/Hero/hash/BackToTop; remove ScrollSnap"
```

---

### Task 5: CLAUDE.md 文档同步

**Files:**
- Modify: `CLAUDE.md`（Lenis 平滑滚动节、导航滚动约定节、架构目录树、测试列表）

**Interfaces:**
- Consumes: Task 1-4 最终形态
- Produces: 文档与实现一致

- [ ] **Step 1: 更新「Lenis 平滑滚动」节**

删除「滚动吸附（`src/components/ScrollSnap.tsx` ...）」整个 bullet，新增：

```markdown
- **整屏翻页（`src/components/PageSnap.tsx`，仅 home 路由挂载）**：自写状态机（idle → animating → cooldown）实现「滚一下立刻翻一屏」。停留点由 `src/scrollStops.ts` 纯函数 `computeStops(sections, viewportH, appbarH)` 计算（短区块 1 站顶对齐 AppBar 下缘；内容超一屏的区块按有效屏高步进多站、末站底对齐；站距 < 40% 视口合并，保留较早站），ResizeObserver + rAF 合帧重算（Accordion 展开改变区块高度时停留点自动跟随）。门控：`reducedMotion || pointer: coarse` 不启用。手感常量（SNAP_DURATION 0.9s / COOLDOWN 200ms / QUIET_WINDOW 100ms / WHEEL_THRESHOLD 0）在 PageSnap.tsx 模块顶部，真机调参直接改那里。wheel 触发在 animating/cooldown 期间被忽略；API 调用（goToSection 等）在 animating 中 force 中断转向。验收清单见 spec 附录。
```

- [ ] **Step 2: 更新「导航滚动约定」节**

「所有区块定位统一走 `useScrollToSection`」段替换为：

```markdown
**所有区块定位统一走 `usePageSnap()`**（`src/components/PageSnap.tsx`）：返回 `{ goToSection(id), goToTop(), goToStops(i) }` 或 null（非 home 路由）。`goToSection` 含 AppBar offset（停留点已含）+ hash 回写 + animating 中 force 中断转向。当前使用方：Navbar 导航/logo、Hero CTA、useHashScroll（运行时 hashchange）、BackToTopButton。**禁止** `element.scrollIntoView()` / `window.scrollTo()` / home 路由上绕过 API 的裸 `lenis.scrollTo`（非 home 路由无 Provider，裸 scrollTo 是唯一选项）。**滚动目标一律传数值**（停留点值），不传元素引用——lenis 元素目标走 getBoundingClientRect，会被 reveal 的 translateY 污染（useHashScroll mount 分支例外，见其注释）。
```

同时：

- 删除「已知缺口——ScrollSnap 吸附无 AppBar offset」整段（已由 computeStops 的 `top - appbarH` 解决）
- 「返回顶部」bullet 改为：`pageSnap?.goToTop()`（无 Provider 时回退裸 scrollTo，reducedMotion 时 duration 0）

- [ ] **Step 3: 更新架构目录树与测试列表**

- 目录树：`ScrollSnap.tsx` 行 → `PageSnap.tsx`（整屏翻页控制器 Provider）；`useScrollToSection.ts` 行 → 新增 `../scrollStops.ts`（翻页停留点纯函数）
- 测试列表：`ScrollSnap.test.tsx` → `PageSnap.test.tsx`、`scrollStops.test.ts`

- [ ] **Step 4: 提交**

```bash
git add CLAUDE.md
git commit -m "docs: sync CLAUDE.md with PageSnap fullpage scrolling system"
```

---

### Task 6: 真机验收（spec 附录清单）

**Files:**
- 无代码变更（验证任务；发现问题按归属改动并提交）

**Interfaces:**
- Consumes: Task 1-5 完成的系统
- Produces: 验收结论；手感常量可能调整

- [ ] **Step 1: 启动 dev server**

Run: `pnpm run dev`

- [ ] **Step 2: 按 spec 附录验收清单逐项检查**

清单位置：`docs/superpowers/specs/2026-09-08-fullpage-scroll-snap-design.md` 附录。重点：

1. 滚轮/触控板 8 项（连滚只翻一页、惯性尾巴、横向手势、导航中断）
2. 键盘 3 项（input 聚焦防御用 devtools 临时造 input）
3. 回归 6 项（移动端模拟、reduced-motion、/resume/404/redirect、深链接直达、hashchange、主题切换后停留点）
4. **Deep link 目检（Task 4 Step 4 标记的可疑点）**：直接访问 `http://localhost:5173/#portfolio`，确认首屏直达、标题在 AppBar 下缘、无 24px 偏差可见

- [ ] **Step 3: 手感调参（如需）**

触控板连滚误翻 → 调大 `WHEEL_THRESHOLD`（10-20）；翻页太慢 → 降 `SNAP_DURATION`；尾段误触发 → 增大 `QUIET_WINDOW_MS`。改动与对应验收项一起提交：

```bash
git add src/components/PageSnap.tsx
git commit -m "tune(scroll): paging feel constants after hands-on acceptance"
```

- [ ] **Step 4: 最终全量检查**

Run: `pnpm run format && pnpm run test:run && pnpm run typecheck && pnpm run lint`
Expected: 全绿，`git status` 干净

---

## 自审记录

1. **Spec 覆盖**：§1 体验目标（Task 1 停留点 + Task 3 控制器 + Task 2 排版）、§2 排版（Task 2）、§3 停留点含 rAF 合帧与 MIN_STOP_SPACING 常量（Task 1/3）、§4 PageSnap 含两层键盘防御/中断/冷却 re-arm（Task 3）、deep link initial（Task 4 Step 4）、§5 整合（Task 4）、§6 测试（Task 1/3 TDD + Task 4 全量）、§7 风险调参（Task 6 Step 3）、§8 文档（Task 5）、附录验收（Task 6）。无缺口。
2. **占位符扫描**：全部步骤含完整代码或显式断言；无 TBD/TODO/"类似 Task N"。
3. **类型一致性**：`PageSnapApi`（Task 3 定义 = Task 4 消费）、`computeStops` 签名（Task 1 = Task 3 调用）、`MIN_STOP_SPACING`（Task 1 导出 = 测试引用）、常量名（Task 3 定义 = Task 5 文档 = Task 6 调参指引）一致。
4. **已知修订**（相对初稿）：deep link 从 PageSnap 移除（双滚动竞态）；AppBar 测量改 offsetHeight（jsdom 兼容 + 语义一致）；goToTop 不回写 hash；Task 1 三个用例推演与断言修正为与实现算法一致。
