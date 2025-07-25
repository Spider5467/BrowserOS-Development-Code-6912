/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}