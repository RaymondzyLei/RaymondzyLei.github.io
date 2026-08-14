# 代码健康度改进设计 — homepage

> 日期：2026-08-14
> 状态：已批准，待用户审阅 spec → 转 writing-plans 出实施计划
> 范围：修 bug + 删死代码 + 安全 + 小步抽取；**不含**测试补全、不动 `resume.typ`、保留 `Skill.proficiency`、保留手机号

## 背景与动机

经三维度（安全 / 冗余 / 结构）并行审查，项目整体质量高（`glass(theme)`/`revealSx()`/`useTilt`/`useReveal` 约定严格遵守、`verbatimModuleSyntax` 类型导入全绿、无 `dangerouslySetInnerHTML`、无 `any`）。但存在一个实质性能 bug、约 30+ 行死代码、若干重复模板与安全纵深缺口，以及 CLAUDE.md 文档滞后于近期新增（`resume` 路由、`useActiveSection`、`SectionHeading`）。本轮目标：在不进行大规模重构的前提下，为下一步开发扫清障碍。

## 已确认的取舍决策

| 决策点 | 选择 |
|---|---|
| 本轮范围 | A(修 Navbar observer bug) + B(删死代码) + D(安全) + C/E 小步抽取；**不做** F(测试补全) |
| 手机号 `resume.ts:17` | **保留**（已自愿公开） |
| `data.redirects.*.label` + `RedirectRule.label` | **删除**（双向死代码） |
| `Skill.proficiency` 字段 + 8 条数据值 | **保留待用** |
| `resume.typ` 注释块 | **不动**（手动维护的 Typst 模板） |
| `theme.ts` 死 token(`duration.hover`/`standard`/`easeInOut`) | 删除 + 同步删 `theme.test.ts` 对应断言 |
| OG image `avatar.jpg` | **保留**（OG 对 webp 支持差，jpg 兼容性更好；非缺陷） |
| CLAUDE.md 文档漂移 | 修复（属清理，非重构） |

## Commit 策略

采用**方案 1：按依赖顺序分 5 阶段，每阶段一次提交**。共享基元先建 → 消费者接入（纯替换，零行为变化）→ 修 bug+删死代码 → 安全 → 小项+文档。每阶段独立 verify + 回退。

## 阶段设计

### Phase 0 — 共享基元（新建，被多文件依赖）

- **`src/data/sections.ts`**（新）：导出 `SECTIONS = [{ id, labelKey, Component }]` 作为 single source of truth；派生 `SECTION_IDS`（供 `useActiveSection`）。Navbar 与 App 都从此读，消除两份独立注册表。
- **`src/components/CertDownloadButton.tsx`**（新）：把 `Qualifications.tsx:24-46` 的 `CertDownloadButton` 提至此共享位置，`Academic` 复用（替代 `Academic.tsx:88-105` 的内联 Button）。
- **`src/components/Section.tsx`**（新）：`<Section id title>{children}</Section>`，封装 `Box[component=section] + Container + SectionHeading + revealSx(visible)`。5 个 section（Skills/Qualifications/Academic/Portfolio/Contact）复用。
- **`src/theme.ts`**：加 `focusVisibleRing(offset = 2)` helper（生成 `'&:focus-visible' { outline, outlineOffset }`）；加 `ctaButtonSx` 常量，覆盖 NotFound + RedirectPage 的两个 CTA（三元组 `textTransform:'none', px:4, py:1.2, fontSize:'1rem', fontWeight:600`）。Hero 的 `StyledButton` 是 `py:1.5` 变体，尺寸不同，**不并入** `ctaButtonSx`，保留独立。

### Phase 1 — 消费者接入（纯替换，零行为变化）

- `Navbar.tsx:95` + `App.tsx:73-79`：改读 `SECTIONS`（消除两份注册表）。
- `Academic.tsx:88-105`：内联 Button → `<CertDownloadButton file={...} />`。
- `Skills/Qualifications/Academic/Portfolio/Contact`：section 外壳 → `<Section>`。
- `theme.ts` 5 个组件（`MuiButton`/`MuiIconButton`/`MuiMenuItem`/`MuiChip`/`MuiAccordionSummary`）：focus-visible → `...focusVisibleRing()`。
- `NotFound/RedirectPage`：CTA sx → `ctaButtonSx`（Hero 的 `StyledButton` 保留独立，见 Phase 0 说明）。
- `Navbar.tsx:8-11` `LANGUAGES` → 从 `i18n` 的 `SUPPORTED_LANGUAGES` 派生（消除重复源）。

### Phase 2 — 修 bug + 删死代码

**Bug 修复：**
- `Navbar.tsx:106` + `useActiveSection.ts:60`：`SECTION_IDS` 提模块级（Phase 0 已建），`useActiveSection(SECTION_IDS, 64)`；label 仍用 `t()` 动态取。消除每次渲染 `sections.map(s=>s.id)` 产生新数组引用 → effect teardown+recreate IntersectionObserver → 滚动抖动循环。section 越多越严重。

**删除死代码：**
- `src/data/types.ts`：删 `BaseLink`（从未被 import；同时修 CLAUDE.md:75 错误描述）。
- i18n 删 6 组死 key（en+zh 对称删）：
  - `_TODO_about_title` / `_TODO_about_description`（en.json/zh.json:28-29）
  - `contact` 表单 7 key：`name`/`email`/`message`/`send` + `_TODO_nameError`/`_TODO_emailError`/`_TODO_messageError`（en.json/zh.json:56-62）
  - `data.achievements.empty.{title,description,date,details}`（en.json/zh.json:108-113）
  - `skills.frameworks`（en.json/zh.json:33）
  - `data.redirects.{google,the-book-of-answers}.label`（en.json/zh.json:172-175）
- `src/data/redirects.ts`：删 `RedirectRule.label` 字段（与上面 i18n 双向死代码）。
- `src/theme.ts`：删 `duration.hover` / `duration.standard` / `easing.easeInOut`；同步删 `theme.test.ts` 中保护这些死导出的断言。
- `package.json`：移除 devDep `@testing-library/user-event`（grep 零命中）+ 更新 `pnpm-lock.yaml`。
- `src/data/skills.ts` / `Skills.tsx:81`：清 frameworks 注释代码。
- `src/data/redirects.ts:11`：删过期 TODO。
- `src/theme.ts`：合并重复的 secondary palette TODO 注释。

**保留**：`Skill.proficiency`（待用）、`resume.typ`（不动）、手机号（保留）。

### Phase 3 — 安全

- **CSP**（`index.html`）：加 `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'none'">`。CSP 指令以空格分隔（无冒号）。`style-src 'unsafe-inline'` 是 MUI Emotion 运行时注入 `<style>` 所需（改 nonce 方案成本过高，本轮不做）。
- **协议白名单**（`RedirectPage.tsx:31`）：跳转前 `new URL(rule.targetUrl).protocol` 校验，仅允许 `http:`/`https:`；非法则 abort 并走 404 渲染。当前 `REDIRECTS` 全为 https，无行为变化，纯纵深防御。
- **Contact rel**（`Contact.tsx:135-153`）：外部链接补 `target="_blank" rel="noopener noreferrer"`（`url: '#'` 占位除外，避免占位链接误开新标签）。
- **eslint**（`eslint.config.js:26`）：加 `no-restricted-syntax`：
  - `selector: "CallExpression[callee.property.name='scrollIntoView']"`
  - `selector: "CallExpression[callee.object.name='window'][callee.property.name='scrollTo']"`
  把 CLAUDE.md「禁止 `element.scrollIntoView()` 与 `window.scrollTo()`」约定变强制规则。

### Phase 4 — 小项 + 文档

- `Academic.tsx:127`：`{} as Record<string, Achievement[]>` → 用 `Object.values` 分组或给 reduce 显式签名，去除断言。
- `Portfolio.tsx:42`：扫光 `rgba(124,58,237,0.05)` → `alpha(theme.palette.primary.main, 0.05)`（`StyledProjectCard` 在 `styled` 工厂内可拿 theme）。
- `Contact.tsx:149`：硬编码 `0.2s` → `theme.transitions.create(['background-color'], { duration: theme.transitions.duration.shorter, easing: easing.easeOut })`。
- **CLAUDE.md 文档漂移修复**：
  - `App.tsx` 描述补 `resume` 路由（`CLAUDE.md:39`）。
  - `routing.ts` 描述补 `'/resume' → resume`（`CLAUDE.md:41`）。
  - hooks 清单补 `useActiveSection.ts`（`CLAUDE.md:47-50`）。
  - components 清单补 `SectionHeading.tsx`（`CLAUDE.md:56-69`）。
  - 测试清单补 `useActiveSection.test.ts`（`CLAUDE.md:229`）。
  - 动效约定补 nav active-section 高亮段（`useActiveSection` IntersectionObserver 驱动）。
  - `SkillPaper`/`ContactPaper` → 现组件名（`SkillCategory` / `Contact` 的两个 `GlassCard`）（`CLAUDE.md:174`）。
  - 修 `BaseLink` 描述（`CLAUDE.md:75`）。

## 验证策略

每阶段后执行：`pnpm run typecheck && pnpm run lint && pnpm run test:run && pnpm run format:check && pnpm run build`。

行为变化项（Navbar observer 重建、Contact rel、CSP、协议白名单）在阶段说明标注需人工/浏览器核验；本轮所用 API 不支持图像输入，依靠代码审查 + build + typecheck 保证，不进行截图回归。

## Out of Scope

- F 测试补全（`useTilt`/`useReveal`/组件渲染/i18n key 对称测试）—— 用户已排除。
- `resume.typ` 注释块清理 —— 不动。
- `Skill.proficiency` 可视化、手机号去留 —— 保留现状。
- OG image 改 webp —— 经核实 `avatar.jpg` 存在且 OG 兼容性更优，保留。
- 大规模重构（路由客户端化、`noUncheckedIndexedAccess` 全局开启等）—— 不在本轮。
