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

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email.includes("@")) e.email = "Enter a valid email.";
    if (password.length < 8) e.password = "At least 8 characters.";
    if (password !== confirm) e.confirm = "Passwords don't match.";
    return e;
  }

  async function handleSignup() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await signup(email, password);
    } catch (err: any) {
      setErrors({ form: err.message || "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
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
          Start your mindscape
        </p>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "#A09DB8",
            marginBottom: 26,
            lineHeight: 1.5,
          }}
        >
          Your tasks will find their rhythm.
        </p>
        <Field
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          error={errors.email}
          autoComplete="email"
        />
        <Field
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="8+ characters"
          error={errors.password}
          autoComplete="new-password"
        />
        <Field
          label="Confirm password"
          id="confirm"
          type="password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Same again"
          error={errors.confirm}
          autoComplete="new-password"
        />

        {errors.form && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "#C0583A",
              marginBottom: 10,
            }}
          >
            {errors.form}
          </p>
        )}

        <PrimaryBtn onClick={handleSignup} loading={loading}>
          Create account
        </PrimaryBtn>
        <SwitchPrompt
          text="Already here?"
          linkLabel="Sign in"
          onLink={() => router.push("/login")}
        />
      </AuthCard>
    </motion.div>
  );
}
