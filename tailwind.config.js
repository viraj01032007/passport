/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#334155',
        navy: { DEFAULT: '#102A43', 900: '#0B1F33', 800: '#102A43', 700: '#1E3A5F', 600: '#334E68' },
        royal: '#1D4ED8',
        cyan: { DEFAULT: '#38BDF8' },
        emerald: { DEFAULT: '#10B981' },
        canvas: '#F8FAFC',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,42,67,.06), 0 12px 32px -12px rgba(16,42,67,.18)',
        lift: '0 30px 60px -20px rgba(16,42,67,.35)',
      },
    },
  },
  plugins: [],
}
