import { Component, createMemo, createSignal, Show, createEffect } from 'solid-js';
import Sidebar from './components/Sidebar';
import HabitMatrix from './components/HabitMatrix';
import WeekView from './components/WeekView';
import HabitModal from './components/HabitModal';
import { store } from './store';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Plus, Sun, Moon } from 'lucide-solid';

const App: Component = () => {
  const [showModal, setShowModal] = createSignal(false);
  const currentMonthName = () => format(parseISO(store.state.currentDate), 'MMMM yyyy');

  createEffect(() => {
    document.documentElement.setAttribute('data-theme', store.state.theme);
  });

  const goToToday = () => {
    store.setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div class="flex h-screen bg-base-100 text-base-content overflow-hidden font-sans">
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 flex items-center justify-between px-8 border-b border-base-content/5 glass z-30">
          <div class="flex items-center gap-6">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Stellar Habits
            </h1>
            <div class="flex items-center gap-1 bg-base-200/50 rounded-xl p-1">
              <button 
                onClick={() => store.setViewMode('month')}
                class={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${store.state.viewMode === 'month' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}
              >
                Month
              </button>
              <button 
                onClick={() => store.setViewMode('week')}
                class={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${store.state.viewMode === 'week' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}
              >
                Week
              </button>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="flex items-center gap-3">
              <button 
                onClick={goToToday}
                class="px-3 py-1.5 rounded-lg text-xs font-bold border border-base-content/10 hover:bg-base-200 transition-colors"
              >
                Today
              </button>
              <div class="flex items-center gap-1">
                <button onClick={() => navigateMonth(-1)} class="p-1.5 hover:bg-base-200 rounded-full transition-colors text-base-content/60">
                  <ChevronLeft size={18} />
                </button>
                <span class="text-sm font-bold min-w-[130px] text-center">{currentMonthName()}</span>
                <button onClick={() => navigateMonth(1)} class="p-1.5 hover:bg-base-200 rounded-full transition-colors text-base-content/60">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div class="h-6 w-px bg-base-content/10"></div>

            <div class="flex items-center gap-3">
              <button onClick={store.toggleTheme} class="p-2.5 hover:bg-base-200 rounded-xl transition-colors text-base-content/60 hover:text-base-content">
                <Show when={store.state.theme === 'dark'} fallback={<Moon size={20} />}>
                  <Sun size={20} />
                </Show>
              </button>
              <button 
                onClick={() => setShowModal(true)}
                class="btn btn-primary btn-sm h-10 px-4 gap-2 rounded-xl normal-case font-bold shadow-lg shadow-blue-500/20"
              >
                <Plus size={18} />
                Add Habit
              </button>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-auto custom-scrollbar p-8">
          {store.state.viewMode === 'month' ? <HabitMatrix /> : <WeekView />}
        </main>
      </div>

      <Sidebar />

      <Show when={showModal()}>
        <HabitModal onClose={() => setShowModal(false)} />
      </Show>
    </div>
  );
};

export default App;
