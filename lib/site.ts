export type SiteSettings = {
  clubName: string;
  shortName: string;
  university: string;
  since: string;
  tenure: string;
  tagline: string;
  aboutText: string;
  facebookPage: string;
  facebookGroup: string;
  bkashNumber: string;
  registrationFee: number;
  registrationOpen: boolean;
  contactEmail: string;
  contactPhone: string;
};

export const SITE: SiteSettings = {
  clubName: "Visual Archive Club",
  shortName: "VAC",
  university: "Eastern University",
  since: "2010",
  tenure: "June 2026 — June 2027",
  tagline: "Where Every Frame Tells a Story",
  aboutText:
    "Visual Archive Club (VAC) is the premier creative media organization of Eastern University — a collective of passionate photographers, videographers, editors, and storytellers. Founded in 2010, VAC documents events, produces cinematic content, and builds a lasting archive of university life.",
  facebookPage: "https://www.facebook.com/visualarchiveeu",
  facebookGroup: "https://www.facebook.com/groups/603306963175089",
  bkashNumber: "01860899999",
  registrationFee: 100,
  registrationOpen: true,
  contactEmail: "vac.easternuni@gmail.com",
  contactPhone: "+880 1860899999"
};
