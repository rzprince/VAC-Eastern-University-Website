import type { Metadata } from "next";
import "./globals.css";

const productionUrl = "https://vac-eastern-university.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: "Visual Archive Club | Eastern University",
  description:
    "Official website of Visual Archive Club (VAC), Eastern University.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Visual Archive Club | Eastern University",
    description:
      "Official website of Visual Archive Club (VAC), Eastern University.",
    url: productionUrl,
    siteName: "Visual Archive Club",
    type: "website"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
