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
          <div className="archive-placeholder archive-placeholder--editorial">
            <div className="archive-storyboard" aria-label="Creative storytelling preview">
              <div className="archive-storyboard-main">
                <img
                  src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&fm=webp&q=86&w=1300"
                  alt="Film reels symbolizing the visual memories VAC will archive"
                  loading="lazy"
                />
                <span>FRAME / 001</span>
              </div>
              <div className="archive-storyboard-detail">
                <img
                  src="https://images.unsplash.com/photo-1739296385343-ff091bca6203?auto=format&fit=crop&fm=webp&q=84&w=1000"
                  alt="Photographer creating a visual story"
                  loading="lazy"
                />
                <span>MAKE / CREATE / ARCHIVE</span>
              </div>
              <div className="archive-storyboard-counter" aria-hidden="true">VAC / VISUAL DIARY</div>
            </div>
            <div className="archive-placeholder-story">
              <div className="eyebrow">The living archive</div>
              <h3>Every frame has a story. <em>Ours is just beginning.</em></h3>
              <p>
                Real VAC photographs, creative projects and Facebook video posts
                will appear here as soon as they are published by the club.
              </p>
              <div className="archive-preview-actions">
                <Link href="/archive" className="archive-preview-link archive-preview-link--spotlight">
                  <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2.5" y="5" width="19" height="15" rx="2.5" />
                    <path d="m8 5 2.5 4M14 5l2.5 4M5 9h14" />
                  </svg>
                  Explore the archive <span aria-hidden="true">↗</span>
                </Link>
                
              </div>
              <small className="archive-preview-note">Illustrative imagery. Official VAC work will replace these previews.</small>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
