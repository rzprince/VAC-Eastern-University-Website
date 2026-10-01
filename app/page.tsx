import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { CommitteeSection } from "@/components/CommitteeSection";
import { EventsSection } from "@/components/EventsSection";
import { MediaSection } from "@/components/MediaSection";
import {
  getCommittee,
  getEvents,
  getMedia,
  getSiteSettings
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [committee, events, media, settings] = await Promise.all([
    getCommittee(),
    getEvents(),
    getMedia(),
    getSiteSettings()
  ]);

  const president =
    committee.find((member) => member.position.toLowerCase() === "president") ||
    committee[0];

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
              <Link className="primary-button" href="/join">Join VAC</Link>
              <a className="secondary-button" href="#committee">
                Meet the committee
              </a>
            </div>

            <div className="hero-meta">
              <div>
                <strong>2026–27</strong>
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
                <a
                  href={settings.facebookPage}
                  target="_blank"
                  rel="noreferrer"
                >
                  Official Facebook Page ↗
                </a>
                <a
                  href={settings.facebookGroup}
                  target="_blank"
                  rel="noreferrer"
                >
                  VAC Facebook Group ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        <CommitteeSection members={committee} />
        <EventsSection events={events} />
        <MediaSection
          items={media}
          facebookPage={settings.facebookPage}
        />

        <section id="contact" className="section section-alt">
          <div className="shell contact-grid">
            <div>
              <div className="eyebrow">Connect with VAC</div>
              <h2>
                Stay close to the <span>archive.</span>
              </h2>
              <p className="section-copy">
                Follow VAC for new event announcements, photography, videos and
                club updates. Membership applications are handled directly on
                this website.
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
              {president?.phone && (
                <a href={"tel:" + president.phone.replace(/\s/g, "")}>
                  <small>Committee contact</small>
                  <strong>{president.phone}</strong>
                </a>
              )}
              {president?.email && (
                <a href={"mailto:" + president.email}>
                  <small>Email</small>
                  <strong>{president.email}</strong>
                </a>
              )}
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
                review everything from the admin dashboard.
              </p>
            </div>
            <Link className="primary-button" href="/join">
              Apply to join VAC
            </Link>
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
