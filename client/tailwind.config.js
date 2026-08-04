/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: 'rgb(var(--dark-bg))',
        darkCard: 'rgb(var(--dark-card))',
        darkBorder: 'rgb(var(--dark-border))',
        accentPrimary: 'rgb(var(--accent-primary))',
        accentSecondary: 'rgb(var(--accent-secondary))',
        accentCyan: 'rgb(var(--accent-cyan))', // keeping for backwards compatibility if missed
        accentPurple: 'rgb(var(--accent-purple))',
        accentPink: 'rgb(var(--accent-pink))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'ambient-shift': 'ambientShift 20s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'card-reveal': 'cardReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ambientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%', transform: 'scale(1)' },
          '50%': { backgroundPosition: '100% 50%', transform: 'scale(1.1)' },
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' }
        },
        cardReveal: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    },
  },
  plugins: [],
}
