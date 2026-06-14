"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Drop this anywhere in your nav/sidebar.
 * It's a small moon/sun orb that matches the Nagare aesthetic.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={className}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: isDark
          ? "1px solid rgba(255,255,255,0.12)"
          : "1px solid rgba(174,166,219,0.4)",
        background: isDark
          ? "rgba(255,255,255,0.06)"
          : "rgba(232,225,255,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 16,
        transition: "background 0.3s, border 0.3s",
      }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -30, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 30, opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {isDark ? "☽" : "☀︎"}
      </motion.span>
    </motion.button>
  );
}
