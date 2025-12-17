/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8f9fa', // Soft white/grey
        surface: '#ffffff',
        primary: '#6b7280', // Slate gray
        secondary: '#e5e7eb', // Light gray
        accent: '#8b5cf6', // Soft purple or maybe a pastel color? Let's stick to neutral/cafe.
        // Cafe theme
        cafe: {
          50: '#fdfbf7', // Cream
          100: '#f5f0e6',
          200: '#e6dcc8',
          300: '#d5c4a1',
          800: '#5c4d3c', // Coffee
          900: '#3e3225',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // We need to add font link in index.html or import
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
