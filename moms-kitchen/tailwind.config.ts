import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm saffron brand colour
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        cream: "#fffaf3",
        ink: "#2b1d14",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "Noto Sans",
          "sans-serif",
        ],
        display: ["Georgia", "Cambria", "Times New Roman", "ui-serif", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(43,29,20,0.06), 0 4px 16px rgba(43,29,20,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
