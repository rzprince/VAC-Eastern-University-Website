import type { Metadata } from "next";
import { Cormorant, Montserrat } from "next/font/google";
import { PremiumMotion } from "@/components/PremiumMotion";
import "./globals.css";
import "./premium-v5.css";
import "./premium-v6.css";
import "./premium-v7.css";
import "./premium-v8.css";

const productionUrl = "https://vac-eastern-university.vercel.app";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

const cormorant = Cormorant({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["500", "600", "700"]
});

export const metadata: Metadata = {
  metadataBase: new URL(productionUrl),
  title: {
    default: "Visual Archive Club | Eastern University",
    template: "%s | Visual Archive Club"
  },
  description:
    "Official website of Visual Archive Club (VAC), Eastern University. Photography, videography, filmmaking, content creation, visual storytelling, art exhibitions and digital art.",
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
    icon: [{ url: "/vac-logo.webp", type: "image/webp" }],
    apple: [{ url: "/vac-logo.webp", type: "image/webp" }]
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
        url: "/vac-logo.webp",
        width: 220,
        height: 157,
        alt: "Visual Archive Club at Eastern University"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Archive Club | Eastern University",
    description:
      "Photography, videography, filmmaking and visual storytelling at Eastern University.",
    images: ["/vac-logo.webp"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable + " " + cormorant.variable}>
      <body>
        <PremiumMotion />
        {children}
      </body>
    </html>
  );
}
