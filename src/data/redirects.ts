export interface RedirectRule {
  /** 子路径，如 '/old-blog'（必须以 / 开头） */
  path: string;
  /** 跳转目标完整 URL */
  targetUrl: string;
  /** 可选描述，如 "博客"（用于提示文字） */
  label?: string;
}

/**
 * TODO: 在此填写需要重定向的路径和目标 URL
 * 可用于内容迁移、短链接等场景
 */
export const REDIRECTS: RedirectRule[] = [
  // 短链接示例
  { path: '/google', targetUrl: 'https://www.google.com', label: 'Google 搜索' },
];
