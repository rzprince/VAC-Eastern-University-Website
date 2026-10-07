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

function wrap(value: string, max = 76) {
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

function text(
  commands: string[],
  value: string,
  x: number,
  y: number,
  size: number,
  font: "F1" | "F2" = "F1",
  color = "0.10 0.10 0.11"
) {
  commands.push(
    "BT /" +
      font +
      " " +
      size +
      " Tf " +
      color +
      " rg " +
      x +
      " " +
      y +
      " Td (" +
      pdfEscape(value) +
      ") Tj ET"
  );
}

function pageHeader(
  commands: string[],
  data: MembershipPdfData,
  pageNumber: number,
  pageCount: number
) {
  // VAC charcoal masthead + signature orange brand bar.
  commands.push("q 0.035 0.035 0.04 rg 0 744 595 98 re f Q");
  commands.push("q 1 0.36 0 rg 0 744 10 98 re f Q");
  commands.push("q 1 0.36 0 rg 46 778 48 30 re f Q");

  text(commands, "VAC", 58, 787, 13, "F2", "1 1 1");
  text(commands, "VISUAL ARCHIVE CLUB", 112, 795, 17, "F2", "0.97 0.96 0.94");
  text(
    commands,
    "Eastern University | Official Membership Application",
    112,
    776,
    8.5,
    "F1",
    "0.68 0.68 0.70"
  );

  text(commands, data.applicationRef, 420, 797, 8.5, "F2", "1 0.46 0.10");
  text(
    commands,
    "PAGE " + pageNumber + " / " + pageCount,
    466,
    778,
    6.8,
    "F2",
    "0.58 0.58 0.61"
  );
}

function sectionTitle(commands: string[], label: string, y: number) {
  commands.push("q 0.96 0.955 0.945 rg 46 " + (y - 8) + " 503 24 re f Q");
  commands.push("q 1 0.36 0 rg 46 " + (y - 8) + " 3 24 re f Q");
  text(commands, label, 59, y, 7.5, "F2", "0.34 0.32 0.30");
}

function field(
  commands: string[],
  row: Row,
  y: number
) {
  const lines = row.multiline ? wrap(row.value, 78) : [ascii(row.value)];
  text(commands, row.label.toUpperCase(), 46, y, 6.8, "F2", "1 0.36 0");
  y -= 13;

  for (const line of lines) {
    text(commands, line || "-", 46, y, 9.8, "F1", "0.10 0.10 0.11");
    y -= 13;
  }

  commands.push("0.90 0.89 0.87 RG 46 " + (y - 2) + " m 549 " + (y - 2) + " l S");
  return y - 12;
}

function pageStream(
  data: MembershipPdfData,
  rows: Row[],
  pageNumber: number,
  pageCount: number,
  includePayment: boolean
) {
  const commands: string[] = [];
  pageHeader(commands, data, pageNumber, pageCount);

  let y = 712;
  sectionTitle(
    commands,
    pageNumber === 1 ? "APPLICANT DETAILS" : "CREATIVE PROFILE",
    y
  );
  y -= 38;

  for (const row of rows) {
    y = field(commands, row, y);
  }

  if (includePayment) {
    y -= 5;
    sectionTitle(commands, "PAYMENT & SUBMISSION", y);
    y -= 42;

    commands.push("q 0.985 0.975 0.955 rg 46 " + (y - 92) + " 503 108 re f Q");
    commands.push("q 1 0.36 0 rg 46 " + (y - 92) + " 4 108 re f Q");

    text(
      commands,
      "MEMBERSHIP FEE",
      64,
      y - 8,
      6.8,
      "F2",
      "0.46 0.42 0.36"
    );
    text(
      commands,
      "BDT " + data.registrationFee,
      64,
      y - 30,
      18,
      "F2",
      "1 0.36 0"
    );
    text(
      commands,
      "bKash sender: " + data.bkashSender,
      190,
      y - 17,
      9.2,
      "F2"
    );
    text(
      commands,
      "TRX ID is submitted separately in the official VAC WhatsApp chat.",
      190,
      y - 36,
      8.4,
      "F1",
      "0.36 0.36 0.39"
    );
    text(
      commands,
      "Submitted: " + data.submittedAt,
      190,
      y - 54,
      8.2,
      "F1",
      "0.42 0.42 0.45"
    );
    text(
      commands,
      "Payment remains pending until a VAC administrator verifies the TRX ID.",
      190,
      y - 72,
      8.2,
      "F1",
      "0.42 0.42 0.45"
    );
  }

  commands.push("0.88 0.87 0.85 RG 46 50 m 549 50 l S");
  text(
    commands,
    "Visual Archive Club | Eastern University | Since 2010",
    46,
    34,
    7.2,
    "F2",
    "0.34 0.34 0.37"
  );
  text(
    commands,
    "Generated securely by the VAC online membership system",
    330,
    34,
    6.8,
    "F1",
    "0.55 0.55 0.57"
  );

  return commands.join("\n");
}

export async function createMembershipPdf(data: MembershipPdfData) {
  const rows: Row[] = [
    { label: "Full name", value: data.fullName },
    { label: "Eastern University ID", value: data.euId },
    { label: "Department", value: data.department },
    { label: "Date of birth", value: data.dateOfBirth },
    { label: "Blood group", value: data.bloodGroup },
    { label: "Email / Gmail", value: data.email },
    { label: "Phone / WhatsApp", value: data.phone },
    { label: "Address", value: data.address, multiline: true },
    { label: "Skills", value: data.skills, multiline: true },
    { label: "Reason for joining VAC", value: data.reason, multiline: true }
  ];

  const firstPage: Row[] = [];
  const secondPage: Row[] = [];
  let estimated = 0;

  for (const row of rows) {
    const lineCount = row.multiline ? wrap(row.value, 78).length : 1;
    const cost = 2 + lineCount;
    if (estimated + cost <= 25) {
      firstPage.push(row);
      estimated += cost;
    } else {
      secondPage.push(row);
    }
  }

  const pages = secondPage.length ? [firstPage, secondPage] : [firstPage];
  const streams = pages.map((pageRows, index) =>
    pageStream(
      data,
      pageRows,
      index + 1,
      pages.length,
      index === pages.length - 1
    )
  );

  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  let nextId = 5;
  for (const stream of streams) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageObjectIds.push(pageId);

    objects[pageId] =
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] " +
      "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> " +
      "/Contents " +
      contentId +
      " 0 R >>";

    objects[contentId] =
      "<< /Length " +
      new TextEncoder().encode(stream).length +
      " >>\nstream\n" +
      stream +
      "\nendstream";
  }

  objects[2] =
    "<< /Type /Pages /Kids [" +
    pageObjectIds.map((id) => id + " 0 R").join(" ") +
    "] /Count " +
    pageObjectIds.length +
    " >>";

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
    "trailer\n<< /Size " +
    objects.length +
    " /Root 1 0 R >>\nstartxref\n" +
    xrefOffset +
    "\n%%EOF";

  return new TextEncoder().encode(pdf);
}
