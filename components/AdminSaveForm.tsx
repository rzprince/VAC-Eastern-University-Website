"use client";

import { type FormEvent, type ReactNode, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSaveResult } from "@/app/admin/save-actions";
import { getBrowserSupabase } from "@/lib/supabase/client";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const OPTIMIZE_ABOVE = 1.4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_FOLDERS: Record<string, string> = {thumbnail: "archive", poster: "events", photo: "committee"};

async function optimizeImage(file: File) {
  if (file.size < OPTIMIZE_ABOVE || typeof createImageBitmap !== "function") return file;
  const bitmap = await createImageBitmap(file);
  try {
    const maxSide = 2600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, "image/webp", 0.87)
    );
    if (!blob || (blob.size >= file.size && file.size <= MAX_FILE_BYTES)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp", lastModified: Date.now()
    });
  } finally {
    bitmap.close();
  }
}

export function AdminSaveForm({
  action,
  children,
  className = "admin-form",
  resetOnSuccess = false
}: {
  action: (formData: FormData) => Promise<AdminSaveResult>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const router = useRouter();
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [stage, setStage] = useState("Saving changes…");
  const [feedback, setFeedback] = useState<AdminSaveResult | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    inFlight.current = true;
    setPending(true);
    setFeedback(null);

    const stagedUploads: string[] = [];
    const storage = getBrowserSupabase();
    try {
      // Upload images directly to the admin-protected Supabase bucket.
      // Server Actions receive only a small validated storage path, so Vercel
      // never needs to parse a multi-megabyte image request.
      for (const [name, entry] of Array.from(data.entries())) {
        if (!(entry instanceof File) || entry.size === 0) continue;
        if (!ALLOWED_TYPES.has(entry.type)) {
          throw new Error("Use a JPG, PNG or WebP image.");
        }
        if (!storage) throw new Error("Image storage is not configured.");
        const folder = IMAGE_FOLDERS[name];
        if (!folder) throw new Error("Unexpected image field.");
        setStage("Preparing your photo for upload…");
        let prepared = entry;
        try { prepared = await optimizeImage(entry); } catch {
          // Keep the original when the browser cannot optimize this image.
        }
        if (prepared.size > MAX_FILE_BYTES) {
          throw new Error("Please choose a photo smaller than 8 MB.");
        }
        const extension = prepared.type === "image/webp"
          ? "webp" : prepared.type === "image/png" ? "png" : "jpg";
        const path = folder + "/" + crypto.randomUUID() + "." + extension;
        setStage("Uploading your image securely…");
        const { error } = await storage.storage.from("vac-media").upload(path, prepared, {
          upsert: false,
          contentType: prepared.type,
          cacheControl: "3600"
        });
        if (error) throw new Error("Photo upload failed: " + error.message);
        stagedUploads.push(path);
        data.delete(name);
        data.set(name + "Path", path);
      }

      setStage("Uploading and saving to VAC…");
      const result = await action(data);
      setFeedback(result);
      if (!result.ok && stagedUploads.length && storage) {
        await storage.storage.from("vac-media").remove(stagedUploads).catch(() => {});
      }
      if (result.ok) {
        if (resetOnSuccess) form.reset();
        // The action also invalidates public page caches. Refresh the editor
        // so the newly saved item becomes visible without a manual reload.
        router.refresh();
      }
    } catch (error) {
      if (stagedUploads.length && storage) {
        await storage.storage.from("vac-media").remove(stagedUploads).catch(() => {});
      }
      setFeedback({
        ok: false,
        message: error instanceof Error && error.message.length < 220
          ? error.message
          : "Could not save. Please try again; your details are still in this form."
      });
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <form className={className} onSubmit={submit} aria-busy={pending}>
      {children}
      {pending && <p className="admin-save-feedback admin-save-feedback--pending" role="status">{stage}</p>}
      {feedback && (
        <p className={"admin-save-feedback " + (feedback.ok ? "admin-save-feedback--success" : "admin-save-feedback--error")}
           role={feedback.ok ? "status" : "alert"} aria-live="polite">
          {feedback.ok ? "✓ " : "⚠ "}{feedback.message}
        </p>
      )}
      {pending && <div className="admin-save-progress" aria-hidden="true"><span /></div>}
    </form>
  );
}
