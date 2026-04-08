 "use client";

import Image from "next/image";
import { CalendarClock } from "lucide-react";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { MONTH_THEMES } from "@/lib/monthThemes";
import { AnimatePresence, motion } from "framer-motion";

interface MonthHeaderProps {
  monthIndex: number;
  year: number;
}

export function MonthHeader({ monthIndex, year }: MonthHeaderProps) {
  const theme = MONTH_THEMES[monthIndex];

  return (
    <header className="flex flex-col gap-4 rounded-[2.5rem] bg-white/70 p-5 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-colors duration-500 dark:bg-slate-900/60 dark:ring-slate-800/50 md:flex-row md:items-stretch">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-slate-200 dark:bg-slate-800 md:w-1/2">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${year}-${monthIndex}`}
            initial={{ opacity: 0, scale: 1.05, filter: "blur(2px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(2px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={theme.image}
              alt={theme.label}
              fill
              priority
              className="object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300"
              >
                {theme.tagline}
              </motion.p>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl drop-shadow-md"
              >
                {theme.label} {year}
              </motion.h1>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex flex-1 flex-col justify-between py-2 md:pl-6 md:pr-4">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-slate-900 text-white shadow-xl shadow-slate-900/20 dark:bg-slate-100 dark:text-slate-900 dark:shadow-slate-100/10">
              <CalendarClock className="h-5 w-5" />
            </div>
            <p className="flex-1 text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100">
              ChronoNote
            </p>
            <ThemeToggle />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            Take U Forward Edition
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
            A calm, tactile view of your month
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Tap a date to see what&apos;s happening, drag across days to mark a
            range, and jot notes just like on your favorite hanging calendar.
          </p>
        </div>
        <div className="mt-8 flex items-center justify-between text-[13px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-2.5">
            <span
              className="inline-block h-3 w-3 rounded-full shadow-sm ring-2 ring-white dark:ring-slate-900"
              style={{ backgroundColor: theme.accent }}
            />
            Colorway of the month
          </span>
          <span className="hidden md:inline">Today is always subtly marked.</span>
        </div>
      </div>
    </header>
  );
}
