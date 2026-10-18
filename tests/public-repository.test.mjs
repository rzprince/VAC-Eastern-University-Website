/**
 * Snapshot-only guardrail for publishing a source repository.
 * Checks tracked files for common accidental credentials and personal exports.
 * Does not inspect Git history or prove security; review history separately.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";

const names = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0").filter(Boolean);

const forbiddenPaths = [
  /(^|\/)\.env(?:\.|$)(?!example$)/i,
  /(^|\/)(?:prince-signature|signature-original)\.(?:ts|js|svg|png)$/i,
  /(^|\/)(?:service-account|credentials|private-key|backup)(?:\.|\/)/i,
  /(^|\/)membership[^/]*\.pdf$/i,
  /\.(?:pem|p12|pfx|key)$/i
];

const tokenShapes = [
  ["PEM private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i],
  ["GitHub token", /gh[pousr]_[A-Za-z0-9_]{32,}/],
  ["Cloud API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["Supabase secret key", /sb_secret_[A-Za-z0-9_-]{18,}/],
  ["OpenAI API token", /sk-(?:proj-)?[A-Za-z0-9_-]{30,}/],
  ["JWT credential", /eyJ[A-Za-z0-9_-]{15,}\.eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/],
  ["Private-key JSON", /"private_key"\s*:\s*"-----BEGIN/i]
];

const textTypes = new Set([
  ".md", ".txt", ".mjs", ".js", ".ts", ".tsx", ".json",
  ".sql", ".yml", ".yaml", ".css", ".xml", ".svg", ".html"
]);

test("Tracked tree excludes credentials and personal exports", () => {
  const issues = [];
  for (const file of names) {
    if (forbiddenPaths.some(re => re.test(file))) {
      issues.push(file + ": disallowed tracked path");
      continue;
    }
    const ext = extname(file).toLowerCase();
    if (!textTypes.has(ext)) continue;
    let body;
    try { body = readFileSync(file, "utf8"); }
    catch { continue; }

    // Exempt this test's own pattern definitions from self matching.
    if (file !== "tests/public-repository.test.mjs") {
      for (const [kind, regex] of tokenShapes) {
        if (regex.test(body)) issues.push(file + ": " + kind);
      }
    }

    if (file.endsWith("lib/google-drive.ts") &&
        /GOOGLE_DRIVE_FOLDER_ID\s*\|\|\s*["'][A-Za-z0-9_-]{12,}/.test(body)) {
      issues.push(file + ": embedded external storage destination");
    }
    if (file.endsWith("lib/application-pdf.ts") &&
        /from\s+["']@\/lib\/prince-signature["']/.test(body)) {
      issues.push(file + ": bundled signature import");
    }
  }

  assert.deepEqual(issues, [],
    "Public-source review failed. Investigate flagged file names privately; never print secret values.");
});
