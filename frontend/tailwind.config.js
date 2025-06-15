/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Correct - this enables class-based dark mode
  theme: {
    extend: {
      colors: { // Change from backgroundColor/textColor to colors
        background: 'var(--background)',
        'background-secondary': 'var(--background-secondary)',
        text: 'var(--text)',
        'text-secondary': 'var(--text-secondary)',
      },
    },
  },
  plugins: [],
};