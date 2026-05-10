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
        background: '#ffffff',
        foreground: '#0f172a',
        primary: '#007aff',
        secondary: '#00D084',
        accent: '#FF6B35',
        card: '#ffffff',
        border: '#e2e8f0',
        input: '#f1f5f9',
        ring: '#007aff',
        chart: {
          '1': '#007aff',
          '2': '#00D084',
          '3': '#FF6B35',
          '4': '#f59e0b',
          '5': '#8b5cf6'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'bento': '24px'
      }
    },
  },
  plugins: [],
}

