import { createStore } from 'solid-js/store';
import { Habit, HabitHistory, AppState, ViewMode } from '../types';
import { format } from 'date-fns';

const LOCAL_STORAGE_KEY = 'stellar_habits_v2';

const loadState = (): AppState => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      
      // Default state to fallback to
      const defaultState: AppState = {
        habits: [],
        history: {},
        viewMode: 'week',
        currentDate: format(new Date(), 'yyyy-MM-dd'),
        theme: 'dark'
      };

      // Merge parsed data into default state to ensure all keys exist
      const merged = { ...defaultState, ...parsed };

      // Validate habits
      if (Array.isArray(merged.habits)) {
        merged.habits = merged.habits.filter((h: any) => h && typeof h === 'object' && h.id && h.name);
      } else {
        merged.habits = [];
      }

      // Validate viewMode
      if (!['month', 'week'].includes(merged.viewMode)) {
        merged.viewMode = 'week';
      }

      // Validate theme
      if (!['light', 'dark'].includes(merged.theme)) {
        merged.theme = 'dark';
      }

      return merged;
    } catch (e) {
      console.error('Failed to load state', e);
    }
  }
  return {
    habits: [
      { id: '1', name: 'Drink Water', color: '#3b82f6', icon: 'Droplets', createdAt: Date.now() },
      { id: '2', name: 'Exercise', color: '#ef4444', icon: 'Activity', createdAt: Date.now() },
      { id: '3', name: 'Read', color: '#10b981', icon: 'Book', createdAt: Date.now() },
    ],
    history: {},
    viewMode: 'week',
    currentDate: format(new Date(), 'yyyy-MM-dd'),
    theme: 'dark',
  };
};

const [state, setState] = createStore<AppState>(loadState());

const saveState = () => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
};

export const store = {
  state,
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setState('habits', (h) => [...h, newHabit]);
    saveState();
  },
  toggleHabit: (habitId: string, date: string) => {
    setState('history', date, (h) => ({
      ...h,
      [habitId]: !h?.[habitId],
    }));
    saveState();
  },
  setViewMode: (mode: ViewMode) => {
    setState('viewMode', mode);
    saveState();
  },
  setCurrentDate: (date: string) => {
    setState('currentDate', date);
    saveState();
  },
  deleteHabit: (id: string) => {
    setState('habits', (h) => h.filter((habit) => habit.id !== id));
    saveState();
  },
  updateHabit: (id: string, updates: Partial<Habit>) => {
    setState('habits', (h) => h.id === id, updates);
    saveState();
  },
  toggleTheme: () => {
    setState('theme', (t) => t === 'dark' ? 'light' : 'dark');
    saveState();
  }
};
