# 代码结构优化设计（不做大规模重构）

**日期**：2026-09-05
**状态**：已确认（5 节设计逐节获用户批准）
**范围**：消除重复代码、提升文件内聚性、同步文档漂移、为关键组件补测试。**不改任何运行时行为与视觉。**

## 背景与目标

项目健康度良好（~3900 行 / 40 文件，共享模式已立住，53 测试全绿）。本次优化面向三类后续开发：**充实现有内容**、**视觉/交互迭代**、**泛泛整洁**。

用户确认的约束：

- 红线：只要不改变行为，怎么改都行（最宽松档）
- 不做 feature 级目录重组（方案 C 已否决）
- 验证标准：现有测试全绿 + 关键组件补测试

痛点清单（审计结论，按优先级）：

1. `Qualifications.tsx`：Desktop/Mobile TimelineItem ~90% 重复
2. `Contact.tsx`：两卡片骨架与文本块重复
3. `theme.ts` 254 行混装 5 类职责
4. `ResumePage.tsx` 355 行单文件装页面 + 4 个子组件
5. `CLAUDE.md` 文档漂移（缺 SoftChip、缺 7 个测试文件、TODO 清单过时）

## 第 1 节：Qualifications 去重

`DesktopTimelineItem` / `MobileTimelineItem` 合并为单一 `TimelineItemCard`：

```tsx
const TimelineItemCard: React.FC<{
  item: TimelineDataItem;
  index: number;
  variant: 'desktop' | 'mobile';
}>
```

差异点收敛为两个条件：accent 方向（desktop=`'left'` / mobile=`'top'`）、是否渲染 `<SchoolIcon>` 日期行（仅 mobile）。内容 JSX 单一来源。

**不变量**：

- DOM 结构、CSS、reveal stagger 延迟（`index * 60`）不变
- 证书按钮 fallback 链 `certLabel || t('qualifications.download')` 不变
- `useMediaQuery(theme.breakpoints.down('sm'))` 断点不变
- 桌面版仍包在 `<TimelineItem>` / `<TimelineSeparator>` 外壳里（外壳归 `Qualifications` 主组件）

预期：`Qualifications.tsx` 137 → ~90 行。

## 第 2 节：Contact 去重

抽两个**不导出**的局部组件（留在 `Contact.tsx` 内）：

- `CardIntro` — `{ title, description }` 标题+描述块
- `LinkText` — `{ name, label }` 右侧文本块（两卡完全相同的那段）

行渲染本体（LiquidGlassButton 版 vs `<a>` 方形 icon 版）差异过大，**不强行合并**——避免造出带多个布尔开关的伪抽象。两卡各自的 `useTilt` / `useReveal` ref 保留。

预期：`Contact.tsx` 191 → ~155 行。

## 第 3 节：theme.ts 拆目录（桶文件保持导入零修改）

目标结构：

```
src/theme.ts          ← 原地变纯 re-export 桶文件（~20 行）
src/theme/
├── tokens.ts         # easing / duration / zIndex / DISPLAY_FONT / HEADING_FONT / BODY_FONT
├── glass.ts          # glass() / glassHoverShadow() / focusVisibleRing() / ctaButtonSx
├── palette.ts        # createTheme(...) + responsiveFontSizes → default export
└── overrides.ts      # MuiButton / MuiIconButton / MuiMenuItem / MuiChip / MuiAccordionSummary / MuiCssBaseline
```

**硬约束**：

1. 所有现有 `import ... from '../theme'`（含 `import theme from '../theme'`、Contact 的 `import { easing, default as theme }`、`theme.test.ts`）**零修改**。
2. 拆分线按现有代码天然边界，不重排语句。`palette.ts` 从 `./glass` / `./tokens` 导入所需符号；`overrides.ts` 与 `palette.ts` 的接线（components 对象常量 vs 函数注入）实施时按最小牵动原则定。
3. 踩坑注释必须随代码迁移：`cssVariables: false` 回归警告、`focusVisibleRing` 的 dark-override 顶层 sibling selector 说明、`MuiCssBaseline` 的「NEVER set html font-size」警告。
4. `theme.test.ts` 零修改照跑。
5. `vite.config.ts` 颜色注入只依赖 `src/styles/colors.ts`，不受影响。

**验证**：typecheck + 全部测试 + `pnpm run build` 成功。

## 第 4 节：ResumePage 拆子组件

4 个纯展示子组件（`SectionTitle` / `EducationItem` / `AwardItem` / `SkillGroup`）移到：

```
src/components/resume/ResumeBits.tsx   # 4 个组件同文件（各 20-50 行，不拆 4 个文件）
```

- `ResumePage.tsx` **留原位**（`src/components/ResumePage.tsx`）——App.tsx lazy import 与文档引用零改动；瘦身到 ~190 行（页面编排 + 数据映射 + GlobalStyles + 打印规则）。
- 颜色常量 `INK/SUB/LINE/PAPER/CHIP_BG/CHIP_INK`（取自 `colors.ts` 的 `RESUME` 命名空间）移入 `ResumeBits.tsx`；`C.paperShadow` 仍归 ResumePage。
- 两个 label 常量（`PROGRAMMING_LANGUAGES_LABEL` / `LANGUAGES_LABEL`）随 `SkillGroup` 走。
- 子组件保持纯数据 props；固定英文 `getFixedT('en')` 取数逻辑留在 ResumePage。行为不变。

## 第 5 节：补测试 + CLAUDE.md 同步

**新增 3 个测试文件**（Vitest + Testing Library，参照现有组件测试写法）：

| 文件 | 覆盖 |
|---|---|
| `src/components/Qualifications.test.tsx` | 桌面/移动双布局（mock `useMediaQuery`）；有 `file` 出下载按钮、无则不出 |
| `src/components/Contact.test.tsx` | 两卡片标题/描述、socialLinks 行、contactLinks 行 |
| `src/components/resume/ResumeBits.test.tsx` | 三个数据驱动子组件（EducationItem / AwardItem / SkillGroup）的文本渲染、bullet `\n` 拆行；`SectionTitle` 纯展示无数据 props，不单独测 |

预期测试数 53 → ~65。

**CLAUDE.md 同步**（只改事实漂移）：

1. 架构图补 `SoftChip.tsx` / `resume/ResumeBits.tsx`；`theme.ts` 行标注「桶文件，实现在 `src/theme/`」
2. 测试清单补齐全部文件（+7 既有 +3 新增）
3. 「占位数据约定」更新：JSON `_TODO_` 机制保留但当前无实例；TS TODO 只剩 `theme.ts` secondary 一处
4. 「毛玻璃模式」「主题」章节补充实现位置说明

**验证门禁**（每节独立提交，每次全过）：

```
pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check
```

## 提交策略

沿用现有惯例：feature branch → 每节一个 commit（共 4 个结构 commit + 1 个 CLAUDE.md commit，测试随所属节提交）→ `--no-ff` merge 回 main → push。

## 不做的事

- 不做 feature 级目录重组（方案 C，已否决）
- 不引入新依赖
- 不改任何 i18n key、数据结构、视觉样式、动效参数
- 不为纯结构搬移写快照测试
