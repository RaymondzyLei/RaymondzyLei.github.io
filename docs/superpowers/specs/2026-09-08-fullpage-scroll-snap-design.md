# 整屏翻页滚动系统设计

日期：2026-09-08
状态：已批准（用户确认全部 4 项决策）

## 背景与目标

现状：`ScrollSnap.tsx` 用 `lenis/snap` 的 `proximity` 模式（阈值 20%），只在停止滚动且距区块顶约 150-200px 内才吸附，中途停下不动——是「吸附辅助」，不是翻页。

目标：桌面端滚轮「翻一下 = 立刻跳到下一个停留点」（fullPage.js 手感），每个停留点呈现一个区块。全站改为幻灯片式排版。

### 已确认的决策

1. **混合停留点策略**：短区块整屏翻页；长区块（内容超一屏）内部按一屏步进生成多个停留点，区块是否超一屏由运行时自动判定
2. **移动端保持自由滚动**（触屏上 Lenis 本不接管，不引入 CSS scroll-snap，避免与原生动量滚动打架）
3. **实现路线：方案 B，自写翻页控制器**（不用 `lenis/snap`，排除原生 CSS `scroll-snap-type: y mandatory`——与 Lenis 抢同一滚动容器且跨浏览器行为不一致）
4. **内容垂直居中（幻灯片式）+ 支持键盘翻页**

### 排除项

- 原生 CSS `scroll-snap-type: y mandatory`：与 Lenis 冲突，跨浏览器行为不一致
- `lenis/snap` lock 模式（方案 A）：跳转在最后一次滚轮事件后 500ms 防抖触发，手感偏「磁吸」而非「翻页」；触控板惯性尾巴与防抖交互有二次跳变风险；防抖/锁定语义受库约束，调教空间有限

## 1. 体验目标

桌面端（`pointer: fine` 且非 `prefers-reduced-motion`）：

- **滚轮一格 = 立刻翻到下一停留点**，动画 ~0.9s，动画期间输入锁定（Lenis `lock: true`），动画后短冷却防惯性误触
- 停留点定义：
  - 短区块：区块顶对齐 AppBar 下缘，内容垂直居中占满一屏
  - 长区块（内容高 > 视口高 − AppBar 高）：首站同上，内部按一屏步进生成中间站，末站区块底对齐视口底
- 键盘翻页：PageDown / PageUp / Space / ↑ / ↓ / Home / End 与滚轮同一套控制器

保持现状不变：移动端、`prefers-reduced-motion`、resume / 404 / redirect 路由（PageSnap 不挂载，页面自由滚动）。

## 2. 排版层重构

**`Section.tsx`** 外壳改为幻灯片式：

```tsx
sx={{
  // 减 AppBar 高度，区块顶对齐栏下缘
  minHeight: { xs: 'calc(100vh - 56px)', md: 'calc(100vh - 64px)' },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  py: 8, // 保留：内容贴边兜底
  scrollMarginTop: { xs: '56px', md: '64px' }, // 保留：原生锚点兜底
  ...revealSx(isVisible, revealDelay),
}}
```

- 标题 + 内容作为整体垂直居中（内容不足一屏时）；内容超高时自然向下延展（`minHeight` 不裁剪）——这就是长区块的运行时判定来源
- `Hero.tsx` 的 `minHeight: '90vh'` 改为与其他区块同款，6 个区块排版统一
- reveal 外层 wrapper、`useTilt` 内层卡片的 transform 写入隔离约定不变

## 3. 停留点计算（纯函数，可单测）

新文件 `src/scrollStops.ts`（与 `routing.ts` 平级）：

```ts
interface StopGeometry { top: number; height: number } // section offsetTop / offsetHeight
export const computeStops = (
  sections: StopGeometry[],
  viewportH: number,
  appbarH: number,
): number[]
```

规则：

- 每个区块首站 = `top - appbarH`（同时精确解决 ScrollSnap 时代「吸附无 AppBar offset」的已知缺口）
- 若 `height > viewportH - appbarH`（长区块）：以 `viewportH - appbarH` 步进生成中间站，末站 = `top + height - viewportH`（区块底对齐视口底）
- 相邻站距 < 40% 视口高时合并，防呆站
- 用 `offsetTop` 链而非 `getBoundingClientRect()`——reveal 的 `translateY(24px)` 是 transform，不影响 offsetTop，`ignoreTransform` 那类坑从根上消失

组件层：ResizeObserver 监听每个 section + window resize 重算停留点。Academic Accordion 展开/收起改变区块高度时停留点自动跟随——这是长区块方案成立的关键。

## 4. PageSnap 控制器

新文件 `src/components/PageSnap.tsx` 替换 `ScrollSnap.tsx`。与现 `ScrollSnap` 渲染 null 的兄弟节点形态不同，PageSnap **以 Context.Provider 形态包裹 home 路由的 `<Layout>` 子树**——否则 Navbar / Hero / useHashScroll / BackToTopButton 消费不到 context。仅 home 路由挂载。

状态机：

```
idle ──wheel |deltaY| 触发──▶ animating（lenis.scrollTo 下一站, lock: true, ~0.9s）
animating ──onComplete──▶ cooldown(~200ms) ──静默确认──▶ idle
```

- 监听 Lenis 的 `virtual-scroll` 事件（已验证 lenis 1.3.23 源码：锁定期间该事件仍发射，监听在锁检查之前）
- idle 中有效 `deltaY` 立即触发翻页，方向取 sign；触发阈值初始设 0（「一滚就翻」），保留为显式常量——若真机测试发现指尖轻蹭误翻，再调大（见第 7 节调参项）
- 惯性尾巴处理：cooldown 结束时若最后一次 wheel 距今 < 100ms，延长冷却直到静默——触控板快速连滚只翻一页
- `deltaX` 忽略（横向手势不误触）
- 翻页完成时 `history.replaceState` 回写目标区块 hash（与导航点击行为一致，deep link 不漂移）

对外 API（React Context）：`usePageSnap()` 返回 `{ goToSection(id), goToTop(), goToStops(i) }` 或 **null**（Provider 未挂载时，如 404 / redirect 路由——`Layout` 同时服务这些路由）。消费方对 null 回退到现有裸 `lenis.scrollTo` 路径，页面不再有可绕过翻页系统的裸滚动（home 路由上所有程序化滚动统一走 API，内部处理锁定旁路 `force: true`）。

键盘：同一控制器内监听 `keydown`，映射 PageDown / PageUp / Space / ↑ / ↓ / Home / End；`document.activeElement` 是交互元素（按钮 / 链接——Space 会触发点击）时跳过该键。

门控与现 ScrollSnap 一致：`reducedMotion || coarsePointer` 返回 null；非 home 路由不挂载。

## 5. 现有系统整合

| 使用方 | 现状 | 改为 |
|---|---|---|
| `Navbar` 导航 / logo | `useScrollToSection` + 手写 replaceState | `goToSection(id)`（内部含 offset + hash 回写） |
| `Hero` CTA | `useScrollToSection` | `goToSection('contact')` |
| `useHashScroll` | 裸 `lenis.scrollTo` | `goToSection(id)`；锁定期间 `force: true` 旁路（深链接必须赢） |
| `BackToTopButton` | 裸 `scrollTo(0)` | `goToTop()` |

- `useScrollToSection.ts` **删除**（职责并入 PageSnap；404 / redirect 等无 Provider 场景由 context 回退兜底）
- `useActiveSection` **不动**——IntersectionObserver 独立于滚动机制，翻页落点自然触发导航高亮
- reveal **不动**——翻页动画与内容渐现并行，`triggerOnce` 保证只首次；offsetTop 不受 reveal transform 影响，停留点无漂移

## 6. 测试

- `src/scrollStops.test.ts`（纯函数）：短区块单站、长区块多站 + 末站底对齐、AppBar offset、站距合并、零区块空数组
- `src/components/PageSnap.test.tsx`（jsdom）：键盘映射、交互元素聚焦跳过、门控（reducedMotion / coarsePointer 不挂载）、context API
- 现有 `ScrollSnap.test.tsx` 随组件删除

## 7. 风险与取舍

- **触控板手感是最大调参点**：触发阈值、cooldown、静默窗口均为显式常量，首次实现后需真机试手感再调（预计 1-2 轮）
- Space 翻页与按钮焦点冲突已防御（交互元素聚焦时跳过键盘翻页）
- Accordion 展开时停留点重算有一帧延迟（ResizeObserver 回调时序），用户几乎不可感知
- 方案 B 固有成本：控制器约 150 行 + 状态机测试，比改库配置多，换来精确手感与零库交互怪癖

## 8. 文档同步

CLAUDE.md 更新：删除 proximity snap 描述与「ScrollSnap 吸附无 AppBar offset」已知缺口条目；新增 PageSnap 状态机、门控、`usePageSnap()` 整合约定（禁止裸 scrollTo）。
