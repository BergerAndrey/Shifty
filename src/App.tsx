import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import WeekPanel from "./components/WeekPanel";
import MonthsModal from "./components/MonthsModal";
import type { EntriesMap, MonthRef } from "./types";
import { dateKey, generateWeeks, monthKey, nextMonth, weekTotalMinutes } from "./utils/timesheet";

const DEFAULT_MONTHS: MonthRef[] = [{ year: 2026, monthIndex: 6 }]; // July 2026

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [months, setMonths] = useState<MonthRef[]>(() => loadJSON("ts_months", DEFAULT_MONTHS));
  const [activeKey, setActiveKey] = useState<string>(() => {
    const stored = loadJSON<string | null>("ts_active_month", null);
    const list = loadJSON("ts_months", DEFAULT_MONTHS);
    return stored && list.some((m: MonthRef) => monthKey(m) === stored) ? stored : monthKey(list[0]);
  });
  const [entriesByMonth, setEntriesByMonth] = useState<Record<string, EntriesMap>>(() =>
    loadJSON("ts_entries", {})
  );
  const [monthsOpen, setMonthsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    localStorage.setItem("ts_months", JSON.stringify(months));
  }, [months]);

  useEffect(() => {
    localStorage.setItem("ts_active_month", JSON.stringify(activeKey));
  }, [activeKey]);

  useEffect(() => {
    localStorage.setItem("ts_entries", JSON.stringify(entriesByMonth));
  }, [entriesByMonth]);

  const activeMonth = useMemo(
    () => months.find((m) => monthKey(m) === activeKey) ?? months[0],
    [months, activeKey]
  );
  const { year, monthIndex } = activeMonth;

  const weeks = useMemo(() => {
    const base = generateWeeks(year, monthIndex);
    const stored = entriesByMonth[activeKey] || {};
    return base.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        const key = dateKey(day.date);
        const e = stored[key];
        return { ...day, start: e?.start ?? null, end: e?.end ?? null };
      }),
    }));
  }, [year, monthIndex, entriesByMonth, activeKey]);

  const monthTotalMinutes = useMemo(
    () => weeks.reduce((sum, w) => sum + weekTotalMinutes(w), 0),
    [weeks]
  );

  function updateDay(weekIndex: number, dayIndex: number, field: "start" | "end", value: string | null) {
    const day = weeks[weekIndex].days[dayIndex];
    const key = dateKey(day.date);
    setEntriesByMonth((prev) => {
      const monthEntries = { ...(prev[activeKey] || {}) };
      const existing = monthEntries[key] || { start: null, end: null };
      monthEntries[key] = { ...existing, [field]: value };
      return { ...prev, [activeKey]: monthEntries };
    });
  }

  function clearWeek(weekIndex: number) {
    const week = weeks[weekIndex];
    setEntriesByMonth((prev) => {
      const monthEntries = { ...(prev[activeKey] || {}) };
      week.days.forEach((d) => {
        delete monthEntries[dateKey(d.date)];
      });
      return { ...prev, [activeKey]: monthEntries };
    });
  }

  function handleSelectMonth(ref: MonthRef) {
    setActiveKey(monthKey(ref));
    setActiveIndex(0);
  }

  function handleAddMonth() {
    const next = nextMonth(months[months.length - 1]);
    const key = monthKey(next);
    if (months.some((m) => monthKey(m) === key)) {
      setActiveKey(key);
      return;
    }
    setMonths((prev) => [...prev, next]);
    setActiveKey(key);
    setActiveIndex(0);
  }

  function scrollToIndex(i: number) {
    const clamped = Math.max(0, Math.min(weeks.length - 1, i));
    panelRefs.current[clamped]?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
    setActiveIndex(clamped);
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    panelRefs.current.forEach((el, i) => {
      if (!el) return;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - containerCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top nav */}
      <header className="safe-top sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white shadow-sm shadow-blue-200">
              <Clock3 className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Shiftly</span>
          </div>
        </div>
      </header>

      {/* Carousel */}
      <section className="relative mx-auto max-w-6xl px-2 pb-10 pt-8 sm:px-6 sm:pt-12">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="absolute left-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg ring-1 ring-slate-200 transition hover:text-blue-500 hover:shadow-xl md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="absolute right-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg ring-1 ring-slate-200 transition hover:text-blue-500 hover:shadow-xl md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto scroll-smooth pb-4"
        >
          {weeks.map((week, i) => (
            <div
              key={week.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              className="flex w-full shrink-0 snap-center justify-center px-6"
            >
              <WeekPanel
                week={week}
                index={i}
                total={weeks.length}
                monthIndex={monthIndex}
                monthTotalMinutes={week.isLast ? monthTotalMinutes : undefined}
                onOpenMonths={() => setMonthsOpen(true)}
                onPrev={() => scrollToIndex(i - 1)}
                onNext={() => scrollToIndex(i + 1)}
                onUpdateDay={(dayIndex, field, value) => updateDay(i, dayIndex, field, value)}
                onClearWeek={() => clearWeek(i)}
              />
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {weeks.map((w, i) => (
            <button
              key={w.id}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to ${w.label}`}
              className={`h-1.5 rounded-full transition-all ${
                i === activeIndex ? "w-6 bg-blue-500" : "w-1.5 bg-slate-200 hover:bg-slate-300"
              }`}
            />
          ))}
        </div>
      </section>

      <footer className="safe-bottom border-t border-slate-100 py-8 text-center text-xs text-slate-400">
        Built with care · Your data stays on this device
      </footer>

      <MonthsModal
        open={monthsOpen}
        months={months}
        activeKey={activeKey}
        onSelect={handleSelectMonth}
        onAdd={handleAddMonth}
        onClose={() => setMonthsOpen(false)}
      />
    </div>
  );
}
