import Image from "next/image";
import Link from "next/link";

export function Navbar({
  facebookPage,
  clubName = "Visual Archive Club",
  university = "Eastern University"
}: {
  facebookPage: string;
  clubName?: string;
  university?: string;
}) {
  return (
    <header className="navbar">
      <div className="shell nav-inner">
        <Link className="brand" href="/">
          <Image src="/vac-logo.webp" alt={clubName} width={74} height={49} priority />
          <span>
            <strong>{clubName}</strong>
            <small>{university}</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="/#about">About</a>
          <a href="/#committee">Committee</a>
          <a href="/#events">Events</a>
          <a href="/#media">Media</a>
          <a href={facebookPage} target="_blank" rel="noreferrer">Facebook</a>
          <Link className="nav-join" href="/join">Join VAC</Link>
        </nav>
      </div>
    </header>
  );
}
