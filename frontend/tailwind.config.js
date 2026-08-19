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
        navy: {
          950: '#0A0D23',
          900: '#12163B',
          800: '#1A2052',
          700: '#262E73',
        },
        teal: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        brand: {
          bg: '#F5F6FA',
          card: '#FFFFFF',
          darkBg: '#0D1127',
          darkCard: '#151A38',
          darkBorder: '#232A54',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
