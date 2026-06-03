export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

// TODO: add real projects
export const projectsData: Project[] = [
  // {
  //   id: '1',
  //   title: 'Personal Portfolio Website',
  //   description: 'A modern portfolio website built with React and Material-UI showcasing projects and skills.',
  //   technologies: ['React', 'TypeScript', 'Material-UI', 'i18next'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
  // {
  //   id: '2',
  //   title: 'E-Commerce Platform',
  //   description: 'Full-stack e-commerce application with product catalog, shopping cart, and payment integration.',
  //   technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
  // {
  //   id: '3',
  //   title: 'Task Management App',
  //   description: 'Collaborative task management application with real-time updates and team features.',
  //   technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
  // {
  //   id: '4',
  //   title: 'Weather Dashboard',
  //   description: 'Real-time weather application with forecast data and interactive maps.',
  //   technologies: ['JavaScript', 'API Integration', 'Charts.js'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
  // {
  //   id: '5',
  //   title: 'Chat Application',
  //   description: 'Real-time chat application with user authentication and message history.',
  //   technologies: ['React', 'Socket.io', 'Express', 'MongoDB'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
  // {
  //   id: '6',
  //   title: 'Machine Learning Dashboard',
  //   description: 'Dashboard for visualizing machine learning model predictions and analytics.',
  //   technologies: ['Python', 'React', 'TensorFlow', 'D3.js'],
  //   githubUrl: 'https://github.com',
  //   demoUrl: 'https://example.com',
  // },
];
