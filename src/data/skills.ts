export interface Skill {
  id: string;
  name: string;
  category: 'languages' | 'frameworks' | 'tools';
  /** Currently not rendered; reserved for future proficiency visualization. */
  proficiency?: number;
}

export const skillsData: Skill[] = [
  // Languages
  { id: '1', name: 'C++', category: 'languages', proficiency: 90 },
  { id: '2', name: 'Rust', category: 'languages', proficiency: 90 },
  { id: '3', name: 'Python', category: 'languages', proficiency: 85 },
  { id: '4', name: 'JS/TS', category: 'languages', proficiency: 80 },
  { id: '5', name: 'HTML/CSS', category: 'languages', proficiency: 95 },

  // Frameworks
  // TODO: list frameworks/libraries
  // { id: '12', name: 'React', category: 'frameworks', proficiency: 90 },
  // { id: '13', name: 'Vue.js', category: 'frameworks', proficiency: 75 },
  // { id: '14', name: 'Node.js', category: 'frameworks', proficiency: 85 },
  // { id: '15', name: 'Material-UI', category: 'frameworks', proficiency: 88 },

  // Tools
  { id: '9', name: 'Git', category: 'tools', proficiency: 90 },
  { id: '10', name: 'VSCode', category: 'tools', proficiency: 95 },
  { id: '11', name: 'Docker', category: 'tools', proficiency: 70 },
  //{ id: '12', name: 'Figma', category: 'tools', proficiency: 75 },
];

// Helper to get skills by category
export const getSkillsByCategory = (category: Skill['category']) =>
  skillsData.filter((skill) => skill.category === category);
