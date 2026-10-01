"use client";

import { FormEvent, useState } from "react";

export function RegistrationForm({
  registrationFee,
  bkashNumber
}: {
  registrationFee: number;
  bkashNumber: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (response.ok) {
      setState("success");
      setMessage(result.message || "Application submitted.");
      form.reset();
    } else {
      setState("error");
      setMessage(result.error || "Could not submit your application.");
    }
  }

  return (
    <form className="registration-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          Full name
          <input name="fullName" required placeholder="As you want it recorded" />
        </label>
        <label>
          EU ID
          <input name="euId" required inputMode="numeric" />
        </label>
        <label>
          Department
          <input name="department" required placeholder="CSE, BBA, LAW…" />
        </label>
        <label>
          Date of birth
          <input name="dateOfBirth" required type="date" />
        </label>
        <label>
          Blood group
          <select name="bloodGroup" required defaultValue="">
            <option value="" disabled>Select</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
        </label>
        <label>
          Email
          <input name="email" required type="email" />
        </label>
        <label>
          Phone + WhatsApp
          <input name="phone" required type="tel" placeholder="01XXXXXXXXX" />
        </label>
        <label className="span-2">
          Address
          <textarea name="address" required rows={2} />
        </label>
        <label className="span-2">
          Skills you have
          <textarea
            name="skills"
            required
            rows={3}
            placeholder="Photography, videography, editing, design, hosting…"
          />
        </label>
        <label className="span-2">
          Why do you want to join VAC?
          <textarea name="reason" required rows={4} />
        </label>
      </div>

      <div className="payment-box">
        <div>
          <small>Registration fee</small>
          <strong>৳{registrationFee}</strong>
        </div>
        <p>
          Send Money to <b>{bkashNumber}</b> using bKash, then enter the sender
          number and Transaction ID below.
        </p>
        <div className="form-grid">
          <label>
            bKash sender number
            <input name="bkashSender" required type="tel" />
          </label>
          <label>
            bKash Transaction ID
            <input name="bkashTransactionId" required placeholder="Example: C8N..." />
          </label>
        </div>
      </div>

      <label className="consent">
        <input type="checkbox" required />
        I confirm that the information and payment reference I submitted are accurate.
      </label>

      <label className="website-honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button className="primary-button" disabled={state === "sending"}>
        {state === "sending" ? "Submitting…" : "Submit membership application"}
      </button>

      {message && <p className={"form-message " + state}>{message}</p>}
    </form>
  );
}
