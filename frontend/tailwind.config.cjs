/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fifa: {
          dark: '#050a1e', // deepest stadium background navy
          navy: '#0f172a', // slate-900 like navy cards
          card: 'rgba(15, 23, 42, 0.75)', // glass card background
          blue: '#0d6efd', // FIFA blue
          azure: '#3b82f6', // bright accent azure
          gold: '#e5c158', // gold accent
          goldDark: '#bfa145', // dark gold
          silver: '#cbd5e1', // slate-300 light text
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
