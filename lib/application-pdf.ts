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

function ascii(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[^\x20-\x7E\n\r\t]/g, "?");
}

function pdfEscape(value: string) {
  return ascii(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrap(value: string, max = 78) {
  const paragraphs = ascii(value).split(/\r?\n/);
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const next = current ? current + " " + word : word;
      if (next.length <= max) {
        current = next;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines.length ? lines : [""];
}

type Row = {
  label: string;
  value: string;
  multiline?: boolean;
};

function pageStream(
  data: MembershipPdfData,
  rows: Row[],
  pageNumber: number,
  pageCount: number
) {
  const commands: string[] = [];
  const orange = "1 0.38 0.02";
  const ink = "0.08 0.08 0.10";
  const muted = "0.38 0.39 0.43";
  let y = 790;

  commands.push("q");
  commands.push(orange + " rg");
  commands.push("0 830 595 12 re f");
  commands.push("Q");

  commands.push("BT");
  commands.push("/F2 19 Tf");
  commands.push(ink + " rg");
  commands.push("46 " + y + " Td");
  commands.push("(" + pdfEscape("VISUAL ARCHIVE CLUB") + ") Tj");
  commands.push("ET");

  y -= 22;
  commands.push("BT /F1 9 Tf " + muted + " rg 46 " + y + " Td (" +
    pdfEscape("Eastern University | Online Membership Application") + ") Tj ET");

  commands.push("BT /F2 10 Tf " + orange + " rg 404 790 Td (" +
    pdfEscape(data.applicationRef) + ") Tj ET");

  y -= 24;
  commands.push("0.88 0.88 0.90 RG 46 " + y + " m 549 " + y + " l S");
  y -= 25;

  for (const row of rows) {
    const lines = row.multiline ? wrap(row.value, 78) : [ascii(row.value)];

    commands.push("BT /F2 7.5 Tf " + orange + " rg 46 " + y + " Td (" +
      pdfEscape(row.label.toUpperCase()) + ") Tj ET");
    y -= 14;

    for (const line of lines) {
      commands.push("BT /F1 10.2 Tf " + ink + " rg 46 " + y + " Td (" +
        pdfEscape(line || "-") + ") Tj ET");
      y -= 14;
    }

    y -= 8;
  }

  if (pageNumber === pageCount) {
    y -= 2;
    commands.push("0.97 0.96 0.94 rg 46 " + (y - 83) + " 503 94 re f");
    commands.push("0.88 0.88 0.90 RG 46 " + (y - 83) + " 503 94 re S");
    commands.push("BT /F2 8 Tf " + orange + " rg 60 " + (y - 4) + " Td (" +
      pdfEscape("PAYMENT REFERENCE") + ") Tj ET");
    commands.push("BT /F2 10 Tf " + ink + " rg 60 " + (y - 23) + " Td (" +
      pdfEscape("Registration fee: BDT " + data.registrationFee) + ") Tj ET");
    commands.push("BT /F1 10 Tf " + ink + " rg 60 " + (y - 40) + " Td (" +
      pdfEscape("bKash sender: " + data.bkashSender) + ") Tj ET");
    commands.push("BT /F1 9 Tf " + muted + " rg 60 " + (y - 57) + " Td (" +
      pdfEscape("TRX ID: supplied manually through VAC WhatsApp") + ") Tj ET");
    commands.push("BT /F1 8 Tf " + muted + " rg 60 " + (y - 72) + " Td (" +
      pdfEscape("Submitted: " + data.submittedAt) + ") Tj ET");
  }

  commands.push("BT /F1 7 Tf " + muted + " rg 46 32 Td (" +
    pdfEscape("Generated automatically by the Visual Archive Club membership system.") +
    ") Tj ET");
  commands.push("BT /F1 7 Tf " + muted + " rg 500 32 Td (" +
    pdfEscape(pageNumber + "/" + pageCount) + ") Tj ET");

  return commands.join("\n");
}

export async function createMembershipPdf(data: MembershipPdfData) {
  const rows: Row[] = [
    { label: "Full name", value: data.fullName },
    { label: "Eastern University ID", value: data.euId },
    { label: "Department", value: data.department },
    { label: "Date of birth", value: data.dateOfBirth },
    { label: "Blood group", value: data.bloodGroup },
    { label: "Email", value: data.email },
    { label: "Phone / WhatsApp", value: data.phone },
    { label: "Address", value: data.address, multiline: true },
    { label: "Skills", value: data.skills, multiline: true },
    { label: "Reason for joining VAC", value: data.reason, multiline: true }
  ];

  const firstPage: Row[] = [];
  const laterPage: Row[] = [];
  let estimatedLines = 0;

  for (const row of rows) {
    const lineCount = row.multiline ? wrap(row.value, 78).length : 1;
    const cost = 2 + lineCount;
    if (estimatedLines + cost <= 28) {
      firstPage.push(row);
      estimatedLines += cost;
    } else {
      laterPage.push(row);
    }
  }

  const pages = laterPage.length ? [firstPage, laterPage] : [firstPage];
  const streams = pages.map((pageRows, index) =>
    pageStream(data, pageRows, index + 1, pages.length)
  );

  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let nextId = 5;
  for (let i = 0; i < streams.length; i++) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageObjectIds.push(pageId);
    contentObjectIds.push(contentId);

    objects[pageId] =
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> " +
      "/Contents " + contentId + " 0 R >>";

    const stream = streams[i];
    objects[contentId] =
      "<< /Length " + new TextEncoder().encode(stream).length + " >>\n" +
      "stream\n" + stream + "\nendstream";
  }

  objects[2] =
    "<< /Type /Pages /Kids [" +
    pageObjectIds.map((id) => id + " 0 R").join(" ") +
    "] /Count " + pageObjectIds.length + " >>";

  let pdf = "%PDF-1.4\n%VAC\n";
  const offsets: number[] = [0];

  for (let id = 1; id < objects.length; id++) {
    offsets[id] = new TextEncoder().encode(pdf).length;
    pdf += id + " 0 obj\n" + objects[id] + "\nendobj\n";
  }

  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += "xref\n0 " + objects.length + "\n";
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id < objects.length; id++) {
    pdf += String(offsets[id]).padStart(10, "0") + " 00000 n \n";
  }

  pdf +=
    "trailer\n<< /Size " + objects.length + " /Root 1 0 R >>\n" +
    "startxref\n" + xrefOffset + "\n%%EOF";

  return new TextEncoder().encode(pdf);
}
