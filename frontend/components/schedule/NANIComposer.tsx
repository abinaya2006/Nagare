"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CreateTaskInput } from "@/types/task";

interface NANIComposerProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  processing: boolean;
}

export default function NANIComposer({
  onSubmit,
  processing,
}: NANIComposerProps) {
  const [value, setValue] = useState("");
  const [orbFlying, setOrbFlying] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const text = value.trim();
    if (!text || processing) return;
    setValue("");
    // Trigger orb animation
    setOrbFlying(true);
    setTimeout(() => setOrbFlying(false), 1200);
    await onSubmit({ title: text });
  };

  return (
    <div
      className="relative z-10 px-8 py-4"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(7,11,24,0.92) 35%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(14px)",
      }}
    >
      {/* Flying orb animation */}
      <AnimatePresence>
        {orbFlying && (
          <motion.div
            className="pointer-events-none absolute h-5 w-5 rounded-full"
            style={{
              background: "radial-gradient(circle, #7C6FCD, #4ECDC4)",
              boxShadow: "0 0 20px rgba(124,111,205,0.6)",
              bottom: "50%",
              left: "50%",
              zIndex: 50,
            }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            animate={{ opacity: 0, scale: 0, x: -80, y: -140 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.34, 1, 0.64, 1] }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="flex items-center gap-3 rounded-2xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
        whileFocusWithin={{
          borderColor: "rgba(124,111,205,0.4)",
          background: "rgba(255,255,255,0.06)",
          boxShadow:
            "0 0 0 3px rgba(124,111,205,0.1), 0 8px 32px rgba(0,0,0,0.3)",
        }}
        transition={{ duration: 0.2 }}
      >
        {/* NANI pulse dot */}
        <motion.div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{
            background: "#7C6FCD",
            boxShadow: "0 0 10px rgba(124,111,205,0.6)",
          }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="What deserves attention today?"
          disabled={processing}
          className="flex-1 bg-transparent text-[13.5px] outline-none"
          style={{
            color: "rgba(255,255,255,0.9)",
            caretColor: "#7C6FCD",
            fontFamily: "inherit",
          }}
        />
        <motion.button
          onClick={handleSubmit}
          disabled={!value.trim() || processing}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] text-white"
          style={{
            background: "linear-gradient(135deg, #7C6FCD, #4ECDC4)",
            boxShadow: "0 0 12px rgba(124,111,205,0.4)",
            border: "none",
            cursor: value.trim() ? "pointer" : "default",
            opacity: value.trim() ? 1 : 0.4,
            fontFamily: "inherit",
          }}
          whileHover={value.trim() ? { scale: 1.1 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
        >
          {processing ? "·" : "↑"}
        </motion.button>
      </motion.div>

      <p
        className="mt-2 text-center text-[11px]"
        style={{ color: "rgba(255,255,255,0.2)" }}
      >
        Try: "Study DBMS tonight for 90 minutes" or "Build auth module this
        weekend"
      </p>
    </div>
  );
}
