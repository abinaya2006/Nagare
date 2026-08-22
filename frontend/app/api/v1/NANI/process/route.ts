import { NextResponse } from "next/server";

const RESPONSES = [
  "That sounds like a lot to hold at once. Let's set it down gently and look at it together.",
  "I hear you. Want me to fold that into today's flow, or just let it float for now?",
  "Noted - I'll keep that nearby so it doesn't get lost in the jar.",
  "That's a thought worth giving some space to. Tell me more, if you'd like.",
];

/**
 * POST /api/v1/NANI/process
 * Body: { message: string }
 * Returns NANI's reply to the user's message.
 */
export async function POST(request: Request) {
  let message = "";
  try {
    const body = await request.json();
    message = typeof body?.message === "string" ? body.message : "";
  } catch {
    // ignore malformed bodies
  }

  const reply = message
    ? RESPONSES[Math.floor(Math.random() * RESPONSES.length)]
    : "I'm listening whenever you're ready.";

  return NextResponse.json({
    id: `nani-${Date.now()}`,
    reply,
  });
}
