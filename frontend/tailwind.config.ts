import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./contexts/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        muted: "hsl(var(--muted))",
        accentPink: "#ff4d8d",
        accentAmber: "#f59e0b",
        accentGreen: "#10b981",
        accentBlue: "#2563eb"
      },
      boxShadow: { soft: "0 14px 40px rgba(15,23,42,.08)" }
    }
  },
  plugins: []
};

export default config;

