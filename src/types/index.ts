export interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
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
}
