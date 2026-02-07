import { Component, For, createMemo } from 'solid-js';
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
              <th class="sticky left-0 bg-slate-950/80 backdrop-blur-md z-20 min-w-[150px] text-left p-2 font-semibold text-slate-400">
                Habits
              </th>
              <For each={daysInMonth()}>
                {(day) => (
                  <th class={`min-w-[32px] text-center p-1 text-xs font-bold transition-colors ${isToday(day) ? 'text-blue-400' : 'text-slate-500'}`}>
                    <div>{format(day, 'EEE')}</div>
                    <div class={`mt-1 h-8 w-8 flex items-center justify-center rounded-full mx-auto ${isToday(day) ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}`}>
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
                <tr>
                  <td class="sticky left-0 bg-slate-950/80 backdrop-blur-md z-20 p-2">
                    <div class="flex items-center gap-3">
                      <div class="w-2 h-8 rounded-full" style={{ 'background-color': habit.color }}></div>
                      <span class="font-medium text-slate-200 whitespace-nowrap">{habit.name}</span>
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
                                : 'hover:bg-slate-800 bg-slate-900 border border-slate-800'
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
              )}
            </For>
          </tbody>
        </table>
      </div>
      
      {store.state.habits.length === 0 && (
        <div class="flex flex-col items-center justify-center p-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl">
          <p>No habits added yet. Start by adding your first habit!</p>
        </div>
      )}
    </div>
  );
};

export default HabitMatrix;
