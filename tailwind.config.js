/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B263B',
          light: '#2E3F5A',
          dark: '#0D131F'
        },
        secondary: {
          DEFAULT: '#415A77',
          light: '#5E7A9C',
          dark: '#2B3C50'
        },
        accent: {
          DEFAULT: '#C97C5D',
          light: '#E29777',
          dark: '#B06143'
        },
        background: {
          DEFAULT: '#F8F5F2',
          card: '#FFFFFF',
          dark: '#EBE6DF'
        },
        charcoal: {
          DEFAULT: '#222222',
          light: '#4A4A4A',
          dark: '#111111'
        },
        success: {
          DEFAULT: '#2A9D8F',
          light: '#48B3A6',
          dark: '#1E756B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        premium: '0 10px 30px -10px rgba(27, 38, 59, 0.08)',
        'premium-hover': '0 20px 40px -12px rgba(27, 38, 59, 0.15)',
        'accent-glow': '0 8px 20px -6px rgba(201, 124, 93, 0.3)'
      }
    },
  },
  plugins: [],
}
