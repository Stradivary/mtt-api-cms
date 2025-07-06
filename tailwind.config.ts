import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./styles/**/*.{css}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
        italianno: ["var(--font-italianno)", "cursive"],
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};

export default config;
