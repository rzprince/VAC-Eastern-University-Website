import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar
        facebookPage={settings.facebookPage}
        clubName={settings.clubName}
        university={settings.university}
      />
      <main className="inner-page">
        <section className="section">
          <div className="shell privacy-page">
            <div className="eyebrow">Privacy</div>
            <h1 className="page-title">Membership data & <span>privacy.</span></h1>
            <p className="section-copy">
              This page explains how the VAC website handles information submitted
              through the online membership form.
            </p>

            <div className="privacy-content">
              <section>
                <h2>Information collected</h2>
                <p>
                  The membership form collects the information needed to review
                  an application: name, Eastern University ID, department,
                  address, date of birth, blood group, email, phone/WhatsApp,
                  skills, reason for joining, bKash sender number and Transaction
                  ID.
                </p>
              </section>

              <section>
                <h2>How it is used</h2>
                <p>
                  Submitted information is used for VAC membership administration,
                  payment-reference verification, applicant communication and the
                  approved-member registry.
                </p>
              </section>

              <section>
                <h2>Who can access it</h2>
                <p>
                  Application records are not displayed on the public website.
                  Database access is restricted to authorized VAC administrators
                  through Supabase authentication and Row Level Security.
                </p>
              </section>

              <section>
                <h2>Public committee information</h2>
                <p>
                  Committee cards may display a member&apos;s position, name,
                  department, photo, phone and email when VAC chooses to publish
                  those fields. Home addresses and Eastern University IDs are not
                  published on committee cards.
                </p>
              </section>

              <section>
                <h2>Questions or corrections</h2>
                <p>
                  For a correction or privacy question, contact VAC at{" "}
                  <a href={"mailto:" + settings.contactEmail}>{settings.contactEmail}</a>
                  {" "}or{" "}
                  <a href={"tel:" + settings.contactPhone.replace(/\s/g, "")}>
                    {settings.contactPhone}
                  </a>.
                </p>
              </section>
            </div>

            <Link className="secondary-button" href="/join">Back to membership form</Link>
          </div>
        </section>
      </main>
    </>
  );
}
