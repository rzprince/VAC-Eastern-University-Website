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
    <section id="media" className="section media-section">
      <div className="shell">
        <div className="section-kicker-row">
          <div>
            <div className="eyebrow">The living archive</div>
            <h2>
              New frames. <span>Real stories.</span>
            </h2>
          </div>
          <Link className="text-link" href="/archive">
            Explore full archive <span>↗</span>
          </Link>
        </div>

        {items.length ? (
          <div className="media-grid">
            {items.map((item, index) => {
              const href =
                item.media_type === "video"
                  ? item.destination_url || facebookPage
                  : item.thumbnail_url;

              return (
                <a
                  className={
                    "media-card " +
                    (item.featured || index === 0 ? "media-card--featured" : "")
                  }
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  key={item.id}
                >
                  <img src={item.thumbnail_url} alt={item.title} loading="lazy" />
                  <span className="media-shade" />

                  {item.media_type === "video" && (
                    <span className="play-button" aria-hidden="true">
                      <i>▶</i>
                    </span>
                  )}

                  <div className="media-overlay">
                    <small>
                      {item.media_type === "video"
                        ? "Film / Facebook"
                        : item.featured
                          ? "Featured frame"
                          : "Photography"}
                    </small>
                    <strong>{item.title}</strong>
                    <span aria-hidden="true">↗</span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="archive-placeholder">
            <div className="archive-placeholder-lens">
              <span />
              <span />
            </div>
            <div>
              <div className="eyebrow">Archive ready</div>
              <h3>Your next visual story starts here.</h3>
              <p>
                When VAC publishes photographs or Facebook video thumbnails in
                Admin, they flow into this gallery automatically — newest first.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
