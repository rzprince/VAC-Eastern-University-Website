import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

function adminKey() {
  const modern = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (modern) {
    try {
      const parsed = JSON.parse(modern);
      if (parsed?.default) return parsed.default as string;
    } catch {
      // Fall back while the project still exposes the legacy service key.
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
}

function sameToken(stored: string, provided: string) {
  if (!/^[0-9a-f]{64}$/.test(stored) || !/^[0-9a-f]{64}$/.test(provided)) return false;
  let different = 0;
  for (let i = 0; i < 64; i++) different |= stored.charCodeAt(i) ^ provided.charCodeAt(i);
  return different === 0;
}

function safeFileName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Method not allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim() || "";
  const token = url.searchParams.get("token")?.trim() || "";

  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id) || !/^[0-9a-f]{64}$/.test(token)) {
    return new Response("Invalid PDF download link.", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const secret = adminKey();
  if (!supabaseUrl || !secret) {
    return new Response("PDF service is unavailable.", { status: 503 });
  }

  const admin = createClient(supabaseUrl, secret, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: application, error } = await admin
    .from("member_applications")
    .select("id,full_name,application_ref,pdf_storage_path,pdf_download_token")
    .eq("id", id)
    .maybeSingle();

  if (
    error ||
    !application ||
    !application.pdf_storage_path ||
    !application.pdf_download_token ||
    !sameToken(application.pdf_download_token, token)
  ) {
    return new Response("PDF link not found or expired.", {
      status: 404,
      headers: { "Cache-Control": "private, no-store" }
    });
  }

  const { data: pdf, error: pdfError } = await admin.storage
    .from("vac-applications")
    .download(application.pdf_storage_path);

  if (pdfError || !pdf) {
    return new Response("Application PDF could not be loaded.", { status: 404 });
  }

  const filename =
    "VAC-Membership-" +
    safeFileName(application.application_ref || application.id.slice(0, 8)) +
    "-" +
    safeFileName(application.full_name || "Applicant") +
    ".pdf";

  const headers = new Headers({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="' + filename + '"',
    "Cache-Control": "private, no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'; sandbox"
  });

  if (req.method === "HEAD") return new Response(null, { status: 200, headers });
  return new Response(pdf, { status: 200, headers });
});
