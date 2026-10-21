/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        beacon: {
          bg: "#0b0f19",
          card: "#111827",
          border: "#1f293d",
          hover: "#1e293b",
          cyan: "#06b6d4",
          teal: "#14b8a6",
          violet: "#8b5cf6",
          amber: "#f59e0b",
          rose: "#f43f5e",
        }
      }
    },
  },
  plugins: [],
}
