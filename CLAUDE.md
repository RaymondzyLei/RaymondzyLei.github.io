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
pnpm run dev        # 启动开发服务器
pnpm run build      # 类型检查 + 生产构建
pnpm run typecheck  # 仅类型检查（CI 复用）
pnpm run lint       # ESLint
pnpm run preview    # 本地预览生产构建
```

项目使用 pnpm 作为包管理器（`pnpm-lock.yaml` 是唯一锁文件，`package-lock.json` 已删除，不要再 `npm install`）。

## 架构

单页应用，所有内容在一个页面中分为 6 个区块，通过导航栏平滑滚动定位。

```
src/
├── main.tsx          # 入口：加载 i18n、Roboto 字体、lenis CSS、渲染 <App />
├── App.tsx           # 根组件：MUI 主题 + <ReactLenis> 包裹 + Layout 包裹各区块
├── theme.ts          # MUI 主题：亮/暗双色方案、紫色主色调
├── hooks/
│   └── useTilt.ts    # 3D 倾斜 hook（rAF 插值，最大 ±5°，prefers-reduced-motion 自动禁用）
├── i18n/
│   ├── i18n.ts       # i18next 初始化，语言偏好持久化到 localStorage
│   ├── en.json       # 英文翻译
│   └── zh.json       # 中文翻译
├── components/
│   ├── Layout.tsx              # 顶部导航栏（吸顶毛玻璃）、移动端抽屉、返回顶部、语言/主题切换、挂载 <BackgroundOrbs />
│   ├── BackgroundOrbs.tsx      # 2 个模糊光球背景层（边界碰撞 + 滚动视差 + 视口 clamp）
│   ├── Hero.tsx                # 头像 + 社交链接 + CTA 按钮（useLenis 滚到 Contact）
│   ├── Skills.tsx              # 按类别分组展示技能标签
│   ├── Qualifications.tsx      # 教育经历时间线（桌面端交替布局，移动端卡片）
│   ├── Academic.tsx            # 学术成就/竞赛（按类别折叠面板）
│   ├── Portfolio.tsx           # 项目卡片网格
│   └── Contact.tsx             # 联系信息 + 有用链接
└── data/
    ├── skills.ts       # 技能数据及按类别查询函数
    ├── timeline.ts     # 教育经历时间线数据
    ├── achievements.ts # 竞赛/学术成就数据
    ├── projects.ts     # 项目作品数据（占位中，TODO 标记）
    ├── social.ts       # 社交媒体链接
    └── contact.ts      # 联系页面链接（部分占位 url: '#'）
```

## 国际化

所有面向用户的文本必须通过 `useTranslation()` 的 `t()` 函数获取，并在 `en.json` 和 `zh.json` 中同时添加翻译条目。语言选择自动保存到 `localStorage` 的 `language` 键。

**未实现区块的 key 用 `_TODO_` 前缀标记**（JSON 不支持注释，所以用 key 命名做标记）：`en.json` / `zh.json` 里以下划线开头的 key 是占位，搜索 `_TODO_` 可定位。

## 主题

MUI 主题支持亮/暗模式，通过 `useColorScheme()` 切换。主色为紫色（亮色模式 `#7c3aed`，暗色模式 `#a78bfa`）。`secondary` 当前与 `primary` 同色（TODO 标记，待未来选个真正的副色）。组件使用 MUI 的 `styled()` API 自定义样式，不使用 CSS 文件。

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

`alpha(theme.palette.background.paper, 0.6) + backdropFilter: 'blur(10px)' + WebkitBackdropFilter: 'blur(10px)'`

统一用于 AppBar、SkillPaper、AchievementCard、ProjectCard、ContactPaper、TimelineCard 等需要"浮在背景光球之上"的卡片。hover 反馈用 `boxShadow` / `border` / `color`，**不要改 `backgroundColor`（会破坏透明）**。

## 滚动视差

`BackgroundOrbs` 在 rAF 里读 `window.scrollY`，给光球的 y 加上 `-scrollY * scrollFactor` 的偏移。Lenis 直接动 `window.scrollY`，所以**视差自动配合 Lenis 的平滑曲线**，不需要额外同步。

- `scrollFactor`：orb1 = 0.12，orb2 = 0.18（值越大视差越强，但越容易出框）
- **clamp 渲染位置**：最终 transform y 限制在 `[0, window.innerHeight - ORB_SIZE]` 范围内，防止光球滚到底时跑出视口顶部
- 碰撞反弹（光球撞视口边缘）作用于 `orb.y` 物理状态，clamp 只影响最终 transform，**两者解耦**

## 导航滚动约定

**所有导航按钮、Hero CTA、返回顶部按钮** 一律用 `lenis?.scrollTo(element)` 或 `lenis?.scrollTo(0, ...)`。**禁止**用 `element.scrollIntoView()` 或 `window.scrollTo()`（会和 Lenis 冲突，要么双滚动要么不丝滑）。

- `lenis.scrollTo(element)` 默认处理 sticky AppBar 的 offset
- 返回顶部：`lenis?.scrollTo(0, { duration: 1.2 })`
- 返回顶部按钮透明度：`Math.min(lenis.scroll / 300, 1)`（用 `useLenis((lenis) => ...)` 订阅更新）

## 动效约定

所有动效遵循"克制"原则：

- **卡片 3D 倾斜**用 `src/hooks/useTilt.ts`，最大 ±5°，rAF 平滑插值。已应用到的卡片：Hero CTA、SkillPaper、TimelineCard（桌面 + 移动）、AchievementCard、StyledProjectCard、ContactPaper。
- **挂 `useTilt` ref 的元素，hover 不得再叠 `transform: translateY/translateX`**（inline transform 冲突）。**非倾斜元素**（如 nav button、avatar、social icon、Chip）可以自由加 hover transform。
- **背景光球**：固定 2 个（紫色 + 蓝色），速度 0.35-0.55 px/frame，撞视口边缘反弹；滚动视差（见上）。
- **移动端（`pointer: coarse`）自动退化**：3D 倾斜不触发（无 mousemove）；视差改为滚动驱动所以移动端也工作。
- **所有动效尊重 `prefers-reduced-motion: reduce`**：`useTilt` 直接 return，`BackgroundOrbs` 通过 CSS 媒体查询关闭 keyframe，Lenis 配置 `duration: 0`。
- **重要**：Lenis 的 `duration: 1.2` 在 reduced-motion 模式下用户也不希望滚很久——目前 `handleBackToTop` 硬编码 1.2s，**未来应该也读 `useReducedMotion` 来决定**（TODO）。

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

- **循环里需要 ref 必须抽子组件**：`useTilt()`（或任何 hook）只能在组件顶层调用，不能写在 `.map()` 里。要给循环渲染的每张卡片抽一个子组件（如 `SkillCategory`、`AchievementCardView`、`ProjectCardView`、`DesktopTimelineItem` / `MobileTimelineItem`）。
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
- `vite.config.ts` 显式声明 `base: '/'`（自定义域名部署需要根相对路径）

## 仓库约定

- `.gitignore` 防 `*.bak` / `*.tsxbak` / `*.orig` / `.playwright-mcp/` 等产物
- `.gitattributes`：`* text=auto eol=lf`（统一 LF 行尾，Windows 开发不会被 CRLF 污染）
- 包管理只用 pnpm（不混用 npm / yarn）
