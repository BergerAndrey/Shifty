import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WheelPicker from "./WheelPicker";

interface TimeModalProps {
  open: boolean;
  title: string;
  initialValue: string | null;
  onClose: () => void;
  onSave: (value: string) => void;
  onClear: () => void;
}

export default function TimeModal({ open, title, initialValue, onClose, onSave, onClear }: TimeModalProps) {
  const [hour, minute] = useMemo(() => {
    const v = initialValue ?? "09:00";
    const [h, m] = v.split(":").map(Number);
    return [h, m];
  }, [initialValue]);

  const [current, setCurrent] = useState({ hour, minute });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-[340px] px-3 pb-3 sm:px-0 sm:pb-0"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main sheet */}
            <div className="overflow-hidden rounded-2xl bg-[#f2f2f3] shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-300/50 px-4 py-3">
                <button
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className={`text-[13px] font-medium text-slate-400 transition hover:text-red-400 ${
                    initialValue ? "opacity-100" : "pointer-events-none opacity-0"
                  }`}
                >
                  Clear
                </button>
                <span className="text-[13px] font-semibold text-slate-500">{title}</span>
                <span className="w-9" />
              </div>

              <WheelPicker
                hour={current.hour}
                minute={current.minute}
                onChange={(h, m) => setCurrent({ hour: h, minute: m })}
              />

              <button
                onClick={() => {
                  onSave(`${current.hour.toString().padStart(2, "0")}:${current.minute.toString().padStart(2, "0")}`);
                  onClose();
                }}
                className="w-full border-t border-slate-300/50 py-3.5 text-[17px] font-semibold text-blue-500 transition hover:bg-slate-200/50 active:bg-slate-200"
              >
                Set
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={onClose}
              className="mt-2 w-full rounded-2xl bg-white py-3.5 text-[17px] font-semibold text-blue-500 shadow-2xl transition hover:bg-slate-50 active:bg-slate-100"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
