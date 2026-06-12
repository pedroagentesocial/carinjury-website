/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta canónica vía variables CSS (definidas en src/styles/global.css)
        primary: 'var(--c-purple)',
        secondary: 'var(--c-rose)',
        accent: 'var(--c-violet)',
        lilac: 'var(--c-lilac)',
        deep: 'var(--c-deep)',
        background: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        // Aliases legacy
        c1: 'var(--c1)',
        c2: 'var(--c2)',
        c3: 'var(--c3)',
        c4: 'var(--c4)',
        // --- Paleta del sorteo (morado de marca) ---
        clay: {
          50: '#F7F2FA', 100: '#EFE6F3', 200: '#DCCEE5', 300: '#CEC6E2', 400: '#A98FC0',
          500: '#806AAA', 600: '#6A3F75', 700: '#59216F', 800: '#4A1C5A', 900: '#2A0E35',
        },
        moss: {
          50: '#F6EDF8', 100: '#EAD7EE', 200: '#D6AFDD', 300: '#BA93C2', 400: '#9E5FA9',
          500: '#7A2E87', 600: '#6A3F75', 700: '#59216F', 800: '#4A1C5A', 900: '#34123F',
        },
        gold: {
          50: '#FEF9E7', 100: '#FDEFC2', 200: '#FBE085', 300: '#F8CC4A', 400: '#F4D03F',
          500: '#E0B72D', 600: '#B89421', 700: '#8A6E18', 800: '#5C4A10', 900: '#2E2508',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        soft: '0 4px 20px -6px rgb(0 0 0 / 0.08)',
        'glow-gold': '0 0 24px -4px rgb(244 208 63 / 0.55)',
      },
      maxWidth: {
        content: 'var(--content-max)',
      },
    },
  },
  plugins: [],
};
