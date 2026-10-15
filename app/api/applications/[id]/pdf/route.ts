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

  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id) ||
      !/^[0-9a-f]{64}$/.test(token) || !supabaseUrl) {
    return NextResponse.json({ error: "Invalid PDF download link." }, { status: 400 });
  }

  const upstream = new URL(supabaseUrl + "/functions/v1/membership-pdf");
  upstream.searchParams.set("id", id);
  upstream.searchParams.set("token", token);

  let response: Response;
  try {
  response = await fetch(upstream, {
    method: "GET",
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
    headers: { Accept: "application/pdf" }
  });
  } catch {
    return NextResponse.json({ error: "PDF service is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Your application PDF could not be loaded." },
      { status: response.status }
    );
  }

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

  // Stream the already-stored PDF immediately instead of buffering it twice.
  if (!response.body) {
    return NextResponse.json({ error: "The application PDF is unavailable." }, { status: 502 });
  }
  return new Response(response.body, { status: 200, headers });
}
