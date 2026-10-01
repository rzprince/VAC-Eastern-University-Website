"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await getServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) throw new Error("This account is not an authorized VAC admin.");
  return supabase;
}

function revalidateContent() {
  revalidatePath("/");
  revalidatePath("/admin");
}

function bangladeshDateTime(raw: string) {
  if (!raw) return raw;
  return /[zZ]|[+-]\d\d:\d\d$/.test(raw) ? raw : raw + "+06:00";
}

async function upload(file: File | null, folder: string) {
  if (!file || file.size === 0) return null;

  const supabase = await requireAdmin();
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const path = `${folder}/${Date.now()}-${safe}`;

  const { error } = await supabase.storage
    .from("vac-media")
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return supabase.storage.from("vac-media").getPublicUrl(path).data.publicUrl;
}

async function deleteStoredPublicFile(url?: string | null) {
  if (!url) return;
  const marker = "/vac-media/";
  const index = url.indexOf(marker);
  if (index < 0) return;

  const path = decodeURIComponent(url.slice(index + marker.length));
  if (!path) return;

  const supabase = await requireAdmin();
  await supabase.storage.from("vac-media").remove([path]);
}

export async function addMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const thumbnailUrl = await upload(formData.get("thumbnail") as File | null, "archive");
  const mediaType = String(formData.get("mediaType")) === "video" ? "video" : "photo";
  const destination = String(formData.get("destinationUrl") || "").trim();

  if (!thumbnailUrl) throw new Error("Thumbnail/photo is required.");
  if (mediaType === "video" && !destination) {
    throw new Error("Paste the exact Facebook post/video URL for a video.");
  }

  const { error } = await supabase.from("media_items").insert({
    title: String(formData.get("title") || "").trim(),
    media_type: mediaType,
    thumbnail_url: thumbnailUrl,
    destination_url: destination || null,
    featured: formData.get("featured") === "on",
    published: true,
    published_at: new Date().toISOString()
  });

  if (error) throw error;
  revalidateContent();
}

export async function updateMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const mediaType = String(formData.get("mediaType")) === "video" ? "video" : "photo";
  const destination = String(formData.get("destinationUrl") || "").trim();

  if (mediaType === "video" && !destination) {
    throw new Error("Facebook post/video URL is required for videos.");
  }

  const { data: current, error: currentError } = await supabase
    .from("media_items")
    .select("thumbnail_url")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  const replacement = await upload(formData.get("thumbnail") as File | null, "archive");
  const { error } = await supabase.from("media_items").update({
    title: String(formData.get("title") || "").trim(),
    media_type: mediaType,
    destination_url: destination || null,
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    ...(replacement ? { thumbnail_url: replacement } : {})
  }).eq("id", id);

  if (error) throw error;
  if (replacement) await deleteStoredPublicFile(current.thumbnail_url);
  revalidateContent();
}

export async function deleteMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { data } = await supabase
    .from("media_items")
    .select("thumbnail_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("media_items").delete().eq("id", id);
  if (error) throw error;

  await deleteStoredPublicFile(data?.thumbnail_url);
  revalidateContent();
}

export async function addEvent(formData: FormData) {
  const supabase = await requireAdmin();
  const posterUrl = await upload(formData.get("poster") as File | null, "events");

  const { error } = await supabase.from("events").insert({
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    starts_at: bangladeshDateTime(String(formData.get("startsAt") || "")),
    location: String(formData.get("location") || "").trim() || null,
    poster_url: posterUrl,
    published: true
  });

  if (error) throw error;
  revalidateContent();
}

export async function updateEvent(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { data: current, error: currentError } = await supabase
    .from("events")
    .select("poster_url")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  const replacement = await upload(formData.get("poster") as File | null, "events");
  const { error } = await supabase.from("events").update({
    title: String(formData.get("title") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    starts_at: bangladeshDateTime(String(formData.get("startsAt") || "")),
    location: String(formData.get("location") || "").trim() || null,
    published: formData.get("published") === "on",
    ...(replacement ? { poster_url: replacement } : {})
  }).eq("id", id);

  if (error) throw error;
  if (replacement) await deleteStoredPublicFile(current.poster_url);
  revalidateContent();
}

export async function deleteEvent(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { data } = await supabase
    .from("events")
    .select("poster_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;

  await deleteStoredPublicFile(data?.poster_url);
  revalidateContent();
}

export async function addCommitteeMember(formData: FormData) {
  const supabase = await requireAdmin();
  const photoUrl = await upload(formData.get("photo") as File | null, "committee");

  const { error } = await supabase.from("committee_members").insert({
    serial: String(formData.get("serial") || "—"),
    position: String(formData.get("position") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    department: String(formData.get("department") || "").trim() || null,
    photo_url: photoUrl,
    leader: formData.get("leader") === "on",
    active: true,
    sort_order: Number(formData.get("sortOrder") || 999)
  });

  if (error) throw error;
  revalidateContent();
}

export async function updateCommitteeMember(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { data: current, error: currentError } = await supabase
    .from("committee_members")
    .select("photo_url")
    .eq("id", id)
    .single();
  if (currentError) throw currentError;

  const replacement = await upload(formData.get("photo") as File | null, "committee");
  const { error } = await supabase.from("committee_members").update({
    serial: String(formData.get("serial") || "—"),
    position: String(formData.get("position") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    department: String(formData.get("department") || "").trim() || null,
    leader: formData.get("leader") === "on",
    active: formData.get("active") === "on",
    sort_order: Number(formData.get("sortOrder") || 999),
    ...(replacement ? { photo_url: replacement } : {})
  }).eq("id", id);

  if (error) throw error;
  if (replacement) await deleteStoredPublicFile(current.photo_url);
  revalidateContent();
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const allowed = ["payment_submitted", "verified", "approved", "rejected"];

  if (!allowed.includes(status)) throw new Error("Invalid application status.");

  const { error } = await supabase
    .from("member_applications")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
  revalidatePath("/admin");
}


export async function updateSiteSettings(formData: FormData) {
  const supabase = await requireAdmin();

  const fee = Number(formData.get("registrationFee") || 100);
  if (!Number.isFinite(fee) || fee <= 0) {
    throw new Error("Registration fee must be a positive number.");
  }

  const { error } = await supabase
    .from("site_settings")
    .update({
      club_name: String(formData.get("clubName") || "").trim(),
      short_name: String(formData.get("shortName") || "VAC").trim(),
      university: String(formData.get("university") || "").trim(),
      since: String(formData.get("since") || "").trim(),
      tenure: String(formData.get("tenure") || "").trim(),
      tagline: String(formData.get("tagline") || "").trim(),
      about_text: String(formData.get("aboutText") || "").trim(),
      facebook_page: String(formData.get("facebookPage") || "").trim(),
      facebook_group: String(formData.get("facebookGroup") || "").trim(),
      bkash_number: String(formData.get("bkashNumber") || "").trim(),
      registration_fee: fee,
      updated_at: new Date().toISOString()
    })
    .eq("id", true);

  if (error) throw error;
  revalidateContent();
  revalidatePath("/join");
}

export async function logout() {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}
