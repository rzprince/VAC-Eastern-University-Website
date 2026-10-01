import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return '"' + text.replaceAll('"', '""') + '"';
}

export async function GET(request: Request) {
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

  const scope = new URL(request.url).searchParams.get("scope") === "members"
    ? "members"
    : "applications";

  let csv = "";

  if (scope === "members") {
    const { data, error } = await supabase
      .from("club_members")
      .select(
        "member_number,active,joined_at,member_applications(full_name,eu_id,department,email,phone_whatsapp,blood_group,skills)"
      )
      .order("joined_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const headers = [
      "Member Number",
      "Full Name",
      "EU ID",
      "Department",
      "Email",
      "Phone / WhatsApp",
      "Blood Group",
      "Skills",
      "Active",
      "Joined At"
    ];

    const rows = (data ?? []).map((member) => {
      const application = Array.isArray(member.member_applications)
        ? member.member_applications[0]
        : member.member_applications;

      return [
        member.member_number,
        application?.full_name,
        application?.eu_id,
        application?.department,
        application?.email,
        application?.phone_whatsapp,
        application?.blood_group,
        application?.skills,
        member.active ? "Yes" : "No",
        member.joined_at
      ];
    });

    csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
  } else {
    const { data, error } = await supabase
      .from("member_applications")
      .select(
        "full_name,eu_id,department,address,date_of_birth,blood_group,email,phone_whatsapp,skills,reason,bkash_sender,bkash_transaction_id,registration_fee,status,admin_notes,reviewed_at,created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const headers = [
      "Full Name",
      "EU ID",
      "Department",
      "Address",
      "Date of Birth",
      "Blood Group",
      "Email",
      "Phone / WhatsApp",
      "Skills",
      "Reason for Joining",
      "bKash Sender",
      "bKash Transaction ID",
      "Registration Fee",
      "Status",
      "Admin Notes",
      "Reviewed At",
      "Submitted At"
    ];

    const rows = (data ?? []).map((application) => [
      application.full_name,
      application.eu_id,
      application.department,
      application.address,
      application.date_of_birth,
      application.blood_group,
      application.email,
      application.phone_whatsapp,
      application.skills,
      application.reason,
      application.bkash_sender,
      application.bkash_transaction_id,
      application.registration_fee,
      application.status,
      application.admin_notes,
      application.reviewed_at,
      application.created_at
    ]);

    csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");
  }

  const date = new Date().toISOString().slice(0, 10);
  const filename = `vac-${scope}-${date}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
