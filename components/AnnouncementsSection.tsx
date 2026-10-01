import type { AnnouncementItem } from "@/lib/data";

export function AnnouncementsSection({
  items
}: {
  items: AnnouncementItem[];
}) {
  if (!items.length) return null;

  return (
    <section className="announcement-section" aria-label="VAC announcements">
      <div className="shell announcement-list">
        {items.map((item) => {
          const content = (
            <>
              <div>
                <small>{item.pinned ? "Pinned announcement" : "Announcement"}</small>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              {item.link_url && <span>Open ↗</span>}
            </>
          );

          return item.link_url ? (
            <a
              className="announcement-card"
              href={item.link_url}
              target="_blank"
              rel="noreferrer"
              key={item.id}
            >
              {content}
            </a>
          ) : (
            <article className="announcement-card" key={item.id}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
