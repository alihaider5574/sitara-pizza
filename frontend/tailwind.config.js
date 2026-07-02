/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ─── Brand ──────────────────────────────────────────────────────────
        'brand-primary': '#E11D48',   // professional food red
        'brand-primary-hover': '#BE123C',
        'brand-secondary': '#F59E0B', // warm amber
        'brand-accent': '#10B981',    // green (veg/status)

        // ─── Background scale ────────────────────────────────────────────────
        'bg-base': '#F9FAFB',         // light gray
        'bg-surface': '#FFFFFF',      // white
        'bg-elevated': '#FFFFFF',     // white
        'bg-border': 'rgba(0,0,0,0.1)',

        // ─── Text ────────────────────────────────────────────────────────────
        'text-primary': '#111827',    // dark gray
        'text-secondary': '#4B5563',  // medium gray
        'text-muted': '#9CA3AF',      // light gray
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #BE123C 0%, #E11D48 100%)',
        'gradient-page': 'linear-gradient(160deg, #F9FAFB 0%, #F3F4F6 100%)',
        'glass': 'rgba(255,255,255,0.7)',
      },
      boxShadow: {
        'glow-primary': '0 4px 14px 0 rgba(225, 29, 72, 0.39)',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backdropBlur: {
        'glass': '12px',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'bounce-subtle': 'bounceSubtle 0.5s ease',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceSubtle: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
