import Link from "next/link";
import type { MediaItem } from "@/lib/data";

export function MediaSection({
  items,
  facebookPage
}: {
  items: MediaItem[];
  facebookPage: string;
}) {
  return (
    <section id="media" className="section">
      <div className="shell">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow">Latest archive</div>
            <h2>Featured photos & <span>videos</span></h2>
          </div>
          <Link className="text-link" href="/archive">Open full archive →</Link>
        </div>

        <p className="section-copy">
          Newest uploads appear first. Video thumbnails open the exact Facebook
          video/post configured by the VAC admin.
        </p>

        {items.length ? (
          <div className="media-grid">
            {items.map((item) => {
              const href =
                item.media_type === "video"
                  ? item.destination_url || facebookPage
                  : item.thumbnail_url;

              return (
                <a
                  className="media-card"
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  key={item.id}
                >
                  <img src={item.thumbnail_url} alt={item.title} />
                  {item.media_type === "video" && (
                    <span className="play-button">▶</span>
                  )}
                  <div className="media-overlay">
                    <small>
                      {item.media_type === "video"
                        ? "Facebook video"
                        : item.featured
                          ? "Featured photo"
                          : "Photo"}
                    </small>
                    <strong>{item.title}</strong>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <strong>The new archive is ready for your uploads.</strong>
            <p>
              Upload a photo, or upload a video thumbnail and paste its Facebook
              post link in the admin dashboard.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
