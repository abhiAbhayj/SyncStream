/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:     ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display:  ['Space Grotesk', 'system-ui', 'sans-serif'],
        sora:     ['Sora', 'system-ui', 'sans-serif'],
        orbitron: ['Orbitron', 'monospace'],
        bebas:    ['Bebas Neue', 'Impact', 'sans-serif'],
        rajdhani: ['Rajdhani', 'system-ui', 'sans-serif'],
        dm:       ['DM Sans', 'system-ui', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Core backgrounds
        darkBg:     'rgb(var(--dark-bg))',
        darkCard:   'rgb(var(--dark-card))',
        darkBorder: 'rgb(var(--dark-border))',
        darkSurf:   'rgb(var(--dark-surf))',
        // Brand accents
        accentCyan:   'rgb(var(--accent-cyan))',
        accentPurple: 'rgb(var(--accent-purple))',
        accentPink:   'rgb(var(--accent-pink))',
        accentGold:   'rgb(var(--accent-gold))',
        accentGreen:  'rgb(var(--accent-green))',
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, rgb(var(--accent-purple)), rgb(var(--accent-cyan)))',
        'gradient-warm':    'linear-gradient(135deg, rgb(var(--accent-pink)), rgb(var(--accent-gold)))',
        'gradient-aurora':  'linear-gradient(135deg, rgb(var(--accent-cyan)), rgb(var(--accent-green)), rgb(var(--accent-purple)))',
        'gradient-card':    'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.95) 100%)',
      },
      boxShadow: {
        'glow-cyan':   '0 0 20px rgba(var(--accent-cyan), 0.35)',
        'glow-purple': '0 0 20px rgba(var(--accent-purple), 0.35)',
        'glow-pink':   '0 0 20px rgba(var(--accent-pink), 0.35)',
        'glow-gold':   '0 0 20px rgba(var(--accent-gold), 0.35)',
        'card':        '0 8px 32px rgba(0,0,0,0.4)',
        'card-hover':  '0 20px 60px rgba(0,0,0,0.6)',
      },
      animation: {
        'pulse-glow':    'pulseGlow 2.5s ease-in-out infinite',
        'fade-in':       'fadeIn 0.5s ease-out forwards',
        'fade-up':       'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up':      'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-x':    'gradientX 8s ease infinite',
        'shimmer':       'shimmer 2.5s infinite linear',
        'float':         'float 6s ease-in-out infinite',
        'aurora':        'aurora 15s ease infinite',
        'spin-slow':     'spin 8s linear infinite',
        'border-flow':   'borderFlow 3s linear infinite',
        'scale-in':      'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'card-rise':     'cardRise 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'bounce-subtle': 'bounceSoft 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(var(--accent-cyan), 0.7))' },
          '50%':      { opacity: '0.7', filter: 'drop-shadow(0 0 2px rgba(var(--accent-cyan), 0.2))' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gradientX: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%':      { 'background-position': '100% 50%' },
        },
        shimmer: {
          '0%':   { 'background-position': '-1000px 0' },
          '100%': { 'background-position': '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        aurora: {
          '0%':   { 'background-position': '0% 50%', 'background-size': '200% 200%' },
          '50%':  { 'background-position': '100% 50%', 'background-size': '250% 250%' },
          '100%': { 'background-position': '0% 50%', 'background-size': '200% 200%' },
        },
        borderFlow: {
          '0%':   { 'background-position': '0% 0%' },
          '100%': { 'background-position': '200% 0%' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        cardRise: {
          '0%':   { opacity: '0', transform: 'translateY(30px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
