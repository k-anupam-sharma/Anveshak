/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f172a", // Dark navy
        surface: "#1e293b", // Charcoal/slate
        border: "#334155",
        primary: "#06b6d4", // Cyan
        secondary: "#3b82f6", // Blue
        accent: "#f59e0b", // Amber for review states
        danger: "#ef4444", // Red for high priority
        muted: "#94a3b8", // Text muted
      }
    },
  },
  plugins: [],
}
