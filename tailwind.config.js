/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/index.html', './src/client/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        linen: '#F7F2EC',
        mica: '#FBFAF7',
        cream: '#FFF9F2',
        sand: '#EDE4D8',
        warmgray: '#A89E91',
        deepspace: '#1F1F23',
        espresso: '#2C2420',
        terracotta: '#C4684A',
        sage: '#5C7355',
        wine: '#6E3B44',
        halo: '#FFB783',
        orange: '#F97316',
        'orange-dark': '#EA580C',
        amber: '#E8A87C',
      },
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wider2: '0.08em',
      },
    },
  },
  plugins: [],
};
