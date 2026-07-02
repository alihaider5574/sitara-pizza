/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Brand ──────────────────────────────────────────────────────────
        'neon-primary': '#FF4D2E',   // fire orange-red
        'neon-secondary': '#7B2FFF', // electric violet
        'neon-cyan': '#00E5FF',      // cyan accent

        // ─── Background scale ────────────────────────────────────────────────
        'bg-base': '#0A0A12',
        'bg-surface': '#12121C',
        'bg-elevated': '#1A1A28',
        'bg-border': 'rgba(255,255,255,0.08)',

        // ─── Text ────────────────────────────────────────────────────────────
        'text-primary': '#F0F0FF',
        'text-secondary': '#A0A0C0',
        'text-muted': '#606080',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #FF4D2E 0%, #7B2FFF 100%)',
        'gradient-neon-hover': 'linear-gradient(135deg, #FF6B4A 0%, #9B4FFF 100%)',
        'gradient-radial-glow': 'radial-gradient(ellipse at center, rgba(255,77,46,0.15) 0%, transparent 70%)',
        'gradient-page': 'linear-gradient(160deg, #0A0A12 0%, #0E0E1A 50%, #12121C 100%)',
        'glass': 'rgba(255,255,255,0.04)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(255,77,46,0.45), 0 0 60px rgba(255,77,46,0.15)',
        'glow-secondary': '0 0 20px rgba(123,47,255,0.45), 0 0 60px rgba(123,47,255,0.15)',
        'glow-cyan': '0 0 20px rgba(0,229,255,0.40)',
        'glass': '0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'card': '0 2px 16px rgba(0,0,0,0.5)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6), 0 0 24px rgba(255,77,46,0.2)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'gradient-shift': 'gradientShift 4s ease infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,77,46,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,77,46,0.6), 0 0 80px rgba(255,77,46,0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
