import { Component, createSignal, JSX, Show } from 'solid-js';
import { Sparkles, Lock } from 'lucide-solid';

const STORAGE_KEY = 'stellar_habits_auth';
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD as string | undefined;

const PasswordGate: Component<{ children: JSX.Element }> = (props) => {
  // No password configured — render app directly
  if (!APP_PASSWORD) {
    return <>{props.children}</>;
  }

  const expectedToken = btoa(APP_PASSWORD);
  const [authed, setAuthed] = createSignal(localStorage.getItem(STORAGE_KEY) === expectedToken);
  const [input, setInput] = createSignal('');
  const [error, setError] = createSignal(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (btoa(input()) === expectedToken) {
      localStorage.setItem(STORAGE_KEY, expectedToken);
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
      setInput('');
    }
  };

  return (
    <Show when={authed()} fallback={
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-base-100">
        <div class="absolute inset-0 bg-base-100 opacity-90" />
        <div
          class="absolute inset-0"
          style={{
            "background-image":
              "radial-gradient(at 0% 0%, rgba(30, 58, 138, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(88, 28, 135, 0.15) 0px, transparent 50%), radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 60%)",
          }}
        />

        <div class={`relative glass rounded-2xl p-10 w-full max-w-sm shadow-2xl shadow-blue-500/10 border border-base-content/5 ${error() ? 'animate-shake' : ''}`}>
          <div class="flex flex-col items-center gap-6">
            <div class="flex items-center gap-2">
              <Sparkles size={24} class="text-emerald-400 animate-float" />
              <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 via-emerald-400 to-violet-400 bg-clip-text text-transparent">
                Stellar Habits
              </h1>
            </div>

            <div class="flex items-center gap-2 text-base-content/50">
              <Lock size={16} />
              <span class="text-sm font-medium">This app is password protected</span>
            </div>

            <form onSubmit={handleSubmit} class="w-full flex flex-col gap-4">
              <input
                type="password"
                placeholder="Enter password"
                value={input()}
                onInput={(e) => setInput(e.currentTarget.value)}
                class="input input-bordered w-full bg-base-200/50 focus:border-blue-500/50 focus:outline-none transition-all duration-300"
                autofocus
              />
              <button
                type="submit"
                class="btn btn-primary w-full rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                Unlock
              </button>
            </form>
          </div>
        </div>
      </div>
    }>
      {props.children}
    </Show>
  );
};

export default PasswordGate;
