type Kind = "facebook" | "group" | "phone" | "mail";

function ContactIcon({ kind }: { kind: Kind }) {
  if (kind === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M13.7 21v-8.1h2.75l.42-3.35H13.7v-2.1c0-.96.27-1.62 1.66-1.62h1.76V2.82A23 23 0 0 0 14.55 2c-2.54 0-4.29 1.55-4.29 4.4v2.45H7.4v3.35h2.86V21h3.44Z"/>
      </svg>
    );
  }
  const path =
    kind === "group"
      ? <><circle cx="9" cy="8.5" r="3.1"/><path d="M2.7 19v-1.4c0-2.8 2.5-4.5 6.3-4.5s6.3 1.7 6.3 4.5V19Z"/><path d="M16.4 5.8a3 3 0 0 1 0 5.8M18 13.6c2.3.65 3.3 2 3.3 4V19"/></>
      : kind === "phone"
        ? <path d="m6.5 3.5 3 3.2-2 2.4a17 17 0 0 0 7.5 7.5l2.4-2 3.2 3-1.6 3.3c-.3.65-.95.95-1.65.83C10.25 20.4 3.6 13.75 2.27 6.65c-.12-.7.18-1.35.83-1.65Z"/>
        : <><rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="m3.6 6.5 8.4 6.4 8.4-6.4"/></>;
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{path}</svg>;
}

function ArrowIcon() {
  return (
    <svg className="contact-action-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 18 18 6M8 6h10v10"/>
    </svg>
  );
}

export function ContactActions({
  facebookPage,
  facebookGroup,
  contactPhone,
  contactEmail
}: {
  facebookPage: string;
  facebookGroup: string;
  contactPhone: string;
  contactEmail: string;
}) {
  const cards: {
    kind: Kind; eyebrow: string; title: string; action: string;
    href: string; external: boolean
  }[] = [
    { kind: "facebook", eyebrow: "Official VAC page", title: "Facebook", action: "Visit official page", href: facebookPage, external: true },
    { kind: "group", eyebrow: "Our community", title: "VAC Group", action: "Explore the group", href: facebookGroup, external: true },
    { kind: "phone", eyebrow: "Committee contact", title: contactPhone, action: "Call the committee", href: "tel:" + contactPhone.replace(/\s/g, ""), external: false },
    { kind: "mail", eyebrow: "Official club email", title: contactEmail, action: "Send an email", href: "mailto:" + contactEmail, external: false }
  ];

  return (
    <div className="contact-links contact-links--interactive">
      {cards.map((card) => (
        <a
          href={card.href}
          target={card.external ? "_blank" : undefined}
          rel={card.external ? "noopener noreferrer" : undefined}
          key={card.kind}
          className={"contact-action contact-action--" + card.kind}
          aria-label={card.action + (card.external ? ". Opens in a new tab." : "")}
        >
          <span className="contact-action-top">
            <span className="contact-action-icon"><ContactIcon kind={card.kind} /></span>
            <ArrowIcon />
          </span>
          <small>{card.eyebrow}</small>
          <strong>{card.title}</strong>
          <span className="contact-action-hint">{card.action} <span aria-hidden="true">↗</span></span>
        </a>
      ))}
    </div>
  );
}
