import { createHmac } from "node:crypto";

export const MAX_REGISTRATION_BODY_BYTES = 12 * 1024;
const SIGNING_KEY_PATTERN = /^[0-9a-f]{64}$/;

function secretKey() {
  const key = process.env.VAC_REGISTRATION_SECRET || "";
  if (!SIGNING_KEY_PATTERN.test(key)) {
    throw new Error("VAC registration signing secret is not configured.");
  }
  return Buffer.from(key, "hex");
}

export function hmacSignature(value: string) {
  return createHmac("sha256", secretKey()).update(value, "utf8").digest("hex");
}

export function signedPdfPath(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    throw new Error("Invalid application identifier.");
  }
  return "membership/" + id + "-" + hmacSignature(id) + ".pdf";
}

export function registrationRateToken(kind: "network" | "student" | "email", input: string) {
  const fingerprint = hmacSignature("identity:" + kind + ":" + input.trim().toLowerCase());
  return {
    p_kind: kind,
    p_fingerprint: fingerprint,
    p_proof: hmacSignature("rate:" + kind + ":" + fingerprint)
  };
}

export function sameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  const destination = new URL(request.url);
  // The browser sends an Origin header for normal same-origin fetch POST.
  // Missing origins are denied on state-changing public endpoints.
  if (!origin || fetchSite === "cross-site") return false;
  try {
    return new URL(origin).origin === destination.origin;
  } catch {
    return false;
  }
}

export class PublicRequestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function readRegistrationJson(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    throw new PublicRequestError(415, "Please submit the registration form normally.");
  }
  const length = request.headers.get("content-length");
  if (length && Number(length) > MAX_REGISTRATION_BODY_BYTES) {
    throw new PublicRequestError(413, "Application is too large.");
  }
  if (!request.body) throw new PublicRequestError(400, "The application is empty.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.length;
      if (total > MAX_REGISTRATION_BODY_BYTES) {
        await reader.cancel();
        throw new PublicRequestError(413, "Application is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const text = Buffer.concat(chunks).toString("utf8");
  let object: unknown;
  try { object = JSON.parse(text); }
  catch { throw new PublicRequestError(400, "Invalid application data."); }
  if (!object || typeof object !== "object" || Array.isArray(object)) {
    throw new PublicRequestError(400, "Invalid application data.");
  }
  return object as Record<string, unknown>;
}
