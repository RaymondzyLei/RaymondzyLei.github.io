export interface Project {
  id: string;
  /** Research entries are also included in the standalone resume. */
  research?: boolean;
  contributionIds?: string[];
  /** Path relative to public/, e.g. '/projects/class-arrange.webp'. */
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
  {
    id: 'nexos',
    research: true,
    contributionIds: ['kernel', 'agentfs', 'reprolab', 'award'],
    technologies: ['RISC-V', 'AgentFS', 'QEMU'],
  },
  {
    id: 'vit-retinamnist',
    research: true,
    contributionIds: ['classifier', 'distillation', 'competition'],
    technologies: ['ViT', 'RetinaMNIST', 'GPTQ', 'AWQ'],
  },
  {
    id: 'cs229',
    research: true,
    contributionIds: ['implementation', 'training'],
    technologies: ['PyTorch', 'Python', 'Burn', 'Rust'],
  },
];

export const researchProjects = projectsData.filter((project) => project.research);
