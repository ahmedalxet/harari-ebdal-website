/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        harari: "#b45309", // Your custom color
      },
      fontFamily: {
        poppins: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
