import { Component, createSignal, For } from 'solid-js';
import { store } from '../store';
import { X, Check, Sparkles } from 'lucide-solid';

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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-enter" style={{ 'background': 'rgba(0,0,0,0.6)', 'backdrop-filter': 'blur(8px)' }}>
      <div class="bg-base-100 border border-base-content/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/40 animate-modal-enter">
        <div class="flex items-center justify-between p-6 border-b border-base-content/10">
          <h2 class="text-xl font-bold text-base-content flex items-center gap-2">
            <Sparkles size={18} class="text-blue-400" />
            New Habit
          </h2>
          <button onClick={props.onClose} class="p-2 hover:bg-base-200 rounded-full transition-all duration-300 hover:rotate-90 hover:scale-110 btn-press">
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
              class="w-full bg-base-200 border border-base-content/5 rounded-2xl p-4 text-base-content placeholder:text-base-content/40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/30 transition-all duration-300 focus:shadow-lg focus:shadow-blue-500/10"
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
                    class={`h-10 rounded-xl transition-all duration-300 relative flex items-center justify-center btn-press
                      ${selectedColor() === color
                        ? 'ring-2 ring-base-content ring-offset-4 ring-offset-base-100 scale-90'
                        : 'hover:scale-110 hover:shadow-lg'}
                    `}
                    style={{
                      'background-color': color,
                      'box-shadow': selectedColor() === color ? `0 0 20px ${color}50` : ''
                    }}
                  >
                    {selectedColor() === color && (
                      <div class="animate-check-pop">
                        <Check size={16} class="text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                )}
              </For>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              onClick={props.onClose}
              class="flex-1 px-6 py-4 rounded-2xl bg-base-200 hover:bg-base-300 font-bold text-base-content transition-all duration-300 btn-press"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name().trim()}
              class="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 btn-press"
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
