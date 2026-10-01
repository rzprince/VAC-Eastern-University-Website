"use client";

import { useMemo, useState } from "react";
import type { MediaItem } from "@/lib/data";

export function ArchiveExplorer({
  items,
  facebookPage
}: {
  items: MediaItem[];
  facebookPage: string;
}) {
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");

  const visible = useMemo(
    () => items.filter((item) => filter === "all" || item.media_type === filter),
    [items, filter]
  );

  return (
    <>
      <div className="archive-filters" role="group" aria-label="Archive filters">
        {(["all", "photo", "video"] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "All" : value === "photo" ? "Photos" : "Videos"}
          </button>
        ))}
      </div>

      {visible.length ? (
        <div className="media-grid archive-grid">
          {visible.map((item) => {
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
                {item.media_type === "video" && <span className="play-button">▶</span>}
                <div className="media-overlay">
                  <small>
                    {item.media_type === "video"
                      ? "Facebook video"
                      : item.featured
                        ? "Featured photo"
                        : "Photo"}
                  </small>
                  <strong>{item.title}</strong>
                  <span>
                    {new Date(item.published_at).toLocaleDateString("en-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <strong>No items in this category yet.</strong>
          <p>Published VAC content will appear here automatically.</p>
        </div>
      )}
    </>
  );
}
