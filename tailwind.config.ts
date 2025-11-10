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
  ],
  theme: {
    extend: {
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
          normal: "#AA9999",
          fighting: "#CC4444",
          flying: "#9BB4E8",
          ground: "#D4A574",
          poison: "#A552CC",
          rock: "#BBAA66",
          bug: "#A8B820",
          ghost: "#705898",
          steel: "#B8B8D0",
          fire: "#FF6600",
          water: "#3399FF",
          grass: "#8DD694",
          electric: "#FFCC33",
          psychic: "#F85888",
          ice: "#66CCCC",
          dragon: "#7038F8",
          dark: "#705848",
          fairy: "#EE99AC",
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

