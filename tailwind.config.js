/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // Custom scrollbar plugin
    plugin(function({ addBase }) {
      addBase({
        '*': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#888 #f1f1f1',
        },
        '*::-webkit-scrollbar': {
          width: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '*::-webkit-scrollbar-thumb': {
          background: '#888',
          'border-radius': '3px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      })
    })
  ],
}
