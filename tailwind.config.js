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
        primary: {
          DEFAULT: '#3182f6',
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3182f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        surface: {
          light: '#ffffff',
          dark: '#1a1a1a',
        },
        background: {
          light: '#f8f9fa',
          dark: '#0a0a0a',
        },
        border: {
          light: '#e9ecef',
          dark: '#2d2d2d',
        },
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
