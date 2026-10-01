import type { Metadata } from "next";
import "./globals.css";

const productionUrl = "https://vac-eastern-university.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: {
    default: "Visual Archive Club | Eastern University",
    template: "%s | Visual Archive Club"
  },
  description:
    "Official website of Visual Archive Club (VAC), Eastern University — photography, videography, events, media archive and membership.",
  keywords: [
    "Visual Archive Club",
    "VAC",
    "Eastern University",
    "Eastern University Bangladesh",
    "Photography Club",
    "Videography Club"
  ],
  alternates: {
    canonical: "/"
  },
  icons: {
    icon: "/vac-logo.webp"
  },
  openGraph: {
    title: "Visual Archive Club | Eastern University",
    description:
      "Official website of Visual Archive Club (VAC), Eastern University.",
    url: productionUrl,
    siteName: "Visual Archive Club",
    type: "website",
    images: [
      {
        url: "/vac-logo.webp",
        width: 1200,
        height: 800,
        alt: "Visual Archive Club"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Archive Club | Eastern University",
    description:
      "Official website of Visual Archive Club (VAC), Eastern University.",
    images: ["/vac-logo.webp"]
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
