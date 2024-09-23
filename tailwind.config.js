// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}", // Include if applicable
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",   // Include if applicable
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
        // Add additional custom colors here
      },
      zIndex: {
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        // Add other font families if needed
      },
      // Extend other theme properties as needed
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Add other plugins if needed
  ],
};