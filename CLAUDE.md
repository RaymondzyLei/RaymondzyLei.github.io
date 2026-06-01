# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人主页/作品集网站，部署于 raymondzylei.me，通过 GitHub Pages 托管。

## 技术栈

- Vite 8 + React 19 + TypeScript 6
- Material-UI v9（`@mui/material`、`@mui/icons-material`、`@mui/lab`）
- i18next + react-i18next（中/英双语）
- react-router-dom（已安装，目前未在 App 中使用路由）

## 命令

```bash
pnpm run dev      # 启动开发服务器
pnpm run build    # 类型检查 + 生产构建
pnpm run lint     # ESLint
pnpm run preview  # 本地预览生产构建
```

项目使用 pnpm 作为包管理器（`pnpm-lock.yaml` 是唯一锁文件，`package-lock.json` 已删除，不要再 `npm install`）。

## 架构

单页应用，所有内容在一个页面中分为 6 个区块，通过导航栏平滑滚动定位。

```
src/
├── main.tsx          # 入口：加载 i18n、Roboto 字体、渲染 <App />
├── App.tsx           # 根组件：MUI 主题 + Layout 包裹各区块组件
├── theme.ts          # MUI 主题：亮/暗双色方案、紫色主色调
├── hooks/
│   └── useTilt.ts    # 3D 倾斜 hook（rAF 插值，最大 ±5°，prefers-reduced-motion 自动禁用）
├── i18n/
│   ├── i18n.ts       # i18next 初始化，语言偏好持久化到 localStorage
│   ├── en.json       # 英文翻译
│   └── zh.json       # 中文翻译
├── components/
│   ├── Layout.tsx    # 顶部导航栏（吸顶）、移动端抽屉菜单、返回顶部按钮、语言/主题切换、全局背景层
│   ├── BackgroundOrbs.tsx  # 2 个模糊光球背景层（挂载在 Layout，JS 边界碰撞 + 鼠标视差）
│   ├── Hero.tsx      # 头像 + 社交链接 + CTA 按钮
│   ├── Skills.tsx    # 按类别分组展示技能标签
│   ├── Qualifications.tsx  # 教育经历时间线（桌面端交替布局，移动端卡片）
│   ├── Academic.tsx  # 学术成就/竞赛（按类别折叠面板）
│   ├── Portfolio.tsx # 项目卡片网格
│   └── Contact.tsx   # 联系信息 + 有用链接
└── data/
    ├── skills.ts     # 技能数据及按类别查询函数
    ├── timeline.ts   # 教育经历时间线数据
    ├── achievements.ts # 竞赛/学术成就数据
    ├── projects.ts   # 项目作品数据（当前为空占位）
    ├── social.ts     # 社交媒体链接
    └── contact.ts    # 联系页面链接
```

## 国际化

所有面向用户的文本必须通过 `useTranslation()` 的 `t()` 函数获取，并在 `en.json` 和 `zh.json` 中同时添加翻译条目。语言选择自动保存到 `localStorage` 的 `language` 键。

## 主题

MUI 主题支持亮/暗模式，通过 `useColorScheme()` 切换。主色为紫色（亮色模式 `#7c3aed`，暗色模式 `#a78bfa`）。组件使用 MUI 的 `styled()` API 自定义样式，不使用 CSS 文件。

## 部署

通过 GitHub Actions（`.github/workflows/deploy-pages.yml`）自动部署到 GitHub Pages。自定义域名为 `raymondzylei.me`（在 `CNAME` 文件中配置）。构建输出到 `dist/` 目录。

## 动效约定

所有动效遵循"克制"原则，避免炫技：

- **卡片 3D 倾斜**用 `src/hooks/useTilt.ts`，最大 ±5°，rAF 平滑插值。已应用到的卡片：Hero CTA、SkillPaper、TimelineCard（桌面 + 移动）、AchievementCard、StyledProjectCard、ContactPaper。
- **不要在 hover 中再叠加 `transform: translateY/translateX`**——会和 `useTilt` 的 inline transform 冲突，保留 `boxShadow` / `border` / `color` 等其他视觉反馈即可。
- **背景光球**固定 2 个（紫色 + 蓝色），速度 0.35-0.55 px/frame，撞视口边缘反弹；鼠标视差 ±20px 且每个光球系数不同（1.0 / -0.6）。
- **移动端（`pointer: coarse`）自动退化**：3D 倾斜不触发（无 mousemove），鼠标视差不监听。
- **所有动效尊重 `prefers-reduced-motion: reduce`**：`useTilt` 直接 return，`BackgroundOrbs` 通过 CSS 媒体查询关闭 keyframe。

## TypeScript 注意事项

`tsconfig.app.json` 启用了 `strict`、`noUnusedLocals`、`noUnusedParameters`、`verbatimModuleSyntax`。常见踩坑：

- **循环里需要 ref 必须抽子组件**：`useTilt()`（或任何 hook）只能在组件顶层调用，不能写在 `.map()` 里。要给循环渲染的每张卡片抽一个子组件（如 `SkillCategory`、`AchievementCardView`、`ProjectCardView`、`DesktopTimelineItem` / `MobileTimelineItem`）。
- **`useRef<T>(null)` 实际返回 `RefObject<T | null>`**：泛型 hook 想暴露 `RefObject<T>` 给消费者（这样能直接 `<Component ref={ref} />` 透传到任意元素类型），需要在 return 处加 `return ref as RefObject<T>` 断言。
- **同名类型冲突**：`TimelineItem` 在 `@mui/lab` 和 `../data/timeline` 都存在，用 `import type { TimelineItem as TimelineDataItem } from '../data/timeline'` 别名区分。