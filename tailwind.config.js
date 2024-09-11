// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#459cc8",
        secondary: "#5A6672",
        accent: "#6CB1D4",
        background: "#f9fafb",
        textPrimary: "#111827",
        textSecondary: "#6b7280",
      },
    },
  },
  plugins: [],
};
