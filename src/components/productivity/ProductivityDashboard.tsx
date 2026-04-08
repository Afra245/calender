"use client";

import { useMemo } from "react";
import { MONTH_THEMES } from "@/lib/monthThemes";
import { motion, AnimatePresence } from "framer-motion";
import { triggerSingleConfetti } from "@/components/shared/ConfettiEffect";

interface ProductivityDashboardProps {
  monthIndex: number;
  year: number;
  focusedDateStr: string;
  streakCount: number;
  totalGoalsDone: number;
  totalGoals: number;
}

export function ProductivityDashboard({
  monthIndex,
  year,
  focusedDateStr,
  streakCount,
  totalGoalsDone,
  totalGoals
}: ProductivityDashboardProps) {
  const theme = MONTH_THEMES[monthIndex];

  const suggestedAction = useMemo(() => {
    if (!focusedDateStr) return "Select a date";
    const d = new Date(focusedDateStr);
    const day = d.getUTCDay(); // 0 is Sun, 6 is Sat
    if (day === 0 || day === 6) {
      return "Relax & Growth 🌱";
    }
    return "Focus Work Day 💼";
  }, [focusedDateStr]);

  const daysLeftInMonth = useMemo(() => {
    const today = new Date();
    const eom = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return eom.getDate() - today.getDate();
  }, []);

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex h-full flex-col gap-6"
    >
      {/* Streak Tracker Card */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-white/70 to-white/40 p-6 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:from-slate-900/80 dark:to-slate-800/60 dark:ring-slate-800/50"
      >
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10 pointer-events-none" />
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
          Take U Forward Consistency
        </p>
        <div className="mt-3 flex items-end gap-3">
          <motion.div 
            key={streakCount}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-black text-slate-900 dark:text-white"
          >
            🔥 {streakCount}
          </motion.div>
          <span className="pb-1 text-sm font-semibold tracking-wide text-slate-600 dark:text-slate-400">
            Day Growth Streak
          </span>
        </div>
      </motion.div>

      {/* Future Vision Panel */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-6 shadow-soft-card ring-1 ring-blue-100/50 backdrop-blur-xl transition-all duration-300 dark:from-blue-900/20 dark:to-indigo-900/20 dark:ring-blue-800/30"
      >
        <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10 pointer-events-none" />
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-600 dark:text-blue-400">
          Future Vision
        </p>
        <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
          You are <span className="text-blue-600 dark:text-blue-400">{daysLeftInMonth} days</span> away from your end-of-month milestone 🚀
        </p>
      </motion.div>

      {/* Smart Daily Planner */}
      <motion.div 
         whileHover={{ scale: 1.02 }}
         className="relative flex-1 overflow-hidden rounded-[2rem] bg-white/70 p-6 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-all duration-300 dark:bg-slate-900/60 dark:ring-slate-800/50"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Smart Suggestion
          </p>
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-700 dark:text-slate-200 shadow-sm"
            style={{ backgroundColor: theme.softAccent }}
          >
            AI Insight
          </span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedDateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-700/50 dark:bg-slate-800/30"
          >
            <p className="text-2xl font-black text-slate-800 dark:text-slate-200">
              {suggestedAction}
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Based on your selection, this day is ideal for focusing deeply or recharging for the week ahead.
            </p>
          </motion.div>
        </AnimatePresence>

        {totalGoals > 0 && (
          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Monthly Progress Overview
            </p>
            <div className="flex items-center gap-4">
              <div className="h-2 w-full rounded-full bg-slate-200 outline-none dark:bg-slate-800 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(totalGoalsDone / totalGoals) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-slate-900 dark:bg-white"
                />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {totalGoalsDone} / {totalGoals}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}
