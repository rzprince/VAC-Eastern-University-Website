import { NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/public";
import { SITE } from "@/lib/site";

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
  "bkashTransactionId"
];

const bloodGroups = new Set(["A+","A-","B+","B-","AB+","AB-","O+","O-"]);

function textValue(body: Record<string, unknown>, key: string, max: number) {
  return String(body[key] || "").trim().slice(0, max);
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
        { error: "Please complete every required field." },
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
      { error: "Please enter a valid Bangladesh phone number." },
      { status: 400 }
    );
  }

  if (!bdPhonePattern.test(bkashSender.replace(/[\s-]/g, ""))) {
    return NextResponse.json(
      { error: "Please enter a valid bKash sender number." },
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

  const transactionId = textValue(body, "bkashTransactionId", 40).toUpperCase();
  if (transactionId.length < 5) {
    return NextResponse.json(
      { error: "Please enter a valid bKash Transaction ID." },
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
    .select("registration_fee,registration_open")
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

  const { error } = await supabase.from("member_applications").insert({
    full_name: textValue(body, "fullName", 120),
    eu_id: textValue(body, "euId", 40),
    department: textValue(body, "department", 80),
    address: textValue(body, "address", 500),
    date_of_birth: dateOfBirth,
    blood_group: bloodGroup,
    email,
    phone_whatsapp: phone,
    skills: textValue(body, "skills", 1000),
    reason: textValue(body, "reason", 1500),
    bkash_sender: bkashSender,
    bkash_transaction_id: transactionId,
    registration_fee: registrationFee,
    status: "payment_submitted"
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This EU ID or bKash Transaction ID has already been submitted." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "We could not save the application. Please contact VAC." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message:
      `Application received successfully. VAC will verify your ৳${registrationFee} bKash payment and review your membership request.`
  });
}
