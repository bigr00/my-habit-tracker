import { Component, For, createMemo, Show } from 'solid-js';
import { store } from '../store';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { motion } from '@motionone/solid';

const HabitMatrix: Component = () => {
  const daysInMonth = createMemo(() => {
    const date = parseISO(store.state.currentDate);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  });

  return (
    <div class="w-full h-full flex flex-col gap-6">
      <div class="overflow-x-auto custom-scrollbar pb-4">
        <table class="border-separate border-spacing-2">
          <thead>
            <tr>
              <th class="sticky left-0 glass z-20 min-w-[150px] text-left p-4 font-semibold text-base-content/60 border-b border-base-content/5 rounded-tl-2xl">
                Habits
              </th>
              <For each={daysInMonth()}>
                {(day) => (
                  <th class={`min-w-[40px] text-center p-2 text-xs font-bold transition-colors border-b border-base-content/5 ${isToday(day) ? 'text-blue-400' : 'text-base-content/50'}`}>
                    <div class="mb-1 opacity-50 font-medium">{format(day, 'EEE')}</div>
                    <div class={`h-10 w-10 flex items-center justify-center rounded-xl mx-auto transition-all ${isToday(day) ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-base-content/5'}`}>
                      {format(day, 'd')}
                    </div>
                  </th>
                )}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={store.state.habits}>
              {(habit) => (
                <Show when={habit}>
                  <tr>
                    <td class="sticky left-0 glass z-20 p-4 border-b border-base-content/5">
                      <div class="flex items-center gap-3">
                        <div class="w-1.5 h-6 rounded-full shadow-[0_0_10px_currentColor]" style={{ 'background-color': habit.color, 'color': habit.color }}></div>
                        <span class="font-medium text-base-content whitespace-nowrap">{habit.name}</span>
                      </div>
                    </td>
                    <For each={daysInMonth()}>
                      {(day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const isChecked = () => store.state.history[dateStr]?.[habit.id] || false;
                        
                        return (
                          <td class="p-1">
                            <button
                              onClick={() => store.toggleHabit(habit.id, dateStr)}
                              class={`w-8 h-8 rounded-lg transition-all duration-300 relative group flex items-center justify-center
                                ${isChecked() 
                                  ? 'shadow-[0_0_15px_rgba(0,0,0,0.3)]' 
                                  : 'hover:bg-base-200 bg-base-300 border border-base-200'
                                }`}
                              style={{ 
                                'background-color': isChecked() ? habit.color : '',
                                'box-shadow': isChecked() ? `0 0 20px -5px ${habit.color}80` : ''
                              }}
                            >
                              {isChecked() && (
                                <motion.div 
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  class="w-2 h-2 bg-white rounded-full shadow-lg"
                                />
                              )}
                              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 rounded-lg pointer-events-none"></div>
                            </button>
                          </td>
                        );
                      }}
                    </For>
                  </tr>
                </Show>
              )}
            </For>
          </tbody>
        </table>
      </div>
      
      {store.state.habits.length === 0 && (
        <div class="flex flex-col items-center justify-center p-20 text-base-content/50 border-2 border-dashed border-base-content/20 rounded-3xl">
          <p>No habits added yet. Start by adding your first habit!</p>
        </div>
      )}
    </div>
  );
};

export default HabitMatrix;
