/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(210 40% 50%)',
          light: 'hsl(210 40% 95%)',
          dark: 'hsl(210 40% 30%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 98%)',
          dark: 'hsl(210 30% 15%)',
        },
        accent: {
          DEFAULT: 'hsl(160 60% 50%)',
          dark: 'hsl(160 60% 40%)'
        }
      }
    },
  },
  plugins: [],
}