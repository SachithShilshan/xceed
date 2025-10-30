/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        xceed: {
          50: '#f5f8ff',
          100: '#eaf0ff',
          500: '#0f62fe',
          600: '#0b56e6',
          700: '#0846b4'
        }
      },
      borderRadius: { xl: '14px' }
    }
  },
  plugins: []
}
