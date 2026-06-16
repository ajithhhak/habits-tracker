/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e0fbfc',
          100: '#c2f8cb',
          200: '#8df0d0',
          300: '#4ee4cf',
          400: '#14f1d9', // neon cyan
          500: '#00d2ff', // electric blue
          600: '#009dff',
          700: '#006fff',
          800: '#0047d4',
          900: '#002b80',
        },
        accent: {
          400: '#ff00ff', // hot pink
          500: '#bf00ff', // electric purple
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#1e293b', // shift middle colors darker
          300: '#0f172a',
          400: '#0B1120', // deep space
          500: '#090E17',
          600: '#060A11',
          700: '#04070D',
          800: '#020407',
          900: '#010204',
          950: '#000000', // true black obsidian
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'], // Outfit provides a very modern, geometric look
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'aurora': 'aurora 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        aurora: { 
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.05)' } 
        },
        shimmer: {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' }
        }
      },
    },
  },
  plugins: [],
}
