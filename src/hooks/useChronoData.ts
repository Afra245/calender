import { useState, useEffect, useCallback, useMemo } from "react";

export interface Goal {
  id: string;
  text: string;
  done: boolean;
}

export interface TimelineEvent {
  id: string;
  time: string;
  task: string;
}

export interface DayData {
  tag?: string;
  notes?: string;
  isProductive?: boolean;
  goals: Goal[];
  timeline: TimelineEvent[];
}

export interface ChronoStore {
  [dateISO: string]: DayData;
}

const STORAGE_KEY = "chronoData";

// Helper to calculate total streak ending "today" or "yesterday"
function calculateStreak(data: ChronoStore): number {
  const today = new Date();
  let streak = 0;
  
  // Starting date is either today or yesterday (allows users to maintain streak if they haven't checked off today yet)
  const tzOffset = today.getTimezoneOffset() * 60000;
  let currentDate = new Date(today.getTime() - tzOffset);
  
  // Try today
  const iso = currentDate.toISOString().slice(0, 10);
  let isTodayProductive = data[iso]?.isProductive;
  
  if (isTodayProductive) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    // Check if yesterday was productive
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);
    if (!data[yesterdayIso]?.isProductive) {
       return 0; // Streak broken completely
    }
    // We start from yesterday
    currentDate = yesterday;
  }

  // Follow the chain back continuously
  while (true) {
    const checkIso = currentDate.toISOString().slice(0, 10);
    if (data[checkIso]?.isProductive) {
      if (!isTodayProductive && streak === 0) {
        // count the first "yesterday"
        streak++;
      } else if (streak > 0) {
        streak++;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function useChronoData() {
  const [data, setData] = useState<ChronoStore>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse chronoData", e);
    }
    setIsLoaded(true);
  }, []);

  const save = useCallback((newData: ChronoStore) => {
    setData(newData);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    }
  }, []);

  const updateDay = useCallback((dateISO: string, updates: Partial<DayData>) => {
    save((prev: ChronoStore) => {
      const currentDay = prev[dateISO] || { goals: [], timeline: [] };
      return {
        ...prev,
        [dateISO]: { ...currentDay, ...updates },
      };
    });
  }, [save]);

  const toggleProductive = useCallback((dateISO: string) => {
    save((prev: ChronoStore) => {
      const currentDay = prev[dateISO] || { goals: [], timeline: [] };
      const currentVal = !!currentDay.isProductive;
      
      return {
        ...prev,
        [dateISO]: { ...currentDay, isProductive: !currentVal }
      };
    });
  }, [save]);

  const setTag = useCallback((dateISO: string, tag?: string) => {
    save((prev: ChronoStore) => {
       const currentDay = prev[dateISO] || { goals: [], timeline: [] };
       return {
         ...prev,
         [dateISO]: { ...currentDay, tag }
       };
    });
  }, [save]);

  const streakCount = useMemo(() => isLoaded ? calculateStreak(data) : 0, [data, isLoaded]);

  return {
    data,
    isLoaded,
    updateDay,
    toggleProductive,
    setTag,
    streakCount
  };
}
