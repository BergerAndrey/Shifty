import { ChevronDown } from "lucide-react";
import { MONTHS } from "../utils/timesheet";

interface MonthPickerProps {
  monthIndex: number;
  onOpen: () => void;
}

export default function MonthPicker({ monthIndex, onOpen }: MonthPickerProps) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-lg font-bold text-slate-900 transition hover:bg-slate-200/60 active:scale-95"
    >
      {MONTHS[monthIndex]}
      <ChevronDown className="h-4 w-4 text-slate-400" />
    </button>
  );
}
