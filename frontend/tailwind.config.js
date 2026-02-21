/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyan:   { DEFAULT: '#38bdf8', dim: '#0ea5e9', glow: 'rgba(56, 189, 248, 0.15)' }, // Sky blue-ish
        orange: { DEFAULT: '#f59e0b', dim: '#d97706' }, // Amber
        red:    { DEFAULT: '#ef4444', dim: '#b91c1c' }, // Red
        green:  { DEFAULT: '#10b981', dim: '#059669' }, // Emerald
        bg: {
          deep:    '#020408', // Almost black
          panel:   'rgba(11, 17, 33, 0.85)', // Dark slate with opacity
          surface: '#1e293b',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'], // More coding-focused mono
        ui:   ['Inter', 'system-ui', 'sans-serif'], // Clean UI font
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1e293b 1px, transparent 1px), linear-gradient(to bottom, #1e293b 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
