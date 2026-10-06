import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 60;

export default async function JoinPage() {
  const settings = await getSiteSettings();

  return (
    <main className="join-page join-page--v2">
      <div className="join-background" aria-hidden="true" />
      <div className="shell join-shell">
        <Link className="back-link" href="/">← Back to VAC</Link>

        <header className="form-header form-header--v2">
          <div className="join-logo-lockup">
            <Image
              src="/vac-logo.png"
              alt={settings.clubName}
              width={520}
              height={347}
              priority
            />
            <span />
            <Image
              src="/eastern-university-logo.png"
              alt={settings.university}
              width={520}
              height={375}
              priority
            />
          </div>

          <div>
            <div className="eyebrow">Online membership · {settings.tenure}</div>
            <h1>
              Join the people behind the <span>frame.</span>
            </h1>
            <p>
              Complete one clean digital application. Send ৳{settings.registrationFee}
              {" "}by bKash to <strong>{settings.bkashNumber}</strong>, submit the
              form, and we&apos;ll open the VAC WhatsApp chat so you can send your
              TRX ID manually.
            </p>
          </div>
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
              <a
                className="primary-button"
                href={settings.facebookPage}
                target="_blank"
                rel="noreferrer"
              >
                Official Facebook Page ↗
              </a>
              <a
                className="secondary-button"
                href={settings.facebookGroup}
                target="_blank"
                rel="noreferrer"
              >
                VAC Facebook Group ↗
              </a>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
