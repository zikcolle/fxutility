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
        background: {
          DEFAULT: '#ffffff',
          dark: '#0a0a0b'
        },
        primary: '#007aff',
        accent: {
          lavender: '#E9E7FD',
          mint: '#E2F9F0',
          blue: '#E0F2FE',
        },
        text: {
          primary: {
            DEFAULT: '#1d1d1f',
            dark: '#ffffff'
          },
          secondary: {
            DEFAULT: '#86868b',
            dark: '#888888'
          }
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#111113'
        },
        border: {
          DEFAULT: '#e2e8f0',
          dark: '#1c1c20'
        },
        muted: {
          DEFAULT: '#f0f2f5',
          dark: '#1a1a1c'
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

