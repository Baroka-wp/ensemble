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
      animation: {
        float: 'float 9s ease-in-out infinite',
        'float-delayed': 'float 9s ease-in-out 2s infinite',
        'fade-up': 'fadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up-delay': 'fadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards',
        shimmer: 'shimmer 3s ease-in-out infinite',
        'ticket-pop': 'ticketPop 4s ease-in-out infinite',
        'orbit-outer': 'orbitOuter 28s linear infinite',
        'orbit-inner': 'orbitInner 22s linear infinite reverse',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        orbitOuter: {
          from: { transform: 'rotate(0deg) translateX(9.25rem) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(9.25rem) rotate(-360deg)' },
        },
        orbitInner: {
          from: { transform: 'rotate(0deg) translateX(5.75rem) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(5.75rem) rotate(-360deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(12px, -18px) scale(1.03)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.45' },
          '50%': { opacity: '0.85' },
        },
        ticketPop: {
          '0%, 100%': { transform: 'translateY(8px) scale(0.98)', opacity: '0.92' },
          '50%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
