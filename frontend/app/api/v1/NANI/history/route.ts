import { NextResponse } from "next/server";
import type { NaniMessage } from "@/types";

const history: NaniMessage[] = [
  {
    id: "welcome",
    role: "nani",
    content: "I'm here. Whenever you're ready, tell me what's drifting through your mind.",
    timestamp: new Date().toISOString(),
  },
];

/**
 * GET /api/v1/NANI/history
 * Returns the conversation history with NANI.
 */
export async function GET() {
  return NextResponse.json({ messages: history });
}
