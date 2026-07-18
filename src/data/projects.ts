export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  /** Currently unused (Portfolio renders a placeholder color block); reserved for project thumbnails. */
  imageUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

// TODO: add real projects
export const projectsData: Project[] = [];
