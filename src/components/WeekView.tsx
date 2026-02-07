import { Component, For, createMemo } from 'solid-js';
import { store } from '../store';
import { format, startOfWeek, addDays, isToday, parseISO } from 'date-fns';
import { CheckCircle2, Circle } from 'lucide-solid';

const WeekView: Component = () => {
  const weekDays = createMemo(() => {
    const start = startOfWeek(parseISO(store.state.currentDate));
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });

  return (
    <div class="grid grid-cols-1 md:grid-cols-7 gap-6">
      <For each={weekDays()}>
        {(day) => (
          <div class={`flex flex-col gap-4 p-4 rounded-3xl border transition-all duration-500
            ${isToday(day) 
              ? 'bg-blue-500/5 border-blue-500/30 ring-1 ring-blue-500/20' 
              : 'bg-slate-900/40 border-slate-800'
            }`}>
            <div class="flex flex-col items-center gap-1 mb-2">
              <span class={`text-[10px] uppercase tracking-widest font-bold ${isToday(day) ? 'text-blue-400' : 'text-slate-500'}`}>
                {format(day, 'EEEE')}
              </span>
              <span class={`text-2xl font-black ${isToday(day) ? 'text-white' : 'text-slate-300'}`}>
                {format(day, 'd')}
              </span>
            </div>

            <div class="flex flex-col gap-2">
              <For each={store.state.habits}>
                {(habit) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isChecked = () => store.state.history[dateStr]?.[habit.id] || false;
                  
                  return (
                    <button
                      onClick={() => store.toggleHabit(habit.id, dateStr)}
                      class={`group flex items-center justify-between p-3 rounded-2xl transition-all
                        ${isChecked() 
                          ? 'bg-slate-800/80 text-white' 
                          : 'bg-slate-950/40 text-slate-500 hover:bg-slate-800/50'
                        }`}
                    >
                      <div class="flex items-center gap-2 overflow-hidden">
                        <div 
                          class="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                          style={{ 'background-color': habit.color }}
                        ></div>
                        <span class="text-xs font-medium truncate">{habit.name}</span>
                      </div>
                      <div class={`transition-transform duration-300 ${isChecked() ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {isChecked() ? (
                          <CheckCircle2 size={18} style={{ color: habit.color }} />
                        ) : (
                          <Circle size={18} class="opacity-20" />
                        )}
                      </div>
                    </button>
                  );
                }}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

export default WeekView;
