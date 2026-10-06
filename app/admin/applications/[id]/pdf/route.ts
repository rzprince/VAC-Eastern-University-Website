import { NextResponse } from "next/server";
import { createMembershipPdf } from "@/lib/application-pdf";
import { getServerSupabase } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { id } = await params;
  const { data: application, error } = await supabase
    .from("member_applications")
    .select(
      "id,application_ref,full_name,eu_id,department,address,date_of_birth,blood_group,email,phone_whatsapp,skills,reason,bkash_sender,registration_fee,created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const ref = application.application_ref || "VAC-" + application.id.slice(0, 8).toUpperCase();
  const pdf = await createMembershipPdf({
    applicationRef: ref,
    fullName: application.full_name,
    euId: application.eu_id,
    department: application.department,
    address: application.address,
    dateOfBirth: application.date_of_birth,
    bloodGroup: application.blood_group,
    email: application.email,
    phone: application.phone_whatsapp,
    skills: application.skills,
    reason: application.reason,
    bkashSender: application.bkash_sender,
    registrationFee: application.registration_fee,
    submittedAt: new Date(application.created_at).toLocaleString("en-BD", {
      timeZone: "Asia/Dhaka",
      dateStyle: "medium",
      timeStyle: "short"
    })
  });

  const safeName = application.full_name
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="VAC-${ref}-${safeName}.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}
