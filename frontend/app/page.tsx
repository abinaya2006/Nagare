import Link from "next/link";
import { ArrowRight, CalendarClock, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
      <section>
        <p className="text-sm font-medium text-accentPink">Less Planning. More Doing.</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-normal text-slate-950 sm:text-6xl">Pulse Plan</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          An adaptive scheduling companion that turns tasks, deadlines, priorities, and interruptions into a focused plan.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="inline-flex h-11 items-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-medium text-white">
            Start planning <ArrowRight className="size-4" />
          </Link>
          <Link href="/login" className="inline-flex h-11 items-center rounded-md border border-border px-5 text-sm font-medium">Log in</Link>
        </div>
      </section>
      <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Today</p>
            <h2 className="text-xl font-semibold">Adaptive focus plan</h2>
          </div>
          <Sparkles className="size-6 text-accentAmber" />
        </div>
        {["Deep work block", "Assignment draft", "Meeting buffer"].map((item, index) => (
          <div key={item} className="mb-3 grid grid-cols-[80px_1fr] rounded-md border border-border p-3">
            <span className="text-sm font-medium text-accentBlue">{9 + index}:00</span>
            <span>{item}</span>
          </div>
        ))}
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
          <CalendarClock className="size-4" />
          Reschedules when the day changes.
        </div>
      </section>
    </main>
  );
}

