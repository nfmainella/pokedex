import type { Config } from "tailwindcss";

/**
 * Helper function to define Tailwind configuration with TypeScript support
 */
function defineConfig(config: Config): Config {
  return config;
}

export default defineConfig({
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/screens/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#DC0A2D",
        },
        gray: {
          300: "#E0E0E0",
          600: "#5E5E5E",
          900: "#2C2C2C",
        },
        type: {
          normal: "#AAA67F",
          fighting: "#C12239",
          flying: "#A891EC",
          ground: "#DEC16B",
          poison: "#A43E9E",
          rock: "#B69E31",
          bug: "#A7B723",
          ghost: "#70559B",
          steel: "#B7B9D0",
          fire: "#F57D31",
          water: "#6493EB",
          grass: "#74CB48",
          electric: "#F9CF30",
          psychic: "#FB5584",
          ice: "#9AD6DF",
          dragon: "#7037FF",
          dark: "#75574C",
          fairy: "#E69EAC",
        },
      },
      boxShadow: {
        "card-sm": "0.10px 2px 4px rgba(0, 0, 0, 0.1)",
        "card-lg": "0.20px 4px 8px rgba(0, 0, 0, 0.2)",
        "inner-default": "inset 0px 1px 3px 1px rgba(0, 0, 0, 0.25)",
        "outer-active": "0px 1px 3px 1px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
});

