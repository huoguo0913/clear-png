import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        cloud: "#f6f8fb",
        mint: "#13b89a",
        coral: "#f25f4c",
        citrus: "#f4c95d",
        ocean: "#2878ff",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 51, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
