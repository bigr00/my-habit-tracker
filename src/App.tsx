import { Component, createMemo, createSignal, Show } from 'solid-js';
import Sidebar from './components/Sidebar';
import HabitMatrix from './components/HabitMatrix';
import WeekView from './components/WeekView';
import HabitModal from './components/HabitModal';
import { store } from './store';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, List, Plus } from 'lucide-solid';

const App: Component = () => {
  const [showModal, setShowModal] = createSignal(false);
  const currentMonthName = () => format(parseISO(store.state.currentDate), 'MMMM yyyy');

  const navigateMonth = (direction: number) => {
    const date = parseISO(store.state.currentDate);
    const newDate = new Date(date.getFullYear(), date.getMonth() + direction, 1);
    store.setCurrentDate(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <div class="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-16 flex items-center justify-between px-8 border-b border-white/5 glass z-20">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Stellar Habits
            </h1>
            <div class="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1">
              <button 
                onClick={() => store.setViewMode('month')}
                class={`px-3 py-1 rounded-md text-sm transition-all ${store.state.viewMode === 'month' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Month
              </button>
              <button 
                onClick={() => store.setViewMode('week')}
                class={`px-3 py-1 rounded-md text-sm transition-all ${store.state.viewMode === 'week' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Week
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <button onClick={() => navigateMonth(-1)} class="p-1 hover:bg-slate-800 rounded-full transition-colors">
                <ChevronLeft size={20} />
              </button>
              <span class="text-sm font-medium min-w-[120px] text-center">{currentMonthName()}</span>
              <button onClick={() => navigateMonth(1)} class="p-1 hover:bg-slate-800 rounded-full transition-colors">
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
