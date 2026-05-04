import Link from "next/link";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="brand" style={{ color: "var(--primary)", marginBottom: 24 }}>
          <span className="brand-mark" style={{ background: "var(--primary)", color: "white" }}>
            弓
          </span>
          <span>
            <strong>YumiTrack</strong>
            <small style={{ color: "var(--muted)" }}>Kyudo journal</small>
          </span>
        </div>

        <p className="eyebrow">{isLogin ? "Welcome back" : "Create account"}</p>
        <h1 style={{ fontSize: 36 }}>{isLogin ? "Log in" : "Sign up"}</h1>

        <form style={{ marginTop: 22 }}>
          <label className="field">
            <span>Email</span>
            <input autoComplete="email" placeholder="you@example.com" type="email" />
          </label>
          <label className="field">
            <span>Password</span>
            <input autoComplete={isLogin ? "current-password" : "new-password"} placeholder="••••••••" type="password" />
          </label>
          <button className="primary-action" style={{ marginTop: 22, width: "100%" }} type="button">
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Need an account? " : "Already have an account? "}
          <Link href={isLogin ? "/signup" : "/login"}>{isLogin ? "Sign up" : "Log in"}</Link>
        </p>
        <p className="hint-text" style={{ marginTop: 12 }}>
          Supabase Auth wiring is prepared in the project structure; this form is still in demo mode.
        </p>
      </section>
    </main>
  );
}
