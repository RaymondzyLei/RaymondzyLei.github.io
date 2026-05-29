export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  details?: string;
  file?: {
    path: string;
    label?: string;
  };
}

export const achievementsData: Achievement[] = [
  {
    id: '1',
    title: 'Second Prize, China Algorithm Capability Competition(Final Contest)',
    description: 'National Level, China',
    date: 'Spring 2026',
    category: 'Competition',
    details: 'The 2nd Session, First-Year Undergraduate Period',
    file: {
      path: '/files/cacc-final-certificate.pdf',
      label: 'Cert.',
    },
  },
  {
    id: '2',
    title: 'Second Prize, China Algorithm Capability Competition(Regional Contest)',
    description: 'National Level, China',
    date: 'Fall 2025',
    category: 'Competition',
    details: 'The 2nd Session, First-Year Undergraduate Period',
    file: {
      path: '/files/cacc-regional-certificate.pdf',
      label: 'Cert.',
    },
  },
  {
    id: '3',
    title: 'First Prize, Chinese Physics Olympiad',
    description: 'Provincial Level, China',
    date: 'Senior 2, 2024',
    category: 'Competition',
    details: 'The 41st Session, Senior High School Period',
    file: {
      path: '/files/cpho-2024-certificate.pdf',
      label: 'Cert.',
    },
  },
  {
    id: '4',
    title: 'Third Prize, Chinese Mathematical Olympiad',
    description: 'Preliminary Round, China',
    date: 'Senior 2, 2024',
    category: 'Competition',
    details: 'The 2024 Session, Senior High School Period',
  },
  {
    id: '5',
    title: 'None',
    description: '',
    date: '',
    category: 'Academic Award',
    details: '',
  },
  {
    id: '6',
    title: 'None',
    description: '',
    date: '',
    category: 'Research',
    details: '',
  },
  {
    id: '7',
    title: 'None',
    description: '',
    date: '',
    category: 'Scholarship',
    details: '',
  },
];
