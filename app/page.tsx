import Link from "next/link";
import { AnnouncementsSection } from "@/components/AnnouncementsSection";
import { CommitteeSection } from "@/components/CommitteeSection";
import { CreativeDisciplines } from "@/components/CreativeDisciplines";
import { CreativeMarquee } from "@/components/CreativeMarquee";
import { EventsSection } from "@/components/EventsSection";
import { HeroScene } from "@/components/HeroScene";
import { MediaSection } from "@/components/MediaSection";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { EuLogo, VacLogo } from "@/components/BrandLogo";
import { ContactActions } from "@/components/ContactActions";
import {
  getAnnouncements,
  getCommittee,
  getMedia,
  getRecentEvents,
  getSiteSettings,
  getUpcomingEvents
} from "@/lib/data";

export const revalidate = 60;

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
              <div className="hero-identity" aria-label="Visual Archive Club at Eastern University">
                <div className="hero-identity-logos">
                  <VacLogo alt="Visual Archive Club logo" priority />
                  <span aria-hidden="true" className="hero-identity-divider" />
                  <EuLogo alt="Eastern University logo" priority />
                </div>
                <div className="hero-identity-caption">
                  <span>Visual Archive Club</span>
                  <small>Eastern University · Est. {settings.since}</small>
                </div>
              </div>

              <div className="eyebrow">Creative media community · Since {settings.since}</div>

              <h1>
                Where every <em>frame</em> becomes <em>history.</em>
              </h1>

              <p className="hero-lead">
                A club for creative minds. We bring ideas to life through
                photography, filmmaking, videography, content creation and stories.
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
                  <strong>Since {settings.since}</strong>
                  <small>Learning and creating</small>
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

        <CreativeMarquee />
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
              {settings.aboutText.split(/\n\s*\n/).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}

              <div className="about-links">
                <a href={settings.facebookPage} target="_blank" rel="noreferrer">
                  Official Facebook Page <span>↗</span>
                </a>
                <a href={settings.facebookGroup} target="_blank" rel="noreferrer">
                  VAC Facebook Group <span>↗</span>
                </a>
              </div>
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

            <ContactActions
              facebookPage={settings.facebookPage}
              facebookGroup={settings.facebookGroup}
              contactPhone={settings.contactPhone}
              contactEmail={settings.contactEmail}
            />
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
