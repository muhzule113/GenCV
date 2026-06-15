/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#0F172A',
        },
        'surface-2': {
          DEFAULT: '#F8FAFC',
          dark: '#1E293B',
        },
        border: {
          DEFAULT: '#E2E8F0',
          dark: '#334155',
        },
        'text-primary': {
          DEFAULT: '#0F172A',
          dark: '#F1F5F9',
        },
        'text-muted': {
          DEFAULT: '#64748B',
          dark: '#94A3B8',
        },
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'card': '12px',
        'modal': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      },
      maxWidth: {
        'container': '1280px',
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.2', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'sm': ['13px', { lineHeight: '1.5' }],
      },
    },
  },
  plugins: [],
}
