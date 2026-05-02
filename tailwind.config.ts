import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090b",
        surface: "#111113",
        surface2: "#1a1a1d",
        border: "#27272a",
        accent: "#f97316",
        text: "#fafafa",
        muted: "#71717a",
      },
      fontFamily: {
        display: ["var(--font-syne)", "system-ui", "sans-serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(249, 115, 22, 0.15), 0 8px 32px rgba(249, 115, 22, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
