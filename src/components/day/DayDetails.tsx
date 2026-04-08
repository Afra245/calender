"use client";

import { useMemo, useState } from "react";
import { getDayInfo } from "@/lib/dayData";
import { MONTH_THEMES } from "@/lib/monthThemes";
import { motion, AnimatePresence } from "framer-motion";
import { ChronoStore, Goal, TimelineEvent } from "@/hooks/useChronoData";
import { triggerConfetti } from "@/components/shared/ConfettiEffect";

interface DayDetailsProps {
  date?: Date;
  chronoData: ChronoStore;
  updateDay: (dateISO: string, updates: any) => void;
  toggleProductive: (dateISO: string) => void;
  setTag: (dateISO: string, tag?: string) => void;
  birthdays: Record<string, boolean>;
  setBirthdays: (birthdays: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
}

export function DayDetails({ 
  date, 
  chronoData,
  updateDay,
  toggleProductive,
  setTag,
  birthdays, 
  setBirthdays 
}: DayDetailsProps) {
  
  const [newGoal, setNewGoal] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newTask, setNewTask] = useState("");

  if (!date) {
    return (
      <motion.section 
        layout
        className="flex h-full flex-col justify-center rounded-[2.5rem] bg-white/70 p-6 text-center text-sm text-slate-500 shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-colors duration-500 dark:bg-slate-900/60 dark:ring-slate-800/50 dark:text-slate-400"
      >
        <motion.p layout="position" className="font-bold text-slate-700 dark:text-slate-300">
          What&apos;s on this day
        </motion.p>
        <motion.p layout="position" className="mt-3 leading-relaxed">
          Tap a date in the calendar to see timeline, goals, and events
          for that day.
        </motion.p>
      </motion.section>
    );
  }

  const iso = date.toISOString().slice(0, 10);
  const info = getDayInfo(iso);
  const theme = MONTH_THEMES[date.getMonth()];
  const dayData = chronoData[iso] || { goals: [], timeline: [] };

  const doneGoalsCount = dayData.goals?.filter((g: Goal) => g.done).length || 0;
  const totalGoals = dayData.goals?.length || 0;

  const dateMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const todayN = new Date();
  const todayMs = Date.UTC(todayN.getUTCFullYear(), todayN.getUTCMonth(), todayN.getUTCDate());
  const diffDays = Math.round((dateMs - todayMs) / (1000 * 60 * 60 * 24));

  const dateLabel = useMemo(() => {
    const dtf = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
    return dtf.format(date);
  }, [date]);

  const handleTagToggle = (tag: string) => {
    if (dayData.tag === tag) {
      setTag(iso, undefined);
    } else {
      setTag(iso, tag);
    }
  };

  const handleBirthdayToggle = () => {
    setBirthdays((prev: Record<string, boolean>) => {
      const copy = { ...prev };
      if (!copy[iso]) {
        triggerConfetti(0.4);
      }
      if (copy[iso]) {
        delete copy[iso];
      } else {
        copy[iso] = true;
      }
      return copy;
    });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const goals = dayData.goals || [];
    updateDay(iso, { goals: [...goals, { id: crypto.randomUUID(), text: newGoal.trim(), done: false }] });
    setNewGoal("");
  };

  const handleToggleGoal = (id: string, currentlyDone: boolean) => {
    const goals = dayData.goals || [];
    const updated = goals.map((g: Goal) => g.id === id ? { ...g, done: !g.done } : g);
    updateDay(iso, { goals: updated });
    if (!currentlyDone) {
      triggerConfetti(0.7);
    }
  };

  const handleRemoveGoal = (id: string) => {
    updateDay(iso, { goals: (dayData.goals || []).filter((g: Goal) => g.id !== id) });
  };

  const handleAddTimeline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !newTime.trim()) return;
    const timeline = dayData.timeline || [];
    updateDay(iso, { timeline: [...timeline, { id: crypto.randomUUID(), time: newTime.trim(), task: newTask.trim() }] });
    setNewTime("");
    setNewTask("");
  };

  const handleRemoveTimeline = (id: string) => {
    updateDay(iso, { timeline: (dayData.timeline || []).filter((t: TimelineEvent) => t.id !== id) });
  };

  const AVAILABLE_TAGS = [
    { label: "Work", icon: "📊", color: "bg-blue-100/80 text-blue-800 border-[0.5px] border-blue-200" },
    { label: "Personal", icon: "💖", color: "bg-pink-100/80 text-pink-800 border-[0.5px] border-pink-200" },
    { label: "Study", icon: "📚", color: "bg-amber-100/80 text-amber-800 border-[0.5px] border-amber-200" },
  ];

  return (
    <motion.section 
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="flex h-full flex-col rounded-[2.5rem] bg-white/70 p-5 text-sm shadow-soft-card ring-1 ring-slate-200/50 backdrop-blur-xl transition-colors duration-500 dark:bg-slate-900/60 dark:ring-slate-800/50"
    >
      <div className="flex items-start justify-between">
        <div>
          <motion.p layout="position" className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            {diffDays === 0 ? "Today" : "Day Planner"}
          </motion.p>
          <motion.p layout="position" className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
            {dateLabel}
          </motion.p>
        </div>
        <motion.button
          layout="position"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toggleProductive(iso);
            if (!dayData.isProductive) {
              triggerConfetti(0.5);
            }
          }}
          className={`inline-flex h-8 items-center rounded-full px-4 text-[11px] font-bold tracking-wider shadow-sm transition-colors duration-300 ${dayData.isProductive ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"}`}
        >
          {dayData.isProductive ? "🔥 Productive Day" : "Mark Productive"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={iso}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          className="mt-5 flex-1 space-y-6 overflow-y-auto pr-2 styled-scroll"
        >

          {/* Goal Tracker */}
          <motion.div layout>
             <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    🎯 Goal Tracker
                 </p>
                 {totalGoals > 0 && (
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                     {doneGoalsCount}/{totalGoals} done
                   </span>
                 )}
             </div>
             
             <ul className="space-y-2 mb-3">
               <AnimatePresence>
                 {(dayData.goals || []).map((goal: Goal) => (
                    <motion.li 
                      key={goal.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm dark:bg-slate-800/50 dark:border-slate-700/50"
                    >
                      <input 
                        type="checkbox" 
                        checked={goal.done} 
                        onChange={() => handleToggleGoal(goal.id, goal.done)}
                        className="h-4 w-4 rounded-full border-slate-300 text-blue-600 focus:ring-blue-600 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                      />
                      <span className={`flex-1 text-[14px] ${goal.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>{goal.text}</span>
                      <button onClick={() => handleRemoveGoal(goal.id)} className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors">
                        ✕
                      </button>
                    </motion.li>
                 ))}
               </AnimatePresence>
             </ul>

             <form onSubmit={handleAddGoal} className="flex gap-2">
               <input 
                 type="text" 
                 value={newGoal}
                 onChange={e => setNewGoal(e.target.value)}
                 placeholder="Add a daily goal..." 
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200" 
               />
               <button type="submit" className="bg-slate-900 text-white px-3 rounded-xl text-sm font-semibold hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
                 Add
               </button>
             </form>
          </motion.div>

          {/* Day Timeline View */}
          <motion.div layout>
             <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 mb-2">
               ⏳ Timeline View
             </p>
             
             <ul className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-2.5 space-y-4 mb-4 mt-4">
               <AnimatePresence>
                 {(dayData.timeline || []).map((t: TimelineEvent) => (
                    <motion.li 
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="relative pl-5"
                    >
                      <div className="absolute w-3 h-3 bg-white border-2 border-slate-300 rounded-full -left-[7px] top-1 dark:bg-slate-900 dark:border-slate-500" />
                      <div className="flex items-start justify-between group">
                        <div>
                          <span className="block text-xs font-bold text-slate-400 mb-0.5">{t.time}</span>
                          <span className="block text-[14px] text-slate-700 dark:text-slate-200">{t.task}</span>
                        </div>
                        <button onClick={() => handleRemoveTimeline(t.id)} className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity p-1">
                          ✕
                        </button>
                      </div>
                    </motion.li>
                 ))}
               </AnimatePresence>
             </ul>

             <form onSubmit={handleAddTimeline} className="flex gap-2">
               <input 
                 type="text" 
                 value={newTime}
                 onChange={e => setNewTime(e.target.value)}
                 placeholder="e.g. 9 AM" 
                 className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200" 
               />
               <input 
                 type="text" 
                 value={newTask}
                 onChange={e => setNewTask(e.target.value)}
                 placeholder="Task/Meeting" 
                 className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-slate-900/50 dark:border-slate-700 dark:text-slate-200" 
               />
               <button type="submit" className="bg-slate-200 text-slate-700 px-3 rounded-xl text-sm font-bold hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
                 +
               </button>
             </form>
          </motion.div>


          {/* Info Events and Birthdays */}
          {birthdays[iso] && (
            <motion.div layout className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100/50 rounded-2xl p-4 shadow-sm dark:from-pink-900/30 dark:to-rose-900/30 dark:border-pink-800/30">
              <p className="text-[14px] font-bold text-pink-700 dark:text-pink-400 flex items-center gap-2">
                <span className="text-lg">🎉</span>
                {diffDays === 0 ? "Birthday Today!" : diffDays > 0 ? `Upcoming in ${diffDays} days` : "Birthday Passed"}
              </p>
            </motion.div>
          )}

          {info?.holiday && (
            <motion.div layout className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 dark:bg-amber-900/10 dark:border-amber-900/30">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-500">
                Holiday
              </p>
              <p className="mt-1 text-[13px] font-bold text-slate-800 dark:text-slate-200">{info.holiday}</p>
            </motion.div>
          )}

          {/* Tags Manager */}
          <motion.div layout className="pt-2 border-t border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Label Day</p>
              <button
                onClick={handleBirthdayToggle}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md transition duration-300 ${birthdays[iso] ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {birthdays[iso] ? '🎂 Remove BDay' : '🎂 Add BDay'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((t) => (
                <motion.button
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  key={t.label}
                  onClick={() => handleTagToggle(t.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-full transition-all duration-300 ${dayData.tag === t.label ? t.color + ' ring-2 ring-slate-400/50 dark:ring-slate-500/50 ring-offset-2 dark:ring-offset-slate-900 scale-105 shadow-sm' : 'bg-slate-50/80 text-slate-600 border border-slate-200/60 hover:bg-slate-100 hover:shadow-sm dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  <span>{t.icon}</span>
                  {t.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

        </motion.div>
      </AnimatePresence>
    </motion.section>
  );
}
