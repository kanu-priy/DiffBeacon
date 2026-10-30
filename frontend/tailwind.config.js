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
          50: '#eefbfb',
          100: '#d5f7f8',
          200: '#afedf2',
          300: '#75dfe9',
          400: '#33c8db',
          500: '#06b6d4', // Cyber Cyan
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        violet: {
          500: '#8b5cf6',
          600: '#7c3aed',
          950: '#1e1035',
        },
        surface: {
          deep: '#030712',      // Cosmic void
          base: '#070d1e',      // Midnight navy
          card: '#0c1329',      // Luminous navy glass
          cardHover: '#111a38',  // Elevated hover
          raised: '#172247',
          border: '#1e2d54',
          borderSubtle: '#141e3a',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        signal: {
          verified: '#10b981',
          inferred: '#38bdf8',
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
        'glow-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.4)',
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.35)',
        'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.3)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.3)',
        'card': '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'card-elevated': '0 16px 48px -8px rgba(6, 182, 212, 0.18), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'gradient-shift': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'radar-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'border-beam': {
          '0%': { 'offset-distance': '0%' },
          '100%': { 'offset-distance': '100%' },
        }
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'float': 'float-gentle 4s ease-in-out infinite',
        'float-rev': 'float-reverse 5s ease-in-out infinite',
        'gradient': 'gradient-shift 6s ease infinite',
        'shimmer': 'shimmer 2.5s infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'radar': 'radar-spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
