"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { uploadMembershipPdfToDrive } from "@/lib/google-drive";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

async function requireAdmin() {
  const supabase = await getServerSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");

  const {
    data: { user }
  } = await supabase.auth.getUser();

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
  ["/", "/admin", "/archive", "/events", "/join"].forEach((path) =>
    revalidatePath(path)
  );
  [
    "vac-site-settings",
    "vac-committee",
    "vac-events",
    "vac-media",
    "vac-announcements"
  ].forEach((tag) => revalidateTag(tag));
}

function bangladeshDateTime(raw: string) {
  if (!raw) return raw;
  return /[zZ]|[+-]\d\d:\d\d$/.test(raw) ? raw : raw + "+06:00";
}

function optionalUrl(raw: FormDataEntryValue | null, facebookOnly = false) {
  const value = String(raw || "").trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http/https links are allowed.");
  }

  if (facebookOnly) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const valid =
      host === "facebook.com" ||
      host.endsWith(".facebook.com") ||
      host === "fb.watch";

    if (!valid) {
      throw new Error("Please paste a Facebook post/video URL.");
    }
  }

  return url.toString();
}

async function upload(file: File | null, folder: string) {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Images must be JPG, PNG, or WebP.");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image files must be 8 MB or smaller.");
  }

  const supabase = await requireAdmin();
  const extension =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("vac-media")
    .upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: "3600"
    });

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

export async function addAnnouncement(formData: FormData) {
  const supabase = await requireAdmin();

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!title || !body) throw new Error("Announcement title and text are required.");

  const expiresRaw = String(formData.get("expiresAt") || "").trim();

  const { error } = await supabase.from("announcements").insert({
    title,
    body,
    link_url: optionalUrl(formData.get("linkUrl")),
    pinned: formData.get("pinned") === "on",
    published: true,
    expires_at: expiresRaw ? bangladeshDateTime(expiresRaw) : null
  });

  if (error) throw error;
  revalidateContent();
}

export async function updateAnnouncement(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const expiresRaw = String(formData.get("expiresAt") || "").trim();

  const { error } = await supabase
    .from("announcements")
    .update({
      title: String(formData.get("title") || "").trim(),
      body: String(formData.get("body") || "").trim(),
      link_url: optionalUrl(formData.get("linkUrl")),
      pinned: formData.get("pinned") === "on",
      published: formData.get("published") === "on",
      expires_at: expiresRaw ? bangladeshDateTime(expiresRaw) : null
    })
    .eq("id", id);

  if (error) throw error;
  revalidateContent();
}

export async function deleteAnnouncement(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
  revalidateContent();
}

export async function addMedia(formData: FormData) {
  const supabase = await requireAdmin();
  const thumbnailUrl = await upload(
    formData.get("thumbnail") as File | null,
    "archive"
  );
  const mediaType =
    String(formData.get("mediaType")) === "video" ? "video" : "photo";
  const destination =
    mediaType === "video"
      ? optionalUrl(formData.get("destinationUrl"), true)
      : optionalUrl(formData.get("destinationUrl"));

  if (!thumbnailUrl) throw new Error("Thumbnail/photo is required.");
  if (mediaType === "video" && !destination) {
    throw new Error("Paste the exact Facebook post/video URL for a video.");
  }

  const { error } = await supabase.from("media_items").insert({
    title: String(formData.get("title") || "").trim(),
    media_type: mediaType,
    thumbnail_url: thumbnailUrl,
    destination_url: destination,
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
  const mediaType =
    String(formData.get("mediaType")) === "video" ? "video" : "photo";
  const destination =
    mediaType === "video"
      ? optionalUrl(formData.get("destinationUrl"), true)
      : optionalUrl(formData.get("destinationUrl"));

  if (mediaType === "video" && !destination) {
    throw new Error("Facebook post/video URL is required for videos.");
  }

  const { data: current, error: currentError } = await supabase
    .from("media_items")
    .select("thumbnail_url")
    .eq("id", id)
    .single();

  if (currentError) throw currentError;

  const replacement = await upload(
    formData.get("thumbnail") as File | null,
    "archive"
  );

  const { error } = await supabase
    .from("media_items")
    .update({
      title: String(formData.get("title") || "").trim(),
      media_type: mediaType,
      destination_url: destination,
      featured: formData.get("featured") === "on",
      published: formData.get("published") === "on",
      ...(replacement ? { thumbnail_url: replacement } : {})
    })
    .eq("id", id);

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
    facebook_url: optionalUrl(formData.get("facebookUrl"), true),
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

  const { error } = await supabase
    .from("events")
    .update({
      title: String(formData.get("title") || "").trim(),
      description: String(formData.get("description") || "").trim() || null,
      starts_at: bangladeshDateTime(String(formData.get("startsAt") || "")),
      location: String(formData.get("location") || "").trim() || null,
      facebook_url: optionalUrl(formData.get("facebookUrl"), true),
      published: formData.get("published") === "on",
      ...(replacement ? { poster_url: replacement } : {})
    })
    .eq("id", id);

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
  const photoUrl = await upload(
    formData.get("photo") as File | null,
    "committee"
  );

  const { error } = await supabase.from("committee_members").insert({
    serial: String(formData.get("serial") || "—"),
    position: String(formData.get("position") || "").trim(),
    name: String(formData.get("name") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    email: String(formData.get("email") || "").trim().toLowerCase() || null,
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

  const replacement = await upload(
    formData.get("photo") as File | null,
    "committee"
  );

  const { error } = await supabase
    .from("committee_members")
    .update({
      serial: String(formData.get("serial") || "—"),
      position: String(formData.get("position") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim() || null,
      email: String(formData.get("email") || "").trim().toLowerCase() || null,
      department: String(formData.get("department") || "").trim() || null,
      leader: formData.get("leader") === "on",
      active: formData.get("active") === "on",
      sort_order: Number(formData.get("sortOrder") || 999),
      ...(replacement ? { photo_url: replacement } : {})
    })
    .eq("id", id);

  if (error) throw error;
  if (replacement) await deleteStoredPublicFile(current.photo_url);
  revalidateContent();
}


export async function syncApplicationPdfToDrive(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") || "");

  const { data: application, error } = await supabase
    .from("member_applications")
    .select("id,application_ref,full_name,pdf_storage_path")
    .eq("id", id)
    .maybeSingle();

  if (error || !application) {
    redirect("/admin?drive=application_not_found");
  }

  if (!application.pdf_storage_path) {
    redirect("/admin?drive=missing_pdf");
  }

  const { data: pdf, error: pdfError } = await supabase.storage
    .from("vac-applications")
    .download(application.pdf_storage_path);

  if (pdfError || !pdf) {
    redirect("/admin?drive=missing_pdf");
  }

  const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
  const safeName = String(application.full_name || "Applicant")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const fileName =
    "VAC-Membership-" +
    String(application.application_ref || application.id.slice(0, 8)) +
    "-" +
    safeName +
    ".pdf";

  const drive = await uploadMembershipPdfToDrive({ pdfBytes, fileName });

  await supabase
    .from("member_applications")
    .update({
      google_drive_file_id: drive.status === "synced" ? drive.fileId : null,
      drive_sync_status: drive.status
    })
    .eq("id", id);

  revalidatePath("/admin");
  redirect("/admin?drive=" + drive.status);
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const allowed = [
    "awaiting_whatsapp",
    "payment_submitted",
    "verified",
    "approved",
    "rejected"
  ];

  if (!allowed.includes(status)) throw new Error("Invalid application status.");

  const transactionId =
    String(formData.get("bkashTransactionId") || "").trim().toUpperCase() || null;

  if (["payment_submitted", "verified", "approved"].includes(status) && !transactionId) {
    throw new Error("Enter the bKash TRX ID before marking this payment as received.");
  }

  const { error } = await supabase
    .from("member_applications")
    .update({
      status,
      bkash_transaction_id: transactionId,
      admin_notes: String(formData.get("adminNotes") || "").trim() || null,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) throw error;
  revalidateContent();
}

export async function updateClubMember(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));
  const memberNumber = String(formData.get("memberNumber") || "").trim();

  const { error } = await supabase
    .from("club_members")
    .update({
      member_number: memberNumber || null,
      active: formData.get("active") === "on",
      updated_at: new Date().toISOString()
    })
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

  const facebookPage = optionalUrl(formData.get("facebookPage"));
  const facebookGroup = optionalUrl(formData.get("facebookGroup"));

  if (!facebookPage || !facebookGroup) {
    throw new Error("Facebook page and group links are required.");
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
      facebook_page: facebookPage,
      facebook_group: facebookGroup,
      bkash_number: String(formData.get("bkashNumber") || "").trim(),
      registration_fee: fee,
      registration_open: formData.get("registrationOpen") === "on",
      contact_email: String(formData.get("contactEmail") || "")
        .trim()
        .toLowerCase(),
      contact_phone: String(formData.get("contactPhone") || "").trim(),
      updated_at: new Date().toISOString()
    })
    .eq("id", true);

  if (error) throw error;
  revalidateContent();
}

export async function logout() {
  const supabase = await getServerSupabase();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/login");
}


export async function syncPendingApplicationPdfsToDrive() {
  const supabase = await requireAdmin();

  const { data: applications, error } = await supabase
    .from("member_applications")
    .select("id,application_ref,full_name,pdf_storage_path,drive_sync_status")
    .not("pdf_storage_path", "is", null)
    .neq("drive_sync_status", "synced")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw error;
  if (!applications?.length) {
    redirect("/admin?drive=all_synced");
  }

  let synced = 0;
  let notConfigured = false;
  let failed = 0;

  for (const application of applications) {
    if (!application.pdf_storage_path) continue;

    const { data: pdf, error: pdfError } = await supabase.storage
      .from("vac-applications")
      .download(application.pdf_storage_path);

    if (pdfError || !pdf) {
      failed += 1;
      await supabase
        .from("member_applications")
        .update({ drive_sync_status: "failed" })
        .eq("id", application.id);
      continue;
    }

    const pdfBytes = new Uint8Array(await pdf.arrayBuffer());
    const safeName = String(application.full_name || "Applicant")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const fileName =
      "VAC-Membership-" +
      String(application.application_ref || application.id.slice(0, 8)) +
      "-" +
      safeName +
      ".pdf";

    const drive = await uploadMembershipPdfToDrive({ pdfBytes, fileName });

    if (drive.status === "not_configured") {
      notConfigured = true;
      break;
    }

    if (drive.status === "synced") {
      synced += 1;
      await supabase
        .from("member_applications")
        .update({
          google_drive_file_id: drive.fileId,
          drive_sync_status: "synced"
        })
        .eq("id", application.id);
    } else {
      failed += 1;
      await supabase
        .from("member_applications")
        .update({ drive_sync_status: "failed" })
        .eq("id", application.id);
    }
  }

  revalidatePath("/admin");

  if (notConfigured) redirect("/admin?drive=not_configured");
  if (failed > 0) redirect("/admin?drive=bulk_partial");
  if (synced > 0) redirect("/admin?drive=bulk_synced");
  redirect("/admin?drive=all_synced");
}
