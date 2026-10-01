import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import type { EventItem } from "@/lib/data";

function EventCard({
  event,
  upcoming
}: {
  event: EventItem;
  upcoming: boolean;
}) {
  const card = (
    <article className="event-card">
      {event.poster_url ? (
        <img src={event.poster_url} alt={event.title} />
      ) : (
        <div className="event-poster-placeholder">VAC EVENT</div>
      )}

      <div className="event-body">
        {upcoming ? (
          <Countdown target={event.starts_at} />
        ) : (
          <span className="countdown countdown--past">Recent event</span>
        )}
        <h3>{event.title}</h3>
        <p>{event.description || "More details will be published soon."}</p>
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
    <a
      className="event-card-link"
      href={event.facebook_url}
      target="_blank"
      rel="noreferrer"
    >
      {card}
    </a>
  ) : card;
}

export function EventsSection({
  upcoming,
  recent
}: {
  upcoming: EventItem[];
  recent: EventItem[];
}) {
  return (
    <section id="events" className="section section-alt">
      <div className="shell">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow">Events</div>
            <h2>Upcoming & <span>recent</span></h2>
          </div>
          <Link className="text-link" href="/events">View all events →</Link>
        </div>

        {upcoming.length ? (
          <>
            <h3 className="subsection-title">Upcoming</h3>
            <div className="event-grid">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} upcoming />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <strong>No upcoming event published yet.</strong>
            <p>New VAC events and countdowns will appear here automatically.</p>
          </div>
        )}

        {recent.length > 0 && (
          <div className="recent-events">
            <h3 className="subsection-title">Recently archived</h3>
            <div className="event-grid">
              {recent.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} upcoming={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
