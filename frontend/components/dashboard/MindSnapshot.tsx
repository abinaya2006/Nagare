"use client";

import { motion } from "framer-motion";
import type { MindSnapshotData } from "@/types";

interface MindSnapshotProps {
  data: MindSnapshotData;
}

interface RingSpec {
  label: string;
  value: number;
  radius: number;
  color: string;
  glowClass: string;
}

/**
 * Right glass panel: "Mind Snapshot" - total, pending, and completed tasks
 * rendered as slowly filling concentric energy rings rather than raw stats.
 */
export default function MindSnapshot({ data }: MindSnapshotProps) {
  const { total, pending, completed } = data;
  const safeTotal = Math.max(total, 1);

  const rings: RingSpec[] = [
    { label: "Total", value: total, radius: 70, color: "#C9B6FF", glowClass: "drop-shadow-[0_0_6px_rgba(201,182,255,0.7)]" },
    { label: "Pending", value: pending, radius: 52, color: "#FF9D8C", glowClass: "drop-shadow-[0_0_6px_rgba(255,157,140,0.7)]" },
    { label: "Completed", value: completed, radius: 34, color: "#A9C9FF", glowClass: "drop-shadow-[0_0_6px_rgba(169,201,255,0.7)]" },
  ];

  const size = 180;
  const center = size / 2;

  return (
    <div className="glass rounded-glass p-5 sm:p-6">
      <h2 className="font-display text-lg font-medium text-ink">Mind Snapshot</h2>
      <p className="mb-4 text-xs text-ink-soft">The shape of your energy right now.</p>

      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-around">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Task energy rings">
          <title>Task energy rings</title>
          {rings.map((ring) => {
            const ratio = ring.label === "Total" ? 1 : ring.value / safeTotal;
            const circumference = 2 * Math.PI * ring.radius;
            const dash = circumference * Math.min(Math.max(ratio, 0), 1);

            return (
              <g key={ring.label} transform={`rotate(-90 ${center} ${center})`}>
                <circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth={9}
                />
                <motion.circle
                  cx={center}
                  cy={center}
                  r={ring.radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={9}
                  strokeLinecap="round"
                  className={ring.glowClass}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference - dash }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                />
              </g>
            );
          })}
          <text
            x={center}
            y={center - 2}
            textAnchor="middle"
            className="font-display"
            fill="#5B5A78"
            fontSize="22"
            fontWeight={500}
          >
            {total}
          </text>
          <text x={center} y={center + 16} textAnchor="middle" fill="#9C9AB8" fontSize="10">
            total thoughts
          </text>
        </svg>

        <ul className="grid w-full grid-cols-3 gap-3 text-center sm:flex sm:flex-col sm:text-left">
          {rings.map((ring) => (
            <li key={ring.label} className="flex items-center justify-center gap-2 sm:justify-start">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: ring.color }}
              />
              <span className="text-sm text-ink">
                <span className="font-semibold">{ring.value}</span>{" "}
                <span className="text-ink-soft">{ring.label.toLowerCase()}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
