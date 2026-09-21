/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'totem-lg': ['2.5rem', { lineHeight: '3rem' }],
        'totem-xl': ['4rem', { lineHeight: '4.5rem' }],
      },
      colors: {
        totem: {
          bg: '#ffffff',
          panel: '#f7fbff',
          key: '#e7f4ff',
          border: '#bedbed',
          navy: '#144068',
          accent: '#177574',
          success: '#177574',
          danger: '#f06543',
        },
      },
    },
  },
  plugins: [],
};
