import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";

const productionUrl = "https://vac-eastern-university.vercel.app";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: {
    default: "Visual Archive Club | Eastern University",
    template: "%s | Visual Archive Club"
  },
  description:
    "Official website of Visual Archive Club (VAC), Eastern University — photography, videography, filmmaking, events, archive and membership.",
  keywords: [
    "Visual Archive Club",
    "VAC",
    "Eastern University",
    "Photography Club",
    "Videography Club",
    "Filmmaking",
    "Visual Storytelling"
  ],
  alternates: { canonical: "/" },
  icons: { icon: "/vac-logo.webp" },
  openGraph: {
    title: "Visual Archive Club | Eastern University",
    description:
      "Photography, videography and visual storytelling at Eastern University.",
    url: productionUrl,
    siteName: "Visual Archive Club",
    type: "website",
    images: [
      {
        url: "/vac-logo.webp",
        width: 1000,
        height: 667,
        alt: "Visual Archive Club"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Archive Club | Eastern University",
    description:
      "Photography, videography and visual storytelling at Eastern University.",
    images: ["/vac-logo.webp"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable + " " + spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
