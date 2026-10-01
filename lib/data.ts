import { committeeFallback, type CommitteeMember } from "@/lib/committee";
import { getPublicSupabase } from "@/lib/supabase/public";
import { SITE, type SiteSettings } from "@/lib/site";

export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  location?: string | null;
  poster_url?: string | null;
  facebook_url?: string | null;
};

export type MediaItem = {
  id: string;
  title: string;
  media_type: "photo" | "video";
  thumbnail_url: string;
  destination_url?: string | null;
  published_at: string;
  featured: boolean;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  link_url?: string | null;
  pinned: boolean;
  created_at: string;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = getPublicSupabase();
  if (!supabase) return SITE;

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "club_name,short_name,university,since,tenure,tagline,about_text,facebook_page,facebook_group,bkash_number,registration_fee,registration_open,contact_email,contact_phone"
    )
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
    registrationFee: Number(data.registration_fee || SITE.registrationFee),
    registrationOpen:
      typeof data.registration_open === "boolean"
        ? data.registration_open
        : SITE.registrationOpen,
    contactEmail: data.contact_email || SITE.contactEmail,
    contactPhone: data.contact_phone || SITE.contactPhone
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

export async function getUpcomingEvents(limit = 6): Promise<EventItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("events")
    .select("id,title,description,starts_at,location,poster_url,facebook_url")
    .eq("published", true)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(limit);

  return data ?? [];
}

export async function getRecentEvents(limit = 6): Promise<EventItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("events")
    .select("id,title,description,starts_at,location,poster_url,facebook_url")
    .eq("published", true)
    .lt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getEvents(): Promise<EventItem[]> {
  return getUpcomingEvents(6);
}

export async function getMedia(limit = 12): Promise<MediaItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("media_items")
    .select("id,title,media_type,thumbnail_url,destination_url,published_at,featured")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as MediaItem[];
}

export async function getAllMedia(): Promise<MediaItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("media_items")
    .select("id,title,media_type,thumbnail_url,destination_url,published_at,featured")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(120);

  return (data ?? []) as MediaItem[];
}

export async function getAnnouncements(limit = 5): Promise<AnnouncementItem[]> {
  const supabase = getPublicSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("announcements")
    .select("id,title,body,link_url,pinned,created_at")
    .eq("published", true)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as AnnouncementItem[];
}
