/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{tsx, ts}",
    "./components/**/*.{tsx, ts}",
  ],
  theme: {
    extend: {},
    data: {
      active: "ui~=\"active\"",
    },
  },
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      textColor: ["disabled"],
    },
  },
  plugins: [],
}
