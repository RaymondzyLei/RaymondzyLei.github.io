export interface TimelineItem {
  id: string;
}

/**
 * Timeline entries are rendered via i18n keys:
 *   data.timeline.<id>.title
 *   data.timeline.<id>.institution
 *   data.timeline.<id>.date
 *   data.timeline.<id>.description
 */
export const timelineData: TimelineItem[] = [{ id: '1' }, { id: '2' }];