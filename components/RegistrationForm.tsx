"use client";

import { FormEvent, useEffect, useState } from "react";
import { VacLogo } from "@/components/BrandLogo";

type SuccessData = {
  applicationRef: string;
  whatsappUrl: string;
  pdfDownloadUrl: string | null;
};

export function RegistrationForm({
  registrationFee,
  bkashNumber
}: {
  registrationFee: number;
  bkashNumber: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [preparedPdfUrl, setPreparedPdfUrl] = useState<string | null>(null);

  // Fetch the stored PDF while the applicant reads their success message.
  // Clicking Download is instant after the file has been prepared.
  useEffect(() => {
    if (!success?.pdfDownloadUrl) return;
    const controller = new AbortController();
    let objectUrl: string | null = null;
    fetch(success.pdfDownloadUrl, {
      credentials: "same-origin",
      signal: controller.signal
    }).then(async (response) => {
      if (!response.ok) return;
      const blob = await response.blob();
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setPreparedPdfUrl(objectUrl);
    }).catch(() => {
      // Direct secure PDF link remains available if preloading fails.
    });
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setPreparedPdfUrl(null);
    };
  }, [success?.pdfDownloadUrl]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setMessage("");
    setSuccess(null);
    setPreparedPdfUrl(null);

    // Open a user-initiated tab immediately so WhatsApp is not blocked after
    // the asynchronous database/PDF work completes.
    const whatsappWindow = window.open("", "_blank");
    if (whatsappWindow) {
      whatsappWindow.opener = null;
      whatsappWindow.document.title = "Opening VAC WhatsApp…";
      whatsappWindow.document.body.innerHTML =
        '<div style="font-family:system-ui;background:#0a0a0a;color:#fff;min-height:100vh;display:grid;place-items:center;margin:0"><p>Preparing your VAC application…</p></div>';
    }

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
        whatsappWindow?.close();
        setState("error");
        setMessage(result.error || "Could not submit your application.");
        return;
      }

      const nextSuccess: SuccessData = {
        applicationRef: result.applicationRef,
        whatsappUrl: result.whatsappUrl,
        pdfDownloadUrl: result.pdfDownloadUrl || null
      };

      setSuccess(nextSuccess);
      setState("success");
      setMessage("Application submitted successfully.");

      if (whatsappWindow && result.whatsappUrl) {
        whatsappWindow.location.href = result.whatsappUrl;
      }
    } catch {
      whatsappWindow?.close();
      setState("error");
      setMessage("Network error. Please check your connection and try again.");
    }
  }

  return (
    <>
      <form className="registration-form registration-form--v3" onSubmit={submit}>
        <div className="form-steps">
          <span><b>01</b> Your information</span>
          <span><b>02</b> Send fee by bKash</span>
          <span><b>03</b> Submit application</span>
          <span><b>04</b> Send TRX ID in WhatsApp</span>
        </div>

        <div className="form-note form-note--premium">
          <span className="form-note-mark">VAC</span>
          <div>
            <strong>Your completed application becomes a VAC PDF.</strong>
            <p>
              After submission, WhatsApp opens in a new tab for your TRX ID.
              This page stays open and gives you a private button to download
              your completed application PDF.
            </p>
          </div>
        </div>

        <div className="form-section-heading">
          <span>01</span>
          <div>
            <strong>Applicant information</strong>
            <small>Use your current Eastern University details.</small>
          </div>
        </div>

        <div className="form-grid">
          <label>
            Full name
            <input name="fullName" required maxLength={120} placeholder="Your full name" />
          </label>
          <label>
            Eastern University ID
            <input name="euId" required maxLength={40} inputMode="numeric" autoComplete="off" placeholder="Student ID" />
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
            Email / Gmail
            <input name="email" required type="email" maxLength={160} autoComplete="email" placeholder="name@gmail.com" />
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

        <div className="form-section-heading form-section-heading--payment">
          <span>02</span>
          <div>
            <strong>Membership payment</strong>
            <small>Manual verification through the VAC WhatsApp chat.</small>
          </div>
        </div>

        <div className="payment-box payment-box--v3">
          <div className="payment-price">
            <small>Membership fee</small>
            <strong>৳{registrationFee}</strong>
          </div>
          <div className="payment-instructions">
            <div className="eyebrow">bKash · Send Money</div>
            <h3>{bkashNumber}</h3>
            <p>
              Send ৳{registrationFee} first. Enter the number you paid from,
              submit the form, then send the TRX ID in the WhatsApp chat that opens.
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
          {state === "sending" ? "Creating your VAC application…" : "Submit application"}
          {state !== "sending" && <span aria-hidden="true">↗</span>}
        </button>

        {message && state === "error" && (
          <div className="form-message error" role="alert">{message}</div>
        )}
      </form>

      {success && (
        <div className="application-success-backdrop" role="presentation">
          <section
            className="application-success-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-success-title"
          >
            <div className="success-logo">
              <VacLogo alt="Visual Archive Club" />
            </div>
            <div className="success-check" aria-hidden="true">✓</div>
            <div className="eyebrow">Application received</div>
            <h2 id="application-success-title">Your VAC application is ready.</h2>
            <p>
              Save your PDF for your records, then send your bKash TRX ID in the
              WhatsApp tab that just opened.
            </p>

            <div className="success-reference">
              <small>Application reference</small>
              <strong>{success.applicationRef}</strong>
            </div>

            <div className="success-actions">
              {success.pdfDownloadUrl ? (
                <a
                  className="primary-button"
                  href={preparedPdfUrl || success.pdfDownloadUrl}
                  target={preparedPdfUrl ? undefined : "_blank"}
                  rel={preparedPdfUrl ? undefined : "noreferrer"}
                  download={preparedPdfUrl ? success.applicationRef + ".pdf" : undefined}
                >
                  {preparedPdfUrl ? "Download PDF now" : "Download my PDF"}
                  <span aria-hidden="true">{preparedPdfUrl ? "✓" : "↓"}</span>
                </a>
              ) : (
                <span className="primary-button primary-button--disabled">
                  PDF download unavailable
                </span>
              )}
              <a
                className="secondary-button"
                href={success.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open WhatsApp again <span aria-hidden="true">↗</span>
              </a>
            </div>

            <button
              className="success-close"
              type="button"
              onClick={() => setSuccess(null)}
            >
              Keep this page open
            </button>
          </section>
        </div>
      )}
    </>
  );
}
