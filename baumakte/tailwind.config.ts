import type { Config } from "tailwindcss";

/** Farben kommen ausschliesslich aus src/styles/tokens.css. Keine weiteren Farbwerte. */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        navy: { 900: "var(--navy-900)", 700: "var(--navy-700)" },
        violet: { 600: "var(--violet-600)", 700: "var(--violet-700)", 50: "var(--violet-50)" },
        gray: { 50: "var(--gray-50)", 200: "var(--gray-200)", 500: "var(--gray-500)" },
        red: { DEFAULT: "var(--red)" },
        amber: { DEFAULT: "var(--amber)" },
        green: { DEFAULT: "var(--green)" },
      },
      borderRadius: { DEFAULT: "10px", lg: "10px", pill: "999px" },
      boxShadow: {
        card: "0 1px 2px rgba(10,11,15,.06), 0 1px 3px rgba(10,11,15,.10)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      minHeight: { touch: "48px" },
      minWidth: { touch: "48px" },
    },
  },
  plugins: [],
};

export default config;
