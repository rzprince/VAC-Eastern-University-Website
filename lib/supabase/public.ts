import { createClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return url && key ? { url, key } : null;
}

export function getPublicSupabase() {
  const config = getSupabaseConfig();
  if (!config) return null;

  return createClient(config.url, config.key, {
    auth: { persistSession: false }
  });
}
