export interface Achievement {
  id: string;
  category: string;
  file?: {
    path: string;
  };
}

/**
 * Achievement cards are rendered via i18n keys:
 *   data.achievements.<id>.title
 *   data.achievements.<id>.description
 *   data.achievements.<id>.date
 *   data.achievements.<id>.details    (optional)
 *   data.achievements.<id>.certLabel  (optional, for download button)
 *
 * Category labels: data.achievements.category.<category>
 * Empty placeholder: data.achievements.empty.title, .description, .date, .details
 */
export const achievementsData: Achievement[] = [
  { id: '1', category: 'Competition', file: { path: '/files/cacc-final-certificate.pdf' } },
  { id: '2', category: 'Competition', file: { path: '/files/cacc-regional-certificate.pdf' } },
  { id: '3', category: 'Competition', file: { path: '/files/cpho-2024-certificate.pdf' } },
  { id: '4', category: 'Competition' },
  { id: '5', category: 'Academic Award' },
  { id: '6', category: 'Research' },
  { id: '7', category: 'Scholarship' },
];