export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
  frequencyPerWeek: number;
  specificDays?: number[]; // 0=Sun..6=Sat (JS getDay()); when set, habit only appears on these days
  createdAt: number;
}

export interface HabitHistory {
  [date: string]: {
    [habitId: string]: boolean;
  };
}

export type ViewMode = 'month' | 'week';

export interface AppState {
  habits: Habit[];
  history: HabitHistory;
  viewMode: ViewMode;
  currentDate: string; // ISO string for the focused day
  theme: 'light' | 'dark';
}

/** Returns true if a habit applies on the given date. */
export function isHabitApplicableOnDate(habit: Habit, date: Date): boolean {
  if (!habit.specificDays || habit.specificDays.length === 0) return true;
  return habit.specificDays.includes(date.getDay());
}
