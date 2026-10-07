import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/data";

export const revalidate = 60;

export default async function JoinPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <main className="join-page join-page--premium">
        <div className="join-background" aria-hidden="true" />
        <div className="shell join-shell">
          <Link className="back-link" href="/">← Back to VAC</Link>

          <header className="form-header form-header--premium" data-reveal>
            <div className="join-institution-lockup" aria-label="VAC and Eastern University">
              <div className="join-logo-card join-logo-card--vac">
                <Image
                  src="/vac-logo.png"
                  alt={settings.clubName}
                  width={520}
                  height={373}
                  priority
                />
              </div>
              <span className="join-lockup-divider" />
              <div className="join-logo-card join-logo-card--eu">
                <Image
                  src="/eastern-university-logo.png"
                  alt={settings.university}
                  width={520}
                  height={295}
                  priority
                />
              </div>
            </div>

            <div className="join-intro">
              <div className="eyebrow">Official membership · {settings.tenure}</div>
              <h1>
                Join the people behind the <em>frame.</em>
              </h1>
              <p>
                Complete one digital application, send ৳{settings.registrationFee}
                {" "}by bKash to <strong>{settings.bkashNumber}</strong>, then submit.
                Your application PDF becomes available immediately and WhatsApp opens
                for manual TRX ID verification.
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

      <SiteFooter
        clubName={settings.clubName}
        university={settings.university}
        since={settings.since}
        facebookPage={settings.facebookPage}
        facebookGroup={settings.facebookGroup}
      />
    </>
  );
}
