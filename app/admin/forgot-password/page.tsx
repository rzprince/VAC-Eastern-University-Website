"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || sent) return;
    setPending(true);
    setUnavailable(false);
    const auth = getBrowserSupabase();
    if (!auth) {
      setUnavailable(true);
      setPending(false);
      return;
    }
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    // Use the active domain. No reset tokens/passwords are exposed in our code
    // or stored in the VAC database; Supabase sends expiring, one-use links.
    const redirectTo = new URL("/admin/auth/callback", window.location.origin).toString();
    try {
      await auth.auth.resetPasswordForEmail(email, { redirectTo });
      // Deliberately same response whether email exists or not.
      setSent(true);
    } catch {
      // Network failures can be retried without confirming any account's existence.
      setUnavailable(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card admin-recovery-card">
        <div className="eyebrow">VAC admin security</div>
        <h1>Reset your password</h1>
        {sent ? (
          <div className="admin-security-status" role="status">
            <strong>Check your email.</strong>
            <p>If that address has an account, Supabase will send a secure password reset link.
              Check spam if needed. Never forward the link to anyone.</p>
          </div>
        ) : (
          <>
            <p>Enter your admin account email. We will send an expiring password reset link.
              Only existing VAC administrators can regain dashboard access.</p>
            <form onSubmit={submit} className="admin-reset-form">
              <label>Admin email
                <input name="email" type="email" autoComplete="email" maxLength={254} required />
              </label>
              <button className="primary-button" type="submit" disabled={pending}>
                {pending ? "Requesting link…" : "Email me a reset link"}
              </button>
            </form>
            {unavailable && <p className="form-message error" role="alert">
              We couldn't process this request. Check your connection or retry shortly.
            </p>}
          </>
        )}
        <Link href="/admin/login" className="admin-security-link">← Back to admin login</Link>
      </div>
    </main>
  );
}
