import Image from "next/image";
import Link from "next/link";
import { AnnouncementsSection } from "@/components/AnnouncementsSection";
import { CommitteeSection } from "@/components/CommitteeSection";
import { CreativeDisciplines } from "@/components/CreativeDisciplines";
import { EventsSection } from "@/components/EventsSection";
import { HeroScene } from "@/components/HeroScene";
import { MediaSection } from "@/components/MediaSection";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import {
  getAnnouncements,
  getCommittee,
  getMedia,
  getRecentEvents,
  getSiteSettings,
  getUpcomingEvents
} from "@/lib/data";

export const revalidate = 60;

function compactTenure(tenure: string) {
  const years = tenure.match(/20\d{2}/g);
  if (years?.length === 2) {
    return years[0] + "–" + years[1].slice(2);
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
        <section className="hero hero-v2">
          <div className="hero-noise" aria-hidden="true" />
          <div className="hero-orb" aria-hidden="true" />

          <div className="shell hero-layout">
            <div className="hero-copy">
              <div className="hero-brandline">
                <Image
                  src="/eastern-university-logo.png"
                  alt={settings.university}
                  width={520}
                  height={295}
                  priority
                />
                <span />
                <p>{settings.university}<b> · </b>Visual Archive Club</p>
              </div>

              <div className="eyebrow">Creative media community · Since {settings.since}</div>

              <h1>
                Every frame becomes <em>history.</em>
              </h1>

              <p className="hero-lead">
                The creative media club of {settings.university}. We photograph,
                film, edit and preserve the moments that define university life.
              </p>

              <div className="hero-actions">
                {settings.registrationOpen ? (
                  <Link className="primary-button" href="/join">
                    Join VAC <span>↗</span>
                  </Link>
                ) : (
                  <span className="primary-button primary-button--disabled">
                    Registration closed
                  </span>
                )}
                <Link className="secondary-button" href="/archive">
                  Explore archive
                </Link>
              </div>

              <div className="hero-meta">
                <div>
                  <strong>{compactTenure(settings.tenure)}</strong>
                  <small>Current committee</small>
                </div>
                <div>
                  <strong>{committee.length}</strong>
                  <small>Committee members</small>
                </div>
                <div>
                  <strong>৳{settings.registrationFee}</strong>
                  <small>Membership fee</small>
                </div>
              </div>
            </div>

            <HeroScene />
          </div>

          <div className="hero-scroll shell">
            <span>Scroll to explore</span>
            <i />
          </div>
        </section>

        <AnnouncementsSection items={announcements} />
        <CreativeDisciplines />

        <section id="about" className="section about-section">
          <div className="shell about-editorial">
            <div className="about-heading" data-reveal>
              <div className="eyebrow">About Visual Archive Club</div>
              <h2>
                We do more than document campus. We build its <em>visual memory.</em>
              </h2>
            </div>

            <div className="about-story" data-reveal>
              <p>{settings.aboutText}</p>
              <p>
                VAC is not only about taking photographs. We document Eastern
                University, develop practical media skills and create an archive
                that lets important moments live beyond the day they happened.
              </p>

              <div className="pill-row">
                <span>Photography</span>
                <span>Videography</span>
                <span>Filmmaking</span>
                <span>Editing</span>
                <span>Digital Media</span>
              </div>

              <div className="about-links">
                <a href={settings.facebookPage} target="_blank" rel="noreferrer">
                  Official Facebook Page <span>↗</span>
                </a>
                <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
                  VAC Facebook Group <span>↗</span>
                </a>
              </div>
            </div>

            <div className="brand-lockup" aria-label="VAC and Eastern University">
              <Image
                src="/vac-logo.png"
                alt={settings.clubName}
                width={520}
                height={373}
              />
              <span />
              <Image
                src="/eastern-university-logo.png"
                alt={settings.university}
                width={520}
                height={295}
              />
            </div>
          </div>
        </section>

        <CommitteeSection members={committee} />
        <EventsSection upcoming={upcoming} recent={recent} />
        <MediaSection items={media} facebookPage={settings.facebookPage} />

        <section id="contact" className="section contact-section">
          <div className="shell contact-layout">
            <div className="contact-statement">
              <div className="eyebrow">Connect with VAC</div>
              <h2>
                Have a frame worth <span>sharing?</span>
              </h2>
              <p>
                Follow our work, collaborate with the committee or join the
                community. We keep the contact paths simple.
              </p>
            </div>

            <div className="contact-links">
              <a href={settings.facebookPage} target="_blank" rel="noreferrer">
                <small>Official page</small>
                <strong>Facebook</strong>
                <span>↗</span>
              </a>
              <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
                <small>Community</small>
                <strong>VAC Group</strong>
                <span>↗</span>
              </a>
              <a href={"tel:" + settings.contactPhone.replace(/\s/g, "")}>
                <small>Committee</small>
                <strong>{settings.contactPhone}</strong>
                <span>↗</span>
              </a>
              <a href={"mailto:" + settings.contactEmail}>
                <small>Email</small>
                <strong>{settings.contactEmail}</strong>
                <span>↗</span>
              </a>
            </div>
          </div>
        </section>

        <section className="section final-cta">
          <div className="shell final-cta-inner">
            <div>
              <div className="eyebrow">Membership</div>
              <h2>Make your next frame part of the archive.</h2>
              <p>
                Fill the form, send the membership fee by bKash, then submit.
                WhatsApp opens automatically so you can send your TRX ID for
                manual confirmation.
              </p>
            </div>
            {settings.registrationOpen ? (
              <Link className="primary-button" href="/join">
                Apply to join VAC <span>↗</span>
              </Link>
            ) : (
              <span className="secondary-button">Applications currently closed</span>
            )}
          </div>
        </section>
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
