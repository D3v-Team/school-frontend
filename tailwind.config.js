const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — orange
        brand: {
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea6c0a",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Dark mode surfaces
        dark: {
          bg:      "#0f172a",
          surface: "#1e293b",
          border:  "#334155",
          text:    "#e2e8f0",
          muted:   "#94a3b8",
        },
      },
    },
  },
  plugins: [],
});
