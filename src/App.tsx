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

  const navigateMonth = (direction: number) => {
    const date = parseISO(store.state.currentDate);
    const newDate = new Date(date.getFullYear(), date.getMonth() + direction, 1);
    store.setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <div class="flex h-screen bg-base-100 text-base-content overflow-hidden">
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 flex items-center justify-between px-8 border-b border-base-content/5 glass z-20">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Stellar Habits
            </h1>
            <div class="flex items-center gap-2 bg-base-200/50 rounded-lg p-1">
              <button 
                onClick={() => store.setViewMode('month')}
                class={`px-3 py-1 rounded-md text-sm transition-all ${store.state.viewMode === 'month' ? 'bg-base-300 text-base-content shadow-lg' : 'text-base-content/60 hover:text-base-content'}`}
              >
                Month
              </button>
              <button 
                onClick={() => store.setViewMode('week')}
                class={`px-3 py-1 rounded-md text-sm transition-all ${store.state.viewMode === 'week' ? 'bg-base-300 text-base-content shadow-lg' : 'text-base-content/60 hover:text-base-content'}`}
              >
                Week
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <button onClick={store.toggleTheme} class="p-2 hover:bg-base-200 rounded-full transition-colors text-base-content/70 hover:text-base-content">
              <Show when={store.state.theme === 'dark'} fallback={<Moon size={20} />}>
                <Sun size={20} />
              </Show>
            </button>
            <div class="flex items-center gap-2">
              <button onClick={() => navigateMonth(-1)} class="p-1 hover:bg-base-200 rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span class="text-sm font-medium min-w-[120px] text-center">{currentMonthName()}</span>
              <button onClick={() => navigateMonth(1)} class="p-1 hover:bg-base-200 rounded-full transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <button 
              onClick={() => setShowModal(true)}
              class="btn btn-primary btn-sm gap-2 rounded-xl"
            >
              <Plus size={16} />
              Add Habit
            </button>
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
