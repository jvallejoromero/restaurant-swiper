/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#F0F1FB",
        primary: "#d52e4c",
        icon: "#ff3a3a",
      }
    },
  },
  plugins: [],
}