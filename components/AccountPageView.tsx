"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AccountPageView() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? "");
      setNewEmail(data.user?.email ?? "");
    }

    loadUser();
  }, []);

  async function updateEmail() {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });

      if (updateError) {
        throw updateError;
      }

      setMessage("Email update requested. Check your inbox to confirm the change.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update email.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updatePassword() {
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        throw updateError;
      }

      setPassword("");
      setMessage("Password updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not update password.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell activePath="/account">
      <header className="topbar">
        <div>
          <p className="eyebrow">Account</p>
          <h1>Profile settings</h1>
        </div>
      </header>

      {error ? <p className="form-alert error">{error}</p> : null}
      {message ? <p className="form-alert success">{message}</p> : null}

      <section className="two-column-grid" style={{ marginTop: 32 }}>
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Email</p>
              <h2>Login identity</h2>
            </div>
          </div>
          <p className="hint-text" style={{ marginTop: 12 }}>
            Current email: {email || "Loading..."}
          </p>
          <label className="field">
            <span>New email</span>
            <input onChange={(event) => setNewEmail(event.target.value)} type="email" value={newEmail} />
          </label>
          <button className="secondary-action note-save-action" disabled={isSaving || !newEmail} onClick={updateEmail} type="button">
            Update email
          </button>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Security</p>
              <h2>Password</h2>
            </div>
          </div>
          <label className="field">
            <span>New password</span>
            <input minLength={6} onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          <button className="secondary-action note-save-action" disabled={isSaving || password.length < 6} onClick={updatePassword} type="button">
            Update password
          </button>
        </section>
      </section>
    </AppShell>
  );
}
