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
        forest: {
          50: '#f2f7f5',
          100: '#e1ede8',
          200: '#c5dbd2',
          300: '#9cbdb0',
          400: '#6e9887',
          500: '#1c3e35', // Deep Forest Green (Primary)
          600: '#142c26',
          700: '#0e1f1b',
          800: '#0a1512',
          900: '#050a09',
          950: '#020504',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155', // Slate Primary
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        graphite: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a', // Graphite dark backgrounds
          850: '#1f1f22',
          900: '#18181b',
          950: '#09090b',
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        teal: {
          500: '#14b8a6',
          600: '#0d9488',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
        red: {
          500: '#ef4444',
          600: '#dc2626',
        },
        blue: {
          500: '#3b82f6',
          600: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'premium-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -4px rgba(0, 0, 0, 0.02)',
      }
    },
  },
  plugins: [],
}
