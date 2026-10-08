/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0B1120',
        surfaceAlt: '#020617',
        accent: '#38bdf8',
        accentSoft: '#0ea5e9',
        danger: '#f97373',
        ink: { DEFAULT: '#08090a', 2: '#0b0c0d', 3: '#101113', 4: '#16171a' },
        paper: '#eeeae0',
        lime: { DEFAULT: '#b7ff49', soft: '#d0ff88' },
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', '"Inter Tight"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        serif: ['"Newsreader Variable"', 'Newsreader', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono Variable"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
