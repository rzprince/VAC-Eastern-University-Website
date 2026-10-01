import Image from "next/image";
import Link from "next/link";
import { AnnouncementsSection } from "@/components/AnnouncementsSection";
import { CommitteeSection } from "@/components/CommitteeSection";
import { EventsSection } from "@/components/EventsSection";
import { MediaSection } from "@/components/MediaSection";
import { Navbar } from "@/components/Navbar";
import {
  getAnnouncements,
  getCommittee,
  getMedia,
  getRecentEvents,
  getSiteSettings,
  getUpcomingEvents
} from "@/lib/data";

export const dynamic = "force-dynamic";

function compactTenure(tenure: string) {
  const years = tenure.match(/20\d{2}/g);
  if (years?.length === 2) {
    return `${years[0]}–${years[1].slice(2)}`;
  }
  return tenure;
}

export default async function Home() {
  const [committee, upcoming, recent, media, announcements, settings] =
    await Promise.all([
      getCommittee(),
      getUpcomingEvents(6),
      getRecentEvents(3),
      getMedia(9),
      getAnnouncements(4),
      getSiteSettings()
    ]);

  return (
    <>
      <Navbar
        facebookPage={settings.facebookPage}
        clubName={settings.clubName}
        university={settings.university}
      />

      <main>
        <section className="hero">
          <div className="hero-grid" />
          <div className="shell hero-content">
            <div className="hero-logos">
              <Image
                src="/eastern-university-logo.webp"
                alt={settings.university}
                width={170}
                height={123}
                priority
              />
              <span />
              <Image
                src="/vac-logo.webp"
                alt={settings.clubName}
                width={210}
                height={140}
                priority
              />
            </div>

            <div className="eyebrow">
              {settings.university} · Since {settings.since}
            </div>

            <h1>
              <span>VISUAL</span>
              <span>ARCHIVE</span>
              <span>CLUB</span>
            </h1>

            <p>{settings.tagline}</p>

            <div className="hero-actions">
              {settings.registrationOpen ? (
                <Link className="primary-button" href="/join">Join VAC</Link>
              ) : (
                <span className="primary-button primary-button--disabled">
                  Registration closed
                </span>
              )}
              <a className="secondary-button" href="#committee">
                Meet the committee
              </a>
            </div>

            <div className="hero-meta">
              <div>
                <strong>{compactTenure(settings.tenure)}</strong>
                <small>Current committee</small>
              </div>
              <div>
                <strong>{committee.length}</strong>
                <small>Committee positions</small>
              </div>
              <div>
                <strong>৳{settings.registrationFee}</strong>
                <small>Registration fee</small>
              </div>
            </div>
          </div>
        </section>

        <AnnouncementsSection items={announcements} />

        <section id="about" className="section section-alt">
          <div className="shell about-grid">
            <div>
              <div className="eyebrow">About VAC</div>
              <h2>
                We preserve the <span>visual story</span> of {settings.university}.
              </h2>
            </div>

            <div className="about-copy">
              <p>{settings.aboutText}</p>
              <div className="pill-row">
                <span>Photography</span>
                <span>Videography</span>
                <span>Editing</span>
                <span>Digital Media</span>
                <span>Archiving</span>
              </div>
              <div className="social-row">
                <a href={settings.facebookPage} target="_blank" rel="noreferrer">
                  Official Facebook Page ↗
                </a>
                <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
                  VAC Facebook Group ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        <CommitteeSection members={committee} />
        <EventsSection upcoming={upcoming} recent={recent} />
        <MediaSection items={media} facebookPage={settings.facebookPage} />

        <section id="contact" className="section section-alt">
          <div className="shell contact-grid">
            <div>
              <div className="eyebrow">Connect with VAC</div>
              <h2>
                Stay close to the <span>archive.</span>
              </h2>
              <p className="section-copy">
                Follow VAC for events, photography, videos and club updates.
                Membership applications are handled directly on this website.
              </p>
            </div>

            <div className="contact-links">
              <a href={settings.facebookPage} target="_blank" rel="noreferrer">
                <small>Official Facebook Page</small>
                <strong>Visual Archive Club ↗</strong>
              </a>
              <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
                <small>Community</small>
                <strong>VAC Facebook Group ↗</strong>
              </a>
              <a href={"tel:" + settings.contactPhone.replace(/\s/g, "")}>
                <small>Committee contact</small>
                <strong>{settings.contactPhone}</strong>
              </a>
              <a href={"mailto:" + settings.contactEmail}>
                <small>Email</small>
                <strong>{settings.contactEmail}</strong>
              </a>
            </div>
          </div>
        </section>

        <section className="section join-strip">
          <div className="shell join-strip-inner">
            <div>
              <div className="eyebrow">Membership</div>
              <h2>
                Your next frame starts <span>here.</span>
              </h2>
              <p>
                Apply online, submit your bKash payment reference, and VAC can
                review everything securely from the admin dashboard.
              </p>
            </div>
            {settings.registrationOpen ? (
              <Link className="primary-button" href="/join">
                Apply to join VAC
              </Link>
            ) : (
              <span className="secondary-button">Applications currently closed</span>
            )}
          </div>
        </section>
      </main>

      <footer>
        <div className="shell footer-inner">
          <div>
            <strong>{settings.clubName}</strong>
            <span>{settings.university} · Since {settings.since}</span>
          </div>
          <div>
            <Link href="/events">Events</Link>
            <Link href="/archive">Archive</Link>
            <a href={settings.facebookPage} target="_blank" rel="noreferrer">
              Facebook Page
            </a>
            <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
              Facebook Group
            </a>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
