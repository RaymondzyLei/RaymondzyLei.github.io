# 代码结构优化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 按 spec `docs/superpowers/specs/2026-09-05-code-structure-optimization-design.md` 消除重复代码、拆分 theme.ts 与 ResumePage、补 3 个组件测试、同步 CLAUDE.md——全程零行为/视觉变化。

**Architecture:** 4 个独立结构改动（Qualifications 合并双 TimelineItem、Contact 抽局部组件、theme.ts 拆目录保留桶文件、ResumePage 抽 ResumeBits）+ 1 个文档同步 + merge/push。每个 task 独立提交、独立过全部门禁。

**Tech Stack:** Vite 8 + React 19 + TypeScript 6（strict/noUnusedLocals/verbatimModuleSyntax）、MUI v9、Vitest 4（jsdom）+ Testing Library、pnpm 12。

## Global Constraints

- **零行为/视觉变化**：不改 i18n key、数据结构、DOM 结构、CSS、动效参数、断点。
- **不引入任何新依赖**；包管理只用 pnpm（`pnpm run <script>`，不用 npm/yarn）。
- **每个 task 的验证门禁**（在仓库根 `C:\Users\raymondzylei\Projects\homepage` 执行，全部必须通过才能 commit）：
  ```
  pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check
  ```
  若 `format:check` 失败，先跑 `pnpm run format` 再复跑门禁。
- **导入路径零修改**：所有现有 `from '../theme'` / `from './theme'` 导入保持工作（theme.ts 变桶文件）；`ResumePage.tsx` 位置不动；App.tsx 等外部调用方不改。
- **踩坑注释是资产**：迁移代码时原文注释必须随代码走（`cssVariables: false` 回归警告、focusVisibleRing 的 dark-override 顶层 sibling selector 说明、MuiCssBaseline 的「NEVER set html font-size」警告等）。
- **测试约定**（照抄现有测试的模式）：
  - 用 `renderWithTheme`（`src/test/render.tsx`）渲染，`afterEach(cleanup)`。
  - vitest 不开 globals——显式 `import { describe, it, expect, ... } from 'vitest'`。
  - 组件用到 `useReveal` 时必须 mock `react-intersection-observer`（jsdom 无 IntersectionObserver，真实 useInView 的 effect 也会构造 observer 而抛错），模式见 `src/hooks/useReveal.test.tsx` 的 `vi.hoisted` 写法。
  - 组件用到 `useTranslation` 时 side-effect import `'../i18n/i18n'` 初始化真实翻译（jsdom localStorage 为空 → 默认 'en'，断言用 en.json 的英文文案）。
  - mock matchMedia 用 `vi.stubGlobal('matchMedia', fn)`，`afterEach` 里 `vi.unstubAllGlobals()`。
- **git 惯例**：feature branch（`refactor/code-structure`）→ 每 task 一个 commit（Co-Authored-By 结尾）→ `--no-ff` merge 回 main。
- 环境：Windows + PowerShell；命令在 Git Bash 语法下给出（Bash 工具可用），路径用正斜杠。

---

### Task 1: Qualifications 去重（合并 Desktop/Mobile TimelineItem）

**Files:**
- Modify: `src/components/Qualifications.tsx`（137 行 → ~95 行）
- Test: `src/components/Qualifications.test.tsx`（新建）

**Interfaces:**
- Consumes: 现有 `timelineData`（`src/data/timeline.ts`：id '1'/'3'/'2'，仅 id '3' 有 `file: { path: '/files/nus-sicp-certificate.pdf' }`）、`useTilt`、`useReveal`、`revealSx`、`GlassCard`、`CertDownloadButton`、`Section`、i18n key `data.timeline.<id>.*` 与 `qualifications.download`。
- Produces: `TimelineItemCard`（模块内私有组件，`{ item: TimelineDataItem; index: number; variant: 'desktop' | 'mobile' }`）；`Qualifications` 对外签名不变（无 props 导出组件）。无其他文件依赖其内部结构。

- [ ] **Step 1: 写特征测试（characterization test）**

创建 `src/components/Qualifications.test.tsx`：

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// useReveal -> react-intersection-observer's useInView constructs a real
// IntersectionObserver even under reduced-motion; jsdom lacks the API.
// Mock it (same pattern as useReveal.test.tsx) so we control inView directly.
const { useInViewMock } = vi.hoisted(() => ({ useInViewMock: vi.fn() }));
vi.mock('react-intersection-observer', () => ({
  useInView: (opts: unknown) => useInViewMock(opts),
}));

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Qualifications } from './Qualifications';
import { renderWithTheme } from '../test/render';

beforeEach(() => {
  useInViewMock.mockReturnValue({ ref: { current: null }, inView: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  cleanup();
});

describe('Qualifications', () => {
  it('desktop layout renders timeline cards with titles and institution', () => {
    // setup.ts's matchMedia stub returns matches:false -> useMediaQuery
    // breakpoints.down('sm') is false -> desktop Timeline layout.
    renderWithTheme(<Qualifications />);
    expect(screen.getByText('B.Eng. in Computer Science and Technology')).toBeInTheDocument();
    expect(screen.getByText(/University of Science and Technology of China/)).toBeInTheDocument();
    expect(
      screen.getByText('Structure and Interpretation of Computer Programs (SICP)'),
    ).toBeInTheDocument();
  });

  it('renders a download button only for entries with a file', () => {
    renderWithTheme(<Qualifications />);
    // Only timeline id '3' (SICP) has file.path set.
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/files/nus-sicp-certificate.pdf');
  });

  it('mobile layout renders the same content as stacked cards', () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      media: '(max-width:600px)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }));
    renderWithTheme(<Qualifications />);
    expect(screen.getByText('B.Eng. in Computer Science and Technology')).toBeInTheDocument();
    expect(screen.getByText('Senior High School Education')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', '/files/nus-sicp-certificate.pdf');
  });
});
```

- [ ] **Step 2: 跑测试确认在旧代码上通过（特征测试 = 重构安全网）**

Run: `pnpm run test:run -- src/components/Qualifications.test.tsx`
Expected: 3 个测试全部 PASS（旧代码行为即为断言内容）。

- [ ] **Step 3: 重构——用 `TimelineItemCard` 替换两个重复组件**

将 `src/components/Qualifications.tsx` 整个替换为：

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import SchoolIcon from '@mui/icons-material/School';
import { CertDownloadButton } from './CertDownloadButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { timelineData, type TimelineItem as TimelineDataItem } from '../data/timeline';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { Section } from './Section';

/**
 * Single card renderer for both layouts. Desktop: accent='left' + caption date
 * under the institution; mobile: accent='top' + icon+date row above the title.
 * Content JSX is otherwise identical (was ~90% duplicated before).
 */
const TimelineItemCard: React.FC<{
  item: TimelineDataItem;
  index: number;
  variant: 'desktop' | 'mobile';
}> = ({ item, index, variant }) => {
  const { t } = useTranslation();
  const tiltRef = useTilt();
  const { ref: revealRef, isVisible } = useReveal();
  const isMobile = variant === 'mobile';
  const p = `data.timeline.${item.id}`;
  return (
    <Box ref={revealRef} sx={revealSx(isVisible, index * 60)}>
      <GlassCard accent={isMobile ? 'top' : 'left'} ref={tiltRef} sx={{ p: 3 }}>
        {isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <SchoolIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t(`${p}.date`)}
            </Typography>
          </Box>
        )}
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'primary.main' }}>
          {t(`${p}.title`)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
          {t(`${p}.institution`)}
        </Typography>
        {!isMobile && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}
          >
            {t(`${p}.date`)}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{ mt: 1, color: 'text.secondary', lineHeight: 1.6, whiteSpace: 'pre-line' }}
        >
          {t(`${p}.description`)}
        </Typography>
        {item.file && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <CertDownloadButton
              file={item.file}
              label={t(`${p}.certLabel`, '') || t('qualifications.download')}
            />
          </Box>
        )}
      </GlassCard>
    </Box>
  );
};

export const Qualifications: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Section id="qualifications" title={t('qualifications.title')} maxWidth="md">
      {isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {timelineData.map((item, index) => (
            <TimelineItemCard key={item.id} item={item} index={index} variant="mobile" />
          ))}
        </Box>
      ) : (
        <Timeline position="alternate">
          {timelineData.map((item, index) => (
            <TimelineItem key={item.id}>
              <TimelineSeparator>
                <TimelineDot
                  sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 1 }}
                >
                  <SchoolIcon />
                </TimelineDot>
                {index < timelineData.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent sx={{ py: 2 }}>
                <TimelineItemCard item={item} index={index} variant="desktop" />
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Section>
  );
};
```

- [ ] **Step 4: 跑测试确认重构后仍通过 + 全门禁**

Run: `pnpm run test:run -- src/components/Qualifications.test.tsx` → 3 PASS
Run 门禁：`pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check`
Expected: typecheck 0 错误；56 tests（53+3）全部 PASS；lint/format 0 问题。

- [ ] **Step 5: Commit**

先建分支（本 task 第一个动作，其他 task 都在此分支上继续）：
```bash
git checkout -b refactor/code-structure
```
然后：
```bash
git add src/components/Qualifications.tsx src/components/Qualifications.test.tsx
git commit -m "refactor(qualifications): merge desktop/mobile timeline items into TimelineItemCard

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 2: Contact 去重（抽 CardIntro / LinkText 局部组件）

**Files:**
- Modify: `src/components/Contact.tsx`（191 行 → ~150 行）
- Test: `src/components/Contact.test.tsx`（新建）

**Interfaces:**
- Consumes: `socialLinks`（github/x/email-school/email-personal）、`contactLinks`（4 条，url 含 '#'/https/'/resume'）、`LiquidGlassButton`、`GlassCard`、`useTilt`/`useReveal`/`revealSx`、i18n key `data.social.<id>.{name,label}` / `data.contact.<id>.{name,label}` / `contact.*`。
- Produces: 模块内私有组件 `CardIntro`（`{ title: string; description: string }`）与 `LinkText`（`{ name: string; label: string }`），均不导出。`Contact` 对外签名不变。

- [ ] **Step 1: 写特征测试**

创建 `src/components/Contact.test.tsx`：

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

// Same react-intersection-observer mock rationale as Qualifications.test.tsx
// (useReveal runs inside Section + both cards).
const { useInViewMock } = vi.hoisted(() => ({ useInViewMock: vi.fn() }));
vi.mock('react-intersection-observer', () => ({
  useInView: (opts: unknown) => useInViewMock(opts),
}));

// Side-effect: initialize the real i18n instance (localStorage empty -> 'en').
import '../i18n/i18n';
import { Contact } from './Contact';
import { renderWithTheme } from '../test/render';

beforeEach(() => {
  useInViewMock.mockReturnValue({ ref: { current: null }, inView: true });
});

afterEach(cleanup);

describe('Contact', () => {
  it('renders both card intros', () => {
    renderWithTheme(<Contact />);
    expect(screen.getByText('Connect With Me')).toBeInTheDocument();
    expect(screen.getByText('Useful Links')).toBeInTheDocument();
    // Double-quoted string: the copy contains an apostrophe (I'm).
    expect(
      screen.getByText(
        "Feel free to reach out through any of these channels. I'm always happy to connect and discuss opportunities.",
      ),
    ).toBeInTheDocument();
  });

  it('renders a LiquidGlassButton per social link with its href', () => {
    renderWithTheme(<Contact />);
    // aria-label of LiquidGlassButton = label i18n (the URL text in en.json).
    expect(
      screen.getByRole('link', { name: 'https://github.com/RaymondzyLei' }),
    ).toHaveAttribute('href', 'https://github.com/RaymondzyLei');
    expect(
      screen.getByRole('link', { name: 'https://x.com/RaymondzyLei' }),
    ).toHaveAttribute('href', 'https://x.com/RaymondzyLei');
    expect(screen.getByText('Email (School)')).toBeInTheDocument();
    expect(screen.getByText('Email (Personal)')).toBeInTheDocument();
  });

  it('renders useful-link rows as anchors with their hrefs', () => {
    renderWithTheme(<Contact />);
    const reposRow = screen.getByText('GitHub Repositories').closest('a');
    expect(reposRow).toHaveAttribute('href', 'https://github.com/RaymondzyLei?tab=repositories');
    const resumeRow = screen.getByText('Resume Download').closest('a');
    expect(resumeRow).toHaveAttribute('href', '/resume');
    expect(screen.getByText('Portfolio Website')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认在旧代码上通过**

Run: `pnpm run test:run -- src/components/Contact.test.tsx`
Expected: 3 个测试全部 PASS。

- [ ] **Step 3: 重构——抽 CardIntro / LinkText，行渲染不合并**

将 `src/components/Contact.tsx` 整个替换为：

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import FolderIcon from '@mui/icons-material/Folder';
import { socialLinks } from '../data/social';
import { contactLinks } from '../data/contact';
import { useTilt } from '../hooks/useTilt';
import { useReveal } from '../hooks/useReveal';
import { revealSx } from '../styles/reveal';
import { GlassCard } from './GlassCard';
import { LiquidGlassButton } from './LiquidGlassButton';
import { Section } from './Section';
import { easing, default as theme } from '../theme';

/** Card header: title + description, shared by both contact cards. */
const CardIntro: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
      {description}
    </Typography>
  </>
);

/** Right-side text block of a link row (name + label), shared by both cards. */
const LinkText: React.FC<{ name: string; label: string }> = ({ name, label }) => (
  <Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
      {name}
    </Typography>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const connectTiltRef = useTilt();
  const linksTiltRef = useTilt();
  const { ref: connectCellRef, isVisible: connectVisible } = useReveal();
  const { ref: linksCellRef, isVisible: linksVisible } = useReveal();

  return (
    <Section id="contact" title={t('contact.title')} maxWidth="md" revealDelay={0}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 4,
        }}
      >
        <Box ref={connectCellRef} sx={revealSx(connectVisible, 0)}>
          <GlassCard ref={connectTiltRef} sx={{ p: 3, height: '100%' }}>
            <CardIntro title={t('contact.connectTitle')} description={t('contact.connectDesc')} />
            <Stack spacing={2}>
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Box
                    key={link.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <LiquidGlassButton
                      icon={<Icon />}
                      label={t(`data.social.${link.id}.label`)}
                      href={link.url}
                    />
                    <LinkText
                      name={t(`data.social.${link.id}.name`)}
                      label={t(`data.social.${link.id}.label`)}
                    />
                  </Box>
                );
              })}
            </Stack>
          </GlassCard>
        </Box>

        <Box ref={linksCellRef} sx={revealSx(linksVisible, 60)}>
          <GlassCard ref={linksTiltRef} sx={{ p: 3, height: '100%' }}>
            <CardIntro title={t('contact.linksTitle')} description={t('contact.linksDesc')} />
            <Stack spacing={2}>
              {contactLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Box
                    key={link.id}
                    component="a"
                    href={link.url}
                    {...(link.url.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      textDecoration: 'none',
                      p: 1,
                      borderRadius: 1,
                      transition: theme.transitions.create(['background-color'], {
                        duration: theme.transitions.duration.shorter,
                        easing: easing.easeOut,
                      }),
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.contrastText',
                      }}
                    >
                      {Icon ? <Icon /> : <FolderIcon />}
                    </Box>
                    <LinkText
                      name={t(`data.contact.${link.id}.name`)}
                      label={t(`data.contact.${link.id}.label`)}
                    />
                  </Box>
                );
              })}
            </Stack>
          </GlassCard>
        </Box>
      </Box>
    </Section>
  );
};
```

刻意不做的事：connect 行（LiquidGlassButton）与 links 行（`<a>` 方形 icon 盒）**不**合并成一个带开关的组件——两个行渲染的视觉结构差异太大，参数化伪抽象比重复更难读。

- [ ] **Step 4: 跑测试 + 全门禁**

Run: `pnpm run test:run -- src/components/Contact.test.tsx` → 3 PASS
Run 门禁：`pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check`
Expected: 59 tests 全 PASS，lint/format 干净。

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.tsx src/components/Contact.test.tsx
git commit -m "refactor(contact): extract CardIntro and LinkText shared blocks

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 3: theme.ts 拆目录（桶文件保持导入零修改）

**Files:**
- Create: `src/theme/tokens.ts`、`src/theme/glass.ts`、`src/theme/overrides.ts`、`src/theme/palette.ts`
- Modify: `src/theme.ts`（254 行 → ~10 行桶文件）
- Test: 无新测试——`src/theme.test.ts`（89 行，import 自 `./theme`）是安全网，**零修改**必须照跑。

**Interfaces:**
- Consumes: `src/styles/colors.ts` 的 `ACCENT`/`ACCENT_RGB`/`TEXT_RGB`/`SURFACE`/`TEXT`/`INFO`。**注意新路径**：`src/theme/` 内引用 colors 用 `'../styles/colors'`（原 theme.ts 是 `'./styles/colors'`）。
- Produces（桶文件 `src/theme.ts` 对外契约，与拆分前完全一致）：
  - default export：MUI `Theme`（responsiveFontSizes 处理后）
  - named：`glass(theme: Theme): CSSProperties`、`glassHoverShadow(theme: Theme): string`、`focusVisibleRing(offset?): Record<string, CSSObject>`、`ctaButtonSx: SxProps`、`easing`、`duration`、`zIndex`、`DISPLAY_FONT`
- 模块间：`overrides.ts` 从 `./glass` 导入 `focusVisibleRing`、从 `./tokens` 导入 `duration`/`easing`；`palette.ts` 从 `./overrides` 导入 `componentOverrides: Components<Theme>`。

- [ ] **Step 1: 创建 `src/theme/tokens.ts`**

```ts
/** Hero display name font (Playfair Display bold italic). */
export const DISPLAY_FONT = '"Playfair Display", serif';

/**
 * Easing tokens (emil-design-eng: built-in CSS easings are too weak).
 * Use these for all UI transitions instead of `ease` / `ease-out` defaults.
 */
export const easing = {
  /** Strong ease-out for entering elements & feedback (dropdowns, hovers). */
  easeOut: 'cubic-bezier(0.23, 1, 0.32, 1)',
} as const;

/** Duration tokens (emil: UI animations stay under 300ms). */
export const duration = {
  press: 160, // button :active feedback
} as const;

/**
 * z-index scale (ui-ux-pro-max `z-index-management`).
 * MUI defaults: appBar 1100, drawer 1200, modal 1300, snackbar 1400, tooltip 1500.
 * Use these named tokens instead of magic numbers so layering stays auditable.
 */
export const zIndex = {
  backgroundOrb: 0, // behind all content
  backToTop: 1150, // above AppBar (1100), below drawer/modal
} as const;
```

- [ ] **Step 2: 创建 `src/theme/glass.ts`**

```ts
import type { CSSProperties } from 'react';
import { alpha } from '@mui/material/styles';
import type { Theme, SxProps } from '@mui/material/styles';
import type { CSSObject } from '@emotion/react';
import { ACCENT } from '../styles/colors';

export const glass = (theme: Theme): CSSProperties => ({
  backgroundColor: alpha(
    theme.palette.mode === 'dark'
      ? theme.palette.background.default
      : theme.palette.background.paper,
    0.65,
  ),
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid',
  borderColor: alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.12 : 0.5),
  boxShadow:
    theme.palette.mode === 'dark'
      ? `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.08)}`
      : `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.6)}, 0 8px 32px ${alpha(ACCENT.light, 0.08)}`,
});

/**
 * Hover shadow for glass surfaces -- same violet family as glass()'s static
 * shadow, deepened one notch. Replaces MUI's neutral grey shadows on hover
 * (GlassCard / StyledProjectCard / StyledAccordion).
 */
export const glassHoverShadow = (theme: Theme): string =>
  theme.palette.mode === 'dark'
    ? `inset 0 1px 0 0 ${alpha(theme.palette.common.white, 0.1)}, 0 12px 36px ${alpha(ACCENT.dark, 0.1)}`
    : `0 12px 40px ${alpha(ACCENT.light, 0.16)}`;

/**
 * Focus-visible ring (ui-ux-pro-max `focus-states`). Static dual-selector CSS
 * keyed off <html data-mui-color-scheme> — theme callbacks cannot read the
 * runtime mode (cssVariables is off, see palette.ts). Spread into a
 * component's `styleOverrides.root`.
 */
export const focusVisibleRing = (offset = 2): Record<string, CSSObject> => ({
  '&:focus-visible': {
    outline: `2px solid ${ACCENT.light}`,
    outlineOffset: offset,
  },
  // Dark override as a TOP-LEVEL sibling selector: MUI's styleOverrides
  // pipeline drops nested selector keys inside '&:focus-visible'.
  '[data-mui-color-scheme="dark"] &:focus-visible': {
    outlineColor: ACCENT.dark,
  },
});

/** Shared CTA button sx (NotFound + RedirectPage). Hero keeps its own. */
export const ctaButtonSx: SxProps = {
  textTransform: 'none',
  px: 4,
  py: 1.2,
  fontSize: '1rem',
  fontWeight: 600,
};
```

- [ ] **Step 3: 创建 `src/theme/overrides.ts`**

```ts
import type { Components, Theme } from '@mui/material/styles';
import { ACCENT_RGB, TEXT_RGB } from '../styles/colors';
import { focusVisibleRing } from './glass';
import { duration, easing } from './tokens';

/**
 * Component-level styleOverrides, consumed by palette.ts's createTheme.
 * Comments below are load-bearing pitfall records -- keep them with the code.
 */
export const componentOverrides: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: {
        // emil: buttons must feel responsive -- scale down on press.
        // NOTE: Hero CTA's StyledButton mounts useTilt, which writes an inline
        // `el.style.transform` (perspective + rotateX/Y) on mousemove. Inline
        // styles override this CSS `:active`, so the CTA won't visibly scale on
        // press -- the tilt itself provides the interaction feedback there.
        transition: `transform ${duration.press}ms ${easing.easeOut}`,
        '&:active': {
          transform: 'scale(0.97)',
        },
        // H2: global focus-visible policy (ui-ux-pro-max `focus-states` CRITICAL).
        ...focusVisibleRing(2),
      },
    },
  },
  // Global focus-visible policy (ui-ux-pro-max `focus-states` CRITICAL).
  // Uses the palette CSS variable so the ring follows light/dark primary.
  MuiIconButton: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(-2),
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        ...focusVisibleRing(2),
      },
    },
  },
  // Decorative global styles: violet selection tint + slim rounded scrollbar.
  // Dual-selector static rules keyed off <html data-mui-color-scheme> (the
  // runtime theme is unavailable in styleOverrides — see palette.ts).
  // Pseudo-elements only -- NEVER set html font-size here (emotion would
  // override the static fonts.css rem baseline).
  MuiCssBaseline: {
    styleOverrides: {
      '::selection': {
        backgroundColor: `rgba(${ACCENT_RGB.light}, 0.20)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${ACCENT_RGB.dark}, 0.30)`,
        },
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `rgba(${TEXT_RGB.light}, 0.18) transparent`,
        '[data-mui-color-scheme="dark"] &': {
          scrollbarColor: `rgba(${TEXT_RGB.dark}, 0.18) transparent`,
        },
      },
      '::-webkit-scrollbar': { width: 10, height: 10 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        borderRadius: 999,
        backgroundColor: `rgba(${TEXT_RGB.light}, 0.18)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${TEXT_RGB.dark}, 0.18)`,
        },
      },
      '::-webkit-scrollbar-thumb:hover': {
        backgroundColor: `rgba(${TEXT_RGB.light}, 0.28)`,
        '[data-mui-color-scheme="dark"] &': {
          backgroundColor: `rgba(${TEXT_RGB.dark}, 0.28)`,
        },
      },
    },
  },
};
```

- [ ] **Step 4: 创建 `src/theme/palette.ts`**

```ts
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { ACCENT, SURFACE, TEXT, INFO } from '../styles/colors';
import { componentOverrides } from './overrides';

const HEADING_FONT = '"Ubuntu Mono", "Cascadia Code", "Fira Code", monospace';
const BODY_FONT = '"Neo Sans Pro", "SmileySans", sans-serif';
const headingTypography = { fontFamily: HEADING_FONT };

let theme = createTheme({
  // NOTE: cssVariables is intentionally OFF. With it on, `theme.palette` in
  // styled()/sx callbacks freezes at the default (light) scheme, breaking
  // every `palette.mode === 'dark'` branch (glass(), SoftChip, hover shadows).
  // Mode-dependent CSS that cannot read the runtime theme uses dual-selector
  // rules keyed off data-mui-color-scheme instead (see glass.ts); App.tsx
  // keeps that attribute in sync with useColorScheme().
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: ACCENT.light,
        },
        // TODO: secondary palette currently mirrors primary; pick a real accent when needed
        secondary: {
          main: ACCENT.light,
        },
        info: { main: INFO.main },
        background: {
          default: SURFACE.light.default,
          paper: SURFACE.light.paper,
        },
        text: {
          primary: TEXT.light.primary,
          secondary: TEXT.light.secondary,
        },
      },
    },
    dark: {
      palette: {
        // Blue-teal accent — same family as orb2 but NOT the same value (orb2
        // is the framework-default info blue, pinned above as INFO.main).
        // Orb1 keeps its violet via ACCENT.orbDark in BackgroundOrbs.
        primary: {
          main: ACCENT.dark,
        },
        secondary: {
          main: ACCENT.dark,
        },
        info: { main: INFO.main },
        background: {
          default: SURFACE.dark.default,
          paper: SURFACE.dark.paper,
        },
        text: {
          primary: TEXT.dark.primary,
          secondary: TEXT.dark.secondary,
        },
      },
    },
  },
  typography: {
    fontFamily: BODY_FONT,
    // Optical typography (apple-design §15): tracking tightens as size grows,
    // leading tracks size inversely. Weight+size+leading as a set, not size alone.
    h1: { ...headingTypography, letterSpacing: '-0.03em', lineHeight: 1.05 },
    h2: { ...headingTypography, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h3: { ...headingTypography, letterSpacing: '-0.015em', lineHeight: 1.2 },
    h4: { ...headingTypography, letterSpacing: '-0.01em', lineHeight: 1.25 },
    h5: { ...headingTypography, letterSpacing: '-0.005em', lineHeight: 1.3 },
    h6: { ...headingTypography, letterSpacing: '0', lineHeight: 1.4 },
  },
  shape: {
    borderRadius: 16,
  },
  components: componentOverrides,
});

theme = responsiveFontSizes(theme);

export default theme;
```

- [ ] **Step 5: 把 `src/theme.ts` 重写为桶文件**

整文件替换为：

```ts
// Barrel file: implementation lives in src/theme/ (tokens / glass / palette /
// overrides). All `from '../theme'` / `from './theme'` imports keep working —
// feature code must keep importing from this barrel, never from './theme/*'.
export { glass, glassHoverShadow, focusVisibleRing, ctaButtonSx } from './theme/glass';
export { easing, duration, zIndex, DISPLAY_FONT } from './theme/tokens';
import theme from './theme/palette';

export default theme;
```

（Windows 文件系统允许 `theme.ts` 与 `theme/` 共存——文件名不同。）

- [ ] **Step 6: 全门禁 + 生产构建**

Run: `pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check`
Expected: 59 tests 全 PASS（`theme.test.ts` 零修改通过——它 import 的 `glass`/`easing`/`duration`/default theme 都由桶文件转发）。
Run: `pnpm run build`
Expected: 构建成功（`tsc -b` 会抓桶文件的导出遗漏；产物大小与拆分前相当）。

- [ ] **Step 7: Commit**

```bash
git add src/theme.ts src/theme/
git commit -m "refactor(theme): split theme.ts into src/theme/ modules with barrel re-export

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 4: ResumePage 拆子组件到 resume/ResumeBits

**Files:**
- Create: `src/components/resume/ResumeBits.tsx`
- Modify: `src/components/ResumePage.tsx`（355 行 → ~200 行，**位置不动**）
- Test: `src/components/resume/ResumeBits.test.tsx`（新建）

**Interfaces:**
- Consumes: `colors.ts` 的 `RESUME` 命名空间（`C.ink`/`C.sub`/`C.line`/`C.paper`/`C.chipBg`/`C.chipInk`/`C.paperShadow`）；ResumePage 现有数据映射逻辑。
- Produces（`src/components/resume/ResumeBits.tsx` 导出，Task 4 的 ResumePage 按此消费）：
  - `SectionTitle: React.FC<{ children: React.ReactNode }>`
  - `EducationItem: React.FC<{ institution: string; location: string; degree: string; period: string; bullets: string[] }>`
  - `AwardItem: React.FC<{ title: string; level: string; date: string; details: string }>`
  - `SkillGroup: React.FC<{ label: string; items: { text: string; strong?: boolean }[] }>`
  - `PROGRAMMING_LANGUAGES_LABEL = 'Programming Languages'`、`LANGUAGES_LABEL = 'Languages'`（string 常量）
- 对外：`ResumePage` 仍是 `src/components/ResumePage.tsx` 的 named export，App.tsx 的 lazy import 不变。

**与 spec 的一处偏差（有意）**：spec 原文说 `PAPER` 常量移入 ResumeBits——实际 `PAPER` 只被页面外壳（GlobalStyles + paper Box）使用，四个子组件都不用它。颜色单一来源仍是 colors.ts，各文件只声明自己用到的别名：ResumeBits 拿 `INK/SUB/LINE/CHIP_BG/CHIP_INK`，ResumePage 拿 `INK/LINE/PAPER`。

- [ ] **Step 1: 写失败测试（此时 `./resume/ResumeBits` 尚不存在）**

创建 `src/components/resume/ResumeBits.test.tsx`：

```tsx
import { describe, it, expect, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { EducationItem, AwardItem, SkillGroup } from './ResumeBits';
import { renderWithTheme } from '../../test/render';

afterEach(cleanup);

describe('EducationItem', () => {
  it('renders institution, location, degree, period and bullet list', () => {
    renderWithTheme(
      <EducationItem
        institution="USTC"
        location="Hefei"
        degree="B.Eng. CS"
        period="2025 - Present"
        bullets={['First line', 'Second line']}
      />,
    );
    expect(screen.getByText('USTC')).toBeInTheDocument();
    expect(screen.getByText('Hefei')).toBeInTheDocument();
    expect(screen.getByText('B.Eng. CS')).toBeInTheDocument();
    expect(screen.getByText('2025 - Present')).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('First line');
  });
});

describe('AwardItem', () => {
  // textContent = concatenation of rendered text in JSX order:
  // [title, date] row, level, then details (when non-empty).
  it('renders title, level, date and details', () => {
    const { container } = renderWithTheme(
      <AwardItem title="Second Prize" level="National" date="Summer 2026" details="OS track" />,
    );
    expect(container.textContent).toBe('Second PrizeSummer 2026NationalOS track');
  });

  it('omits the details line when details is empty', () => {
    const { container } = renderWithTheme(
      <AwardItem title="Second Prize" level="National" date="Summer 2026" details="" />,
    );
    expect(container.textContent).toBe('Second PrizeSummer 2026National');
  });
});

describe('SkillGroup', () => {
  it('renders the label and every skill item', () => {
    renderWithTheme(
      <SkillGroup
        label="Programming Languages"
        items={[{ text: 'C++', strong: true }, { text: 'Rust' }]}
      />,
    );
    expect(screen.getByText('Programming Languages')).toBeInTheDocument();
    expect(screen.getByText('C++')).toBeInTheDocument();
    expect(screen.getByText('Rust')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm run test:run -- src/components/resume/ResumeBits.test.tsx`
Expected: FAIL —— `Cannot find module './ResumeBits'`（或 TS 解析错误）。

- [ ] **Step 3: 创建 `src/components/resume/ResumeBits.tsx`**

四个子组件的 JSX **原样照搬**自 `src/components/ResumePage.tsx` 当前定义（第 54-155 行），只加 `export` 和模块头。完整内容：

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { RESUME as C } from '../../styles/colors';

/**
 * Presentational building blocks of the /resume page (ResumePage.tsx).
 * Pure data props; the print palette comes from colors.ts's RESUME namespace
 * (mode-independent by design). All user-facing text is resolved by the caller
 * (ResumePage's getFixedT('en')) and passed in as plain strings.
 */

// Print palette — values live in src/styles/colors.ts (RESUME namespace),
// the app-wide color single source; mode-independent by design.
const INK = C.ink;
const SUB = C.sub;
const LINE = C.line;
const CHIP_BG = C.chipBg;
const CHIP_INK = C.chipInk;

// Skill sub-group labels (fixed English; resume doesn't translate).
export const PROGRAMMING_LANGUAGES_LABEL = 'Programming Languages';
export const LANGUAGES_LABEL = 'Languages';

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    sx={{
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontSize: '0.8rem',
      fontWeight: 700,
      color: SUB,
      borderBottom: `1px solid ${LINE}`,
      pb: 0.5,
      mb: 2,
      mt: 5,
    }}
  >
    {children}
  </Typography>
);

export const EducationItem: React.FC<{
  institution: string;
  location: string;
  degree: string;
  period: string;
  bullets: string[];
}> = ({ institution, location, degree, period, bullets }) => (
  <Box sx={{ mb: 2.5 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Box>
        <Typography component="span" sx={{ fontWeight: 700, color: INK, fontSize: '1rem' }}>
          {institution}
        </Typography>
        <Typography component="span" sx={{ color: SUB, fontSize: '0.85rem', ml: 1 }}>
          {location}
        </Typography>
      </Box>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
        {period}
      </Typography>
    </Box>
    <Typography sx={{ color: INK, fontSize: '0.9rem', mt: 0.25 }}>{degree}</Typography>
    <Box component="ul" sx={{ m: 0, pl: 3, mt: 0.5 }}>
      {bullets.map((b) => (
        <Box
          component="li"
          key={b}
          sx={{ color: SUB, fontSize: '0.85rem', lineHeight: 1.6, mt: 0.25 }}
        >
          {b}
        </Box>
      ))}
    </Box>
  </Box>
);

export const AwardItem: React.FC<{
  title: string;
  level: string;
  date: string;
  details: string;
}> = ({ title, level, date, details }) => (
  <Box sx={{ borderLeft: `2px solid ${LINE}`, pl: 2, mb: 2 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2 }}>
      <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.95rem' }}>{title}</Typography>
      <Typography sx={{ color: SUB, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{date}</Typography>
    </Box>
    <Typography sx={{ color: SUB, fontSize: '0.85rem', mt: 0.25 }}>{level}</Typography>
    {details && (
      <Typography sx={{ color: SUB, fontSize: '0.8rem', mt: 0.25 }}>{details}</Typography>
    )}
  </Box>
);

export const SkillGroup: React.FC<{ label: string; items: { text: string; strong?: boolean }[] }> = ({
  label,
  items,
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography sx={{ fontWeight: 700, color: INK, fontSize: '0.85rem', mb: 0.75 }}>
      {label}
    </Typography>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {items.map((item) => (
        <Typography
          key={item.text}
          component="span"
          sx={{
            fontSize: '0.8rem',
            fontWeight: item.strong ? 700 : 400,
            bgcolor: item.strong ? CHIP_BG : 'transparent',
            color: item.strong ? CHIP_INK : INK,
            border: `1px solid ${item.strong ? CHIP_BG : LINE}`,
            borderRadius: 999,
            px: 1.5,
            py: 0.5,
          }}
        >
          {item.text}
        </Typography>
      ))}
    </Box>
  </Box>
);
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm run test:run -- src/components/resume/ResumeBits.test.tsx`
Expected: 4 个测试全部 PASS。

- [ ] **Step 5: 重写 `src/components/ResumePage.tsx`（删除内联定义，改从 ResumeBits 导入）**

整文件替换为（页面编排与数据接线与现状逐行等价，仅子组件改为导入）：

```tsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import GlobalStyles from '@mui/material/GlobalStyles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import i18n from '../i18n/i18n';
import { timelineData } from '../data/timeline';
import { achievementsData } from '../data/achievements';
import { skillsData, type Skill } from '../data/skills';
import { socialLinks, type SocialLink } from '../data/social';
import {
  resumeAvatar,
  resumePhone,
  resumeContactIds,
  resumeSkillIds,
  resumeStrongSkillIds,
} from '../data/resume';
import { RESUME as C } from '../styles/colors';
import {
  SectionTitle,
  EducationItem,
  AwardItem,
  SkillGroup,
  PROGRAMMING_LANGUAGES_LABEL,
  LANGUAGES_LABEL,
} from './resume/ResumeBits';

/**
 * Standalone resume preview page (/resume).
 *
 * Data-driven: education / awards / skills / social contacts are reused from
 * src/data (timelineData, achievementsData, skillsData, socialLinks) so this
 * page never drifts from the home page. Resume-only fields (full name,
 * location, phone, about, GPA, TOEFL, which skills to bold) live in
 * src/data/resume.ts + the i18n `resume.*` namespace.
 *
 * Fixed English via i18n.getFixedT('en') - the page ignores the active language
 * so it always reads like a printed English résumé. Deliberately decoupled from
 * <Layout>: no Navbar / background orbs / back-to-top / Lenis reveal. Hardcoded
 * light theme (white paper, dark ink) - ignores useColorScheme. Print via
 * browser (Ctrl+P) uses the inline @media print rules below. resume.typ (Typst
 * source) is kept in sync manually for PDF export.
 *
 * Display sub-components (SectionTitle / EducationItem / AwardItem /
 * SkillGroup) live in ./resume/ResumeBits and take plain-string props.
 */

// Print palette — values live in src/styles/colors.ts (RESUME namespace),
// the app-wide color single source; mode-independent by design.
const INK = C.ink;
const LINE = C.line;
const PAPER = C.paper;

export const ResumePage: React.FC = () => {
  // Fixed English: read en resources regardless of the active language.
  const t = i18n.getFixedT('en');

  const contactSocials = resumeContactIds
    .map((id) => socialLinks.find((s) => s.id === id))
    .filter((s): s is SocialLink => Boolean(s));

  const programmingItems = resumeSkillIds
    .map((id) => skillsData.find((s) => s.id === id))
    .filter((s): s is Skill => Boolean(s))
    .map((s) => ({ text: s.name, strong: resumeStrongSkillIds.some((id) => id === s.id) }));

  return (
    <>
      <GlobalStyles
        styles={`
          /* !important: must beat the anti-FOUC inline html[data-mui-color-scheme]
             background and the dark-mode CssBaseline body rule, so no dark
             bars peek above/below the paper in dark mode. */
          html, body { background: ${PAPER} !important; }
          @media print {
            @page { size: A4; margin: 1.5cm; }
            .no-print { display: none !important; }
            .resume-paper {
              box-shadow: none !important;
              border-radius: 0 !important;
              max-width: none !important;
              padding: 0 !important;
              margin: 0 !important;
            }
          }
        `}
      />
      <Box
        className="no-print"
        sx={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: INK,
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 500,
            '&:hover': { color: C.sub },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: '1.1rem' }} />
          {t('resume.backHome')}
        </Link>
      </Box>

      <Box
        className="resume-paper"
        sx={{
          maxWidth: 768,
          mx: 'auto',
          my: { xs: 3, md: 6 },
          px: { xs: 3, md: 6 },
          py: { xs: 4, md: 6 },
          bgcolor: PAPER,
          color: INK,
          boxShadow: C.paperShadow,
          borderRadius: 2,
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: INK, lineHeight: 1.1 }}>
              {t('resume.fullName')}
            </Typography>
            <Typography sx={{ color: C.sub, fontSize: '1.05rem', mt: 0.5 }}>
              {t('resume.tagline')}
            </Typography>
            <Typography sx={{ color: C.sub, fontSize: '0.85rem', mt: 0.25 }}>
              {t('resume.location')}
            </Typography>
          </Box>
          <Avatar
            src={resumeAvatar.src}
            srcSet={resumeAvatar.srcSet}
            alt={t('resume.avatarAlt')}
            variant="rounded"
            sx={{ width: 96, height: 96, flexShrink: 0 }}
          />
        </Box>

        {/* Contact icons */}
        <Box className="no-print" sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
          {contactSocials.map((link) => {
            const Icon = link.icon;
            return (
              <IconButton
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </IconButton>
            );
          })}
          <IconButton
            href={`tel:${resumePhone}`}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ border: `1px solid ${LINE}`, borderRadius: '50%', color: INK }}
          >
            <PhoneIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* About */}
        <section>
          <SectionTitle>{t('resume.section.about')}</SectionTitle>
          <Typography sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.7 }}>
            {t('resume.about')}
          </Typography>
        </section>

        {/* Education */}
        <section>
          <SectionTitle>{t('resume.section.education')}</SectionTitle>
          {timelineData.map((item) => {
            const p = `data.timeline.${item.id}`;
            const bullets = t(`${p}.description`).split('\n').filter(Boolean);
            return (
              <EducationItem
                key={item.id}
                institution={t(`${p}.institution`)}
                location={t(`resume.timelineLocation.${item.id}`)}
                degree={t(`${p}.title`)}
                period={t(`${p}.date`)}
                bullets={bullets}
              />
            );
          })}
        </section>

        {/* Awards & Achievements */}
        <section>
          <SectionTitle>{t('resume.section.awards')}</SectionTitle>
          {achievementsData.map((achievement) => {
            const p = `data.achievements.${achievement.id}`;
            const title = t(`${p}.title`);
            if (!title) return null;
            return (
              <AwardItem
                key={achievement.id}
                title={title}
                level={t(`${p}.description`)}
                date={t(`${p}.date`)}
                details={t(`${p}.details`)}
              />
            );
          })}
        </section>

        {/* Academic Profile */}
        <section>
          <SectionTitle>{t('resume.section.academicProfile')}</SectionTitle>
          <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
            <Box component="li" sx={{ color: INK, fontSize: '0.9rem', lineHeight: 1.6 }}>
              {t('resume.academicProfile')}
            </Box>
          </Box>
        </section>

        {/* Skills */}
        <section>
          <SectionTitle>{t('resume.section.skills')}</SectionTitle>
          <SkillGroup label={PROGRAMMING_LANGUAGES_LABEL} items={programmingItems} />
          <SkillGroup label={LANGUAGES_LABEL} items={[{ text: t('resume.languages') }]} />
        </section>
      </Box>
    </>
  );
};
```

注意：原文件里的本地别名 `SUB` 在页面主体已无使用点（back-link hover、tagline、location 改为内联 `C.sub`），不要保留未使用的 `const SUB`（`noUnusedLocals` 会报错）。

- [ ] **Step 6: 全门禁 + 生产构建**

Run: `pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check`
Expected: 63 tests（59+4）全 PASS，lint/format 干净。
Run: `pnpm run build` → 成功。

- [ ] **Step 7: Commit**

```bash
git add src/components/ResumePage.tsx src/components/resume/
git commit -m "refactor(resume): extract ResumeBits display components

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 5: CLAUDE.md 文档同步

**Files:**
- Modify: `CLAUDE.md`（只改事实漂移，不改约定语义）

**Interfaces:**
- Consumes: Task 1-4 的最终事实（组件清单、测试清单、theme 桶文件、resume/ResumeBits）。
- Produces: 与代码库一致的 CLAUDE.md（后续所有会话的上下文来源）。

- [ ] **Step 1: 架构树修正（theme.ts 行 + 补 SoftChip / ResumeBits）**

`src/` 树中找到 `theme.ts` 行，把：

```
├── theme.ts          # MUI 主题：亮/暗双色方案（色值全部引用 styles/colors.ts）、`glass(theme)` helper、`DISPLAY_FONT` 常量、`shape.borderRadius: 16`
```

替换为：

```
├── theme.ts          # MUI 主题桶文件（re-export，实现拆在 theme/ 目录）
├── theme/            # 主题实现：tokens.ts（动效/z-index/字体 token）、glass.ts（glass/glassHoverShadow/focusVisibleRing/ctaButtonSx）、palette.ts（createTheme + colorSchemes）、overrides.ts（组件级 styleOverrides）——色值全部引用 styles/colors.ts
```

组件树里，在 `Portfolio.tsx` 行之前（按现有字母/职能排列习惯，紧跟 `CertDownloadButton.tsx` 之后）插入两行：

```
│   ├── SoftChip.tsx            # 共享软填充 Chip（tinted primary 背景 + inset ring，Skills/Portfolio/Academic 复用）
│   ├── resume/ResumeBits.tsx   # ResumePage 的 4 个纯展示子组件（SectionTitle/EducationItem/AwardItem/SkillGroup，纯数据 props）
```

- [ ] **Step 2: 测试文件清单补齐**

「仓库约定」一节中，把：

```
现有测试文件：`routing.test.ts`、`theme.test.ts`、`i18n.test.ts`、`reveal.test.ts`、`useHashScroll.test.ts`、`useActiveSection.test.ts`、`redirects.test.ts`
```

替换为：

```
现有测试文件：`routing.test.ts`、`theme.test.ts`、`i18n.test.ts`、`i18n-keys.test.ts`、`reveal.test.ts`、`useHashScroll.test.ts`、`useActiveSection.test.ts`、`useTilt.test.tsx`、`redirects.test.ts`、组件测试 `CertDownloadButton/GlassCard/LiquidGlassButton/SectionHeading/SoftChip/Qualifications/Contact.test.tsx`、`resume/ResumeBits.test.tsx`
```

- [ ] **Step 3: 「占位数据约定」更新**

把该节中 TypeScript 数据文件的清单：

```
  - `src/data/projects.ts`（开头）
  - `src/data/achievements.ts`（3 个 'None' 占位行上方）
  - `src/data/skills.ts`（框架技能块上方）
  - `src/data/contact.ts`（3 个 `url: '#'` 行上方）
  - `src/theme.ts`（`secondary` 调色板）
```

替换为：

```
  - `src/data/contact.ts`（2 个 `url: '#'` 行上方）
  - `src/theme/palette.ts`（`secondary` 调色板）

  其余历史标记（projects.ts、achievements.ts、skills.ts）已随内容填充清理；JSON 侧 `_TODO_` 前缀机制保留，当前 en/zh 均无实例。
```

- [ ] **Step 4: 「主题」与「毛玻璃模式」章节补实现位置**

「主题」一节首句后补一句（保持原文不动，只追加）：

```
实现拆分：`src/theme.ts` 是桶文件，palette/overrides/glass/token 的实现分别在 `src/theme/` 目录——改主题先定位到对应实现文件。
```

「毛玻璃模式」一节中所有 `src/theme.ts` 导出 `glass(theme)` 的表述改为 `src/theme/glass.ts`（`glass` 的定义处），其余不动。

- [ ] **Step 5: 全门禁 + Commit**

Run: `pnpm run typecheck && pnpm run test:run && pnpm run lint && pnpm run format:check`（docs 改动不应影响，但跑一遍求稳）
Expected: 全绿。

```bash
git add CLAUDE.md
git commit -m "docs(claude): sync architecture tree, test list and TODO drift

Co-Authored-By: Claude Code <noreply@anthropic.com>"
```

---

### Task 6: Merge 回 main 并推送

**Files:** 无代码改动——分支收尾。

**Interfaces:**
- Consumes: `refactor/code-structure` 分支上 Task 1-5 的 5 个 commit。
- Produces: main 分支包含全部结构优化，远端同步。

- [ ] **Step 1: 确认分支干净且门禁全绿**

Run: `git status --short` → 无输出；再跑一次完整门禁确认。

- [ ] **Step 2: merge 并推送**

```bash
git checkout main
git merge --no-ff refactor/code-structure -m "Merge branch 'refactor/code-structure'"
git push origin main
git branch -d refactor/code-structure
```

Expected: push 成功，GitHub Actions 自动重新部署（raymondzylei.me）。

- [ ] **Step 3: 线上确认（可选但推荐）**

部署完成后访问 https://raymondzylei.me 肉眼确认：首页 6 区块滚动/渐现正常、Qualifications 桌面时间线与移动卡片正常、Contact 两卡正常、/resume 英文简历正常、404 与主题切换正常。
