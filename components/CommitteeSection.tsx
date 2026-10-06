"use client";

import { useEffect, useState } from "react";
import type { CommitteeMember } from "@/lib/committee";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CommitteeSection({
  members
}: {
  members: CommitteeMember[];
}) {
  const [selected, setSelected] = useState<CommitteeMember | null>(null);

  useEffect(() => {
    if (!selected) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <section id="committee" className="section committee-section">
      <div className="shell">
        <div className="section-kicker-row">
          <div>
            <div className="eyebrow">Committee · 2026–2027</div>
            <h2>
              The people moving <span>VAC forward.</span>
            </h2>
          </div>
          <p className="section-copy compact-copy">
            A multidisciplinary team of photographers, filmmakers, editors,
            organizers and storytellers. Open any card for public contact details.
          </p>
        </div>

        <div className="committee-grid">
          {members.map((member, index) => (
            <button
              className={
                "member-card " +
                (member.leader ? "member-card--leader " : "") +
                (index === 0 ? "member-card--first" : "")
              }
              key={member.serial + member.position + member.name}
              onClick={() => setSelected(member)}
              type="button"
            >
              <div className="member-card-top">
                <span className="member-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="member-open" aria-hidden="true">↗</span>
              </div>

              <div className="member-avatar">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt={member.name} loading="lazy" />
                ) : (
                  <span>{initials(member.name)}</span>
                )}
              </div>

              <div className="member-card-copy">
                <small>{member.position}</small>
                <strong>{member.name}</strong>
                <em>{member.department || "Visual Archive Club"}</em>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <article
            className="member-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selected.name + " committee details"}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              type="button"
              aria-label="Close member details"
            >
              ×
            </button>

            <div className="member-modal-grid">
              <div className="member-avatar member-avatar--large">
                {selected.photoUrl ? (
                  <img src={selected.photoUrl} alt={selected.name} />
                ) : (
                  <span>{initials(selected.name)}</span>
                )}
              </div>

              <div>
                <div className="eyebrow">{selected.position}</div>
                <h3>{selected.name}</h3>
                {selected.department && (
                  <p>Department of {selected.department}</p>
                )}

                <div className="modal-actions">
                  {selected.phone && (
                    <a href={"tel:" + selected.phone.replace(/\s/g, "")}>
                      <span>Phone</span>
                      <strong>{selected.phone}</strong>
                    </a>
                  )}
                  {selected.email && (
                    <a href={"mailto:" + selected.email}>
                      <span>Email</span>
                      <strong>{selected.email}</strong>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
