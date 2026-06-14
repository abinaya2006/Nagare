import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FCFCFF] px-6">
      {/* Background glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#E8E1FF,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#DDEEFF,transparent_60%)]" />

      {/* Blur orbs */}
      <div className="absolute top-20 left-16 h-32 w-32 rounded-full bg-[#E8E1FF]/60 blur-3xl" />
      <div className="absolute bottom-24 right-16 h-40 w-40 rounded-full bg-[#DDEEFF]/50 blur-3xl" />
      <div className="absolute top-1/2 left-8 h-20 w-20 rounded-full bg-[#FFF4C7]/50 blur-2xl" />
      <div className="absolute top-1/3 right-12 h-16 w-16 rounded-full bg-[#E8E1FF]/40 blur-2xl" />

      {/* Floating thought fragments — hidden on mobile */}
      <div className="absolute top-28 left-[12%] hidden rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm text-[#6D7088] backdrop-blur-md sm:block">
        Learn Japanese
      </div>
      <div className="absolute bottom-36 right-[16%] hidden rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm text-[#6D7088] backdrop-blur-md sm:block">
        Hackathon Demo
      </div>
      <div className="absolute top-[58%] left-[22%] hidden rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm text-[#6D7088] backdrop-blur-md lg:block">
        Build Portfolio
      </div>
      <div className="absolute top-[25%] right-[18%] hidden rounded-full border border-white/50 bg-white/60 px-4 py-2 text-sm text-[#6D7088] backdrop-blur-md lg:block">
        Ship that side project
      </div>

      {/* Hero */}
      <section className="relative z-10 w-full max-w-2xl text-center">


        <h1 className="mb-4 font-serif text-5xl font-normal text-[#2F3142] sm:text-6xl lg:text-7xl">
          Nagare
        </h1>

        <p className="mb-4 text-lg text-[#4A4D68] sm:text-xl lg:text-2xl">
          Where thoughts find their flow.
        </p>

        <div className="mb-10 space-y-1.5 text-sm text-[#6D7088] sm:text-base">
          <p>Some thoughts are unfinished.</p>
          <p>Some dreams are waiting.</p>
          <p>Some plans never find their place.</p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="w-full rounded-full bg-[#2F3142] px-8 py-3.5 text-sm font-medium text-white transition hover:scale-105 hover:bg-[#1e2030] sm:w-auto sm:text-base sm:py-4"
          >
            ✨ Start Planning
          </Link>
          <Link
            href="/login"
            className="w-full rounded-full border border-[#D7DAEA] bg-white/70 px-8 py-3.5 text-sm font-medium text-[#2F3142] backdrop-blur-md transition hover:scale-105 hover:bg-white/90 sm:w-auto sm:text-base sm:py-4"
          >
            Log In
          </Link>
        </div>

        <p className="mt-8 text-xs text-[#A09DB8]">
          Calm productivity · AI-powered flow · No overwhelm
        </p>
      </section>
    </main>
  );
}
