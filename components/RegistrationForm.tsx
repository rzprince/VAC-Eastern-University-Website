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

    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(result.error || "Could not submit your application.");
        return;
      }

      setState("success");
      setMessage(result.message || "Application submitted.");

      if (result.whatsappUrl) {
        window.setTimeout(() => {
          window.location.assign(result.whatsappUrl);
        }, 550);
      }
    } catch {
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <form className="registration-form registration-form--v2" onSubmit={submit}>
      <div className="form-steps">
        <span><b>01</b> Your information</span>
        <span><b>02</b> Send fee by bKash</span>
        <span><b>03</b> Submit</span>
        <span><b>04</b> Send TRX ID in WhatsApp</span>
      </div>

      <div className="form-note">
        <strong>Your application becomes a PDF automatically.</strong>
        <p>
          After submission, this page opens the VAC WhatsApp chat. Send your
          bKash TRX ID there so the committee can confirm the payment manually.
        </p>
      </div>

      <div className="form-grid">
        <label>
          Full name
          <input name="fullName" required maxLength={120} placeholder="As you want it recorded" />
        </label>
        <label>
          Eastern University ID
          <input name="euId" required maxLength={40} inputMode="numeric" autoComplete="off" />
        </label>
        <label>
          Department
          <input name="department" required maxLength={80} placeholder="CSE, BBA, LAW…" />
        </label>
        <label>
          Date of birth
          <input name="dateOfBirth" required type="date" max={new Date().toISOString().slice(0, 10)} />
        </label>
        <label>
          Blood group
          <select name="bloodGroup" required defaultValue="">
            <option value="" disabled>Select blood group</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((group) => (
              <option key={group}>{group}</option>
            ))}
          </select>
        </label>
        <label>
          Email
          <input name="email" required type="email" maxLength={160} autoComplete="email" placeholder="name@example.com" />
        </label>
        <label>
          Phone + WhatsApp
          <input
            name="phone"
            required
            type="tel"
            maxLength={20}
            autoComplete="tel"
            placeholder="01XXXXXXXXX"
          />
        </label>
        <label className="span-2">
          Address
          <textarea name="address" required maxLength={500} rows={3} placeholder="Current address" />
        </label>
        <label className="span-2">
          Skills you have
          <textarea
            name="skills"
            required
            maxLength={1000}
            rows={3}
            placeholder="Photography, videography, editing, design, hosting…"
          />
        </label>
        <label className="span-2">
          Why do you want to join VAC?
          <textarea name="reason" required maxLength={1500} rows={4} placeholder="Tell us what you want to learn, create or contribute." />
        </label>
      </div>

      <div className="payment-box payment-box--v2">
        <div className="payment-price">
          <small>Membership fee</small>
          <strong>৳{registrationFee}</strong>
        </div>
        <div>
          <div className="eyebrow">Manual bKash verification</div>
          <h3>Send Money to {bkashNumber}</h3>
          <p>
            Send the fee first. Then submit this form. WhatsApp opens
            automatically and you send only your TRX ID there.
          </p>
        </div>
        <label className="payment-sender">
          bKash number you sent from
          <input name="bkashSender" required type="tel" maxLength={20} placeholder="01XXXXXXXXX" />
        </label>
        <label className="consent payment-confirm">
          <input name="paymentConfirmed" value="yes" type="checkbox" required />
          <span>I confirm that I have already sent ৳{registrationFee} to {bkashNumber}.</span>
        </label>
      </div>

      <label className="consent">
        <input type="checkbox" required />
        <span>
          I confirm that the information above is accurate and I have read the{" "}
          <a href="/privacy" target="_blank" rel="noreferrer">privacy notice</a>.
        </span>
      </label>

      <label className="website-honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>

      <button className="primary-button form-submit" disabled={state === "sending"}>
        {state === "sending" ? "Creating application PDF…" : "Submit & open WhatsApp"}
      </button>

      {message && (
        <div
          className={"form-message " + state}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </div>
      )}
    </form>
  );
}
