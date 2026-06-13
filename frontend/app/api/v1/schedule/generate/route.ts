import { NextResponse } from "next/server";
import type { ScheduleBlock } from "@/types";

const FLOW_VARIANTS: ScheduleBlock[][] = [
  [
    { id: "g1", time: "9:00", label: "Deep Work" },
    { id: "g2", time: "11:00", label: "Break" },
    { id: "g3", time: "11:30", label: "Coding" },
    { id: "g4", time: "14:00", label: "Lunch" },
    { id: "g5", time: "15:00", label: "Project Work" },
  ],
  [
    { id: "g1", time: "8:30", label: "Quiet Planning" },
    { id: "g2", time: "9:30", label: "Focus Block" },
    { id: "g3", time: "12:00", label: "Lunch" },
    { id: "g4", time: "13:00", label: "Meetings" },
    { id: "g5", time: "16:00", label: "Wind Down" },
  ],
  [
    { id: "g1", time: "7:30", label: "Morning Walk" },
    { id: "g2", time: "9:00", label: "Creative Work" },
    { id: "g3", time: "11:30", label: "Admin & Email" },
    { id: "g4", time: "13:00", label: "Lunch" },
    { id: "g5", time: "14:30", label: "Collaborative Work" },
  ],
];

/**
 * POST /api/v1/schedule/generate
 * Returns a freshly suggested daily flow.
 */
export async function POST() {
  const flow = FLOW_VARIANTS[Math.floor(Math.random() * FLOW_VARIANTS.length)];
  return NextResponse.json({ flow });
}
