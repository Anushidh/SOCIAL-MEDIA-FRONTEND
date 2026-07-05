/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Portfolio-inspired palette
        primary: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0f766e', // accent — main CTA / active state
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
        },
        surface: '#FFFFFF',
        background: '#FAFAF7',
        border: '#E7E5E4',
        // Text scale
        'text-primary':   '#242424',
        'text-secondary': '#6B6B6B',
        'text-muted':     '#9A9A9A',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      keyframes: {
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s cubic-bezier(0.22,1,0.36,1)',
        'fade-up':  'fade-up  0.4s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
};
