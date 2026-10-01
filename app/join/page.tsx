import Image from "next/image";
import Link from "next/link";
import { RegistrationForm } from "@/components/RegistrationForm";
import { getSiteSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const settings = await getSiteSettings();

  return (
    <main className="join-page">
      <div className="shell">
        <Link className="back-link" href="/">← Back to VAC</Link>

        <header className="form-header">
          <div className="form-header-logos">
            <Image
              src="/eastern-university-logo.webp"
              alt={settings.university}
              width={130}
              height={94}
            />
            <Image
              src="/vac-logo.webp"
              alt={settings.clubName}
              width={160}
              height={106}
            />
          </div>

          <div className="eyebrow">Online membership registration</div>
          <h1>Join <span>{settings.clubName}</span></h1>
          <p>
            This digital form replaces the paper membership form. Complete your
            information, send ৳{settings.registrationFee} by bKash to{" "}
            <strong>{settings.bkashNumber}</strong>, and submit your Transaction
            ID for verification.
          </p>
        </header>

        <RegistrationForm
          registrationFee={settings.registrationFee}
          bkashNumber={settings.bkashNumber}
        />
      </div>
    </main>
  );
}
