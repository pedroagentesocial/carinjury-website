/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Mantener las variables CSS existentes
        primary: 'var(--c1)',
        secondary: 'var(--c2)',
        accent: 'var(--c3)',
        background: 'var(--bg)',
        text: 'var(--text)',
        // --- Paleta del sorteo (portada de senor-casas) — café/oliva/dorado ---
        clay: {
          50: '#FAF4EF', 100: '#F0E2D3', 200: '#DFC2A5', 300: '#C99D75', 400: '#A77149',
          500: '#8B5132', 600: '#6D3D22', 700: '#5A321C', 800: '#412419', 900: '#2A1710',
        },
        moss: {
          50: '#F2F4EB', 100: '#E1E6CC', 200: '#C2CC99', 300: '#9DAB68', 400: '#7B8B45',
          500: '#606D34', 600: '#4A5429', 700: '#3F4925', 800: '#364322', 900: '#1F2614',
        },
        gold: {
          50: '#FEF9E7', 100: '#FDEFC2', 200: '#FBE085', 300: '#F8CC4A', 400: '#F4D03F',
          500: '#E0B72D', 600: '#B89421', 700: '#8A6E18', 800: '#5C4A10', 900: '#2E2508',
        },
      },
      boxShadow: {
        soft: '0 4px 20px -6px rgb(0 0 0 / 0.08)',
        'glow-gold': '0 0 24px -4px rgb(244 208 63 / 0.55)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'slide-down': 'slideDown 0.8s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}