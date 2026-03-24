/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0B0F19',
          50:  '#1a1f2e',
          100: '#141824',
          200: '#0f1320',
          300: '#0B0F19',
        },
        navy: {
          50:  '#eef2f7',
          100: '#d4dfee',
          200: '#a9bfdd',
          300: '#7e9fcb',
          400: '#537fba',
          500: '#2a5fa0',
          600: '#1e4d87',
          700: '#173c6d',
          800: '#102b52',
          900: '#1a2e4a',
          950: '#0d1a2b',
        },
        gold: {
          50:  '#fdf8ec',
          100: '#f9edc9',
          200: '#f3d993',
          300: '#edca5e',
          400: '#e7bc38',
          500: '#c9a84c',
          600: '#b3903a',
          700: '#8f7029',
          800: '#6c521c',
          900: '#4a3810',
        },
        accent: {
          /* Fallback mappings for JSX gradients */
          blue:    '#F99224', /* Orange */
          purple:  '#DE5E19', /* Burnt Orange */
          pink:    '#970F22', /* Dark Red / Crimson */
          cyan:    '#49162B', /* Plum / Dark Burgundy */
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        display: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm':  '0 0 20px -5px rgba(249,146,36,0.2)',
        'glow-md':  '0 0 40px -10px rgba(222,94,25,0.2)',
        'glass':    '0 8px 32px 0 rgba(0,0,0,0.36)',
        'card':     '0 2px 12px 0 rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-out',
        'slide-up':    'slideUp 0.6s ease-out',
        'slide-down':  'slideDown 0.4s ease-out',
        'float':       'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' },                                to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown:  { from: { opacity: '0', transform: 'translateY(-10px)'},  to: { opacity: '1', transform: 'translateY(0)' } },
        float:      { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
}
