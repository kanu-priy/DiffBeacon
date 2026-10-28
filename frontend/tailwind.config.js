/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f5ff',
          100: '#eceffe',
          200: '#dadffd',
          300: '#bac4fb',
          400: '#949ef7',
          500: '#6366f1', // Electric iris / indigo
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          deep: '#07080b',
          base: '#0c0e14',
          card: '#12151e',
          cardHover: '#171b26',
          raised: '#1c212f',
          border: '#212738',
          borderSubtle: '#181d2a',
        },
        signal: {
          verified: '#10b981',
          inferred: '#6366f1',
          warning: '#f59e0b',
          breaking: '#f43f5e',
          unknown: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-brand': '0 0 24px -4px rgba(99, 102, 241, 0.25)',
        'glow-subtle': '0 0 40px -10px rgba(99, 102, 241, 0.12)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'elevated': '0 12px 36px -4px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-subtle': 'shimmer-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
