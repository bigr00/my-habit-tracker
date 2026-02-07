import { Component, createSignal, For } from 'solid-js';
import { store } from '../store';
import { X, Check } from 'lucide-solid';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#a855f7'
];

interface HabitModalProps {
  onClose: () => void;
}

const HabitModal: Component<HabitModalProps> = (props) => {
  const [name, setName] = createSignal('');
  const [selectedColor, setSelectedColor] = createSignal(COLORS[0]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name().trim()) return;
    
    store.addHabit({
      name: name(),
      color: selectedColor(),
      icon: 'Activity'
    });
    props.onClose();
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-300/80 backdrop-blur-sm">
      <div class="bg-base-100 border border-base-content/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between p-6 border-b border-base-content/10">
          <h2 class="text-xl font-bold text-base-content">New Habit</h2>
          <button onClick={props.onClose} class="p-2 hover:bg-base-200 rounded-full transition-colors">
            <X size={20} class="text-base-content" />
          </button>
        </div>

        <form onSubmit={handleSubmit} class="p-6 space-y-8">
          <div class="space-y-2">
            <label class="text-xs uppercase tracking-widest font-bold text-base-content/50">Habit Name</label>
            <input
              type="text"
              autofocus
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              placeholder="e.g. Morning Yoga"
              class="w-full bg-base-200 border-none rounded-2xl p-4 text-base-content placeholder:text-base-content/40 focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div class="space-y-3">
            <label class="text-xs uppercase tracking-widest font-bold text-base-content/50">Theme Color</label>
            <div class="grid grid-cols-5 gap-3">
              <For each={COLORS}>
                {(color) => (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    class={`h-10 rounded-xl transition-all relative flex items-center justify-center
                      ${selectedColor() === color ? 'ring-2 ring-base-content ring-offset-4 ring-offset-base-100 scale-90' : 'hover:scale-105'}
                    `}
                    style={{ 'background-color': color }}
                  >
                    {selectedColor() === color && <Check size={16} class="text-white" />}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              onClick={props.onClose}
              class="flex-1 px-6 py-4 rounded-2xl bg-base-200 hover:bg-base-300 font-bold text-base-content transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name().trim()}
              class="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-blue-500/20 transition-all"
            >
              Create Habit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
