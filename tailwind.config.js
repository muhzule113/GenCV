/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ink: '#1A1A1A',
        paper: '#FAFAFA',
        sheet: '#F3F0EB',
        surface: '#FFFFFF',
        border: '#E6E6E6',
        rule: '#D6D2CC',
        clip: '#1B6B8F',
        muted: '#888888',
        success: '#16A34A',
        danger: '#DC2626',
        warning: '#D97706',
      },
      fontSize: {
        'display-xl': ['56px', { lineHeight: '1.05', fontWeight: '600' }],
        'display': ['40px', { lineHeight: '1.1', fontWeight: '600' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['17px', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['15px', { lineHeight: '1.6' }],
        'sm': ['13px', { lineHeight: '1.5' }],
        'xs': ['11px', { lineHeight: '1.4' }],
      },
      maxWidth: {
        'container': '1120px',
      },
      letterSpacing: {
        'display': '0.02em',
        'wide': '0.08em',
      },
    },
  },
  plugins: [],
}
