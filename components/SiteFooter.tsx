import Link from "next/link";
import { VacLogo } from "@/components/BrandLogo";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13.7 22v-8.7h2.9l.4-3.4h-3.3V7.7c0-1 .3-1.7 1.7-1.7h1.8V3a24 24 0 0 0-2.6-.1c-2.6 0-4.4 1.6-4.4 4.5V10H7.3v3.4h2.9V22h3.5Z"
      />
    </svg>
  );
}

export function SiteFooter({
  clubName,
  university,
  since,
  facebookPage,
  facebookGroup
}: {
  clubName: string;
  university: string;
  since: string;
  facebookPage: string;
  facebookGroup: string;
}) {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          <VacLogo alt="" />
          <div>
            <strong>{clubName}</strong>
            <span>{university} · Since {since}</span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/events">Events</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/join">Membership</Link>
          <Link href="/privacy">Privacy</Link>
          <a href={facebookPage} target="_blank" rel="noreferrer">Facebook Page</a>
          <a href={facebookGroup} target="_blank" rel="noreferrer">VAC Group</a>
        </nav>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Visual Archive Club · Eastern University</span>
        <a
          className="developer-credit"
          href="https://www.facebook.com/rz.hs.prince"
          target="_blank"
          rel="noreferrer"
          aria-label="Website developed by Rezwan Hossain Prince — open Facebook profile"
        >
          <span>This website is developed by <b>Rezwan Hossain Prince</b></span>
          <i><FacebookIcon /></i>
        </a>
      </div>
    </footer>
  );
}
