export type DayInfo = {
  date: string; // MM-DD or YYYY-MM-DD
  holiday?: string;
  funFact?: string;
  events?: string[];
  isImportant?: boolean;
};

export const DAY_DATA: DayInfo[] = [
  {
    date: "01-01",
    holiday: "New Year",
    funFact: "January is named after Janus, the Roman god of beginnings.",
    events: ["Set intentions for the year"],
    isImportant: true
  },
  {
    date: "02-14",
    holiday: "Valentine's Day",
    funFact: "The oldest surviving Valentine was a poem written in 1415.",
    events: ["Plan a small act of kindness"]
  },
  {
    date: "03-08",
    holiday: "International Women's Day",
    funFact: "IWD has been observed since the early 1900s.",
    events: ["Celebrate women's achievements"],
    isImportant: true
  },
  {
    date: "08-15",
    holiday: "Independence Day (India)",
    funFact: "India gained independence from British rule on this day in 1947.",
    events: ["Watch flag hoisting", "Celebrate freedom"],
    isImportant: true
  },
  {
    date: "12-25",
    holiday: "Christmas",
    funFact: "The tradition of decorating trees dates back to 16th-century Germany.",
    events: ["Share a warm drink with someone"],
    isImportant: true
  }
];

export function getDayInfo(dateIso: string): DayInfo | undefined {
  const mmdd = dateIso.slice(5);
  return DAY_DATA.find((d) => d.date === dateIso || d.date === mmdd);
}

