import { Component, createSignal, JSX, Show, onCleanup } from 'solid-js';
import { Sparkles, Lock, ShieldAlert } from 'lucide-solid';

const STORAGE_KEY = 'stellar_habits_auth';
const LOCKOUT_KEY = 'stellar_habits_lockout';
const MAX_ATTEMPTS = 5;
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD as string | undefined;

function getLockout(): { attempts: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, lockedUntil: 0 };
}

function saveLockout(attempts: number, lockedUntil: number) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
}

function lockoutDuration(attempts: number): number {
  // 30s after 5 fails, 60s after 10, 120s after 15, etc.
  const tier = Math.floor((attempts - 1) / MAX_ATTEMPTS);
  return 30_000 * Math.pow(2, tier);
}

const PasswordGate: Component<{ children: JSX.Element }> = (props) => {
  if (!APP_PASSWORD) {
    return <>{props.children}</>;
  }

  const expectedToken = btoa(APP_PASSWORD);
  const [authed, setAuthed] = createSignal(localStorage.getItem(STORAGE_KEY) === expectedToken);
  const [input, setInput] = createSignal('');
  const [error, setError] = createSignal(false);

  const initial = getLockout();
  const [attempts, setAttempts] = createSignal(initial.attempts);
  const [lockedUntil, setLockedUntil] = createSignal(initial.lockedUntil);
  const [remaining, setRemaining] = createSignal(0);

  // Tick the countdown every second while locked out
  const timer = setInterval(() => {
    const left = Math.max(0, lockedUntil() - Date.now());
    setRemaining(left);
  }, 1000);
  onCleanup(() => clearInterval(timer));

  const isLocked = () => remaining() > 0;
  const remainingSeconds = () => Math.ceil(remaining() / 1000);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (isLocked()) return;

    if (btoa(input()) === expectedToken) {
      localStorage.setItem(STORAGE_KEY, expectedToken);
      localStorage.removeItem(LOCKOUT_KEY);
      setAuthed(true);
      setError(false);
    } else {
      const newAttempts = attempts() + 1;
      setAttempts(newAttempts);

      if (newAttempts % MAX_ATTEMPTS === 0) {
        const until = Date.now() + lockoutDuration(newAttempts);
        setLockedUntil(until);
        setRemaining(until - Date.now());
        saveLockout(newAttempts, until);
      } else {
        saveLockout(newAttempts, lockedUntil());
      }

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
                disabled={isLocked()}
                class="input input-bordered w-full bg-base-200/50 focus:border-blue-500/50 focus:outline-none transition-all duration-300 disabled:opacity-50"
                autofocus
              />
              <button
                type="submit"
                disabled={isLocked()}
                class="btn btn-primary w-full rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 disabled:opacity-50"
              >
                {isLocked() ? `Locked — ${remainingSeconds()}s` : 'Unlock'}
              </button>
            </form>

            <Show when={isLocked()}>
              <div class="flex items-center gap-2 text-error/80 text-xs font-medium">
                <ShieldAlert size={14} />
                <span>Too many attempts. Try again in {remainingSeconds()}s.</span>
              </div>
            </Show>
            <Show when={!isLocked() && attempts() > 0 && attempts() % MAX_ATTEMPTS !== 0}>
              <span class="text-base-content/30 text-xs">
                {MAX_ATTEMPTS - (attempts() % MAX_ATTEMPTS)} attempts remaining
              </span>
            </Show>
          </div>
        </div>
      </div>
    }>
      {props.children}
    </Show>
  );
};

export default PasswordGate;
