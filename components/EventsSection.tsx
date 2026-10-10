import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import type { EventItem } from "@/lib/data";

function EventCard({
  event,
  upcoming,
  index
}: {
  event: EventItem;
  upcoming: boolean;
  index: number;
}) {
  const date = new Date(event.starts_at);
  const day = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    timeZone: "Asia/Dhaka"
  }).format(date);
  const month = new Intl.DateTimeFormat("en", {
    month: "short",
    timeZone: "Asia/Dhaka"
  }).format(date);

  const card = (
    <article className={"event-card " + (index === 0 && upcoming ? "event-card--featured" : "")}>
      <div className="event-visual">
        {event.poster_url ? (
          <img src={event.poster_url} alt={event.title} loading="lazy" />
        ) : (
          <div className="event-poster-placeholder">
            <span>VAC</span>
            <strong>EVENT</strong>
          </div>
        )}
        <div className="event-date">
          <strong>{day}</strong>
          <span>{month}</span>
        </div>
      </div>

      <div className="event-body">
        <div className="event-meta-row">
          {upcoming ? (
            <Countdown target={event.starts_at} />
          ) : (
            <span className="countdown countdown--past">Archived</span>
          )}
          <span className="event-arrow" aria-hidden="true">↗</span>
        </div>

        <h3>{event.title}</h3>
        <p>{event.description || "More details will be published soon."}</p>

        <div className="event-details">
          <span>
            {new Date(event.starts_at).toLocaleString("en-BD", {
              timeZone: "Asia/Dhaka",
              dateStyle: "medium",
              timeStyle: "short"
            })}
          </span>
          {event.location && <span>{event.location}</span>}
        </div>

        {event.facebook_url && (
          <span className="event-link">Open Facebook post</span>
        )}
      </div>
    </article>
  );

  return event.facebook_url ? (
    <a
      className="event-card-link"
      href={event.facebook_url}
      target="_blank"
      rel="noreferrer"
      aria-label={event.title + ". Open Facebook post"}
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
    <section id="events" className="section events-section">
      <div className="shell">
        <div className="section-kicker-row">
          <div>
            <div className="eyebrow">Programs & moments</div>
            <h2>
              What&apos;s happening <span>next.</span>
            </h2>
          </div>
          <Link className="text-link" href="/events">
            View event archive <span>↗</span>
          </Link>
        </div>

        {upcoming.length ? (
          <div className="event-grid">
            {upcoming.map((event, index) => (
              <EventCard key={event.id} event={event} upcoming index={index} />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--editorial">
            <span className="empty-state-index">NEXT /</span>
            <div>
              <strong>No upcoming event is published yet.</strong>
              <p>
                The next VAC workshop, photowalk or creative session will appear
                here as soon as it is announced.
              </p>
            </div>
          </div>
        )}

        {recent.length > 0 && (
          <div className="recent-events">
            <div className="subsection-line">
              <span>Recently archived</span>
            </div>
            <div className="event-grid event-grid--recent">
              {recent.slice(0, 3).map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  upcoming={false}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
