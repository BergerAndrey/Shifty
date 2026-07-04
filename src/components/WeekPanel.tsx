import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronRight as RowChevron } from "lucide-react";
import type { Week } from "../types";
import {
  durationMinutes,
  formatDuration,
  formatMoney,
  formatTime,
  salaryForMinutes,
  weekTotalMinutes,
} from "../utils/timesheet";
import TimeModal from "./TimeModal";
import MonthPicker from "./MonthPicker";

interface WeekPanelProps {
  week: Week;
  index: number;
  total: number;
  monthIndex: number;
  monthTotalMinutes?: number;
  onOpenMonths: () => void;
  onPrev: () => void;
  onNext: () => void;
  onUpdateDay: (dayIndex: number, field: "start" | "end", value: string | null) => void;
  onClearWeek: () => void;
}

export default function WeekPanel({
  week,
  index,
  total,
  monthIndex,
  monthTotalMinutes,
  onOpenMonths,
  onPrev,
  onNext,
  onUpdateDay,
  onClearWeek,
}: WeekPanelProps) {
  const [modal, setModal] = useState<{ dayIndex: number; field: "start" | "end" } | null>(null);

  const totalMins = weekTotalMinutes(week);
  const activeDay = modal ? week.days[modal.dayIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
      className="flex h-full w-[300px] shrink-0 snap-center flex-col rounded-3xl bg-slate-100/80 px-5 pt-6 pb-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 transition-shadow hover:shadow-md sm:w-[320px]"
    >
      {/* Header */}
      <div className="mb-1 flex items-center justify-center">
        <MonthPicker monthIndex={monthIndex} onOpen={onOpenMonths} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-25"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-semibold text-slate-900">{week.label}</span>
        <button
          onClick={onNext}
          disabled={index === total - 1}
          className="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 transition hover:bg-blue-50 disabled:pointer-events-none disabled:opacity-25"
          aria-label="Next week"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Table header */}
      <div className="mb-2 grid grid-cols-[0.9fr_1fr_1fr_1fr_16px] items-center gap-1 px-1 text-[13px] font-semibold text-slate-500">
        <span>Day</span>
        <span>Start</span>
        <span>End</span>
        <span>Time</span>
        <span />
      </div>

      {/* Rows */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        {week.days.map((day, i) => {
          const mins = durationMinutes(day.start, day.end);
          return (
            <div
              key={i}
              className="grid grid-cols-[0.9fr_1fr_1fr_1fr_16px] items-center gap-1 border-b border-slate-100 px-2.5 py-3 text-[14px] transition-colors last:border-b-0 hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-900">{day.dayName}</span>
              <button
                onClick={() => setModal({ dayIndex: i, field: "start" })}
                className={`truncate text-left font-medium transition hover:underline ${
                  day.start ? "text-slate-700" : "text-blue-500"
                }`}
              >
                {formatTime(day.start)}
              </button>
              <button
                onClick={() => setModal({ dayIndex: i, field: "end" })}
                className={`truncate text-left font-medium transition hover:underline ${
                  day.end ? "text-slate-700" : "text-blue-500"
                }`}
              >
                {formatTime(day.end)}
              </button>
              <span className="truncate text-slate-400">{formatDuration(mins)}</span>
              <RowChevron className="h-3.5 w-3.5 justify-self-end text-slate-300" />
            </div>
          );
        })}
      </div>

      {/* Total time */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-100">
        <span className="text-[15px] font-semibold text-slate-900">Total Time</span>
        <span className="text-[15px] text-slate-400">{formatDuration(totalMins)}</span>
      </div>

      {week.isLast && monthTotalMinutes !== undefined && (
        <>
          <p className="mb-2 mt-6 text-center text-[15px] text-slate-400">Month Total</p>
          <div className="divide-y divide-slate-100 rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px] font-semibold text-slate-900">Total Time</span>
              <span className="text-[15px] text-slate-400">{formatDuration(monthTotalMinutes)}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-[15px] font-semibold text-slate-900">Total Salary</span>
              <span className="text-[15px] text-slate-400">
                {formatMoney(salaryForMinutes(monthTotalMinutes))}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* Footer */}
      <div className="mt-8 flex items-center justify-center border-t border-slate-200/70 pt-4 text-[14px] font-medium">
        <button
          onClick={onClearWeek}
          className="text-slate-300 transition hover:text-red-400 active:scale-95"
        >
          Clear
        </button>
      </div>

      {activeDay && modal && (
        <TimeModal
          open={!!modal}
          title={`${activeDay.dayName} · ${modal.field === "start" ? "Start" : "End"} time`}
          initialValue={activeDay[modal.field]}
          onClose={() => setModal(null)}
          onSave={(value) => onUpdateDay(modal.dayIndex, modal.field, value)}
          onClear={() => onUpdateDay(modal.dayIndex, modal.field, null)}
        />
      )}
    </motion.div>
  );
}
