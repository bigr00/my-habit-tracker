import { Component, createMemo, For } from 'solid-js';
import { store } from '../store';
import { format, addDays } from 'date-fns';
import { SolidApexCharts } from 'solid-apexcharts';
import { Trophy, Flame, Target, TrendingUp } from 'lucide-solid';

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
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1200,
        dynamicAnimation: { enabled: true, speed: 500 }
      }
    },
    colors: [completionRate() === 100 ? '#10b981' : '#3b82f6'],
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        track: {
          background: 'rgba(255,255,255,0.05)',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 5,
            fontSize: '24px',
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
    <aside class="w-80 glass border-l border-base-content/5 flex flex-col p-6 overflow-y-auto custom-scrollbar animate-slide-in-right">
      <h2 class="text-lg font-bold mb-6 flex items-center gap-2 text-base-content">
        <Target class="text-blue-400 animate-float" size={20} />
        Today's Overview
      </h2>

      {/* ── Radial chart ─────────────────────── */}
      <div class={`rounded-3xl p-6 mb-6 border flex flex-col items-center shadow-2xl transition-all duration-700 shimmer-container
        ${completionRate() === 100
          ? 'bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/10'
          : 'bg-base-content/5 border-base-content/5'
        }`}>
        <div class="w-full h-40 chart-glow">
          <SolidApexCharts options={chartOptions()} series={series()} type="radialBar" height="100%" />
        </div>
        <p class={`text-sm mt-2 font-medium transition-colors duration-500
          ${completionRate() === 100 ? 'text-emerald-400' : 'text-base-content/60'}`}>
          {completionRate() === 100 ? 'All habits complete!' : 'Daily Progress'}
        </p>
      </div>

      {/* ── Streak & Score cards ──────────────── */}
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 hover:border-orange-500/20 transition-all duration-300 cursor-default group hover:shadow-lg hover:shadow-orange-500/5">
          <div class="text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300 animate-flame">
            <Flame size={20} />
          </div>
          <div class="text-xl font-bold text-base-content">{stats().streak}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Current Streak</div>
        </div>
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 hover:border-yellow-500/20 transition-all duration-300 cursor-default group hover:shadow-lg hover:shadow-yellow-500/5">
          <div class="text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300 animate-trophy">
            <Trophy size={20} />
          </div>
          <div class="text-xl font-bold text-base-content">{stats().score}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Habit Score</div>
        </div>
      </div>

      {/* ── Quick Stats ──────────────────────── */}
      <h3 class="text-xs uppercase tracking-widest text-base-content/50 font-bold mb-4 flex items-center gap-2">
        <TrendingUp size={14} class="text-base-content/40" />
        Quick Stats
      </h3>
      <div class="space-y-3">
        <For each={validHabits()}>
          {(habit, index) => {
            const completedCount = createMemo(() => {
               return Object.values(store.state.history).filter(day => day[habit.id]).length;
            });
            const maxDays = createMemo(() => Object.keys(store.state.history).length || 1);
            const percentage = createMemo(() => Math.round((completedCount() / maxDays()) * 100));

            return (
              <div
                class="group animate-fade-in-up"
                style={{ 'animation-delay': `${0.4 + index() * 0.08}s` }}
              >
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-2 h-2 rounded-full transition-all duration-300 group-hover:scale-150"
                      style={{
                        'background-color': habit.color,
                        'box-shadow': `0 0 8px ${habit.color}50`
                      }}
                    ></div>
                    <span class="text-sm font-semibold text-base-content/70 group-hover:text-base-content transition-colors duration-300">
                      {habit.name}
                    </span>
                  </div>
                  <div class="text-xs font-mono font-bold text-base-content/40 bg-base-300/50 px-2 py-1 rounded-lg group-hover:bg-base-300 transition-all duration-300">
                    {completedCount()}
                  </div>
                </div>
                {/* Mini progress bar */}
                <div class="h-1 bg-base-content/5 rounded-full overflow-hidden ml-5">
                  <div
                    class="h-full rounded-full transition-all duration-700 animate-progress-fill"
                    style={{
                      width: `${percentage()}%`,
                      'background-color': habit.color,
                      'box-shadow': `0 0 8px ${habit.color}40`
                    }}
                  />
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </aside>
  );
};

export default Sidebar;
