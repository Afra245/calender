"use client";

import { useMemo } from "react";
import { MONTH_THEMES } from "@/lib/monthThemes";
import { getDayInfo } from "@/lib/dayData";
import { motion, AnimatePresence } from "framer-motion";
import { ChronoStore } from "@/hooks/useChronoData";

type Selection = {
  start?: Date;
  end?: Date;
};

interface CalendarProps {
  monthIndex: number;
  year: number;
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
  onDayClick: (date: Date) => void;
  chronoData: ChronoStore;
  birthdays: Record<string, boolean>;
}

type CalendarCell = {
  date: Date;
  isCurrentMonth: boolean;
};

function utcMidnightMs(d: Date) {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

function sameDay(a: Date | undefined, b: Date | undefined) {
  if (!a || !b) return false;
  return utcMidnightMs(a) === utcMidnightMs(b);
}

function inRange(date: Date, start?: Date, end?: Date) {
  if (!start || !end) return false;
  const d = utcMidnightMs(date);
  const s = utcMidnightMs(start);
  const e = utcMidnightMs(end);
  return d > Math.min(s, e) && d < Math.max(s, e);
}

export function Calendar({
  monthIndex,
  year,
  selection,
  onSelectionChange,
  onDayClick,
  chronoData,
  birthdays
}: CalendarProps) {
  const theme = MONTH_THEMES[monthIndex];
  const today = useMemo(() => new Date(), []);

  const weeks: CalendarCell[][] = useMemo(() => {
    const firstOfMonth = new Date(Date.UTC(year, monthIndex, 1));
    const startDay = firstOfMonth.getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

    const cells: CalendarCell[] = [];

    // previous month padding
    for (let i = 0; i < startDay; i++) {
      const date = new Date(Date.UTC(year, monthIndex, i - startDay + 1));
      cells.push({ date, isCurrentMonth: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: new Date(Date.UTC(year, monthIndex, d)),
        isCurrentMonth: true
      });
    }

    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(Date.UTC(year, monthIndex + 1, i)),
        isCurrentMonth: false
      });
    }

    const weeks: CalendarCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }

    return weeks;
  }, [monthIndex, year]);

  function handleDayInteraction(clicked: Date) {
    const day = new Date(
      Date.UTC(clicked.getUTCFullYear(), clicked.getUTCMonth(), clicked.getUTCDate())
    );

    if (!selection.start || (selection.start && selection.end)) {
      onSelectionChange({ start: day, end: undefined });
      onDayClick(day);
      return;
    }

    if (selection.start && !selection.end) {
      const start = selection.start;
      if (day < start) {
        onSelectionChange({ start: day, end: start });
      } else if (sameDay(day, start)) {
        onSelectionChange({ start: day, end: day });
      } else {
        onSelectionChange({ start, end: day });
      }
      onDayClick(day);
    }
  }

  return (
    <section
      className="relative rounded-[2.5rem] bg-white/70 p-5 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-colors duration-500 dark:bg-slate-900/60 dark:ring-slate-800/50"
      style={{
        boxShadow: `0 18px 45px ${theme.softAccent}`
      }}
    >
      <div className="flex items-center justify-between pb-4 pt-1 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${monthIndex}`}
          initial={{ opacity: 0, y: 10, filter: "blur(2px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid grid-cols-7 gap-1.5 text-sm"
        >
          {weeks.map((week, i) => (
            <div key={i} className="contents">
              {week.map((cell) => {
                const isToday = sameDay(cell.date, today);
                const isStart = sameDay(cell.date, selection.start);
                const isEnd = sameDay(cell.date, selection.end);
                const isBetween = inRange(cell.date, selection.start, selection.end);
                const isActive = isStart || isEnd || isBetween;

                const iso = cell.date.toISOString().slice(0, 10);
                const dayInfo = getDayInfo(iso);
                const hasBirthday = birthdays[iso];
                const dayData = chronoData[iso];
                const tag = dayData?.tag;
                const isProductive = dayData?.isProductive;
                const totalGoals = dayData?.goals?.length || 0;
                const doneGoals = dayData?.goals?.filter(g => g.done).length || 0;

                const base =
                  "group relative flex h-[3.25rem] cursor-pointer select-none items-center justify-center rounded-2xl border text-sm transition-colors duration-200 touch-manipulation overflow-hidden";

                let border = "border-slate-200/50 dark:border-slate-700/50";
                let bg = "bg-white/50 dark:bg-slate-800/20";
                let text = cell.isCurrentMonth ? "text-slate-800 dark:text-slate-200 font-medium" : "text-slate-400 dark:text-slate-600";

                if (isProductive) {
                  bg = "bg-emerald-100/70 dark:bg-emerald-900/40";
                  border = "border-emerald-300/60 dark:border-emerald-700/50";
                  text = cell.isCurrentMonth ? "text-emerald-900 dark:text-emerald-100 font-bold" : "text-emerald-600/60 dark:text-emerald-400/50";
                }

                if (dayInfo?.isImportant && !isProductive) {
                  border = "border-amber-300 dark:border-amber-500/50";
                  bg = "bg-amber-50/70 dark:bg-amber-900/20";
                }

                if (isBetween) {
                  bg = "bg-slate-100/80 dark:bg-slate-800";
                  border = "border-transparent";
                  text = "text-slate-900 dark:text-white font-semibold";
                }
                
                if (isStart || isEnd) {
                  bg = "bg-slate-900 dark:bg-slate-100";
                  text = "text-white dark:text-slate-900 font-bold";
                  border = "border-transparent";
                }

                const tagColors: Record<string, string> = {
                  Work: "#3B82F6",
                  Personal: "#EC4899",
                  Study: "#EAB308",
                };

                let toolTipContent = [];
                if (hasBirthday) toolTipContent.push("🎂 Birthday");
                if (tag) toolTipContent.push(`Tag: ${tag}`);
                if (dayInfo?.holiday) toolTipContent.push(dayInfo.holiday);
                if (isProductive) toolTipContent.push("🔥 Productive Streak");
                if (totalGoals > 0) toolTipContent.push(`🎯 ${doneGoals}/${totalGoals} Goals`);

                return (
                  <motion.button
                    key={cell.date.toISOString()}
                    type="button"
                    whileHover={isActive ? undefined : { scale: 1.05, y: -2, zIndex: 10, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleDayInteraction(cell.date)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`${base} ${border} ${bg} ${text}`}
                  >
                    {isProductive && !isActive && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400/10 to-transparent pointer-events-none" />
                    )}

                    {toolTipContent.length > 0 && (
                      <div className="absolute bottom-full mb-3 ml-1 hidden w-max max-w-[150px] scale-95 flex-col items-center rounded-xl bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white opacity-0 shadow-xl transition-all duration-200 group-hover:flex group-hover:scale-100 group-hover:opacity-100 z-50 dark:bg-slate-700">
                        {toolTipContent.map((t, idx) => (
                          <span key={idx} className="block whitespace-nowrap">{t}</span>
                        ))}
                        <div className="absolute top-full h-0 w-0 border-x-4 border-t-[5px] border-x-transparent border-t-slate-900 dark:border-t-slate-700" />
                      </div>
                    )}

                    {isBetween && (
                      <motion.div
                        layoutId="selection-range"
                        className="absolute inset-y-1.5 left-0 right-0 z-0 bg-opacity-30 rounded-lg pointer-events-none"
                        style={{ backgroundColor: theme.softAccent }}
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <span className="relative z-10">
                      {cell.date.getUTCDate()}
                    </span>
                    
                    {isToday && !isActive && (
                      <span
                        className="pointer-events-none absolute inset-x-2.5 bottom-1.5 h-1 rounded-full opacity-80"
                        style={{ backgroundColor: theme.accent }}
                      />
                    )}
                    {isToday && isActive && (
                      <span
                        className="pointer-events-none absolute inset-x-2.5 bottom-1 h-[3px] rounded-full opacity-40 bg-white"
                      />
                    )}
                    <div className="absolute top-1.5 right-1.5 flex gap-0.5 pointer-events-none">
                      {hasBirthday && <span className="text-[9px] leading-none">🎂</span>}
                      {tag && (
                        <span
                          className="mt-[1px] h-1.5 w-1.5 rounded-full shadow-sm"
                          style={{ backgroundColor: tagColors[tag] }}
                        />
                      )}
                      {totalGoals > 0 && totalGoals === doneGoals && !tag && (
                        <span className="mt-[1px] h-1.5 w-1.5 rounded-full shadow-sm bg-emerald-400" />
                      )}
                      {dayInfo && !tag && (
                         <span className="mt-[1px] h-1.5 w-1.5 rounded-full shadow-sm bg-amber-400 opacity-50" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap justify-center sm:justify-between gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-4 rounded-full bg-slate-900 dark:bg-slate-100 shadow-sm" />
          Range
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2.5 w-4 rounded-full shadow-sm bg-emerald-300 dark:bg-emerald-500/50"
          />
          Productive
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full shadow-sm"
            style={{ backgroundColor: theme.accent }}
          />
          Today
        </span>
      </div>
    </section>
  );
}
