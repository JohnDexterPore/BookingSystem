/** @type {import('tailwindcss').Config} */

const withMT = require("@material-tailwind/react/utils/withMT");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"], // Removed extra space
  theme: {
    extend: {
      fontFamily: {
        sans: ["InterVariable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  // ...
});
