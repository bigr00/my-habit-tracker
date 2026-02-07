import { Component, createSignal, For, Show } from 'solid-js';
import { store } from '../store';
import { Habit } from '../types';
import { X, Check, Sparkles, Trash2 } from 'lucide-solid';

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#a855f7'
];

const FREQ_LABELS: Record<number, string> = {
  1: '1x', 2: '2x', 3: '3x', 4: '4x', 5: '5x', 6: '6x', 7: 'Daily'
};

interface HabitModalProps {
  onClose: () => void;
  habit?: Habit;
}

const HabitModal: Component<HabitModalProps> = (props) => {
  const isEdit = () => !!props.habit;
  const [name, setName] = createSignal(props.habit?.name ?? '');
  const [selectedColor, setSelectedColor] = createSignal(props.habit?.color ?? COLORS[0]);
  const [frequency, setFrequency] = createSignal(props.habit?.frequencyPerWeek ?? 7);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name().trim()) return;

    if (isEdit()) {
      store.updateHabit(props.habit!.id, {
        name: name(),
        color: selectedColor(),
        frequencyPerWeek: frequency(),
      });
    } else {
      store.addHabit({
        name: name(),
        color: selectedColor(),
        icon: 'Activity',
        frequencyPerWeek: frequency(),
      });
    }
    props.onClose();
  };

  const handleDelete = () => {
    if (props.habit) {
      store.deleteHabit(props.habit.id);
      props.onClose();
    }
  };

  return (
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdrop-enter" style={{ 'background': 'rgba(0,0,0,0.6)', 'backdrop-filter': 'blur(8px)' }}>
      <div class="bg-base-100 border border-base-content/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/40 animate-modal-enter">
        <div class="flex items-center justify-between p-6 border-b border-base-content/10">
          <h2 class="text-xl font-bold text-base-content flex items-center gap-2">
            <Sparkles size={18} class="text-blue-400" />
            {isEdit() ? 'Edit Habit' : 'New Habit'}
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

          <div class="space-y-3">
            <label class="text-xs uppercase tracking-widest font-bold text-base-content/50">Frequency</label>
            <div class="flex gap-2">
              <For each={[1, 2, 3, 4, 5, 6, 7]}>
                {(n) => (
                  <button
                    type="button"
                    onClick={() => setFrequency(n)}
                    class={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-300 btn-press
                      ${frequency() === n
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-base-200 text-base-content/50 hover:bg-base-300 hover:text-base-content/70'}
                    `}
                  >
                    {FREQ_LABELS[n]}
                  </button>
                )}
              </For>
            </div>
            <p class="text-xs text-base-content/40">
              {frequency() === 7 ? 'Track this habit every day' : `Target: ${frequency()} times per week`}
            </p>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              onClick={props.onClose}
              class="flex-1 px-6 py-4 rounded-2xl bg-base-200 hover:bg-base-300 font-bold text-base-content transition-all duration-300 btn-press"
            >
              Cancel
            </button>
            <Show when={isEdit()}>
              <button
                type="button"
                onClick={handleDelete}
                class="px-4 py-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold transition-all duration-300 btn-press"
              >
                <Trash2 size={18} />
              </button>
            </Show>
            <button
              type="submit"
              disabled={!name().trim()}
              class="flex-[2] px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 btn-press"
            >
              {isEdit() ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;
