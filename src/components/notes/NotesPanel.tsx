"use client";

import { useEffect, useState } from "react";
import { MONTH_THEMES } from "@/lib/monthThemes";
import { motion } from "framer-motion";

const STORAGE_KEY = "wall-calendar-notes";

interface NotesPanelProps {
  monthIndex: number;
  year: number;
}

export function NotesPanel({ monthIndex, year }: NotesPanelProps) {
  const [notes, setNotes] = useState("");
  const theme = MONTH_THEMES[monthIndex];
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, monthIndex, 1)));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNotes(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, notes);
  }, [notes]);

  return (
    <motion.section 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="flex h-full flex-col rounded-[2.5rem] bg-white/70 p-6 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-colors duration-500 dark:bg-slate-900/60 dark:ring-slate-800/50"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            Notes
          </p>
          <p className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
            Month log for {monthLabel}
          </p>
        </div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-700 dark:text-slate-200 shadow-sm"
          style={{ backgroundColor: theme.softAccent }}
        >
          Local only
        </span>
      </div>
      
      <div className="mt-5 flex-1 overflow-hidden rounded-[1.5rem] border border-slate-200/50 bg-white/30 dark:border-slate-800/50 dark:bg-slate-900/30 shadow-inner group focus-within:ring-4 focus-within:ring-slate-200/50 dark:focus-within:ring-slate-800/50 transition-all duration-300">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="calendar-notes-lines h-full w-full resize-none bg-transparent px-5 py-4 text-[15px] leading-8 text-slate-800 outline-none dark:text-slate-200"
          placeholder="Write what you’d normally scribble along the edge of a wall calendar — appointments, small wins, reminders..."
        />
      </div>
    </motion.section>
  );
}
