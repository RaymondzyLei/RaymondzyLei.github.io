export interface Project {
  id: string;
  /** Path relative to public/, e.g. '/projects/class-arrange.webp'. When set, replaces the colored placeholder. */
  imageUrl?: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
}

/**
 * Title & description rendered via i18n keys:
 *   data.projects.<id>.title
 *   data.projects.<id>.description
 */
export const projectsData: Project[] = [
  {
    id: '1',
    imageUrl: '/projects/class-arrange.webp',
    technologies: ['React', 'TypeScript'],
    githubUrl: 'https://github.com/RaymondzyLei/class-arrange',
    demoUrl: 'https://class-arrange.raymondzylei.me',
  },
];
