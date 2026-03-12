/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // --- Brand core ---
        primary: "#14532D",       // dark green  — primary buttons, active tabs, headings
        "primary-light": "#166534", // green-800  — button hover/pressed state
        accent: "#4ADE80",        // light green — accents, success indicators, active dots
        "accent-light": "#BBF7D0", // green-200  — accent backgrounds, light badges
        secondary: "#1E3A8A",     // dark blue   — secondary buttons, links, info states
        "secondary-light": "#1D4ED8", // blue-700 — secondary hover state

        // --- Neutrals (gray variants) ---
        neutral: "#6B7280",       // gray-500    — muted icons, inactive tabs
        "neutral-light": "#9CA3AF", // gray-400  — placeholder text
        "neutral-dark": "#374151",  // gray-700  — secondary text

        // --- Semantic ---
        danger: "#DC2626",        // red-600     — delete, errors, destructive actions
        "danger-light": "#FEE2E2", // red-100    — danger backgrounds
        success: "#16A34A",       // green-600   — upload complete, success toasts
        "success-light": "#DCFCE7", // green-100 — success backgrounds
        warning: "#D97706",       // amber-600   — storage warning, caution
        "warning-light": "#FEF3C7", // amber-100 — warning backgrounds

        // --- Light mode surfaces ---
        background: "#F8FAFC",    // slate-50    — all screen backgrounds
        surface: "#FFFFFF",       // white       — cards, modals, sheets
        border: "#E5E7EB",        // gray-200    — input borders, dividers
        text: "#0F172A",          // slate-900   — primary body text
        muted: "#6B7280",         // gray-500    — secondary text, placeholders

        // --- Dark mode surfaces ---
        darkbg: "#0F172A",        // slate-900   — dark screen background
        darksurface: "#1E293B",   // slate-800   — dark cards, sheets
        darkborder: "#334155",    // slate-700   — dark dividers, borders
        darktext: "#E2E8F0",      // slate-200   — dark primary text
        darkmuted: "#94A3B8",     // slate-400   — dark secondary text
      },
      fontFamily: {
        sans: ["Inter_400Regular"],
        medium: ["Inter_500Medium"],
        semibold: ["Inter_600SemiBold"],
        bold: ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
}