import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#090909",
        surface: "#121212",
        card: "#171717",
        hover: "#1E1E1E",
        accent: {
          DEFAULT: "#E53935",
          bright: "#FF4B45",
        },
        gold: {
          DEFAULT: "#F6C453",
          dim: "#D9A93C",
        },
        leaf: "#74C043",
        ink: {
          primary: "#FFFFFF",
          secondary: "#B3B3B3",
          muted: "#7A7A7A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 20px 60px rgba(0, 0, 0, 0.5)",
        accentGlow: "0 8px 24px rgba(229, 57, 53, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
