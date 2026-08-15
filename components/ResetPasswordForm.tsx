"use client";

import Link from "next/link";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function sendReset() {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account`,
      });

      if (resetError) {
        throw resetError;
      }

      setMessage("Password reset email sent. Follow the link in your inbox.");
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">Security</p>
        <h1 style={{ fontSize: 36 }}>Reset password</h1>
        <label className="field">
          <span>Email</span>
          <input onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
        </label>
        {error ? <p className="form-alert error">{error}</p> : null}
        {message ? <p className="form-alert success">{message}</p> : null}
        <button className="primary-action" disabled={isSubmitting || !email} onClick={sendReset} style={{ marginTop: 22, width: "100%" }} type="button">
          {isSubmitting ? "Sending..." : "Send reset email"}
        </button>
        <p className="auth-switch">
          Remembered it? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
