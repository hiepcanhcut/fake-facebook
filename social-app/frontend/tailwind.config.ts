import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Chill book-like palette
        background: "#f4efe6",
        "background-dark": "#0b0f1a",
        surface: "#fffdf7",
        "surface-dark": "#11141a",
        border: "#e7dfd3",
        "border-dark": "#252731",
        primary: "#0b1020",
        "primary-dark": "#e6e0dc",
        secondary: "#6b6f76",
        "secondary-dark": "#9aa0a6",
        accent: "#6d28d9",     // mystical purple
        "accent-light": "#9f7aea",
        "accent-dark": "#4c1d95",
        success: "#2f855a",
        danger: "#e53e3e",
        warning: "#d69e2e",
        info: "#6d28d9",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      spacing: {
        "128": "32rem",
        "144": "36rem",
      },
    },
  },
  plugins: [],
};
export default config;
