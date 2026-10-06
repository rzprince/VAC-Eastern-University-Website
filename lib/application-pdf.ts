import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

const ORANGE = rgb(1, 0.38, 0.02);
const INK = rgb(0.08, 0.08, 0.1);
const MUTED = rgb(0.38, 0.39, 0.43);
const LINE = rgb(0.88, 0.88, 0.9);

function pdfSafe(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\n\r\t]/g, "?");
}

function wrapText(text: string, maxChars: number) {
  const words = pdfSafe(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }
    if ((current + " " + word).length <= maxChars) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

export async function createMembershipPdf(data: MembershipPdfData) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let page = pdf.addPage([595.28, 841.89]);
  const width = page.getWidth();
  const height = page.getHeight();
  const margin = 46;
  let y = height - 48;

  function ensureSpace(required = 48) {
    if (y - required > 54) return;

    page = pdf.addPage([595.28, 841.89]);
    y = page.getHeight() - 50;
    page.drawText("VAC MEMBERSHIP APPLICATION - " + pdfSafe(data.applicationRef), {
      x: margin,
      y,
      size: 9,
      font: bold,
      color: MUTED
    });
    y -= 26;
  }

  page.drawRectangle({
    x: 0,
    y: height - 12,
    width,
    height: 12,
    color: ORANGE
  });

  page.drawText("VISUAL ARCHIVE CLUB", {
    x: margin,
    y,
    size: 20,
    font: bold,
    color: INK
  });
  y -= 23;

  page.drawText("Eastern University | Online Membership Application", {
    x: margin,
    y,
    size: 10,
    font: regular,
    color: MUTED
  });

  page.drawText(pdfSafe(data.applicationRef), {
    x: width - margin - 145,
    y: height - 48,
    size: 11,
    font: bold,
    color: ORANGE
  });

  y -= 30;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: LINE
  });
  y -= 24;

  function field(label: string, value: string, multiline = false) {
    const lines = multiline ? wrapText(value, 78) : [pdfSafe(value)];
    ensureSpace(26 + lines.length * 14);

    page.drawText(label.toUpperCase(), {
      x: margin,
      y,
      size: 7.5,
      font: bold,
      color: ORANGE
    });
    y -= 14;

    for (const line of lines) {
      page.drawText(line || "-", {
        x: margin,
        y,
        size: 10.5,
        font: regular,
        color: INK,
        maxWidth: width - margin * 2
      });
      y -= 14;
    }

    y -= 9;
  }

  field("Full name", data.fullName);
  field("Eastern University ID", data.euId);
  field("Department", data.department);
  field("Date of birth", data.dateOfBirth);
  field("Blood group", data.bloodGroup);
  field("Email", data.email);
  field("Phone / WhatsApp", data.phone);
  field("Address", data.address, true);
  field("Skills", data.skills, true);
  field("Reason for joining VAC", data.reason, true);

  ensureSpace(115);
  page.drawRectangle({
    x: margin,
    y: y - 82,
    width: width - margin * 2,
    height: 94,
    color: rgb(0.975, 0.965, 0.95),
    borderColor: LINE,
    borderWidth: 1
  });

  page.drawText("PAYMENT REFERENCE", {
    x: margin + 14,
    y: y - 4,
    size: 8,
    font: bold,
    color: ORANGE
  });
  page.drawText("Registration fee: BDT " + data.registrationFee, {
    x: margin + 14,
    y: y - 23,
    size: 10,
    font: bold,
    color: INK
  });
  page.drawText("bKash sender: " + pdfSafe(data.bkashSender), {
    x: margin + 14,
    y: y - 40,
    size: 10,
    font: regular,
    color: INK
  });
  page.drawText("TRX ID: supplied manually through VAC WhatsApp", {
    x: margin + 14,
    y: y - 57,
    size: 9,
    font: regular,
    color: MUTED
  });
  page.drawText("Submitted: " + pdfSafe(data.submittedAt), {
    x: margin + 14,
    y: y - 72,
    size: 8,
    font: regular,
    color: MUTED
  });
  y -= 105;

  ensureSpace(48);
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: LINE
  });
  y -= 18;
  page.drawText(
    "Generated automatically by the Visual Archive Club membership system.",
    {
      x: margin,
      y,
      size: 8,
      font: regular,
      color: MUTED
    }
  );

  return pdf.save();
}
