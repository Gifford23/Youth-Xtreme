/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0a0a0a",
          gray: "#171717",
          accent: "#CCFF00",
          text: "#ededed",
          muted: "#a3a3a3",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Oswald", "sans-serif"],
      },
    },
  },
  plugins: [],
};
