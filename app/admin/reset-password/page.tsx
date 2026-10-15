"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBrowserSupabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = getBrowserSupabase();
    if (!supabase) { setReady(true); return; }
    async function checkSession() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (!active) return;
      if (!user) { setReady(true); return; }
      const { data: admin, error } = await supabase!
        .from("admin_users").select("user_id")
        .eq("user_id", user.id).maybeSingle();
      if (!active) return;
      setAllowed(Boolean(admin && !error));
      setReady(true);
    }
    void checkSession();
    return () => { active = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allowed || saving) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");
    if (password.length < 12 || password.length > 128 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
      setMessage("Use 12–128 characters with uppercase, lowercase, a number and a symbol.");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords must match.");
      return;
    }
    setSaving(true);
    setMessage("");
    const supabase = getBrowserSupabase();
    if (!supabase) { setSaving(false); setMessage("Authentication is unavailable."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setAllowed(false);
      setMessage("Your reset session expired. Request a fresh link.");
      return;
    }
    const { data: admin } = await supabase
      .from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!admin) {
      setAllowed(false);
      setSaving(false);
      setMessage("Only authorized VAC admins can use this page.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage("Unable to update password. The reset link may have expired. Request another link.");
      setSaving(false);
      return;
    }
    // End the recovery session so a fresh sign in is required.
    await supabase.auth.signOut({ scope: "local" });
    router.replace("/admin/login?password=updated");
    router.refresh();
  }

  return (
    <main className="admin-login">
      <div className="admin-login-card admin-recovery-card">
        <div className="eyebrow">VAC admin security</div>
        <h1>Choose a new password</h1>
        {!ready ? <p role="status">Verifying your secure recovery link…</p> :
         !allowed ? (
          <div className="admin-security-status" role="alert">
            <p>This reset link is expired, invalid, or not for an authorized VAC administrator.</p>
            <Link href="/admin/forgot-password" className="admin-security-link">
              Request a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="admin-reset-form">
            <p>Choose a unique password with at least 12 characters,
              uppercase, lowercase, numbers and a symbol.</p>
            <label>New password
              <input name="password" type="password" autoComplete="new-password"
                minLength={12} maxLength={128} required />
            </label>
            <label>Confirm new password
              <input name="confirm" type="password" autoComplete="new-password"
                minLength={12} maxLength={128} required />
            </label>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Updating password…" : "Update password securely"}
            </button>
          </form>
        )}
        {message && <p className="form-message error" role="alert">{message}</p>}
        <Link href="/admin/login" className="admin-security-link">← Back to admin login</Link>
      </div>
    </main>
  );
}
