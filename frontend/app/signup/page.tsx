"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await signup(email, password);
    } catch {
      setError("Could not create that account.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-semibold">Create account</h1>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        <Input type="email" required placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Input type="password" required minLength={8} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <Button>Create account</Button>
      </form>
      <p className="mt-4 text-sm text-slate-600">Already joined? <Link className="font-medium" href="/login">Log in</Link></p>
    </main>
  );
}

