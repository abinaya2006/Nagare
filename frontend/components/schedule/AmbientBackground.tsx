"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AmbientBackground({
  flowBalance = 0,
  orbAnimating = false,
  isGenerating = false,
}: {
  flowBalance?: number;
  orbAnimating?: boolean;
  isGenerating?: boolean;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.5 + 0.4,
      o: Math.random() * 0.35 + 0.05,
      c: Math.random() > 0.5 ? "124,111,205" : "78,205,196",
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.o})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(tick);
    };

    const observer = new ResizeObserver(() => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    });
    observer.observe(canvas);
    tick();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -right-24 -top-48 h-[500px] w-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, #7C6FCD, transparent 70%)",
            opacity: 0.12,
          }}
          animate={{
            x: [0, 30, -10, 0],
            y: [0, -20, 15, 0],
            scale: [1, 1.05, 0.97, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-36 left-12 h-[420px] w-[420px] rounded-full"
          style={{
            background: "radial-gradient(circle, #4ECDC4, transparent 70%)",
            opacity: 0.1,
          }}
          animate={{
            x: [0, -20, 25, 0],
            y: [0, 20, -15, 0],
            scale: [1, 0.95, 1.06, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
        <motion.div
          className="absolute left-1/3 top-1/2 h-[320px] w-[320px] rounded-full"
          style={{
            background: "radial-gradient(circle, #F7A8B8, transparent 70%)",
            opacity: 0.07,
          }}
          animate={{ x: [0, 15, -25, 0], y: [0, 25, -10, 0] }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 9,
          }}
        />
      </div>
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{ zIndex: 1 }}
      />
    </>
  );
}
