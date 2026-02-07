import { Component, createMemo, For, Show } from 'solid-js';
import { store } from '../store';
import { format, isToday, parseISO, addDays } from 'date-fns';
import { SolidApexCharts } from 'solid-apexcharts';
import { Trophy, Flame, Star, Target } from 'lucide-solid';

const Sidebar: Component = () => {
  const today = () => format(new Date(), 'yyyy-MM-dd');

  const validHabits = createMemo(() => {
    const habits = store.state.habits;
    if (!Array.isArray(habits)) return [];
    return habits.filter(h => h && h.id && h.name);
  });
  
  const completionRate = createMemo(() => {
    const habits = validHabits();
    if (habits.length === 0) return 0;
    const historyToday = store.state.history[today()] || {};
    const completed = habits.filter(h => historyToday[h.id]).length;
    return Math.round((completed / habits.length) * 100);
  });

  const series = () => [completionRate()];

  const chartOptions = createMemo(() => ({
    chart: {
      type: 'radialBar' as const,
      sparkline: { enabled: true }
    },
    colors: ['#10b981'],
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontSize: '22px',
            fontWeight: 'bold',
            color: store.state.theme === 'dark' ? '#f1f5f9' : '#1e293b',
            formatter: (val: number) => `${val}%`
          }
        }
      }
    },
    stroke: { lineCap: 'round' as const }
  }));

  const stats = createMemo(() => {
    const habits = validHabits();
    if (habits.length === 0) return { streak: 0, score: 0 };
    
    let totalCompletions = 0;
    Object.values(store.state.history).forEach(day => {
      totalCompletions += Object.values(day).filter(Boolean).length;
    });
    
    const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
    const hasToday = Object.values(store.state.history[today()] || {}).some(Boolean);
    const hasYesterday = Object.values(store.state.history[yesterday] || {}).some(Boolean);
    const currentStreak = (hasToday || hasYesterday) ? (hasToday && hasYesterday ? 2 : 1) : 0;

    return {
      streak: currentStreak,
      score: Math.min(100, totalCompletions * 5)
    };
  });

  return (
    <aside class="w-80 glass border-l border-base-content/5 flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <h2 class="text-lg font-bold mb-6 flex items-center gap-2 text-base-content">
        <Target class="text-blue-400" size={20} />
        Today's Overview
      </h2>

      <div class="bg-base-content/5 rounded-3xl p-6 mb-6 border border-base-content/5 flex flex-col items-center shadow-2xl">
        <div class="w-full h-40">
          <SolidApexCharts options={chartOptions()} series={series()} type="radialBar" height="100%" />
        </div>
        <p class="text-sm text-base-content/60 mt-2 font-medium">Daily Progress</p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 transition-all cursor-default group">
          <div class="text-orange-400 mb-1 group-hover:scale-110 transition-transform"><Flame size={20} /></div>
          <div class="text-xl font-bold text-base-content">{stats().streak}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Current Streak</div>
        </div>
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 transition-all cursor-default group">
          <div class="text-yellow-400 mb-1 group-hover:scale-110 transition-transform"><Trophy size={20} /></div>
          <div class="text-xl font-bold text-base-content">{stats().score}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Habit Score</div>
        </div>
      </div>

      <h3 class="text-xs uppercase tracking-widest text-base-content/50 font-bold mb-4">Quick Stats</h3>
      <div class="space-y-4">
        <For each={validHabits()}>
          {(habit) => {
            const completedCount = createMemo(() => {
               return Object.values(store.state.history).filter(day => day[habit.id]).length;
            });
            return (
              <div class="flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ 'background-color': habit.color, 'color': habit.color }}></div>
                  <span class="text-sm font-semibold text-base-content/70 group-hover:text-base-content transition-colors">{habit.name}</span>
                </div>
                <div class="text-xs font-mono font-bold text-base-content/40 bg-base-300/50 px-2 py-1 rounded-lg">
                  {completedCount()}
                </div>
              </div>
            );
          }}
        </For>
      </div>

      <div class="mt-auto pt-8">
        <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 text-white shadow-xl hover:shadow-indigo-500/20 transition-all cursor-pointer group">
          <div class="flex items-center gap-2 mb-2">
            <Star size={16} fill="white" class="group-hover:rotate-12 transition-transform" />
            <span class="text-xs font-bold uppercase tracking-wider">Unlock Pro</span>
          </div>
          <p class="text-[11px] opacity-90 leading-relaxed">
            Get advanced analytics and sync across all your devices.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;