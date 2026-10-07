import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { Navbar } from "@/components/Navbar";
import {
  getRecentEvents,
  getSiteSettings,
  getUpcomingEvents,
  type EventItem
} from "@/lib/data";

export const revalidate = 60;

function EventCard({
  event,
  upcoming
}: {
  event: EventItem;
  upcoming: boolean;
}) {
  const content = (
    <article className="event-card event-card--archive">
      {event.poster_url ? (
        <img src={event.poster_url} alt={event.title} />
      ) : (
        <div className="event-poster-placeholder">VAC EVENT</div>
      )}
      <div className="event-body">
        {upcoming ? (
          <Countdown target={event.starts_at} />
        ) : (
          <span className="countdown countdown--past">Archived</span>
        )}
        <h3>{event.title}</h3>
        <p>{event.description || "VAC event"}</p>
        <small>
          {new Date(event.starts_at).toLocaleString("en-BD", {
            timeZone: "Asia/Dhaka",
            dateStyle: "medium",
            timeStyle: "short"
          })}
          {event.location ? " · " + event.location : ""}
        </small>
        {event.facebook_url && <span className="event-link">View Facebook post ↗</span>}
      </div>
    </article>
  );

  return event.facebook_url ? (
    <a href={event.facebook_url} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : content;
}

export default async function EventsPage() {
  const [upcoming, recent, settings] = await Promise.all([
    getUpcomingEvents(30),
    getRecentEvents(60),
    getSiteSettings()
  ]);

  return (
    <>
      <Navbar
        facebookPage={settings.facebookPage}
        clubName={settings.clubName}
        university={settings.university}
      />
      <main className="inner-page">
        <section className="section">
          <div className="shell">
            <div className="eyebrow">VAC Events</div>
            <h1 className="page-title">What&apos;s next & <span>what we captured.</span></h1>
            <p className="section-copy">
              Upcoming VAC programs include a live countdown. Past events remain
              here as part of the club archive.
            </p>

            <h2 className="archive-heading">Upcoming</h2>
            {upcoming.length ? (
              <div className="event-grid">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} upcoming />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>No upcoming event published yet.</strong>
                <p>Check back for the next VAC program.</p>
              </div>
            )}

            <h2 className="archive-heading archive-heading--spaced">Past events</h2>
            {recent.length ? (
              <div className="event-grid">
                {recent.map((event) => (
                  <EventCard key={event.id} event={event} upcoming={false} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <strong>No past events published yet.</strong>
                <p>Archived event posts will appear here after they are added.</p>
              </div>
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
            <Link href="/">Home</Link>
            <Link href="/archive">Archive</Link>
            <Link href="/join">Join VAC</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
