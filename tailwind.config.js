/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#14532D",     // dark green
        accent: "#4ADE80",      // light green
        secondary: "#1E3A8A",   // dark blue
        neutral: "#6B7280",     // gray

        // light mode
        background: "#F8FAFC",
        surface: "#FFFFFF",
        border: "#E5E7EB",
        text: "#0F172A",
        muted: "#6B7280",

        // dark mode
        darkbg: "#0F172A",
        darksurface: "#1E293B",
        darkborder: "#334155",
        darktext: "#E2E8F0",
        darkmuted: "#94A3B8"
      }
    },
  },
  plugins: [],
}