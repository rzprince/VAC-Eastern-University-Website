"use server";

import {
  addAnnouncement,
  updateAnnouncement,
  addMedia,
  updateMedia,
  addEvent,
  updateEvent,
  addCommitteeMember,
  updateCommitteeMember,
  updateSiteSettings
} from "@/app/admin/actions";

// Expected validation or database failures should appear inside the editor,
// never crash the entire protected administration dashboard.
export type AdminSaveResult = { ok: boolean; message: string };

function friendlyError(error: unknown) {
  const original = error instanceof Error ? error.message : "";
  if (/fetch failed|network/i.test(original)) {
    return "The server could not reach the database or image storage. Please retry.";
  }
  if (/row-level security|permission denied|not authorized/i.test(original)) {
    return "This account cannot save that item. Check your administrator access.";
  }
  if (/payload too large|body exceeded|413/i.test(original)) {
    return "This image is too large. Please use a JPG, PNG or WebP under 8 MB.";
  }
  if (/duplicate key|23505/i.test(original)) {
    return "This item already exists. Please review the details.";
  }
  // Known input validation errors from the existing secure admin actions.
  const expected = [
    "required", "image", "images", "MB", "Facebook", "URL", "http",
    "valid", "format", "photo", "thumbnail", "file", "positive"
  ];
  if (original && original.length < 220 && expected.some(term => original.toLowerCase().includes(term.toLowerCase()))) {
    return original;
  }
  console.error("VAC admin save error:", error);
  return "The update could not be saved. Your form entries are still here. Please retry.";
}

async function execute(
  action: (formData: FormData) => Promise<void>,
  data: FormData
): Promise<AdminSaveResult> {
  try {
    await action(data);
    return { ok: true, message: "Saved successfully. The public website has been updated." };
  } catch (error) {
    return { ok: false, message: friendlyError(error) };
  }
}

export async function saveNewEvent(data: FormData) { return execute(addEvent, data); }
export async function saveEditedEvent(data: FormData) { return execute(updateEvent, data); }
export async function saveNewMedia(data: FormData) { return execute(addMedia, data); }
export async function saveEditedMedia(data: FormData) { return execute(updateMedia, data); }
export async function saveNewCommitteeMember(data: FormData) { return execute(addCommitteeMember, data); }
export async function saveEditedCommitteeMember(data: FormData) { return execute(updateCommitteeMember, data); }
export async function saveClubSettings(data: FormData) { return execute(updateSiteSettings, data); }
export async function saveNewAnnouncement(data: FormData) { return execute(addAnnouncement, data); }
export async function saveEditedAnnouncement(data: FormData) { return execute(updateAnnouncement, data); }
