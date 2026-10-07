"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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

function isPresident(member: CommitteeMember) {
  return (
    member.position.trim().toLowerCase() === "president" ||
    member.name.trim().toLowerCase() === "rezwan hossain prince"
  );
}

function displaySerial(member: CommitteeMember, fallbackIndex: number) {
  const serial = String(member.serial || "").trim();
  if (serial && serial !== "—" && serial !== "-") return serial;
  return String(fallbackIndex + 1).padStart(2, "0");
}

export function CommitteeSection({
  members
}: {
  members: CommitteeMember[];
}) {
  const [selected, setSelected] = useState<CommitteeMember | null>(null);
  const president = useMemo(() => members.find(isPresident) || null, [members]);

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
        <div className="section-kicker-row" data-reveal>
          <div>
            <div className="eyebrow">Committee · 2026–2027</div>
            <h2>
              The people behind the <em>archive.</em>
            </h2>
          </div>
          <p className="section-copy compact-copy">
            Coordinator, advisors and committee members remain in their official
            order. Select any member to view their published contact information.
          </p>
        </div>

        {president && (
          <button
            className="president-feature"
            type="button"
            onClick={() => setSelected(president)}
            data-reveal
            aria-label={"Open President " + president.name + " contact details"}
          >
            <div className="president-feature-media">
              {president.photoUrl ? (
                <img src={president.photoUrl} alt={president.name} loading="lazy" />
              ) : (
                <div className="president-monogram" aria-hidden="true">
                  <span>{initials(president.name)}</span>
                </div>
              )}
              <span className="president-feature-glow" aria-hidden="true" />
            </div>

            <div className="president-feature-copy">
              <span className="president-kicker">President · Visual Archive Club</span>
              <h3>{president.name}</h3>
              <p>
                Leading VAC&apos;s 2026–2027 committee and its photography,
                videography, filmmaking and visual-archive initiatives.
              </p>
              <div className="president-meta">
                <span>{president.department || "Eastern University"}</span>
                <span>Committee 2026–2027</span>
              </div>
              <span className="president-open">
                View president profile <b aria-hidden="true">↗</b>
              </span>
            </div>

            <div className="president-feature-mark" aria-hidden="true">
              <span>01</span>
              <strong>PRESIDENT</strong>
            </div>
          </button>
        )}

        <div className="committee-list-label" data-reveal>
          <span>Official committee</span>
          <i />
          <small>{members.length} members</small>
        </div>

        <div className="committee-grid committee-grid--uniform">
          {members.map((member, index) => {
            const presidentCard = isPresident(member);

            return (
              <button
                className={
                  "member-card member-card--uniform " +
                  (presidentCard ? "member-card--president " : "")
                }
                key={member.serial + member.position + member.name}
                onClick={() => setSelected(member)}
                type="button"
                data-reveal
                style={{ "--reveal-delay": (index % 4) * 45 + "ms" } as CSSProperties}
              >
                <div className="member-card-top">
                  <span className="member-index">
                    {displaySerial(member, index)}
                  </span>
                  {presidentCard ? (
                    <span className="member-president-chip">President</span>
                  ) : (
                    <span className="member-open" aria-hidden="true">↗</span>
                  )}
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
            );
          })}
        </div>
      </div>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <article
            className={
              "member-modal " +
              (isPresident(selected) ? "member-modal--president" : "")
            }
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

              <div className="member-modal-copy">
                <div className="eyebrow">
                  {isPresident(selected) ? "VAC President · 2026–2027" : selected.position}
                </div>
                <h3>{selected.name}</h3>
                <p className="member-modal-position">{selected.position}</p>

                <dl className="member-contact-list">
                  <div>
                    <dt>Department</dt>
                    <dd>{selected.department || "Not published"}</dd>
                  </div>
                  <div>
                    <dt>Phone</dt>
                    <dd>
                      {selected.phone ? (
                        <a href={"tel:" + selected.phone.replace(/\s/g, "")}>
                          {selected.phone}
                        </a>
                      ) : (
                        "Not published"
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Gmail / Email</dt>
                    <dd>
                      {selected.email ? (
                        <a href={"mailto:" + selected.email}>{selected.email}</a>
                      ) : (
                        "Not published"
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </article>
        </div>
      )}
    </section>
  );
}
