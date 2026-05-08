/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        primary: '#007aff',
        accent: {
          lavender: '#E9E7FD',
          mint: '#E2F9F0',
          blue: '#E0F2FE',
        },
        text: {
          primary: '#1d1d1f',
          secondary: '#86868b',
        }
      },
      borderRadius: {
        'bento': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
