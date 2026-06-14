import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Semantic tokens — resolve from CSS vars, flip automatically ──
        ink:       "var(--text-primary)",
        "ink-soft": "var(--text-secondary)",
        "ink-muted": "var(--text-muted)",
        surface:   "var(--bg-raised)",
        base:      "var(--bg-base)",

        // ── Brand palette (CSS var so dark mode can soften them) ──
        lavender:  "var(--lavender)",
        sky:       "var(--river-blue)",
        gold:      "var(--memory-gold)",
        peach:     "var(--warm-peach)",
        cloud:     "#FCFCFF",   // stays white — only used in gradients

        // ── Fixed accent colors — same in both modes ──
        coral: { DEFAULT: "#FFB4A6", glow: "#FF9D8C" },
        goldglow: { DEFAULT: "#FFD873", soft: "#FFE9B0" },
        lavglow:  { DEFAULT: "#C9B6FF", soft: "#DCCCFF" },
        silver:   { DEFAULT: "#DDE2EC", glow: "#EEF1F7" },

        // ── Nagare dark palette (schedule/world) ──
        void:  "#07051a",
        deep:  "#0a0823",

        // ── CSS variable tokens ──
        border:     "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary:    "hsl(var(--primary))",
        muted:      "hsl(var(--muted))",

        // ── Accents ──
        accentPink:  "#ff4d8d",
        accentAmber: "#f59e0b",
        accentGreen: "#10b981",
        accentBlue:  "#2563eb",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body:    ["var(--font-jakarta)", "sans-serif"],
      },
      borderRadius: {
        glass: "28px",
      },
      boxShadow: {
        soft:         "var(--shadow-soft)",
        glass:        "var(--shadow-card)",
        "glow-coral": "0 0 24px rgba(255,157,140,0.55)",
        "glow-gold":  "0 0 24px rgba(255,216,115,0.55)",
        "glow-lav":   "0 0 24px rgba(201,182,255,0.55)",
        "glow-silver":"0 0 18px rgba(238,241,247,0.7)",
        "glow-nani":  "0 0 30px rgba(232,225,255,0.8)",
      },
      keyframes: {
        drift: {
          "0%, 100%": { transform: "translate(0px, 0px)" },
          "50%":       { transform: "translate(12px, -18px)" },
        },
        "drift-slow": {
          "0%, 100%": { transform: "translate(0px, 0px) scale(1)" },
          "50%":       { transform: "translate(-20px, 24px) scale(1.04)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.85" },
          "50%":       { transform: "scale(1.08)", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(232,225,255,0.55)" },
          "50%":       { boxShadow: "0 0 38px rgba(232,225,255,0.95)" },
        },
        rise: {
          "0%":   { transform: "translateY(0)", opacity: "0" },
          "10%":  { opacity: "0.6" },
          "90%":  { opacity: "0.6" },
          "100%": { transform: "translateY(-120px)", opacity: "0" },
        },
      },
      animation: {
        drift:        "drift 9s ease-in-out infinite",
        "drift-slow": "drift-slow 16s ease-in-out infinite",
        breathe:      "breathe 4.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3.5s ease-in-out infinite",
        rise:         "rise 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
