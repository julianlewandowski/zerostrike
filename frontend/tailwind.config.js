/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyan:   { DEFAULT: '#00e5ff', dim: '#00aabf' },
        orange: { DEFAULT: '#ff6a00', dim: '#b84d00' },
        red:    { DEFAULT: '#ff2020', dim: '#b81515' },
        green:  { DEFAULT: '#00ff99', dim: '#00b86e' },
        bg: {
          deep:    '#030608',
          panel:   '#060d10',
          surface: '#0a1520',
        },
      },
      fontFamily: {
        mono: ['Share Tech Mono', 'Courier New', 'monospace'],
        ui:   ['Rajdhani', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
