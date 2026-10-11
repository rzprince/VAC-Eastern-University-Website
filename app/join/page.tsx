import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { SiteFooter } from "@/components/SiteFooter";
import { getSiteSettings } from "@/lib/data";
import { EuLogo, VacLogo } from "@/components/BrandLogo";

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
                <VacLogo alt={settings.clubName} priority />
              </div>
              <span className="join-lockup-divider" />
              <div className="join-logo-card join-logo-card--eu">
                <EuLogo alt={settings.university} priority />
              </div>
            </div>

            <div className="join-intro">
              <div className="eyebrow">Official VAC membership <span className="join-live-mark" aria-hidden="true" /></div>
              <h1>
                Join the people behind the <em>frame.</em>
              </h1>
              <p>
                Complete one digital application, send ৳{settings.registrationFee}
                {" "}by bKash to <strong>{settings.bkashNumber}</strong>, then submit.
                Your application PDF becomes available immediately and WhatsApp opens
                for manual TRX ID verification.
              </p>
              <div className="join-hero-tags" aria-label="VAC creative disciplines">
                <span>Photography</span>
                <span>Filmmaking</span>
                <span>Storytelling</span>
              </div>
            </div>
          </header>

          <div className="join-creative-banner" aria-label="Visual Archive Club membership journey">
            <div className="join-creative-banner-shade" aria-hidden="true" />
            <div className="join-creative-banner-copy">
              <span>CREATE SOMETHING REMARKABLE</span>
              <strong>Your story belongs in the frame.</strong>
            </div>
            <span className="join-banner-counter">VAC / 2010 <span aria-hidden="true">✦</span></span>
          </div>

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
