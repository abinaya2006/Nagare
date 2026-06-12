"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AuthCard, {
  NagareBrand,
  Field,
  PrimaryBtn,
  SwitchPrompt,
} from "@/components/AuthCard";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 420,
        padding: "0 16px",
        margin: "0 auto",
      }}
    >
      <AuthCard>
        <NagareBrand />
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 500,
            color: "#1C1A2E",
            marginBottom: 4,
          }}
        >
          Welcome back
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#A09DB8",
            marginBottom: 26,
            lineHeight: 1.5,
          }}
        >
          Step back into your flow.
        </p>
        <Field
          label="Email"
          id="login-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label="Password"
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        {error && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#C0583A",
              marginBottom: 10,
            }}
          >
            {error}
          </p>
        )}

        <PrimaryBtn onClick={handleLogin} loading={loading}>
          Sign in
        </PrimaryBtn>
        <SwitchPrompt
          text="No account yet?"
          linkLabel="Create one"
          onLink={() => router.push("/signup")}
        />
      </AuthCard>
    </motion.div>
  );
}
