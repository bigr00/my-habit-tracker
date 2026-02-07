/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'habit-matrix-empty': '#1e293b',
        'habit-matrix-check': '#10b981',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["dark"],
  },
}
