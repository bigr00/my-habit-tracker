# Stellar Habits

A visually rich, high-performance habit tracker built with **SolidJS**, **TypeScript**, and **Tailwind CSS**. Stellar Habits replaces the traditional calendar grid with a matrix-based visualization designed for instant pattern recognition and satisfying feedback on every interaction.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solid.js](https://img.shields.io/badge/Solid.js-2c4f7c?logo=solid&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=fff)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)

---

## Features

### Habit Management
- Create unlimited habits with custom names, colors (9 options), and flexible scheduling
- Edit or delete habits at any time
- Click any cell or card to toggle completion — no submit buttons, instant save

### Two Views

**Month View (Matrix)** — Habits as rows, days as columns. See an entire month of consistency in one glance. Day headers glow green with a checkmark when all required habits are complete, and blue for today. Non-applicable cells (wrong day for a specific-day habit, or weekly target already met) are dimmed and non-interactive. Sticky headers and habit names keep context while scrolling.

**Week View (Cards)** — Seven large day cards with individual habit toggles inside. Cards celebrate with a party-popper and "All Done!" state when every required habit is checked off. Specific-day habits only appear on their assigned days. Frequency habits show a dot-based progress indicator and collapse into a "Done this week" placeholder once their weekly target is met. Each card has a quick-edit button for adjusting habits on the spot.

### Analytics Sidebar
- Real-time radial progress chart (overall completion %) that turns green at 100%
- Current streak counter — consecutive days with at least one completed habit
- Habit score — cumulative completions scored out of 100
- Per-habit progress bars with completed/target counts, adapting to weekly or monthly view — targets for specific-day habits reflect the actual number of applicable days in the period

### Day-Specific & Flexible Frequency
- **Specific Days** mode — assign a habit to exact days of the week (e.g. Mon/Wed/Fri for Gym). The habit only appears on those days in both views and analytics targets adjust accordingly
- **Times per Week** mode — set a frequency target from 1x to 7x per week. The habit appears on all days until the weekly target is met, then collapses into a dimmed placeholder to stay out of your way
- Toggle between modes when creating or editing any habit; day order respects your configured week-start day
- Non-daily habits display a frequency badge (e.g. "3x/wk" or "Mo/We/Fr") in both views
- Frequency habits show a dot-based weekly progress indicator that fills as you complete them throughout the week
- "Day complete" status only considers habits with a firm daily expectation (daily and specific-day habits) — frequency-mode habits never block a day from going green

### Dark & Light Themes
- Toggle between dark (default) and light mode via the header icon
- All glassmorphism, gradients, glows, and animations adapt to the active theme
- Preference persists across sessions

### Animations
- 25+ hand-tuned CSS keyframe animations: cell bounces on completion, floating icons, shimmer sweeps, glow pulses, staggered fade-ins, modal entrances, flame-flicker streaks, trophy bounces, and more
- Button press scale feedback on every interactive element

### Local-First Data
- All data stored in `localStorage` (key: `stellar_habits_v2`)
- Auto-saves on every change with zero network requests
- Automatic data migration and corruption recovery

### Optional Password Protection
- Set `VITE_APP_PASSWORD` as an environment variable to enable a client-side password gate
- Disabled by default — the app loads with no prompt when the variable is unset
- On correct entry, an auth token is saved to `localStorage` so you're not asked again
- Styled login screen with the app's glassmorphism aesthetic and a shake animation on wrong password

> **Note:** This is a casual client-side deterrent (the password is baked into the JS bundle at build time), not cryptographic security.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | [SolidJS](https://www.solidjs.com/) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS + [DaisyUI](https://daisyui.com/) |
| Animations | [Motion One](https://motion.dev/) + custom CSS keyframes |
| Icons | [Lucide Solid](https://lucide.dev/) |
| Charts | [ApexCharts](https://apexcharts.com/) via solid-apexcharts |
| Dates | [date-fns](https://date-fns.org/) |
| Build | [Vite](https://vitejs.dev/) |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or pnpm

### Installation

```bash
git clone https://github.com/your-username/my-habit-tracker.git
cd my-habit-tracker
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run serve   # preview the production build
```

### Enable Password Protection (optional)

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```
2. Set your password:
   ```
   VITE_APP_PASSWORD=your-secret-here
   ```
3. Rebuild or restart the dev server. The password gate will now appear on load.

On hosting platforms like Vercel or Netlify, add `VITE_APP_PASSWORD` as an environment variable in the project settings instead.

### Configure First Day of Week (optional)

By default the week starts on **Monday**. To start on Sunday instead, set in your `.env`:

```
VITE_WEEK_STARTS_ON=sunday
```

Restart the dev server (or rebuild) for the change to take effect. Valid values: `monday` (default), `sunday`.

---

## Project Structure

```
src/
  index.tsx              # Entry point
  index.css              # Tailwind directives + 25+ custom animations
  App.tsx                # Root layout, header, navigation, modals
  config.ts              # Shared env-driven config (week start day, etc.)
  types/
    index.ts             # Habit, HabitHistory, AppState interfaces + isHabitApplicableOnDate helper
  store/
    index.ts             # Reactive state, actions, localStorage persistence
  components/
    PasswordGate.tsx     # Optional password protection wrapper
    Sidebar.tsx          # Analytics sidebar (chart, streaks, scores, per-habit stats)
    HabitMatrix.tsx      # Month view — matrix grid
    WeekView.tsx         # Week view — day cards
    HabitModal.tsx       # Create / edit / delete habit form
```

---

## Design Philosophy

- **High contrast** — Deep slate/navy backgrounds make neon habit colors pop, so completion states are unmistakable at a glance.
- **Consistency over complexity** — The matrix layout surfaces behavioral patterns (e.g. "I always skip Tuesdays") without menus or drill-downs.
- **Reduced friction** — One click to track, zero network requests, instant visual feedback.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Made for the habit builders.*
