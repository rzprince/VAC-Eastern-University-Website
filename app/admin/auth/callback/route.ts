import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Never accept arbitrary "next" destinations or leak auth codes.
  const destination = new URL("/admin/reset-password", request.url);
  const failed = new URL("/admin/forgot-password?link=invalid", request.url);
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const error = request.nextUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(failed);
  const supabase = await getServerSupabase();
  if (!supabase) return NextResponse.redirect(failed);
  let valid = false;
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    valid = !exchangeError;
  } else if (tokenHash) {
    // Supports explicit recovery OTP links if Supabase uses a token-hash template.
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash, type: "recovery"
    });
    valid = !verifyError;
  }
  // A valid session does not grant admin rights. reset-password verifies
  // the user against admin_users before calling updateUser.
  const response = NextResponse.redirect(valid ? destination : failed);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
