import type { DayEntry, MonthRef, Week } from "../types";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MONTHS = MONTH_NAMES;

export function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function monthKey(ref: MonthRef) {
  return `${ref.year}-${ref.monthIndex}`;
}

export function monthLabel(ref: MonthRef) {
  return MONTH_NAMES[ref.monthIndex];
}

export function nextMonth(ref: MonthRef): MonthRef {
  if (ref.monthIndex === 11) return { year: ref.year + 1, monthIndex: 0 };
  return { year: ref.year, monthIndex: ref.monthIndex + 1 };
}

/**
 * Splits a month into calendar weeks that always end on Sunday (and start on Monday),
 * except for the first week of the month (which may start mid-week on day 1) and the
 * last week of the month (which may end mid-week on the month's last day).
 */
export function generateWeeks(year: number, monthIndex: number): Week[] {
  const total = daysInMonth(year, monthIndex);
  const weeks: Week[] = [];
  let start = 1;

  while (start <= total) {
    const startDate = new Date(year, monthIndex, start);
    const dow = startDate.getDay(); // 0 = Sun ... 6 = Sat
    const daysUntilSunday = dow === 0 ? 0 : 7 - dow;
    const end = Math.min(start + daysUntilSunday, total);

    const days: DayEntry[] = [];
    for (let d = start; d <= end; d++) {
      const date = new Date(year, monthIndex, d);
      days.push({
        date,
        dayName: DAY_NAMES[date.getDay()],
        start: null,
        end: null,
      });
    }
    const endDate = new Date(year, monthIndex, end);
    const label = `${MONTH_NAMES[startDate.getMonth()].slice(0, 3)} ${start} – ${MONTH_NAMES[
      endDate.getMonth()
    ].slice(0, 3)} ${end}`;
    weeks.push({
      id: `${year}-${monthIndex}-${start}`,
      label,
      days,
      isLast: end === total,
    });

    start = end + 1;
  }

  return weeks;
}

/** Returns duration in minutes between start (HH:MM) and end (HH:MM), handling overnight shifts. */
export function durationMinutes(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins;
}

export function formatDuration(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export function formatTime(value: string | null): string {
  if (!value) return "Set";
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatMoney(amount: number): string {
  return `zł ${amount.toFixed(2)}`;
}

/**
 * Tiered hourly rate table (PLN/hour) based on total hours worked in the month.
 * More hours worked in a month -> slightly lower per-hour rate.
 * Rates between breakpoints are linearly interpolated.
 */
const RATE_TABLE: { hours: number; rate: number }[] = [
  { hours: 160, rate: 28.94 },
  { hours: 180, rate: 28.45 },
  { hours: 200, rate: 28.06 },
  { hours: 220, rate: 27.75 },
  { hours: 240, rate: 27.48 },
  { hours: 260, rate: 27.25 },
  { hours: 280, rate: 27.06 },
];

export function rateForHours(hours: number): number {
  if (hours <= RATE_TABLE[0].hours) return RATE_TABLE[0].rate;
  const last = RATE_TABLE[RATE_TABLE.length - 1];
  if (hours >= last.hours) return last.rate;

  for (let i = 0; i < RATE_TABLE.length - 1; i++) {
    const a = RATE_TABLE[i];
    const b = RATE_TABLE[i + 1];
    if (hours >= a.hours && hours <= b.hours) {
      const t = (hours - a.hours) / (b.hours - a.hours);
      return a.rate + t * (b.rate - a.rate);
    }
  }
  return last.rate;
}

export function salaryForMinutes(mins: number): number {
  const hours = mins / 60;
  return hours * rateForHours(hours);
}

export function weekTotalMinutes(week: Week): number {
  return week.days.reduce((sum, d) => sum + durationMinutes(d.start, d.end), 0);
}
