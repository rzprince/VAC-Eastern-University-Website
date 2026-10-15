import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  PublicRequestError, MAX_REGISTRATION_BODY_BYTES,
  signedPdfPath, registrationRateToken, sameOriginRequest, readRegistrationJson
} from "../lib/security.ts";

process.env.VAC_REGISTRATION_SECRET = "ab".repeat(32);
const id = "12345678-1234-4234-8234-123456789abc";

test("PDF uploads are signed using a private HMAC key", () => {
  const expected = createHmac("sha256", Buffer.from("ab".repeat(32), "hex"))
    .update(id).digest("hex");
  assert.equal(signedPdfPath(id), `membership/${id}-${expected}.pdf`);
  assert.throws(() => signedPdfPath("../wrong"), /Invalid application/);
});

test("rate tokens do not expose submitted email or university id", () => {
  const result = registrationRateToken("email", "Member@Example.com");
  assert.equal(result.p_kind, "email");
  assert.match(result.p_fingerprint, /^[a-f0-9]{64}$/);
  assert.match(result.p_proof, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(result).includes("member@example.com"), false);
  assert.deepEqual(result, registrationRateToken("email", "member@example.com"));
});

test("cross-origin or missing-origin registration POST is blocked", () => {
  const make = (origin, site) => new Request("https://vac.example.org/api/registrations", {
    method: "POST", headers: {
      ...(origin ? { Origin: origin } : {}),
      ...(site ? { "Sec-Fetch-Site": site } : {})
    }
  });
  assert.equal(sameOriginRequest(make("https://vac.example.org", "same-origin")), true);
  assert.equal(sameOriginRequest(make("https://evil.example.org", "cross-site")), false);
  assert.equal(sameOriginRequest(make("https://vac.example.org", "cross-site")), false);
  assert.equal(sameOriginRequest(make(undefined, "none")), false);
});

test("JSON parser rejects malformed, oversized and non-object bodies", async () => {
  const post = (body, contentType = "application/json") =>
    new Request("https://vac.example.org/api/registrations", {
      method: "POST", headers: { "Content-Type": contentType }, body
    });
  assert.deepEqual(await readRegistrationJson(post('{"fullName":"test"}')), {fullName:"test"});
  await assert.rejects(readRegistrationJson(post("{}","text/plain")),
    (error) => error instanceof PublicRequestError && error.status === 415);
  await assert.rejects(readRegistrationJson(post("{oops")),
    (error) => error instanceof PublicRequestError && error.status === 400);
  await assert.rejects(readRegistrationJson(post("[]")),
    (error) => error instanceof PublicRequestError && error.status === 400);
  await assert.rejects(readRegistrationJson(post("x".repeat(MAX_REGISTRATION_BODY_BYTES + 1))),
    (error) => error instanceof PublicRequestError && error.status === 413);
});

test("the signing secret must be configured correctly", () => {
  const existing = process.env.VAC_REGISTRATION_SECRET;
  process.env.VAC_REGISTRATION_SECRET = "invalid";
  assert.throws(() => signedPdfPath(id), /not configured/);
  process.env.VAC_REGISTRATION_SECRET = existing;
});
