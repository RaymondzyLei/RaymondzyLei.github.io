export interface TimelineItem {
  id: string;
  title: string;
  institution: string;
  date: string;
  description: string;
  /** Currently unused (Qualifications hardcodes SchoolIcon); reserved for per-item icons. */
  icon?: string;
}

export const timelineData: TimelineItem[] = [
  {
    id: '1',
    title: 'B.Eng. in Computer Science and Technology',
    institution:
      'University of Science and Technology of China (USTC), School of the Gifted Young College',
    date: '2025 - Present',
    description:
      'Currently a first-year undergraduate student with a solid academic foundation in computer science-related basic courses.\nActive in academic competitions and independent learning of cutting-edge computer science knowledge.',
  },
  {
    id: '2',
    title: 'Senior High School Education',
    institution: 'Guangzhou No.6 Middle School',
    date: '2023 - 2025',
    description:
      'Completed high school curriculum with outstanding academic performance in Physics and Mathematics.\nRanked among the top students in science-related subjects.',
  },
];
