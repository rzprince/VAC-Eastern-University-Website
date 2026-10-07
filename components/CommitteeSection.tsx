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

function displaySerial(member: CommitteeMember) {
  const serial = String(member.serial || "").trim();
  return serial && serial !== "-" ? serial : "—";
}

function MemberCard({
  member,
  index,
  onOpen
}: {
  member: CommitteeMember;
  index: number;
  onOpen: (member: CommitteeMember) => void;
}) {
  return (
    <button
      className="member-card member-card--uniform"
      key={member.serial + member.position + member.name}
      onClick={() => onOpen(member)}
      type="button"
      data-reveal
      style={{ "--reveal-delay": (index % 4) * 45 + "ms" } as CSSProperties}
    >
      <div className="member-card-top">
        <span className="member-index">{displaySerial(member)}</span>
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
  );
}

export function CommitteeSection({
  members
}: {
  members: CommitteeMember[];
}) {
  const [selected, setSelected] = useState<CommitteeMember | null>(null);

  const presidentIndex = useMemo(
    () => members.findIndex(isPresident),
    [members]
  );
  const president = presidentIndex >= 0 ? members[presidentIndex] : null;
  const beforePresident = presidentIndex >= 0 ? members.slice(0, presidentIndex) : [];
  const afterPresident = presidentIndex >= 0 ? members.slice(presidentIndex + 1) : members;

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
            The committee is presented in its official order. Select any member
            to view their published department, phone number and Gmail/email.
          </p>
        </div>

        {beforePresident.length > 0 && (
          <div className="committee-grid committee-grid--advisory">
            {beforePresident.map((member, index) => (
              <MemberCard
                key={member.position + member.name}
                member={member}
                index={index}
                onOpen={setSelected}
              />
            ))}
          </div>
        )}

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
                President of the 2026–2027 Visual Archive Club committee,
                leading VAC&apos;s creative direction, visual storytelling and
                university-wide media initiatives.
              </p>
              <div className="president-meta">
                <span>{president.department || "Eastern University"}</span>
                <span>Serial {displaySerial(president)}</span>
                <span>Committee 2026–2027</span>
              </div>
              <span className="president-open">
                View president profile <b aria-hidden="true">↗</b>
              </span>
            </div>

            <div className="president-feature-mark" aria-hidden="true">
              <span>{displaySerial(president)}</span>
              <strong>PRESIDENT</strong>
            </div>
          </button>
        )}

        <div className="committee-list-label" data-reveal>
          <span>Committee members</span>
          <i />
          <small>{members.length} people in official order</small>
        </div>

        <div className="committee-grid committee-grid--uniform">
          {afterPresident.map((member, index) => (
            <MemberCard
              key={member.serial + member.position + member.name}
              member={member}
              index={index}
              onOpen={setSelected}
            />
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
