import { Component, For, createMemo, Show } from 'solid-js';
import { store } from '../store';
import { Habit } from '../types';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { Check, PartyPopper, Settings2 } from 'lucide-solid';

interface WeekViewProps {
  onEditHabit: (habit: Habit) => void;
}

const WeekView: Component<WeekViewProps> = (props) => {
  const weekDays = createMemo(() => {
    const start = startOfWeek(parseISO(store.state.currentDate));
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });

  const validHabits = createMemo(() => {
    const habits = store.state.habits;
    if (!Array.isArray(habits)) return [];
    return habits.filter(h => h && h.name);
  });

  // Only daily (7x/week) habits count toward day completion
  const dailyHabits = createMemo(() => validHabits().filter(h => h.frequencyPerWeek === 7));

  const isDayComplete = (day: Date) => {
    const habits = dailyHabits();
    if (habits.length === 0) return false;
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayHistory = store.state.history[dateStr];
    return dayHistory ? habits.every(h => dayHistory[h.id]) : false;
  };

  return (
    <div class="grid grid-cols-1 md:grid-cols-7 gap-4 animate-fade-in-up">
      <For each={weekDays()}>
        {(day, index) => {
          const dayComplete = () => isDayComplete(day);
          const today = isToday(day);

          return (
            <div
              class={`flex flex-col p-5 rounded-3xl border transition-all duration-500 animate-fade-in-up
                ${dayComplete()
                  ? 'day-complete-card ring-1 ring-emerald-500/20'
                  : today
                    ? 'day-today-card ring-1 ring-blue-500/20'
                    : 'bg-base-200/40 border-base-content/10 hover:bg-base-200/60 hover:border-base-content/15'
                }`}
              style={{ 'animation-delay': `${index() * 0.07}s` }}
            >
              {/* ── Day header ──────────────────────── */}
              <div class="flex flex-col items-center gap-1 mb-5">
                <span class={`text-xs uppercase tracking-widest font-bold transition-colors duration-500
                  ${dayComplete() ? 'text-emerald-400' : today ? 'text-blue-400' : 'text-base-content/50'}`}>
                  {format(day, 'EEEE')}
                </span>
                <div class="relative">
                  <span class={`text-3xl font-black transition-colors duration-500
                    ${dayComplete() ? 'text-emerald-400' : today ? 'text-base-content' : 'text-base-content/70'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayComplete() && (
                    <PartyPopper size={16} class="absolute -top-2 -right-6 text-emerald-400 animate-check-pop" />
                  )}
                </div>
                {dayComplete() && (
                  <span class="text-[10px] uppercase tracking-widest font-bold text-emerald-400/70 animate-fade-in-up mt-1">
                    All Done!
                  </span>
                )}
              </div>

              {/* ── Habit cards ─────────────────────── */}
              <div class="flex flex-col gap-3">
                <For each={validHabits()}>
                  {(habit) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isChecked = () => store.state.history[dateStr]?.[habit.id] || false;

                    return (
                      <div
                        onClick={() => store.toggleHabit(habit.id, dateStr)}
                        class={`group relative flex flex-col items-center p-5 rounded-2xl transition-all duration-500 btn-press cursor-pointer overflow-hidden
                          ${isChecked()
                            ? 'text-base-content shadow-lg'
                            : 'bg-base-100/50 text-base-content/50 hover:text-base-content/70 border border-base-content/5 hover:border-base-content/10'
                          }`}
                        style={isChecked() ? {
                          'background': `linear-gradient(165deg, ${habit.color}18 0%, ${habit.color}08 100%)`,
                          'border': `1px solid ${habit.color}30`,
                          'box-shadow': `0 4px 24px -4px ${habit.color}25`
                        } : {}}
                      >
                        {/* Color accent bar at top */}
                        <div
                          class={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${isChecked() ? 'opacity-100' : 'opacity-20 group-hover:opacity-50'}`}
                          style={{ 'background': isChecked() ? habit.color : `linear-gradient(90deg, ${habit.color}60, ${habit.color}20)` }}
                        />

                        {/* Settings button — top-right on hover */}
                        <div
                          onClick={(e) => { e.stopPropagation(); props.onEditHabit(habit); }}
                          class="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-all duration-200 p-1.5 hover:bg-base-content/10 rounded-xl cursor-pointer z-10"
                        >
                          <Settings2 size={13} />
                        </div>

                        {/* Habit name + frequency */}
                        <div class="flex flex-col items-center gap-1.5 mt-2 mb-4 px-1">
                          <span class={`text-sm font-bold text-center leading-snug transition-all duration-300 ${isChecked() ? '' : 'opacity-70'}`}>
                            {habit.name}
                          </span>
                          <Show when={habit.frequencyPerWeek < 7}>
                            <span class="text-[10px] font-semibold text-base-content/30 bg-base-content/5 px-2.5 py-0.5 rounded-full">
                              {habit.frequencyPerWeek}x / week
                            </span>
                          </Show>
                        </div>

                        {/* Big toggle circle */}
                        <div
                          class={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500
                            ${isChecked() ? '' : 'border-2 border-current opacity-20 group-hover:opacity-40 scale-90 group-hover:scale-100'}`}
                          style={isChecked() ? {
                            'background-color': habit.color,
                            'box-shadow': `0 0 16px ${habit.color}50, 0 0 40px ${habit.color}18`
                          } : {}}
                        >
                          {isChecked() ? (
                            <div class="animate-check-pop">
                              <Check size={20} class="text-white drop-shadow-lg" />
                            </div>
                          ) : (
                            <div class="w-1.5 h-1.5 rounded-full bg-current transition-all duration-300 group-hover:scale-150" />
                          )}
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};

export default WeekView;
