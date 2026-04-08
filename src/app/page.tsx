"use client";

import { useMemo, useState, useEffect } from "react";
import { MonthHeader } from "@/components/header/MonthHeader";
import { Calendar } from "@/components/calendar/Calendar";
import { DayDetails } from "@/components/day/DayDetails";
import { ProductivityDashboard } from "@/components/productivity/ProductivityDashboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useChronoData } from "@/hooks/useChronoData";
import { motion, AnimatePresence } from "framer-motion";

type Selection = {
  start?: Date;
  end?: Date;
};

export default function HomePage() {
  const todayUtc = useMemo(() => {
    const n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  }, []);

  const [monthIndex, setMonthIndex] = useState(todayUtc.getUTCMonth());
  const [year, setYear] = useState(todayUtc.getUTCFullYear());
  
  const [birthdays, setBirthdays] = useLocalStorage<Record<string, boolean>>("chrononote-birthdays", {});
  const [storedSel, setStoredSel, selMounted] = useLocalStorage<{start?: string, end?: string}>("chrononote-selection", {});
  
  const [selection, setSelectionState] = useState<Selection>({});
  const [focusedDate, setFocusedDate] = useState<Date | undefined>(todayUtc);

  // Core Data
  const { data: chronoData, updateDay, toggleProductive, setTag, streakCount, isLoaded } = useChronoData();

  useEffect(() => {
    if (selMounted && storedSel.start) {
      setSelectionState({
        start: new Date(storedSel.start),
        end: storedSel.end ? new Date(storedSel.end) : undefined
      });
    }
  }, [selMounted, storedSel.start, storedSel.end]);

  const setSelection = (newSel: Selection) => {
    setSelectionState(newSel);
    setStoredSel({
      start: newSel.start?.toISOString(),
      end: newSel.end?.toISOString()
    });
  };

  function changeMonth(delta: number) {
    const next = new Date(Date.UTC(year, monthIndex + delta, 1));
    setMonthIndex(next.getUTCMonth());
    setYear(next.getUTCFullYear());
    setSelection({});
  }

  const monthLabel = useMemo(() => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });
    return dtf.format(new Date(Date.UTC(year, monthIndex, 1)));
  }, [monthIndex, year]);

  // Derive stats for focused month or selected date
  const selectedIso = focusedDate?.toISOString().slice(0, 10);
  const totalGoalsMonth = useMemo(() => {
    let t = 0;
    Object.keys(chronoData).forEach(k => {
      // Very loose check, this assumes the whole store, you could filter by month
      if (k.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)) {
        t += (chronoData[k].goals || []).length;
      }
    });
    return t;
  }, [chronoData, year, monthIndex]);

  const doneGoalsMonth = useMemo(() => {
    let t = 0;
    Object.keys(chronoData).forEach(k => {
      if (k.startsWith(`${year}-${String(monthIndex + 1).padStart(2, '0')}`)) {
        t += (chronoData[k].goals?.filter(g => g.done) || []).length;
      }
    });
    return t;
  }, [chronoData, year, monthIndex]);


  if (!isLoaded) return null; // Prevent hydration mismatch visually

  return (
    <main
      className="min-h-screen bg-slate-50 transition-colors duration-500 dark:bg-slate-950 px-4 py-8 md:px-6 lg:px-8 md:py-12 relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.8),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(15,23,42,0.8),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_bottom,rgba(15,23,42,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />
      
      <div className="relative z-10 mx-auto flex max-w-[72rem] flex-col gap-8 md:gap-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-5"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 ml-1">
              Interactive View
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
              ChronoNote
            </h1>
          </div>
          <div className="inline-flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-white/70 p-1.5 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl dark:bg-slate-900/60 dark:ring-slate-800/50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeMonth(-1)}
              className="flex h-full items-center justify-center rounded-full px-5 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Prev
            </motion.button>
            <div className="relative flex h-full items-center justify-center rounded-full bg-slate-900 px-6 shadow-md dark:bg-slate-100 min-w-[100px] overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`${year}-${monthIndex}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute text-[11px] font-bold uppercase tracking-widest text-white dark:text-slate-900"
                >
                  {monthLabel}
                </motion.span>
              </AnimatePresence>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => changeMonth(1)}
              className="flex h-full items-center justify-center rounded-full px-5 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Next
            </motion.button>
          </div>
        </motion.div>

        <MonthHeader monthIndex={monthIndex} year={year} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)_minmax(0,1.2fr)] lg:gap-6 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col gap-6 h-full"
          >
            {/* Dashboard containing streak, vision, etc */}
            <ProductivityDashboard 
              monthIndex={monthIndex} 
              year={year} 
              streakCount={streakCount}
              totalGoals={totalGoalsMonth}
              totalGoalsDone={doneGoalsMonth}
              focusedDateStr={selectedIso || ""}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <Calendar
              monthIndex={monthIndex}
              year={year}
              selection={selection}
              onSelectionChange={setSelection}
              onDayClick={setFocusedDate}
              chronoData={chronoData}
              birthdays={birthdays}
            />
          </motion.div>

          <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="h-[600px] lg:h-full lg:min-h-[500px]"
          >
            <DayDetails 
              date={focusedDate} 
              chronoData={chronoData}
              updateDay={updateDay}
              toggleProductive={toggleProductive}
              setTag={setTag}
              birthdays={birthdays}
              setBirthdays={setBirthdays}
            />
          </motion.div>

        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mx-auto mt-6 max-w-3xl text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500"
        >
          Take U Forward
          <br className="mt-2" />
          <span className="text-slate-300 dark:text-slate-600">Productivity ecosystem running locally on your device.</span>
        </motion.p>
      </div>
    </main>
  );
}
