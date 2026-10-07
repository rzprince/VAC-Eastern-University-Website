import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.nextUrl.searchParams.get("token")?.trim() || "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  if (!id || token.length < 48 || !supabaseUrl) {
    return NextResponse.json({ error: "Invalid PDF download link." }, { status: 400 });
  }

  const upstream = new URL(supabaseUrl + "/functions/v1/membership-pdf");
  upstream.searchParams.set("id", id);
  upstream.searchParams.set("token", token);

  const response = await fetch(upstream, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/pdf" }
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Your application PDF could not be loaded." },
      { status: response.status }
    );
  }

  const bytes = await response.arrayBuffer();
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set(
    "Content-Disposition",
    response.headers.get("content-disposition") ||
      'attachment; filename="VAC-Membership-Application.pdf"'
  );
  headers.set("Cache-Control", "private, no-store, max-age=0");
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "no-referrer");

  return new Response(bytes, { status: 200, headers });
}
