import { createSign } from "node:crypto";

type DriveUploadResult =
  | { status: "synced"; fileId: string }
  | { status: "not_configured" }
  | { status: "failed"; error: string };

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken(email: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/drive.file",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600
    })
  );

  const unsigned = header + "." + payload;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();

  const signature = signer
    .sign(privateKey)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const assertion = unsigned + "." + signature;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion
    })
  });

  if (!response.ok) {
    throw new Error("Google OAuth failed: " + response.status);
  }

  const token = (await response.json()) as { access_token?: string };
  if (!token.access_token) throw new Error("Google OAuth returned no access token.");
  return token.access_token;
}

export async function uploadMembershipPdfToDrive({
  pdfBytes,
  fileName
}: {
  pdfBytes: Uint8Array;
  fileName: string;
}): Promise<DriveUploadResult> {
  const email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const folderId =
    process.env.GOOGLE_DRIVE_FOLDER_ID ||
    "1JPVZHucyP8lqSxIeDAINvOXZT8462vA2";

  if (!email || !privateKey || !folderId) {
    return { status: "not_configured" };
  }

  try {
    const accessToken = await getGoogleAccessToken(email, privateKey);
    const boundary = "vac_" + crypto.randomUUID().replaceAll("-", "");

    const metadata = JSON.stringify({
      name: fileName,
      parents: [folderId],
      mimeType: "application/pdf"
    });

    const prefix = Buffer.from(
      "--" +
        boundary +
        "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
        metadata +
        "\r\n--" +
        boundary +
        "\r\nContent-Type: application/pdf\r\n\r\n"
    );
    const suffix = Buffer.from("\r\n--" + boundary + "--");
    const body = Buffer.concat([prefix, Buffer.from(pdfBytes), suffix]);

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + accessToken,
          "Content-Type": "multipart/related; boundary=" + boundary
        },
        body
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error("Google Drive upload failed: " + response.status + " " + message.slice(0, 180));
    }

    const file = (await response.json()) as { id?: string };
    if (!file.id) throw new Error("Google Drive returned no file ID.");

    return { status: "synced", fileId: file.id };
  } catch (error) {
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown Google Drive error"
    };
  }
}
