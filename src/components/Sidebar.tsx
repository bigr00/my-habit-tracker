import { Component, createMemo, For } from 'solid-js';
import { store } from '../store';
import { isHabitApplicableOnDate } from '../types';
import { format, addDays, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { weekStartsOn } from '../config';
import { SolidApexCharts } from 'solid-apexcharts';
import { Trophy, Flame, Target, TrendingUp, Calendar } from 'lucide-solid';

interface HabitPeriodStats {
  habitId: string;
  done: number;
  target: number;
  percentage: number;
  isMet: boolean;
}

const Sidebar: Component = () => {
  const today = () => format(new Date(), 'yyyy-MM-dd');
  const isWeekView = () => store.state.viewMode === 'week';

  const validHabits = createMemo(() => {
    const habits = store.state.habits;
    if (!Array.isArray(habits)) return [];
    return habits.filter(h => h && h.id && h.name);
  });

  // Date strings for the viewed period — single memo drives everything
  const periodDateStrings = createMemo(() => {
    const current = parseISO(store.state.currentDate);
    const start = isWeekView() ? startOfWeek(current, { weekStartsOn }) : startOfMonth(current);
    const end = isWeekView() ? endOfWeek(current, { weekStartsOn }) : endOfMonth(current);
    return eachDayOfInterval({ start, end }).map(d => format(d, 'yyyy-MM-dd'));
  });

  const periodLabel = createMemo(() => {
    const current = parseISO(store.state.currentDate);
    if (isWeekView()) {
      const ws = startOfWeek(current, { weekStartsOn });
      const we = endOfWeek(current, { weekStartsOn });
      return `${format(ws, 'MMM d')} – ${format(we, 'MMM d')}`;
    }
    return format(current, 'MMMM yyyy');
  });

  // Actual Date objects for the period (needed for isHabitApplicableOnDate)
  const periodDays = createMemo(() => {
    const current = parseISO(store.state.currentDate);
    const start = isWeekView() ? startOfWeek(current, { weekStartsOn }) : startOfMonth(current);
    const end = isWeekView() ? endOfWeek(current, { weekStartsOn }) : endOfMonth(current);
    return eachDayOfInterval({ start, end });
  });

  // All per-habit stats computed in one memo for reliable reactivity
  const habitStats = createMemo((): HabitPeriodStats[] => {
    const habits = validHabits();
    const days = periodDays();
    const dates = periodDateStrings();
    const history = store.state.history;
    const weekView = isWeekView();
    const numWeeks = dates.length / 7;

    return habits.map(h => {
      let done = 0;
      for (const dateStr of dates) {
        if (history[dateStr]?.[h.id]) done++;
      }

      let target: number;
      if (h.specificDays && h.specificDays.length > 0) {
        // Count how many days in this period match the specific days
        target = days.filter(d => isHabitApplicableOnDate(h, d)).length;
      } else {
        target = weekView
          ? h.frequencyPerWeek
          : Math.round(h.frequencyPerWeek * numWeeks);
      }

      const percentage = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
      return {
        habitId: h.id,
        done,
        target,
        percentage,
        isMet: done >= target,
      };
    });
  });

  // Average progress across all habits (not binary met/not-met)
  const completionRate = createMemo(() => {
    const stats = habitStats();
    if (stats.length === 0) return 0;
    const total = stats.reduce((sum, s) => sum + s.percentage, 0);
    return Math.round(total / stats.length);
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
          background: store.state.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
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

  const streakAndScore = createMemo(() => {
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
      <h2 class="text-lg font-bold mb-2 flex items-center gap-2 text-base-content">
        <Target class="text-blue-400 animate-float" size={20} />
        {isWeekView() ? 'Weekly Overview' : 'Monthly Overview'}
      </h2>
      <p class="text-xs text-base-content/40 mb-6 flex items-center gap-1.5">
        <Calendar size={12} />
        {periodLabel()}
      </p>

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
          {completionRate() === 100 ? 'All habits on track!' : `${isWeekView() ? 'Weekly' : 'Monthly'} Progress`}
        </p>
      </div>

      {/* ── Streak & Score cards ──────────────── */}
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 hover:border-orange-500/20 transition-all duration-300 cursor-default group hover:shadow-lg hover:shadow-orange-500/5">
          <div class="text-orange-400 mb-1 group-hover:scale-110 transition-transform duration-300 animate-flame">
            <Flame size={20} />
          </div>
          <div class="text-xl font-bold text-base-content">{streakAndScore().streak}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Current Streak</div>
        </div>
        <div class="bg-base-content/5 p-4 rounded-2xl border border-base-content/5 hover:bg-base-content/10 hover:border-yellow-500/20 transition-all duration-300 cursor-default group hover:shadow-lg hover:shadow-yellow-500/5">
          <div class="text-yellow-400 mb-1 group-hover:scale-110 transition-transform duration-300 animate-trophy">
            <Trophy size={20} />
          </div>
          <div class="text-xl font-bold text-base-content">{streakAndScore().score}</div>
          <div class="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">Habit Score</div>
        </div>
      </div>

      {/* ── Quick Stats ──────────────────────── */}
      <h3 class="text-xs uppercase tracking-widest text-base-content/50 font-bold mb-4 flex items-center gap-2">
        <TrendingUp size={14} class="text-base-content/40" />
        {isWeekView() ? 'This Week' : 'This Month'}
      </h3>
      <div class="space-y-3">
        <For each={habitStats()}>
          {(stat, index) => {
            const habit = () => validHabits().find(h => h.id === stat.habitId);

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
                        'background-color': habit()?.color ?? '#888',
                        'box-shadow': `0 0 8px ${habit()?.color ?? '#888'}50`
                      }}
                    ></div>
                    <span class="text-sm font-semibold text-base-content/70 group-hover:text-base-content transition-colors duration-300">
                      {habit()?.name}
                    </span>
                  </div>
                  <div class={`text-xs font-mono font-bold px-2 py-1 rounded-lg transition-all duration-300
                    ${stat.isMet
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-base-content/40 bg-base-300/50 group-hover:bg-base-300'
                    }`}>
                    {stat.done}/{stat.target}
                  </div>
                </div>
                {/* Progress bar */}
                <div class="h-1 bg-base-content/5 rounded-full overflow-hidden ml-5">
                  <div
                    class="h-full rounded-full transition-all duration-700 animate-progress-fill"
                    style={{
                      width: `${stat.percentage}%`,
                      'background-color': stat.isMet ? '#10b981' : (habit()?.color ?? '#888'),
                      'box-shadow': `0 0 8px ${stat.isMet ? '#10b981' : (habit()?.color ?? '#888')}40`
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
