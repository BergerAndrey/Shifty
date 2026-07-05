import { useEffect, useRef, useState, useCallback } from "react";
import { hapticTick } from "../utils/haptics";

/** How many times the value list is repeated to fake infinite/circular scrolling. */
const REPEAT = 9;

interface WheelColumnProps {
  values: string[];
  index: number;
  onSettle: (index: number) => void;
  itemHeight: number;
  visibleCount: number;
}

function WheelColumn({ values, index, onSettle, itemHeight, visibleCount }: WheelColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const length = values.length;
  const middleSet = Math.floor(REPEAT / 2);
  const extended = Array.from({ length: length * REPEAT }, (_, i) => values[i % length]);

  const [pos, setPos] = useState(middleSet * length + index);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTick = useRef<number>(index);

  const padding = itemHeight * Math.floor(visibleCount / 2);

  // initialize scroll position at the middle repeat set
  useEffect(() => {
    if (containerRef.current) {
      const raw = middleSet * length + index;
      containerRef.current.scrollTop = raw * itemHeight;
      setPos(raw);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep in sync if index changes externally (e.g. re-opened with a different value)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const currentRaw = el.scrollTop / itemHeight;
    const currentValue = ((Math.round(currentRaw) % length) + length) % length;
    if (currentValue !== index) {
      const currentSet = Math.floor(Math.round(currentRaw) / length);
      const raw = currentSet * length + index;
      el.scrollTop = raw * itemHeight;
      setPos(raw);
      lastTick.current = index;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Silently recenter into the middle repeat set once the user drifts into
    // an adjacent set — since every set renders identical content, this jump
    // is visually undetectable and gives the illusion of infinite scrolling.
    const setHeight = length * itemHeight;
    const currentSet = Math.floor(el.scrollTop / setHeight);
    if (currentSet !== middleSet) {
      el.scrollTop += (middleSet - currentSet) * setHeight;
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rawPos = el.scrollTop / itemHeight;
      setPos(rawPos);

      const rounded = Math.round(rawPos);
      const valueIndex = ((rounded % length) + length) % length;
      if (lastTick.current !== valueIndex) {
        lastTick.current = valueIndex;
        hapticTick();
      }
    });

    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => {
      const rounded = Math.round(el.scrollTop / itemHeight);
      const valueIndex = ((rounded % length) + length) % length;
      onSettle(valueIndex);
    }, 120);
  }, [itemHeight, length, middleSet, onSettle]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="scrollbar-none relative z-10 flex-1 snap-y snap-mandatory overflow-y-scroll"
      style={{ height: itemHeight * visibleCount, paddingTop: padding, paddingBottom: padding }}
    >
      {extended.map((v, i) => {
        const distance = Math.abs(i - pos);
        const opacity = Math.max(0.18, 1 - distance * 0.32);
        const isCenter = distance < 0.5;
        return (
          <div
            key={i}
            className="flex snap-center items-center justify-center select-none"
            style={{ height: itemHeight }}
          >
            <span
              className="tabular-nums transition-[font-weight,color] duration-100"
              style={{
                opacity,
                fontSize: isCenter ? 26 : 22,
                fontWeight: isCenter ? 600 : 400,
                color: isCenter ? "#0f172a" : "#64748b",
              }}
            >
              {v}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface WheelPickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export default function WheelPicker({ hour, minute, onChange }: WheelPickerProps) {
  const itemHeight = 40;
  const visibleCount = 7;

  return (
    <div className="relative" style={{ height: itemHeight * visibleCount }}>
      {/* highlight band */}
      <div
        className="pointer-events-none absolute inset-x-3 z-0 rounded-lg border-y border-slate-300/60 bg-slate-400/10"
        style={{ top: itemHeight * Math.floor(visibleCount / 2), height: itemHeight }}
      />
      {/* fade masks */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-[#f2f2f3] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 bg-gradient-to-t from-[#f2f2f3] to-transparent" />

      <div className="flex h-full">
        <WheelColumn
          values={HOURS}
          index={hour}
          onSettle={(i) => onChange(i, minute)}
          itemHeight={itemHeight}
          visibleCount={visibleCount}
        />
        <WheelColumn
          values={MINUTES}
          index={minute}
          onSettle={(i) => onChange(hour, i)}
          itemHeight={itemHeight}
          visibleCount={visibleCount}
        />
      </div>
    </div>
  );
}
