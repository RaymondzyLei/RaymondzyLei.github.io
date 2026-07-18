# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人主页/作品集网站，部署于 raymondzylei.me，通过 GitHub Pages 托管。

## 技术栈

- Vite 8 + React 19 + TypeScript 6（均为较新版本，参考文档请查 release notes）
- Material-UI v9（`@mui/material`、`@mui/icons-material`、`@mui/lab`）
- i18next + react-i18next（中/英双语）
- Lenis 1.x（`lenis` + `lenis/react`）—— 平滑滚动

## 命令

```bash
pnpm run dev          # 启动开发服务器
pnpm run build        # 类型检查 + 生产构建
pnpm run typecheck    # 仅类型检查（CI 复用）
pnpm run lint         # ESLint
pnpm run test         # Vitest（watch 模式）
pnpm run test:run     # Vitest 单次运行（CI 复用）
pnpm run format       # Prettier 全量格式化
pnpm run format:check # Prettier 检查（CI 复用）
pnpm run preview      # 本地预览生产构建
```

项目使用 pnpm 作为包管理器（`pnpm-lock.yaml` 是唯一锁文件，`package-lock.json` 已删除，不要再 `npm install`）。

## 架构

单页应用，所有内容在一个页面中分为 6 个区块，通过导航栏平滑滚动定位。

```
src/
├── main.tsx          # 入口：加载 i18n、字体 CSS（fonts.css）、lenis CSS、渲染 <App />
├── App.tsx           # 根组件：MUI 主题 + <ReactLenis> 包裹 + resolveRoute() 分发 home/redirect/404
├── theme.ts          # MUI 主题：亮/暗双色方案、紫色主色调、`glass(theme)` helper、`DISPLAY_FONT` 常量、`shape.borderRadius: 24`
├── routing.ts        # 纯函数 resolveRoute(pathname)：'/'→home、REDIRECTS 命中→redirect、其余→notFound
├── routing.test.ts   # resolveRoute 单元测试（Vitest）
├── theme.test.ts      # glass() helper 单元测试（亮/暗模式）
├── styles/
│   ├── reveal.ts      # 共享 scroll-reveal 样式片段
│   └── reveal.test.ts # revealSx() 单元测试 `revealSx(isVisible, delayMs)`（6 区块 + 卡片错位复用）
├── hooks/
│   ├── useTilt.ts        # 3D 倾斜 hook（rAF 插值，最大 ±5°，订阅 matchMedia change 响应式）
│   ├── useReveal.ts      # scroll-reveal hook（react-intersection-observer useInView + MUI useMediaQuery 减弱动效）
│   └── useHashScroll.ts  # hash 深链接：getHashTarget() + useHashScroll()（监听 hashchange + lenis.scrollTo，无效 hash 忽略）
├── i18n/
│   ├── i18n.ts       # i18next 初始化，语言偏好持久化到 localStorage，export isSupportedLanguage 类型守卫
│   ├── i18n.test.ts  # isSupportedLanguage 单元测试（en/zh → true, null/空/未知 → false）
│   ├── en.json       # 英文翻译
│   └── zh.json       # 中文翻译
├── components/
│   ├── Layout.tsx              # 页面骨架：编排 <Navbar> + <BackgroundOrbs> + <main> + <BackToTopButton>
│   ├── GlassCard.tsx           # 共享液态玻璃卡片（`glass(theme)` + hover elevation，`accent` 控制左/上边线）
│   ├── BackgroundOrbs.tsx      # 2 个模糊光球背景层（边界碰撞 + 滚动视差 + 视口 clamp）
│   ├── LiquidGlassButton.tsx   # 圆形 48px 液态玻璃按钮（Hero + Contact 社交行复用）
│   ├── Hero.tsx                # 头像 + 4 个 LiquidGlassButton 社交链接 + CTA 按钮（useLenis 滚到 Contact）
│   ├── Skills.tsx              # 按类别分组展示技能标签
│   ├── Qualifications.tsx      # 教育经历时间线（桌面端交替布局，移动端卡片）
│   ├── Academic.tsx            # 学术成就/竞赛（按类别折叠面板）
│   ├── Portfolio.tsx           # 项目卡片网格
│   ├── Contact.tsx             # 联系信息 + LiquidGlassButton 社交行 + 有用链接
│   ├── NotFound.tsx            # 404 页面（毛玻璃卡片 + 返回首页链接）
│   ├── RedirectPage.tsx        # 重定向中间页（3 秒倒计时自动跳转）
│   └── layout/
│       ├── Navbar.tsx          # 吸顶毛玻璃 AppBar + 导航 + 主题切换 + 移动抽屉
│       ├── LanguageMenu.tsx    # 语言切换下拉菜单（en/zh）
│       └── BackToTopButton.tsx # 固定返回顶部按钮（订阅 Lenis 滚动更新透明度）
├── data/
│   ├── types.ts        # 共享 `BaseLink` 接口（social/contact 复用）
│   ├── skills.ts       # 技能数据及按类别查询函数
│   ├── timeline.ts     # 教育经历时间线数据
│   ├── achievements.ts # 竞赛/学术成就数据
│   ├── projects.ts     # 项目作品数据（占位中，TODO 标记）
│   ├── social.ts       # 社交媒体链接（SocialLink extends BaseLink，icon 必填）
│   ├── contact.ts      # 联系页面链接（ContactLink = BaseLink，部分占位 url: '#'）
│   └── redirects.ts    # 短链接重定向规则（如 /google、/the-book-of-answers）
└── test/
    └── setup.ts        # Vitest 环境 setup（jest-dom/vitest matchers）
```

## 国际化

所有面向用户的文本必须通过 `useTranslation()` 的 `t()` 函数获取，并在 `en.json` 和 `zh.json` 中同时添加翻译条目。语言选择自动保存到 `localStorage` 的 `language` 键。

**初始化时校验 localStorage**：`src/i18n/i18n.ts` 启动时读 `language` 键，**仅接受 `en` / `zh`**，其他值一律回退到 `en`（用 `isSupportedLanguage` 类型守卫实现，不要用 `|| 'en'` 这种 fallback，养成显式校验习惯）。`SUPPORTED_LANGUAGES` 数组是 single source of truth。

**未实现区块的 key 用 `_TODO_` 前缀标记**（JSON 不支持注释，所以用 key 命名做标记）：`en.json` / `zh.json` 里以下划线开头的 key 是占位，搜索 `_TODO_` 可定位。

## 主题

MUI 主题支持亮/暗模式，通过 `useColorScheme()` 切换。主色为紫色（亮色模式 `#7c3aed`，暗色模式 `#a78bfa`），暗色背景为经典黑色（default `#0d0d0d` / paper `#1a1a1a`）。`secondary` 当前与 `primary` 同色（TODO 标记，待未来选个真正的副色）。组件使用 MUI 的 `styled()` API 自定义样式，不使用 CSS 文件。

`shape.borderRadius: 24`（iOS 26 风格），全局级联到所有 Paper / Card / Accordion / Chip / IconButton；圆形元素（avatar、background orbs）不受影响。

## HTML 文档约定

`index.html` 的 `<head>` 必须包含：

- `<meta name="description">` —— 1-2 句话描述页面（SEO 关键）
- `og:type` / `og:title` / `og:description` / `og:url` / `og:image` —— 社交分享卡片（Open Graph）
- `<meta name="twitter:card" content="summary_large_image">` —— Twitter / X 预览
- `og:url` 用生产域名（`https://raymondzylei.me`），`og:image` 用绝对 URL

新加页面级 meta / 链接（如 favicon 主题色、apple-touch-icon）也加在这里。

## Lenis 平滑滚动

- 包：`lenis`（`lenis/react` 提供 `<ReactLenis>` + `useLenis`）
- CSS：在 `src/main.tsx` 顶部 `import 'lenis/dist/lenis.css';`
- 包裹：在 `App.tsx` 用 `<ReactLenis root options={lenisOptions}>` 包住整棵子树（`root` 模式让 `<html>` 当滚动容器）
- **`useLenis` 双调用模式**：
  - `const lenis = useLenis();` —— 拿实例，给 `scrollTo` 用
  - `useLenis((lenis) => { ... })` —— 订阅滚动事件，更新派生状态（如返回顶部按钮透明度）
  - `lenis` 初始可能 undefined，所有调用用 `lenis?.scrollTo(...)`
- **`prefers-reduced-motion` 配置**（`App.tsx`）：用 `useState + useEffect` 订阅 `matchMedia` 的 `change` 事件以响应运行时变化（不要一次性 useState 捕获）。reduced 时传 `{ duration: 0, smoothWheel: false }`，正常时传 `{ lerp: 0.1 }`

## 毛玻璃模式

**不要再手写 3 行 backdrop-filter 模板**。所有需要"浮在背景光球之上"的表面统一用 `src/theme.ts` 导出的 `glass(theme)` helper：

```ts
import { glass } from '../theme';
// styled 工厂内：
...glass(theme),
// 或 sx 回调内：
sx={(theme) => ({ ...glass(theme), ... })}
```

`glass(theme)` 返回：alpha 0.65 背景（暗色用 `background.default` 让光球透出）+ `blur(20px) saturate(180%)` + 1px rim border（亮色白 alpha 0.5 / 暗色白 alpha 0.12）+ 顶部 inner highlight inset（亮色白 alpha 0.6 / 暗色白 alpha 0.08）；亮色模式额外带紫色软投影 `0 8px 32px rgba(124,58,237,0.08)`（暗色模式省略，黑色投影在黑色背景上不可见）。

**新增 glass 卡片优先用 `GlassCard`**（`src/components/GlassCard.tsx`）：已封装 `...glass(theme)` + hover `boxShadow`，通过 `accent` prop（`'none'|'left'|'top'`）控制 4px primary 边线方向。当前用法：Skills / Qualifications(桌面+移动) / Academic / Contact / NotFound / RedirectPage 的卡片。`AppBar` 的 sx 仍直接展开 `...glass(theme)`（非卡片）。`StyledProjectCard`（Portfolio）带扫光动效 + `shadows[16]`，视觉不同，独立保留。

**需要全新玻璃形态（非上述卡片）** = 在 styled 工厂里加 `...glass(theme)`，不要复制上面的 CSS。

hover 反馈继续用 `boxShadow` / `border` / `color`，**不要改 `backgroundColor`（会破坏透明）**。

## 滚动视差

`BackgroundOrbs` 在 rAF 里读 `window.scrollY`，给光球的 y 加上 `-scrollY * scrollFactor` 的偏移。Lenis 直接动 `window.scrollY`，所以**视差自动配合 Lenis 的平滑曲线**，不需要额外同步。

- `scrollFactor`：orb1 = 0.12，orb2 = 0.18（值越大视差越强，但越容易出框）
- **clamp 渲染位置**：最终 transform y 限制在 `[0, window.innerHeight - ORB_SIZE]` 范围内，防止光球滚到底时跑出视口顶部
- 碰撞反弹（光球撞视口边缘）作用于 `orb.y` 物理状态，clamp 只影响最终 transform，**两者解耦**

## 导航滚动约定

**所有导航按钮、Hero CTA、返回顶部按钮** 一律用 `lenis?.scrollTo(element)` 或 `lenis?.scrollTo(0, ...)`。**禁止**用 `element.scrollIntoView()` 或 `window.scrollTo()`（会和 Lenis 冲突，要么双滚动要么不丝滑）。

- `lenis.scrollTo(element)` 默认处理 sticky AppBar 的 offset
- 返回顶部：`lenis?.scrollTo(0, { duration: reducedMotion ? 0 : 1.2 })`（用 `useMediaQuery('(prefers-reduced-motion: reduce)')` 读 `reducedMotion`）
- 返回顶部按钮透明度：`Math.min(lenis.scroll / 300, 1)`（用 `useLenis((lenis) => ...)` 订阅更新）

**Hash 深链接**（`useHashScroll`，挂在 `Layout`）：访问 `/#skills` 等会在 lenis 就绪后滚到对应区块，并订阅 `hashchange` 持续响应；无效 hash 静默忽略。导航点击用 `history.replaceState` 回写 hash（不触发 hashchange，避免与监听循环），因此浏览器前进/后退不在 section 间跳转——这是有意为之，保持历史栈干净。

## 动效约定

所有动效遵循"克制"原则：

- **卡片 3D 倾斜**用 `src/hooks/useTilt.ts`，最大 ±5°，rAF 平滑插值。已应用到的卡片：Hero CTA、SkillPaper、TimelineCard（桌面 + 移动）、AchievementCard、StyledProjectCard、ContactPaper。
- **挂 `useTilt` ref 的元素，hover 不得再叠 `transform: translateY/translateX`**（inline transform 冲突）。**非倾斜元素**（如 nav button、avatar、social icon、Chip）可以自由加 hover transform。
- **背景光球**：固定 2 个（紫色 `primary.main` + 蓝色 `info.main`），速度 0.35-0.55 px/frame，撞视口边缘反弹；滚动视差（见上）。暗色模式下透明度显著降低（0.16 / 0.12），避免光球在黑色背景上过于抢眼干扰阅读。
- **移动端（`pointer: coarse`）自动退化**：3D 倾斜不触发（无 mousemove）；视差改为滚动驱动所以移动端也工作。
- **所有动效尊重 `prefers-reduced-motion: reduce`**：`useTilt` 订阅 `change` 事件动态启停（关闭时清 transform、取消 rAF）；`BackgroundOrbs` 通过 CSS 媒体查询关闭 keyframe；Lenis 配置 `duration: 0`；`handleBackToTop` 用 `useMediaQuery` 决定 `duration: 0` 还是 `1.2`。
- **Scroll-reveal（`useReveal`）**：6 个 section + 区块内卡片错位渐现。opacity 0→1 + translateY(24px)→0，缓动 `cubic-bezier(0.22, 1, 0.36, 1)`，1200ms。`useReveal` 包装 `react-intersection-observer` 的 `useInView`（threshold 0.2、rootMargin `'0px 0px 0px 0px'`、triggerOnce true）+ MUI `useMediaQuery`；`prefers-reduced-motion: reduce` 时直接 `isVisible: true` 无 observer。错位 stagger：同区块卡片 `transitionDelay: ${index * 100}ms`，由调用方传 `delayMs`（如 `revealSx(isVisible, index * 100)`），hook 不传 delay。**那段 sx 统一用 `src/styles/reveal.ts` 的 `revealSx(isVisible, delayMs)` 生成**，不要手写重复的 transition 字符串。
- **transform 写入隔离**：`useTilt`（写 `rotate3d`）和 `useReveal`（写 `translate3d`）**不允许挂在同一 DOM 元素**。reveal 写外层 wrapper Box，tilt 写内层卡片 DOM。
- **Academic Accordion 特殊处理**：accordion 内的 `AchievementCardView` **不** stagger。`<AccordionDetails>` 折叠时 `height: 0` 但 DOM 存在，IntersectionObserver 立即 fire `inView: true`，展开时卡片已 visible，再 stagger 反而闪烁。仅 `Academic` 区块整体渐现。
- **LiquidGlassButton 动效**：hover `transform: scale(1.08)` + 加深 inset highlight；active `scale(0.96)`；`focus-visible` 焦点环 `outline: 2px solid primary.main; outline-offset: 4px`；`@media (pointer: coarse)` 禁用 scale；`prefers-reduced-motion: reduce` 时 transition 全部清零。**不挂 useTilt**（与 scale transform 冲突）。

## 占位数据约定

- **JSON 翻译文件**：`en.json` / `zh.json` 中未实现区块的 key 用 `_TODO_` 前缀（如 `_TODO_about_title`）。
- **TypeScript 数据文件**：未填充的内容在附近加 `// TODO: ...` 注释说明。已标记的：
  - `src/data/projects.ts`（开头）
  - `src/data/achievements.ts`（3 个 'None' 占位行上方）
  - `src/data/skills.ts`（框架技能块上方）
  - `src/data/contact.ts`（3 个 `url: '#'` 行上方）
  - `src/theme.ts`（`secondary` 调色板）

## TypeScript 注意事项

`tsconfig.app.json` 启用了 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`。常见踩坑：

- **循环里需要 ref 必须抽子组件**：`useTilt()` / `useReveal()`（或任何 hook）只能在组件顶层调用，不能写在 `.map()` 里。要给循环渲染的每张卡片抽一个子组件（如 `SkillCategory`、`AchievementCardView`、`ProjectCardView`、`ProjectCardCell`、`DesktopTimelineItem` / `MobileTimelineItem`）。
- **`useRef<T>(null)` 实际返回 `RefObject<T | null>`**：泛型 hook 想暴露 `RefObject<T>` 给消费者（这样能直接 `<Component ref={ref} />` 透传到任意元素类型），需要在 return 处加 `return ref as RefObject<T>` 断言。
- **同名类型冲突**：`TimelineItem` 在 `@mui/lab` 和 `../data/timeline` 都存在，用 `import type { TimelineItem as TimelineDataItem } from '../data/timeline'` 别名区分。
- **OS 级媒体查询用 `useState` + `useEffect` 订阅 `change` 事件**（不要用 `useState(() => mq.matches)` 一次性捕获）。模式：
  ```tsx
  const [value, setValue] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setValue(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  ```
  （也可考虑 `useSyncExternalStore`，但本项目目前用 `useState + useEffect` 已足够）

## 部署

- GitHub Actions：`.github/workflows/deploy-pages.yml`
  - `push` 到 `main` → build + deploy（生产）
  - `pull_request` → build + deploy（PR 预览，URL 见 workflow run 输出，PR 关闭/合并后清理）
  - `workflow_dispatch` → 手动触发
  - `actions/deploy-pages@v4` 配 `enablement: true` 才能在 PR 上部署（GitHub 默认禁止）
- 自定义域名 `raymondzylei.me`（在 `CNAME` 文件中配置）
- 构建输出到 `dist/` 目录
- `vite.config.ts` 显式声明 `base: '/'`（自定义域名部署需要根相对路径），含自定义插件在构建后将 `index.html` 复制为 `404.html`（GitHub Pages SPA fallback）

## 仓库约定

- `.gitignore` 防 `*.bak` / `*.tsxbak` / `*.orig` / `.playwright-mcp/` / `.claude/`（Claude Code 本地配置如 plans/）等产物
- `.gitattributes`：`* text=auto eol=lf`（统一 LF 行尾，Windows 开发不会被 CRLF 污染）
- 代码风格用 Prettier（`.prettierrc`：单引号、分号、2 空格、`trailingComma: all`、`printWidth: 100`），`pnpm run format` 格式化；ESLint 末尾接 `eslint-config-prettier` 关闭冲突规则
- 测试用 Vitest（`vitest.config.ts`，jsdom 环境），`pnpm run test:run` 单次运行；纯函数优先测试。现有测试文件：`routing.test.ts`、`theme.test.ts`、`i18n.test.ts`、`reveal.test.ts`、`useHashScroll.test.ts`
- 包管理只用 pnpm（不混用 npm / yarn）
