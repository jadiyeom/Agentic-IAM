/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Tight', 'Inter', 'ui-sans-serif', 'system-ui'],
        serif: ['Newsreader', 'Georgia', 'ui-serif', 'serif'],
      },
      colors: {
        surface: '#0B1120',
        surfaceAlt: '#020617',
        accent: '#38bdf8',
        accentSoft: '#0ea5e9',
        danger: '#f97373',
      },
    },
  },
  plugins: [],
};

