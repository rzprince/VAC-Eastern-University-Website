import { committeeFallback, type CommitteeMember } from "@/lib/committee";
import { getPublicSupabase } from "@/lib/supabase/public";
import { SITE, type SiteSettings } from "@/lib/site";

export type EventItem = {
  id: string;
  title: string;
  description?: string;
  starts_at: string;
  location?: string;
  poster_url?: string;
};

export type MediaItem = {
  id: string;
  title: string;
  media_type: "photo" | "video";
  thumbnail_url: string;
  destination_url?: string;
  published_at: string;
  featured: boolean;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getPublicSupabase();
  if (!supabase) return SITE;

  const { data, error } = await supabase
    .from("site_settings")
    .select("club_name,short_name,university,since,tenure,tagline,about_text,facebook_page,facebook_group,bkash_number,registration_fee")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) return SITE;

  return {
    clubName: data.club_name || SITE.clubName,
    shortName: data.short_name || SITE.shortName,
    university: data.university || SITE.university,
    since: data.since || SITE.since,
    tenure: data.tenure || SITE.tenure,
    tagline: data.tagline || SITE.tagline,
    aboutText: data.about_text || SITE.aboutText,
    facebookPage: data.facebook_page || SITE.facebookPage,
    facebookGroup: data.facebook_group || SITE.facebookGroup,
    bkashNumber: data.bkash_number || SITE.bkashNumber,
    registrationFee: Number(data.registration_fee || SITE.registrationFee)
  };
}

export async function getCommittee(): Promise<CommitteeMember[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return committeeFallback;

  const { data, error } = await supabase
    .from("committee_members")
    .select("serial,position,name,phone,email,department,leader,photo_url")
    .eq("active", true)
    .order("sort_order");

  if (error || !data?.length) return committeeFallback;

  return data.map((member) => ({
    serial: member.serial ?? "—",
    position: member.position,
    name: member.name,
    phone: member.phone ?? undefined,
    email: member.email ?? undefined,
    department: member.department ?? undefined,
    leader: member.leader,
    photoUrl: member.photo_url ?? undefined
  }));
}

export async function getEvents(): Promise<EventItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("events")
    .select("id,title,description,starts_at,location,poster_url")
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(6);

  return data ?? [];
}

export async function getMedia(): Promise<MediaItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("media_items")
    .select("id,title,media_type,thumbnail_url,destination_url,published_at,featured")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(12);

  return (data ?? []) as MediaItem[];
}
