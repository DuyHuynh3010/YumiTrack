"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserProfile } from "@/lib/supabase/profiles";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(searchParams.get("message"));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        if (data.user) {
          await ensureUserProfile(supabase, data.user);
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?message=Email confirmed. You can log in now.`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        if (data.user) {
          await ensureUserProfile(supabase, data.user);
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      setMessage("Account created. Please check your email to confirm your account before logging in.");
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand" style={{ color: "var(--primary)", marginBottom: 24 }}>
          <span className="brand-mark" style={{ background: "var(--primary)", color: "white" }}>
            Y
          </span>
          <span>
            <strong>YumiTrack</strong>
            <small style={{ color: "var(--muted)" }}>Kyudo journal</small>
          </span>
        </div>

        <p className="eyebrow">{isLogin ? "Welcome back" : "Create account"}</p>
        <h1 style={{ fontSize: 36 }}>{isLogin ? "Log in" : "Sign up"}</h1>

        <form onSubmit={handleSubmit} style={{ marginTop: 22 }}>
          <label className="field">
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
              type="password"
              value={password}
            />
          </label>

          {error ? <p className="form-alert error">{error}</p> : null}
          {message ? <p className="form-alert success">{message}</p> : null}

          <button className="primary-action" disabled={isSubmitting} style={{ marginTop: 22, width: "100%" }} type="submit">
            {isSubmitting ? "Working..." : isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"}>{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
        <p className="hint-text" style={{ marginTop: 12 }}>
          Uses Supabase Auth. Add your Supabase keys in `.env.local` before testing real accounts.
        </p>
      </section>
    </main>
  );
}
