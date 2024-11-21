import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#131619",
          200: "#1A1D21",
          300: "#686B6E",
          400: "#9B9C9E",
          600: "#CDCECF",
          500: "#363A3D",
        },
        secondary: {
          100: "#0C1132",
        },
        gradientGreen: {
          100: "#82DBF7",
          200: "#B6F09C",
        },
        gradientBlue: {
          100: "#4D62E5",
          200: "#87DDEE",
          300: "#B6F09C",
        },
        accent: "#B6F09C",
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
