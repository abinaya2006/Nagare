import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFCFF]">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#E8E1FF,transparent_60%)]" />
      {/* Floating Memory Particles */}
      <div className="absolute top-24 left-24 h-24 w-24 rounded-full bg-[#E8E1FF]/50 blur-3xl" />
      <div className="absolute bottom-32 right-24 h-32 w-32 rounded-full bg-[#DDEEFF]/60 blur-3xl" />
      <div className="absolute top-1/2 left-10 h-16 w-16 rounded-full bg-[#FFF4C7]/50 blur-2xl" />
      {/* Thought Fragments */}
      <div className="absolute top-32 left-[15%] rounded-full border border-white/50 bg-white/60 px-4 py-2 backdrop-blur-md">
        Learn Japanese
      </div>
      <div className="absolute bottom-40 right-[20%] rounded-full border border-white/50 bg-white/60 px-4 py-2 backdrop-blur-md">
        Hackathon Demo
      </div>
      <div className="absolute top-[60%] left-[25%] rounded-full border border-white/50 bg-white/60 px-4 py-2 backdrop-blur-md">
        Build Portfolio
      </div>
      {/* Hero */}
      <section className="relative z-10 max-w-2xl text-center">
        <h1 className="mb-6 font-serif text-7xl text-[#2F3142]">Nagare</h1>
        <p className="mb-4 text-2xl text-[#4A4D68]">
          Where thoughts find their flow.
        </p>
        <div className="mb-10 space-y-2 text-[#6D7088]">
          <p>Some thoughts are unfinished.</p>
          <p>Some dreams are waiting.</p>
          <p>Some plans never find their place.</p>
        </div>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-full bg-[#2F3142] px-8 py-4 text-white transition hover:scale-105"
          >
            ✨ Start Planning
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-[#D7DAEA] bg-white/70 px-8 py-4 text-[#2F3142] backdrop-blur-md transition hover:scale-105"
          >
            Log In
          </Link>
        </div>
      </section>
    </main>
  );
}
