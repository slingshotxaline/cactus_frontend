/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./features/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fef2f2",
          500: "#dc2626",
          600: "#b91c1c",
          900: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
};
