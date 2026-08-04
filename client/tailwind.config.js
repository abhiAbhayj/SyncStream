/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'sans-serif'],
        outfit: ['"Outfit"', 'sans-serif'],
        syne: ['"Syne"', '"Outfit"', 'sans-serif'],
        grotesk: ['"Space Grotesk"', '"Outfit"', 'sans-serif'],
      },
      colors: {
        darkBg: 'rgb(var(--dark-bg))',
        darkCard: 'rgb(var(--dark-card))',
        darkBorder: 'rgb(var(--dark-border))',
        accentCyan: 'rgb(var(--accent-cyan))',
        accentPurple: 'rgb(var(--accent-purple))',
        accentPink: 'rgb(var(--accent-pink))',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite',
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-x': 'gradientX 15s ease infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
        'float': 'floatSlow 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'zoom-in': 'zoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.7))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 3px rgba(0, 240, 255, 0.2))' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(35px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientX: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        shimmer: {
          '0%': { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(1deg)' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.2), 0 0 30px rgba(139, 92, 246, 0.1)' },
          '50%': { boxShadow: '0 0 35px rgba(0, 240, 255, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)' }
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      }
    },
  },
  plugins: [],
}
