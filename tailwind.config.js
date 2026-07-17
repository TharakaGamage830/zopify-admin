/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dominant: {
          light: '#faf9f6',
          dark: '#0b0c0e',
        },
        cardbg: {
          light: '#ffffff',
          dark: '#131418',
        },
        secondary: {
          light: '#111111',
          dark: '#f8fafc',
          muted: '#94a3b8',
        },
        accent: {
          DEFAULT: '#7c3aed',
          hover: '#6d28d9',
          light: '#a78bfa',
          lightHover: '#c4b5fd',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
