"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { useNaniSidebar } from "@/components/providers/NaniProvider";

interface NANISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NANISidebar({ isOpen, onClose }: NANISidebarProps) {
  const { messages, isThinking, error, sendMessage } = useNaniSidebar();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft);
    setDraft("");
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[2px] sm:bg-ink/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label="NANI chat"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="glass-strong fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:w-[420px]"
        style={{ pointerEvents: isOpen ? "auto" : "none" }}
          onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/50 px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-medium text-ink">NANI</h2>
            <p className="text-xs text-ink-soft">What are we untangling today?</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close NANI"
            className="rounded-full p-2 text-ink-soft transition hover:bg-white/50 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
              className={`max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                message.role === "nani"
                  ? "bg-white/60 text-ink"
                  : "ml-auto bg-lavender/70 text-ink"
              }`}
            >
              {message.content}
            </motion.div>
          ))}

          {isThinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex w-fit items-center gap-1 rounded-3xl bg-white/60 px-4 py-3"
              aria-live="polite"
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-lavglow"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          )}

          {error && <p className="text-xs text-coral-glow">{error}</p>}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="border-t border-white/50 px-5 py-4">
          <div className="flex items-center gap-2 rounded-full bg-white/60 px-4 py-2.5 shadow-inner">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Tell me what's on your mind…"
              aria-label="Message NANI"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-lavglow/80 text-[#4f3f8a] transition hover:bg-lavglow disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </div>
        </form>
      </motion.aside>
    </>
  );
}
