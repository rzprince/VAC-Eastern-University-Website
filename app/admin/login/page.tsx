"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const supabase = getBrowserSupabase();
    if (!supabase) {
      setPending(false);
      setError("Authentication is unavailable. Please contact the club administrator.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "")
    });
    if (authError) {
      setPending(false);
      setError("Unable to sign in. Check your credentials and try again.");
      return;
    }

    // The server checks admin_users and all database operations enforce RLS.
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={login}>
        <div className="eyebrow">VAC administration</div>
        <h1>Admin login</h1>
        <p>Secure access to the Visual Archive Club control room.</p>
        <label>Email
          <input type="email" name="email" autoComplete="username" required />
        </label>
        <label>Password
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        <button className="primary-button" type="submit" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <Link className="admin-security-link" href="/admin/forgot-password">
          Forgot your password? Get a secure reset link
        </Link>
        {error && <p className="form-message error" role="alert">{error}</p>}
      </form>
    </main>
  );
}
