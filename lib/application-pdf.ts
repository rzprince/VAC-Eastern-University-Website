import sharp from "sharp";
import {
  PDFDocument, StandardFonts, rgb,
  type PDFFont, type PDFPage, type PDFImage
} from "pdf-lib";
import { PRINCE_SIGNATURE_PATH } from "@/lib/prince-signature";
import { VAC_LOGO_PNG, EU_LOGO_PNG } from "@/lib/brand-pdf-assets";

export type MembershipPdfData = {
  applicationRef: string;
  fullName: string;
  euId: string;
  department: string;
  address: string;
  dateOfBirth: string;
  bloodGroup: string;
  email: string;
  phone: string;
  skills: string;
  reason: string;
  bkashSender: string;
  registrationFee: number;
  submittedAt: string;
};

/*
 * All data is captured on a single PDF page. Long applicant responses grow
 * the height of that one page rather than creating a second sheet.
 * Payment is an application receipt, NOT proof of payment verification.
 */
const colors = {
  ink: rgb(0.08, 0.11, 0.16),
  muted: rgb(0.40, 0.46, 0.52),
  orange: rgb(1, 0.42, 0.09),
  cream: rgb(0.99, 0.98, 0.96),
  dark: rgb(0.055, 0.078, 0.11),
  border: rgb(0.87, 0.89, 0.90),
  panel: rgb(0.965, 0.970, 0.978),
  white: rgb(1, 1, 1)
};

function clean(value: string) {
  // Standard PDF fonts are ASCII-only. Keep the original saved record intact.
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\n\r\t]/g, "?")
    .trim() || "Not supplied";
}

function linesFor(value: string, font: PDFFont, size: number, maxWidth: number) {
  const result: string[] = [];
  const paragraphs = clean(value).split(/\r?\n/);
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) { result.push(""); continue; }
    let line = "";
    for (let word of words) {
      while (font.widthOfTextAtSize(word, size) > maxWidth) {
        let length = 1;
        while (length < word.length &&
          font.widthOfTextAtSize(word.slice(0, length + 1), size) <= maxWidth) length++;
        const part = word.slice(0, length);
        if (line) { result.push(line); line = ""; }
        result.push(part);
        word = word.slice(length);
      }
      const candidate = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
        result.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) result.push(line);
  }
  return result.length ? result : ["Not supplied"];
}

function text(page: PDFPage, value: string, x: number, y: number,
              size: number, font: PDFFont, color = colors.ink) {
  page.drawText(clean(value), { x, y, size, font, color });
}

function rectangle(page: PDFPage, x: number, y: number, width: number,
                   height: number, color = colors.panel) {
  page.drawRectangle({ x, y, width, height, color });
}

function label(page: PDFPage, value: string, x: number, y: number, font: PDFFont) {
  text(page, value.toUpperCase(), x, y, 7.3, font, colors.orange);
}

function panelField(page: PDFPage, x: number, top: number, width: number,
                    height: number, heading: string, values: string[],
                    regular: PDFFont, bold: PDFFont, fontSize = 9.6) {
  rectangle(page, x, top - height, width, height);
  page.drawLine({ start: { x, y: top - height },
                  end: { x: x + width, y: top - height },
                  thickness: 0.6, color: colors.border });
  label(page, heading, x + 13, top - 14, bold);
  let y = top - 30;
  for (const line of values) {
    text(page, line || " ", x + 13, y, fontSize, regular);
    y -= fontSize + 2.8;
  }
}

async function embedClubLogo(doc: PDFDocument, name: string, logoBase64: string) {
  // Bundle the original transparent logos to work reliably on Vercel functions.
  // Flatten to match the masthead color and embed a small optimized JPEG.
  try {
    const source = Buffer.from(logoBase64, "base64");
    const jpg = await sharp(source)
      .resize({ width: 370, withoutEnlargement: true })
      .flatten({ background: "#0e141c" })
      .jpeg({ quality: 89, mozjpeg: true })
      .toBuffer();
    return await doc.embedJpg(jpg);
  } catch (error) {
    console.error("VAC PDF logo could not be loaded:", name,
      error instanceof Error ? error.message : "unknown error");
    return null;
  }
}

function fitImage(page: PDFPage, image: PDFImage | null,
                  x: number, y: number, width: number, height: number) {
  if (!image) return;
  const scale = Math.min(width / image.width, height / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  page.drawImage(image, {
    x: x + (width - w) / 2,
    y: y + (height - h) / 2,
    width: w, height: h
  });
}

export async function createMembershipPdf(data: MembershipPdfData) {
  const doc = await PDFDocument.create();
  doc.setTitle("VAC Membership Application | " + clean(data.applicationRef));
  doc.setAuthor("Visual Archive Club, Eastern University");
  doc.setSubject("Official membership application receipt, pending payment verification");
  doc.setCreator("Visual Archive Club membership portal");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const editorial = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);

  const W = 595.28;
  const margin = 36;
  const contentW = W - 2 * margin;
  const gap = 11;
  const colW = (contentW - gap) / 2;
  const profile: [string, string][][] = [
    [["Full name", data.fullName], ["University ID", data.euId]],
    [["Department", data.department], ["Date of birth", data.dateOfBirth]],
    [["Blood group", data.bloodGroup], ["Email / Gmail", data.email]],
    [["Phone / WhatsApp", data.phone], ["Address", data.address]]
  ];
  const fieldRows = profile.map(pair => {
    const parts = pair.map(([heading,value]) => ({
      heading,
      lines: linesFor(value, regular, 9.3, colW - 28)
    }));
    return {
      parts,
      height: Math.max(45, ...parts.map(p => 31 + p.lines.length * 12))
    };
  });
  const skills = linesFor(data.skills, regular, 9, contentW - 28);
  const reason = linesFor(data.reason, regular, 9, contentW - 28);
  const skillsHeight = Math.max(52, 30 + skills.length * 12);
  const reasonHeight = Math.max(61, 30 + reason.length * 12);
  const rowTotal = fieldRows.reduce((n, row) => n + row.height, 0);
  const overflow = Math.max(0, rowTotal - 180)
    + Math.max(0, skillsHeight - 52)
    + Math.max(0, reasonHeight - 61);
  // A4 normally; extremely long applicant statements still remain on one page.
  const H = 842 + overflow;
  const page = doc.addPage([W, H]);

  rectangle(page, 0, H - 128, W, 128, colors.dark);
  rectangle(page, 0, H - 128, 7, 128, colors.orange);
  const [vac, eu] = await Promise.all([
    embedClubLogo(doc, "VAC", VAC_LOGO_PNG),
    embedClubLogo(doc, "Eastern University", EU_LOGO_PNG)
  ]);
  fitImage(page, vac, 30, H - 112, 88, 80);
  rectangle(page, 133, H - 102, 1, 57, rgb(.32,.36,.42));
  fitImage(page, eu, 149, H - 109, 79, 75);
  text(page, "VISUAL ARCHIVE CLUB", 244, H - 60, 15.5, bold, colors.white);
  text(page, "EASTERN UNIVERSITY  |  SINCE 2010", 245, H - 77, 7.7, regular, rgb(.80,.80,.79));
  text(page, "MEMBERSHIP APPLICATION", 244, H - 102, 10.2, editorial, rgb(1,.62,.33));

  let top = H - 139;
  rectangle(page, margin, top - 31, contentW, 31, colors.cream);
  rectangle(page, margin, top - 31, 3.5, 31, colors.orange);
  label(page, "Application reference", margin + 12, top - 12, bold);
  text(page, data.applicationRef, margin + 140, top - 17.7, 9.2, bold);
  text(page, "PENDING VERIFICATION", W - margin - 126, top - 16, 7.2, bold, colors.orange);

  top -= 48;
  label(page, "01  /  Applicant profile", margin, top, bold);
  top -= 13;

  for (const row of fieldRows) {
    const [left,right] = row.parts;
    panelField(page, margin, top, colW, row.height, left.heading, left.lines, regular, bold, 9.3);
    panelField(page, margin + colW + gap, top, colW, row.height, right.heading, right.lines, regular, bold, 9.3);
    top -= row.height + 4;
  }

  top -= 9;
  label(page, "02  /  Creative profile", margin, top, bold);
  top -= 13;
  panelField(page, margin, top, contentW, skillsHeight, "Skills and creative interests", skills, regular, bold, 9);
  top -= skillsHeight + 7;
  panelField(page, margin, top, contentW, reasonHeight, "Why I want to join VAC", reason, regular, bold, 9);
  top -= reasonHeight + 14;

  const paymentH = 75;
  rectangle(page, margin, top - paymentH, contentW, paymentH, colors.cream);
  rectangle(page, margin, top - paymentH, 4, paymentH, colors.orange);
  label(page, "03  /  Membership fee", margin + 13, top - 17, bold);
  text(page, "BDT " + data.registrationFee, margin + 13, top - 46, 20, bold, colors.orange);
  text(page, "bKash sender: " + data.bkashSender,
       margin + 152, top - 28, 9, bold);
  text(page, "Transaction ID: sent via official VAC WhatsApp",
       margin + 152, top - 44, 7.9, regular, colors.muted);
  text(page, "Payment pending manual verification",
       margin + 152, top - 60, 8, bold, colors.orange);
  top -= paymentH + 12;

  // The supplied President signature is a facsimile for issuance only.
  // It is NOT an approval and does not verify payment.
  page.drawLine({
    start: { x: margin, y: top - 116 },
    end: { x: W - margin, y: top - 116 },
    color: colors.border, thickness: 0.7
  });
  label(page, "Submitted", margin + 2, top - 10, bold);
  text(page, data.submittedAt, margin + 2, top - 27, 9, regular);
  text(page, "RECEIVED  /  AWAITING TRX ID VERIFICATION",
    margin + 2, top - 45, 7.5, bold, colors.muted);

  // Direct vector line segments avoid expensive SVG-path parsing in serverless.
  // The point geometry was traced from the transparent signature supplied by VAC.
  const signX = W - margin - 136;
  const signY = top + 5;
  const signScale = 0.16;
  for (const contour of PRINCE_SIGNATURE_PATH.split(" M").map((path, i) => i === 0 ? path : "M" + path)) {
    const points = Array.from(contour.matchAll(/[ML]([0-9]+),([0-9]+)/g),
      ([, px, py]) => ({ x: signX + Number(px) * signScale, y: signY - Number(py) * signScale }));
    if (points.length < 2) continue;
    for (let i = 1; i < points.length; i++) {
      page.drawLine({
        start: points[i - 1], end: points[i],
        thickness: 1.05, color: colors.orange
      });
    }
    page.drawLine({
      start: points[points.length - 1], end: points[0],
      thickness: 1.05, color: colors.orange
    });
  }
  text(page, "Rezwan Hossain Prince", W - margin - 152, top - 93, 9.6, bold);
  text(page, "President  |  VAC acknowledgement", W - margin - 152, top - 108, 7, regular, colors.muted);

  rectangle(page, 0, 0, W, 31, colors.dark);
  text(page, "VISUAL ARCHIVE CLUB  /  EASTERN UNIVERSITY", margin, 12, 7, bold, colors.white);
  text(page, "ONE APPLICATION. ONE CREATIVE COMMUNITY.", W - margin - 228, 12, 7, regular, rgb(.82,.77,.73));

  // pdf-lib produces a compact, cross-browser, fully downloadable one-page PDF.
  return await doc.save({ useObjectStreams: true, addDefaultPage: false });
}
