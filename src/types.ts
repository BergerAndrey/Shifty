export interface DayEntry {
  date: Date;
  dayName: string;
  start: string | null; // "HH:MM" 24h format
  end: string | null; // "HH:MM" 24h format
}

export interface Week {
  id: string;
  label: string; // e.g. "Jul 1 – Jul 7"
  days: DayEntry[];
  isLast: boolean;
}

export interface MonthRef {
  year: number;
  monthIndex: number;
}

export type EntriesMap = Record<string, { start: string | null; end: string | null }>;
