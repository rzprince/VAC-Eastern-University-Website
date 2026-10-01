import Link from "next/link";
import { ArchiveExplorer } from "@/components/ArchiveExplorer";
import { Navbar } from "@/components/Navbar";
import { getAllMedia, getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const [items, settings] = await Promise.all([
    getAllMedia(),
    getSiteSettings()
  ]);

  return (
    <>
      <Navbar
        facebookPage={settings.facebookPage}
        clubName={settings.clubName}
        university={settings.university}
      />
      <main className="inner-page">
        <section className="section">
          <div className="shell">
            <div className="eyebrow">Visual Archive</div>
            <h1 className="page-title">Photos, videos & <span>memories.</span></h1>
            <p className="section-copy">
              Browse VAC&apos;s published archive. Video cards open the exact
              Facebook post configured by the club.
            </p>
            <ArchiveExplorer items={items} facebookPage={settings.facebookPage} />
          </div>
        </section>
      </main>
      <footer>
        <div className="shell footer-inner">
          <div>
            <strong>{settings.clubName}</strong>
            <span>{settings.university} · Since {settings.since}</span>
          </div>
          <div>
            <Link href="/">Home</Link>
            <Link href="/events">Events</Link>
            <Link href="/join">Join VAC</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
