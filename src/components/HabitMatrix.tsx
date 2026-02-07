import { Component, For, createMemo, Show } from 'solid-js';
import { store } from '../store';
import { Habit, isHabitApplicableOnDate } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isFuture } from 'date-fns';
import { weekStartsOn } from '../config';
import { Check } from 'lucide-solid';

const SHORT_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface HabitMatrixProps {
  onEditHabit: (habit: Habit) => void;
}

const HabitMatrix: Component<HabitMatrixProps> = (props) => {
  const daysInMonth = createMemo(() => {
    const date = parseISO(store.state.currentDate);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  });

  const validHabits = createMemo(() => {
    const habits = store.state.habits;
    if (!Array.isArray(habits)) return [];
    return habits.filter(h => h && h.name);
  });

  /** Count how many times a habit is checked in the week containing `day`. */
  const weeklyCompletions = (habit: Habit, day: Date) => {
    const ws = startOfWeek(day, { weekStartsOn });
    const we = endOfWeek(day, { weekStartsOn });
    const days = eachDayOfInterval({ start: ws, end: we });
    let count = 0;
    for (const d of days) {
      if (store.state.history[format(d, 'yyyy-MM-dd')]?.[habit.id]) count++;
    }
    return count;
  };

  /** Is the habit visible on this day? (accounts for weekly target being met) */
  const isHabitVisibleOnDay = (habit: Habit, day: Date) => {
    if (!isHabitApplicableOnDate(habit, day)) return false;
    // Specific-day habits are fully governed by applicability
    if (habit.specificDays && habit.specificDays.length > 0) return true;
    // Daily habits always visible
    if (habit.frequencyPerWeek >= 7) return true;
    // Frequency habits: hide once weekly target met (keep if checked today)
    const dateStr = format(day, 'yyyy-MM-dd');
    if (store.state.history[dateStr]?.[habit.id]) return true;
    return weeklyCompletions(habit, day) < habit.frequencyPerWeek;
  };

  const completedDays = createMemo(() => {
    const habits = validHabits();
    if (habits.length === 0) return new Set<string>();
    const completed = new Set<string>();
    for (const day of daysInMonth()) {
      // Only habits with a firm daily expectation count toward day completion
      const required = habits.filter(h =>
        isHabitApplicableOnDate(h, day) &&
        ((h.specificDays && h.specificDays.length > 0) || h.frequencyPerWeek >= 7)
      );
      if (required.length === 0) continue;
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayHistory = store.state.history[dateStr];
      if (dayHistory && required.every(h => dayHistory[h.id])) {
        completed.add(dateStr);
      }
    }
    return completed;
  });

  const frequencyBadge = (habit: Habit) => {
    if (habit.specificDays && habit.specificDays.length > 0 && habit.specificDays.length < 7) {
      return habit.specificDays.map(d => SHORT_DAY_NAMES[d]).join('/');
    }
    if (habit.frequencyPerWeek < 7) {
      return `${habit.frequencyPerWeek}x/wk`;
    }
    return null;
  };

  return (
    <div class="w-full h-full flex flex-col gap-6 animate-fade-in-up">
      <div class="overflow-x-auto custom-scrollbar pb-4">
        <table class="border-separate border-spacing-2">
          <thead>
            <tr>
              <th class="sticky left-0 glass z-20 min-w-[150px] text-left p-4 font-semibold text-base-content/60 border-b border-base-content/5 rounded-tl-2xl">
                Habits
              </th>
              <For each={daysInMonth()}>
                {(day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isDayComplete = () => completedDays().has(dateStr);
                  const today = isToday(day);

                  return (
                    <th class={`min-w-[40px] text-center p-2 text-xs font-bold transition-all duration-500 border-b border-base-content/5
                      ${isDayComplete() ? 'text-emerald-400' : today ? 'text-blue-400' : 'text-base-content/50'}`}>
                      <div class="mb-1 opacity-50 font-medium">{format(day, 'EEE')}</div>
                      <div class={`h-10 w-10 flex items-center justify-center rounded-xl mx-auto transition-all duration-500
                        ${isDayComplete()
                          ? 'bg-emerald-500 text-white animate-glow-pulse-green'
                          : today
                            ? 'bg-blue-500 text-white animate-glow-pulse-blue'
                            : 'bg-base-content/5'
                        }`}>
                        {isDayComplete()
                          ? <Check size={16} class="animate-check-pop" />
                          : format(day, 'd')
                        }
                      </div>
                    </th>
                  );
                }}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={validHabits()}>
              {(habit, index) => {
                if (!habit) return null;
                return (
                  <tr class={`habit-row animate-fade-in-up`} style={{ 'animation-delay': `${index() * 0.06}s` }}>
                    <td class="sticky left-0 glass z-20 p-4 border-b border-base-content/5">
                      <button
                        onClick={() => props.onEditHabit(habit)}
                        class="flex items-center gap-3 group cursor-pointer hover:opacity-80 transition-opacity duration-200"
                      >
                        <div
                          class="w-2 h-6 rounded-full transition-all duration-300"
                          style={{
                            'background-color': habit.color,
                            'box-shadow': `0 0 12px ${habit.color}60`
                          }}
                        ></div>
                        <span class="font-bold text-base-content whitespace-nowrap group-hover:underline decoration-base-content/30 underline-offset-2">{habit.name}</span>
                        <Show when={frequencyBadge(habit)}>
                          <span class="text-[10px] font-bold text-base-content/40 bg-base-content/5 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                            {frequencyBadge(habit)}
                          </span>
                        </Show>
                      </button>
                    </td>
                    <For each={daysInMonth()}>
                      {(day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const future = isFuture(day);
                        const isChecked = createMemo(() => store.state.history[dateStr]?.[habit.id] || false);
                        const visible = () => isHabitVisibleOnDay(habit, day);

                        return (
                          <Show when={visible()} fallback={
                            <td class="p-1">
                              <div class="w-10 h-10 rounded-xl bg-base-content/3 opacity-40" />
                            </td>
                          }>
                          <td class="p-1">
                            <button
                              onClick={() => !future && store.toggleHabit(habit.id, dateStr)}
                              disabled={future}
                              class={`w-10 h-10 rounded-xl transition-all duration-300 relative group flex items-center justify-center
                                ${future
                                  ? 'opacity-25 cursor-not-allowed bg-base-300/20'
                                  : isChecked()
                                    ? 'shadow-lg scale-95 animate-cell-celebrate btn-press'
                                    : 'hover:bg-base-200 hover:scale-105 bg-base-300/30 border border-base-content/5 hover:border-base-content/10 btn-press'
                                }`}
                              style={{
                                'background-color': !future && isChecked() ? habit.color : '',
                                'box-shadow': !future && isChecked() ? `0 0 20px -3px ${habit.color}70, 0 0 6px -1px ${habit.color}40` : ''
                              }}
                            >
                              {!future && isChecked() ? (
                                <div class="animate-check-pop">
                                  <Check size={14} class="text-white drop-shadow-lg" />
                                </div>
                              ) : (
                                <div class="w-1 h-1 rounded-full bg-base-content/10 group-hover:bg-base-content/30 transition-all duration-300 group-hover:scale-150" />
                              )}
                              {!future && <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-base-content/5 rounded-xl pointer-events-none"></div>}
                            </button>
                          </td>
                          </Show>
                        );
                      }}
                    </For>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>

      {validHabits().length === 0 && (
        <div class="flex flex-col items-center justify-center p-20 text-base-content/50 border-2 border-dashed border-base-content/20 rounded-3xl animate-fade-in-up">
          <p class="text-lg font-medium">No habits added yet. Start by adding your first habit!</p>
        </div>
      )}
    </div>
  );
};

export default HabitMatrix;
