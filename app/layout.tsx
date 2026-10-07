import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { PremiumMotion } from "@/components/PremiumMotion";
import "./globals.css";

const productionUrl = "https://vac-eastern-university.vercel.app";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: {
    default: "Visual Archive Club | Eastern University",
    template: "%s | Visual Archive Club"
  },
  description:
    "Official website of Visual Archive Club (VAC), Eastern University — photography, videography, filmmaking, events, visual archive and membership.",
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
  icons: {
    icon: [{ url: "/vac-logo.png", type: "image/png" }],
    apple: [{ url: "/vac-logo.png", type: "image/png" }]
  },
  openGraph: {
    title: "Visual Archive Club | Eastern University",
    description:
      "Photography, videography, filmmaking and visual storytelling at Eastern University.",
    url: productionUrl,
    siteName: "Visual Archive Club",
    type: "website",
    images: [
      {
        url: "/vac-logo.png",
        width: 520,
        height: 373,
        alt: "Visual Archive Club — Eastern University"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Archive Club | Eastern University",
    description:
      "Photography, videography, filmmaking and visual storytelling at Eastern University.",
    images: ["/vac-logo.png"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable + " " + playfair.variable}>
      <body>
        <PremiumMotion />
        {children}
      </body>
    </html>
  );
}
