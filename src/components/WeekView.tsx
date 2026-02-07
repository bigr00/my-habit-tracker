import { Component, For, createMemo, Show } from 'solid-js';
import { store } from '../store';
import { Habit } from '../types';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { CheckCircle2, Circle, PartyPopper, Settings2 } from 'lucide-solid';

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
    <div class="grid grid-cols-1 md:grid-cols-7 gap-6 animate-fade-in-up">
      <For each={weekDays()}>
        {(day, index) => {
          const dayComplete = () => isDayComplete(day);
          const today = isToday(day);

          return (
            <div
              class={`flex flex-col gap-4 p-4 rounded-3xl border transition-all duration-500 animate-fade-in-up
                ${dayComplete()
                  ? 'day-complete-card ring-1 ring-emerald-500/20'
                  : today
                    ? 'day-today-card ring-1 ring-blue-500/20'
                    : 'bg-base-200/40 border-base-content/10 hover:bg-base-200/60 hover:border-base-content/15'
                }`}
              style={{ 'animation-delay': `${index() * 0.07}s` }}
            >
              <div class="flex flex-col items-center gap-1 mb-2">
                <span class={`text-[10px] uppercase tracking-widest font-bold transition-colors duration-500
                  ${dayComplete() ? 'text-emerald-400' : today ? 'text-blue-400' : 'text-base-content/50'}`}>
                  {format(day, 'EEEE')}
                </span>
                <div class="relative">
                  <span class={`text-2xl font-black transition-colors duration-500
                    ${dayComplete() ? 'text-emerald-400' : today ? 'text-base-content' : 'text-base-content/70'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayComplete() && (
                    <PartyPopper size={14} class="absolute -top-2 -right-5 text-emerald-400 animate-check-pop" />
                  )}
                </div>
                {dayComplete() && (
                  <span class="text-[9px] uppercase tracking-widest font-bold text-emerald-400/70 animate-fade-in-up mt-1">
                    All Done!
                  </span>
                )}
              </div>

              <div class="flex flex-col gap-2">
                <For each={validHabits()}>
                  {(habit, habitIndex) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isChecked = () => store.state.history[dateStr]?.[habit.id] || false;

                    return (
                      <button
                        onClick={() => store.toggleHabit(habit.id, dateStr)}
                        class={`group flex items-center justify-between p-3 rounded-2xl transition-all duration-300 btn-press relative
                          ${isChecked()
                            ? 'bg-base-300/80 text-base-content shadow-sm'
                            : 'bg-base-100/50 text-base-content/40 hover:bg-base-200/50 hover:text-base-content/60'
                          }`}
                        style={isChecked() ? { 'box-shadow': `0 2px 12px -3px ${habit.color}30` } : {}}
                      >
                        <div class="flex items-center gap-3 overflow-hidden">
                          <div
                            class={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-500 ${isChecked() ? 'scale-125' : 'scale-100'}`}
                            style={{
                              'background-color': habit.color,
                              'box-shadow': isChecked() ? `0 0 8px ${habit.color}60` : 'none'
                            }}
                          ></div>
                          <span class={`text-xs font-semibold truncate transition-all duration-300 ${isChecked() ? 'opacity-100' : 'opacity-60'}`}>
                            {habit.name}
                          </span>
                          <Show when={habit.frequencyPerWeek < 7}>
                            <span class="text-[9px] font-bold text-base-content/30 bg-base-content/5 px-1 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                              {habit.frequencyPerWeek}x/wk
                            </span>
                          </Show>
                        </div>
                        <div class="flex items-center gap-1">
                          <div
                            onClick={(e) => { e.stopPropagation(); props.onEditHabit(habit); }}
                            class="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-all duration-200 p-0.5 hover:bg-base-content/10 rounded cursor-pointer"
                          >
                            <Settings2 size={12} />
                          </div>
                          <div class={`transition-all duration-300 ${isChecked() ? 'scale-110' : 'opacity-20 group-hover:opacity-100 group-hover:scale-110'}`}>
                            {isChecked() ? (
                              <div class="animate-check-pop">
                                <CheckCircle2 size={18} style={{ color: habit.color }} />
                              </div>
                            ) : (
                              <Circle size={18} />
                            )}
                          </div>
                        </div>
                      </button>
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
