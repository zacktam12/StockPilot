/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#1c1e26",
        "background-secondary": "#232734",
        text: "#e5e7eb",
        "text-secondary": "#a1a1aa",
        primary: "#3f51b5",
        "primary-dark": "#303f9f",
        accent: "#3f51b5",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
