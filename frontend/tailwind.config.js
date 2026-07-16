/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── PRIMARY BRAND: Deep Forest Green (Accent / CTA) ──────────────
        forest: {
          50: '#f2f7f5',
          100: '#e1ede8',
          200: '#c5dbd2',
          300: '#9cbdb0',
          400: '#6e9887',
          500: '#1c3e35',
          600: '#142c26',
          700: '#0e1f1b',
          800: '#0a1512',
          900: '#050a09',
          950: '#020504',
        },
        // ── DARK MODE BASE: Warm Espresso/Mocha ──────────────────────────
        carbon: {
          50:  '#faf8f5',
          100: '#f2ede6',
          200: '#e4d9cc',
          300: '#cebfaa',
          400: '#b39e82',
          500: '#8f7a5e',
          600: '#6b5b44',
          700: '#4a3e2f',   // dark sidebar bg
          750: '#3d3228',   // dark panel bg
          800: '#2e2419',   // dark app bg
          850: '#231b12',   // deeper bg
          900: '#18110c',   // darkest bg
          950: '#100b06',   // absolute darkest
        },
        // ── LIGHT MODE BASE: Warm Cream/Sand ─────────────────────────────
        sand: {
          50:  '#fefcf8',
          100: '#fdf8f0',
          200: '#f9f0e0',
          300: '#f3e4c8',
          400: '#e8d0a6',
          500: '#d4b483',
          600: '#b8935a',
          700: '#8f6e3a',
          800: '#5c4322',
          900: '#372711',
          950: '#1e1508',
        },
        // ── GRAPHITE (neutral fallbacks) ─────────────────────────────────
        graphite: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f22',
          900: '#18181b',
          950: '#09090b',
        },
        // ── SEMANTIC COLORS ───────────────────────────────────────────────
        emerald: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        red: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
        },
        blue: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium':    '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'premium-lg': '0 10px 30px -3px rgba(0,0,0,0.08), 0 4px 10px -4px rgba(0,0,0,0.05)',
        'warm':       '0 4px 20px -2px rgba(143,106,58,0.15)',
        'warm-lg':    '0 12px 40px -4px rgba(143,106,58,0.25)',
        'glow-green': '0 0 20px rgba(28,62,53,0.35)',
      },
      backgroundImage: {
        'warm-dark':  'linear-gradient(135deg, #18110c 0%, #2e2419 50%, #231b12 100%)',
        'warm-light': 'linear-gradient(135deg, #fdf8f0 0%, #fefcf8 50%, #f9f0e0 100%)',
      },
    },
  },
  plugins: [],
}
