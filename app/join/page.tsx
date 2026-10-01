import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const settings = await getSiteSettings();

  return (
    <main className="join-page">
      <div className="shell">
        <Link className="back-link" href="/">← Back to VAC</Link>

        <header className="form-header">
          <div className="form-header-logos">
            <Image
              src="/eastern-university-logo.webp"
              alt={settings.university}
              width={130}
              height={94}
            />
            <Image
              src="/vac-logo.webp"
              alt={settings.clubName}
              width={160}
              height={106}
            />
          </div>

          <div className="eyebrow">Online membership registration</div>
          <h1>Join <span>{settings.clubName}</span></h1>
          <p>
            Complete your information, send ৳{settings.registrationFee} by bKash
            to <strong>{settings.bkashNumber}</strong>, and submit your Transaction
            ID for verification.
          </p>
        </header>

        {settings.registrationOpen ? (
          <RegistrationForm
            registrationFee={settings.registrationFee}
            bkashNumber={settings.bkashNumber}
          />
        ) : (
          <section className="registration-closed">
            <div className="eyebrow">Applications paused</div>
            <h2>Membership registration is currently closed.</h2>
            <p>
              VAC will reopen this form when the next intake begins. Follow the
              official Facebook page and group for announcements.
            </p>
            <div className="hero-actions">
              <a className="primary-button" href={settings.facebookPage} target="_blank" rel="noreferrer">
                Official Facebook Page ↗
              </a>
              <a className="secondary-button" href={settings.facebookGroup} target="_blank" rel="noreferrer">
                VAC Facebook Group ↗
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
