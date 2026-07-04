import { AnimatePresence, motion } from "framer-motion";
import { Calendar, Check, Plus, X } from "lucide-react";
import type { MonthRef } from "../types";
import { monthKey, monthLabel, nextMonth } from "../utils/timesheet";

interface MonthsModalProps {
  open: boolean;
  months: MonthRef[];
  activeKey: string;
  onSelect: (ref: MonthRef) => void;
  onAdd: () => void;
  onClose: () => void;
}

export default function MonthsModal({ open, months, activeKey, onSelect, onAdd, onClose }: MonthsModalProps) {
  const candidate = months.length ? nextMonth(months[months.length - 1]) : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
                  <Calendar className="h-4 w-4" />
                </span>
                <h3 className="text-base font-semibold text-slate-900">Months</h3>
              </div>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {months.map((m) => {
                const key = monthKey(m);
                const active = key === activeKey;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      onSelect(m);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                      active ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>
                      {monthLabel(m)} <span className="text-slate-400">{m.year}</span>
                    </span>
                    {active && <Check className="h-4 w-4 text-blue-500" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onAdd}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-blue-300 py-2.5 text-sm font-semibold text-blue-500 transition hover:border-blue-400 hover:bg-blue-50 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add {candidate ? monthLabel(candidate) : "Month"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
