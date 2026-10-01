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
};

export const SITE: SiteSettings & {
  president: { name: string; phone: string; email: string };
} = {
  clubName: "Visual Archive Club",
  shortName: "VAC",
  university: "Eastern University",
  since: "2010",
  tenure: "June 2026 — June 2027",
  tagline: "Where Every Frame Tells a Story",
  aboutText:
    "Visual Archive Club is a creative community for photography, videography, editing, design and visual storytelling. VAC documents university life and helps students build practical creative skills.",
  facebookPage: "https://www.facebook.com/visualarchiveeu",
  facebookGroup: "https://www.facebook.com/groups/603306963175089",
  bkashNumber: "01860899999",
  registrationFee: 100,
  president: {
    name: "Rezwan Hossain Prince",
    phone: "+880 1860899999",
    email: "rzprince02@gmail.com"
  }
};
