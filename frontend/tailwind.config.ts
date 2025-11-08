import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./fhevm/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'Press Start 2P'", ...fontFamily.mono],
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        wall: {
          bg: "#0D1B2A",
          neon: "#4CC9F0",
          accent: "#F72585",
          emerald: "#4ADB82",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(76, 201, 240, 0.45)",
      },
      animation: {
        shimmer: "shimmer 2.8s linear infinite",
        pulseNeon: "pulseNeon 2.4s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(150%)" },
        },
        pulseNeon: {
          "0%, 100%": { boxShadow: "0 0 18px rgba(76, 201, 240, 0.3)" },
          "50%": { boxShadow: "0 0 32px rgba(76, 201, 240, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

