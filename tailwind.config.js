/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // use 'class' for manual dark mode toggling
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
