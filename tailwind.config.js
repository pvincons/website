/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1e68a8',
          darkblue: '#0d3d6b',
          orange: '#e87e23',
          gold: '#8c6239',
          brown: '#a67c52',
          gray: '#f4f6f9'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif']
      }
    },
  },
  plugins: [],
}