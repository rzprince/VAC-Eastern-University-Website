"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Navbar({
  facebookPage,
  clubName = "Visual Archive Club",
  university = "Eastern University"
}: {
  facebookPage: string;
  clubName?: string;
  university?: string;
}) {
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  return (
    <header className="navbar">
      <div className="shell nav-inner">
        <Link
          className="brand"
          href="/"
          onClick={close}
          aria-label="Visual Archive Club home"
        >
          <span className="brand-mark">
            <Image
              src="/vac-logo.png"
              alt=""
              width={520}
              height={373}
              priority
            />
          </span>
          <span className="brand-copy">
            <strong>{clubName}</strong>
            <small>{university}</small>
          </span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="main-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="main-navigation"
          className={"nav-links " + (open ? "nav-links--open" : "")}
          aria-label="Main navigation"
        >
          <a href="/#about" onClick={close}>About</a>
          <a href="/#committee" onClick={close}>Committee</a>
          <Link href="/events" onClick={close}>Events</Link>
          <Link href="/archive" onClick={close}>Archive</Link>
          <a href="/#contact" onClick={close}>Contact</a>
          <a href={facebookPage} target="_blank" rel="noreferrer" onClick={close}>
            Facebook
          </a>
          <Link className="nav-join" href="/join" onClick={close}>
            <span>Join VAC</span><b aria-hidden="true">↗</b>
          </Link>
        </nav>
      </div>
    </header>
  );
}
