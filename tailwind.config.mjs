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
        // --- Paleta del sorteo (marca Car Injury: morado) ---
        // clay = neutral morado (fondos/texto; clay-900 = hero morado profundo)
        clay: {
          50: '#F7F2FA', 100: '#EFE6F3', 200: '#DCCEE5', 300: '#CEC6E2', 400: '#A98FC0',
          500: '#806AAA', 600: '#6A3F75', 700: '#59216F', 800: '#4A1C5A', 900: '#2A0E35',
        },
        // moss = morado de marca (botones primarios / acentos)
        moss: {
          50: '#F6EDF8', 100: '#EAD7EE', 200: '#D6AFDD', 300: '#BA93C2', 400: '#9E5FA9',
          500: '#7A2E87', 600: '#6A3F75', 700: '#59216F', 800: '#4A1C5A', 900: '#34123F',
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