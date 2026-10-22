import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay as dateFnsIsSameDay,
  addDays,
} from 'date-fns';
import { TimeBlockData } from './types';

export const CALENDAR_COLORS = [
  { name: 'Bubblegum Pink', hex: '#FF4FA3', borderHex: '#F472B6', isDarkText: false },
  { name: 'Neon Cyan', hex: '#00C2CB', borderHex: '#22D3EE', isDarkText: true },
  { name: 'Electric Blue', hex: '#3B82F6', borderHex: '#60A5FA', isDarkText: false },
  { name: 'Emerald Mint', hex: '#10B981', borderHex: '#34D399', isDarkText: false },
  { name: 'Royal Violet', hex: '#8B5CF6', borderHex: '#A78BFA', isDarkText: false },
  { name: 'Sun Amber', hex: '#F59E0B', borderHex: '#FBBF24', isDarkText: true },
  { name: 'Crimson Coral', hex: '#EF4444', borderHex: '#F87171', isDarkText: false },
  { name: 'Indigo Twilight', hex: '#6366F1', borderHex: '#818CF8', isDarkText: false },
];

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime12(time: string): string {
  if (!time) return '';
  const [hStr, mStr] = time.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function isSameDay(d1: Date | string, d2: Date | string): boolean {
  return dateFnsIsSameDay(new Date(d1), new Date(d2));
}

/**
 * Returns array of 7 dates for the week containing `selectedDate`,
 * starting from Monday (weekStartsOn: 1).
 */
export function getWeekDates(selectedDate: Date): Date[] {
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export interface MonthDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates the 35 or 42 grid cells for the monthly calendar view.
 */
export function getMonthMatrix(selectedDate: Date): MonthDay[][] {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  const weeks: MonthDay[][] = [];
  let currentWeek: MonthDay[] = [];

  allDays.forEach((day) => {
    currentWeek.push({
      date: day,
      dateStr: format(day, 'yyyy-MM-dd'),
      isCurrentMonth: day.getMonth() === selectedDate.getMonth(),
      isToday: dateFnsIsSameDay(day, today),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  return weeks;
}

export interface PositionedBlock {
  block: TimeBlockData;
  top: number; // in pixels
  height: number; // in pixels
  leftPercent: number; // 0 to 100
  widthPercent: number; // 0 to 100
}

/**
 * Overlap layout algorithm for timeline blocks:
 * Calculates column positions (left and width percentages) for overlapping blocks
 * so they render side-by-side without obscuring one another.
 */
export function layoutDayBlocks(
  blocks: TimeBlockData[],
  startHour: number = 0,
  pixelsPerHour: number = 60
): PositionedBlock[] {
  if (!blocks || blocks.length === 0) return [];

  // Sort blocks primarily by startTime, secondarily by duration descending
  const sorted = [...blocks].sort((a, b) => {
    const aStart = timeToMinutes(a.startTime);
    const bStart = timeToMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aDur = timeToMinutes(a.endTime) - aStart;
    const bDur = timeToMinutes(b.endTime) - bStart;
    return bDur - aDur;
  });

  // Group overlapping blocks into clusters
  const clusters: TimeBlockData[][] = [];
  let currentCluster: TimeBlockData[] = [];
  let clusterEnd = -1;

  for (const block of sorted) {
    const startMin = timeToMinutes(block.startTime);
    const endMin = timeToMinutes(block.endTime);

    if (currentCluster.length === 0) {
      currentCluster.push(block);
      clusterEnd = endMin;
    } else if (startMin < clusterEnd) {
      // Overlaps with current cluster
      currentCluster.push(block);
      clusterEnd = Math.max(clusterEnd, endMin);
    } else {
      // New cluster
      clusters.push(currentCluster);
      currentCluster = [block];
      clusterEnd = endMin;
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const result: PositionedBlock[] = [];

  // For each cluster, assign columns greedily
  for (const cluster of clusters) {
    const columns: TimeBlockData[][] = [];

    for (const block of cluster) {
      const startMin = timeToMinutes(block.startTime);
      let placed = false;

      for (let colIdx = 0; colIdx < columns.length; colIdx++) {
        const lastInCol = columns[colIdx][columns[colIdx].length - 1];
        if (timeToMinutes(lastInCol.endTime) <= startMin) {
          columns[colIdx].push(block);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([block]);
      }
    }

    const totalCols = columns.length;
    const colWidth = 100 / totalCols;

    for (let colIdx = 0; colIdx < totalCols; colIdx++) {
      for (const block of columns[colIdx]) {
        const startMin = timeToMinutes(block.startTime);
        const endMin = timeToMinutes(block.endTime);
        const durationMin = Math.max(15, endMin - startMin);

        const top = ((startMin - startHour * 60) / 60) * pixelsPerHour;
        const height = (durationMin / 60) * pixelsPerHour;

        result.push({
          block,
          top: Math.max(0, top),
          height: Math.max(22, height),
          leftPercent: colIdx * colWidth,
          widthPercent: colWidth - (totalCols > 1 ? 1 : 0), // small gutter
        });
      }
    }
  }

  return result;
}

export function formatDateHeading(view: 'day' | 'week' | 'month', date: Date): string {
  if (view === 'day') {
    return format(date, 'EEEE, MMMM d, yyyy');
  }
  if (view === 'week') {
    const weekDates = getWeekDates(date);
    const first = weekDates[0];
    const last = weekDates[6];
    if (first.getMonth() === last.getMonth()) {
      return `${format(first, 'MMM d')} – ${format(last, 'd, yyyy')}`;
    }
    return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`;
  }
  return format(date, 'MMMM yyyy');
}
