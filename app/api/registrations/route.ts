import { NextResponse } from "next/server";
import { createMembershipPdf } from "@/lib/application-pdf";
import { uploadMembershipPdfToDrive } from "@/lib/google-drive";
import { SITE } from "@/lib/site";
import { getPublicSupabase } from "@/lib/supabase/public";

export const runtime = "nodejs";

const required = [
  "fullName",
  "euId",
  "department",
  "dateOfBirth",
  "bloodGroup",
  "email",
  "phone",
  "address",
  "skills",
  "reason",
  "bkashSender",
  "paymentConfirmed"
];

const bloodGroups = new Set(["A+","A-","B+","B-","AB+","AB-","O+","O-"]);

function textValue(body: Record<string, unknown>, key: string, max: number) {
  return String(body[key] || "").trim().slice(0, max);
}

function whatsappNumber(localNumber: string) {
  const digits = localNumber.replace(/\D/g, "");
  if (digits.startsWith("880")) return digits;
  if (digits.startsWith("0")) return "880" + digits.slice(1);
  return digits;
}

function applicationReference(id: string) {
  const stamp = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(new Date())
    .replaceAll("-", "");

  return "VAC-" + stamp + "-" + id.slice(0, 8).toUpperCase();
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (String(body.website || "").trim()) {
    return NextResponse.json({ message: "Application received." });
  }

  for (const field of required) {
    if (!String(body[field] || "").trim()) {
      return NextResponse.json(
        { error: "Please complete every required field and confirm your bKash payment." },
        { status: 400 }
      );
    }
  }

  const email = textValue(body, "email", 160).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  const phone = textValue(body, "phone", 20);
  const bkashSender = textValue(body, "bkashSender", 20);
  const bdPhonePattern = /^(?:\+?880|0)1[3-9]\d{8}$/;

  if (!bdPhonePattern.test(phone.replace(/[\s-]/g, ""))) {
    return NextResponse.json(
      { error: "Please enter a valid Bangladesh phone / WhatsApp number." },
      { status: 400 }
    );
  }

  if (!bdPhonePattern.test(bkashSender.replace(/[\s-]/g, ""))) {
    return NextResponse.json(
      { error: "Please enter the bKash number you used to send the fee." },
      { status: 400 }
    );
  }

  const bloodGroup = textValue(body, "bloodGroup", 3);
  if (!bloodGroups.has(bloodGroup)) {
    return NextResponse.json({ error: "Invalid blood group." }, { status: 400 });
  }

  const dateOfBirth = textValue(body, "dateOfBirth", 10);
  const dob = new Date(dateOfBirth + "T00:00:00Z");
  if (Number.isNaN(dob.getTime()) || dob > new Date()) {
    return NextResponse.json(
      { error: "Please enter a valid date of birth." },
      { status: 400 }
    );
  }

  const supabase = getPublicSupabase();
  if (!supabase) {
    return NextResponse.json(
      { error: "Registration database is not connected yet." },
      { status: 503 }
    );
  }

  const { data: settings } = await supabase
    .from("site_settings")
    .select("registration_fee,registration_open,bkash_number")
    .eq("id", true)
    .maybeSingle();

  const registrationOpen =
    typeof settings?.registration_open === "boolean"
      ? settings.registration_open
      : SITE.registrationOpen;

  if (!registrationOpen) {
    return NextResponse.json(
      { error: "VAC membership registration is currently closed." },
      { status: 403 }
    );
  }

  const registrationFee = Number(
    settings?.registration_fee || SITE.registrationFee
  );
  const paymentNumber = settings?.bkash_number || SITE.bkashNumber;

  const id = crypto.randomUUID();
  const applicationRef = applicationReference(id);
  const pdfDownloadToken =
    crypto.randomUUID().replaceAll("-", "") +
    crypto.randomUUID().replaceAll("-", "");
  const submittedAt = new Date().toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short"
  });

  const application = {
    fullName: textValue(body, "fullName", 120),
    euId: textValue(body, "euId", 40),
    department: textValue(body, "department", 80),
    address: textValue(body, "address", 500),
    dateOfBirth,
    bloodGroup,
    email,
    phone,
    skills: textValue(body, "skills", 1000),
    reason: textValue(body, "reason", 1500),
    bkashSender
  };

  const pdfBytes = await createMembershipPdf({
    applicationRef,
    ...application,
    registrationFee,
    submittedAt
  });

  const pdfPath = "membership/" + id + ".pdf";
  const { error: pdfError } = await supabase.storage
    .from("vac-applications")
    .upload(pdfPath, pdfBytes, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false
    });

  if (pdfError) {
    return NextResponse.json(
      { error: "Your application PDF could not be generated. Please try again." },
      { status: 500 }
    );
  }

  const fileName =
    "VAC-Membership-" +
    applicationRef +
    "-" +
    application.fullName.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") +
    ".pdf";

  const drive = await uploadMembershipPdfToDrive({ pdfBytes, fileName });

  const { error } = await supabase.from("member_applications").insert({
    id,
    application_ref: applicationRef,
    full_name: application.fullName,
    eu_id: application.euId,
    department: application.department,
    address: application.address,
    date_of_birth: application.dateOfBirth,
    blood_group: application.bloodGroup,
    email: application.email,
    phone_whatsapp: application.phone,
    skills: application.skills,
    reason: application.reason,
    bkash_sender: application.bkashSender,
    bkash_transaction_id: null,
    registration_fee: registrationFee,
    status: "awaiting_whatsapp",
    pdf_storage_path: pdfPath,
    pdf_generated_at: new Date().toISOString(),
    google_drive_file_id: drive.status === "synced" ? drive.fileId : null,
    drive_sync_status: drive.status,
    pdf_download_token: pdfDownloadToken
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "An application with this Eastern University ID already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "We could not save the application. Please contact VAC." },
      { status: 500 }
    );
  }

  const message = [
    "Hello VAC, I just submitted my membership application.",
    "",
    "Application Ref: " + applicationRef,
    "Name: " + application.fullName,
    "EU ID: " + application.euId,
    "Department: " + application.department,
    "bKash sender: " + application.bkashSender,
    "Fee sent: BDT " + registrationFee,
    "",
    "I will send my bKash TRX ID in this chat for manual payment confirmation."
  ].join("\n");

  const whatsappUrl =
    "https://wa.me/" +
    whatsappNumber(paymentNumber) +
    "?text=" +
    encodeURIComponent(message);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const pdfDownloadUrl = supabaseUrl
    ? supabaseUrl +
      "/functions/v1/membership-pdf?id=" +
      encodeURIComponent(id) +
      "&token=" +
      encodeURIComponent(pdfDownloadToken)
    : null;

  return NextResponse.json({
    message:
      "Application saved. WhatsApp is opening so you can send your bKash TRX ID.",
    applicationRef,
    whatsappUrl,
    pdfDownloadUrl,
    pdfSaved: true,
    driveStatus: drive.status
  });
}
