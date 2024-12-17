import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "100px",
      },
      boxShadow: {
        goldglow: "0 0 20px #E0B472",
        bronzeglow: "0 0 20px #D7B494",
        silverglow: "0 0 20px #EBECEE",
        silver2glow: "0 0 15px #EBECEE",
        accentglow: "0 0 20px #B6F09C",
      },
      colors: {
        primary: {
          50: "#0D0F10",
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
        glass: {
          100: "#D7EDED",
          200: "#CCEBEB",
        },
        accent: "#B6F09C",
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"],
      },
      backgroundImage: {
        "glass-gradient":
          "linear-gradient(to bottom right, #D7EDED 0%, rgba(204, 235, 235, 0) 100%)",
      },
      opacity: {
        16: "0.16",
      },
    },
  },
  plugins: [],
} satisfies Config;
