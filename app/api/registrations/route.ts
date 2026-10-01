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

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

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

  const email = String(body.email).trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
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
    .select("registration_fee")
    .eq("id", true)
    .maybeSingle();

  const registrationFee = Number(
    settings?.registration_fee || SITE.registrationFee
  );

  const { error } = await supabase.from("member_applications").insert({
    full_name: String(body.fullName).trim(),
    eu_id: String(body.euId).trim(),
    department: String(body.department).trim(),
    address: String(body.address).trim(),
    date_of_birth: body.dateOfBirth,
    blood_group: String(body.bloodGroup),
    email,
    phone_whatsapp: String(body.phone).trim(),
    skills: String(body.skills).trim(),
    reason: String(body.reason).trim(),
    bkash_sender: String(body.bkashSender).trim(),
    bkash_transaction_id: String(body.bkashTransactionId).trim().toUpperCase(),
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
      `Application received. VAC will verify your ৳${registrationFee} bKash payment and review your membership request.`
  });
}
