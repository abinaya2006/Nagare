export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <section className="mt-6 rounded-lg border border-border bg-white p-4">
        <h2 className="font-medium">Work preferences</h2>
        <p className="mt-2 text-sm text-slate-600">Default work hours and productivity periods are sent with schedule requests. Persistent preference editing is ready to add on top of the existing schedule context.</p>
      </section>
      <section className="mt-4 rounded-lg border border-border bg-white p-4">
        <h2 className="font-medium">Future extensions</h2>
        <p className="mt-2 text-sm text-slate-600">ORDA is text-first today, with service boundaries ready for wake-word activation, voice input, analytics, teams, mobile clients, archival storage, and alternative AI providers.</p>
      </section>
    </main>
  );
}

