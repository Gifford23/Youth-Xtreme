/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          // Uses CSS variables for the toggle
          dark: "rgb(var(--color-bg-dark) / <alpha-value>)",
          gray: "rgb(var(--color-bg-gray) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          text: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
        },
      },
      fontFamily: {
        // ✅ REVERTED: Kept your original fonts
        sans: ["Inter", "sans-serif"],
        display: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};
