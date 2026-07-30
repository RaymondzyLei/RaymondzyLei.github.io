export interface TimelineItem {
  id: string;
  file?: {
    path: string;
  };
}

/**
 * Timeline entries are rendered via i18n keys:
 *   data.timeline.<id>.title
 *   data.timeline.<id>.institution
 *   data.timeline.<id>.date
 *   data.timeline.<id>.description
 *   data.timeline.<id>.certLabel  (optional, for download button)
 *
 * Optional `file.path` enables a certificate download button on the card
 * (same pattern as achievements). When absent, no button is rendered.
 */
export const timelineData: TimelineItem[] = [
  { id: '1' },
  { id: '3', file: { path: '/files/nus-sicp-certificate.pdf' } },
  { id: '2' },
];
