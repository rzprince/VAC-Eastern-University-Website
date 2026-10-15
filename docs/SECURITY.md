# VAC website security handbook

Security controls are layered. No system can be claimed to be completely safe from every attack. This document records controls and outstanding tasks as of the security hardening work.

## Protecting member data
* Database Row Level Security protects member applications, admin records, and the member registry from unauthenticated reads.
* The PDF storage bucket is **private**. A cryptographically random download token is required for one applicant PDF; tokens are validated at the API and in the edge function.
* PDFs are **not** proof of payment. bKash TRX IDs are verified manually by authorized VAC staff.
* New registrations use a 256-bit HMAC signed PDF path. Direct anonymous storage uploads and application writes with forged/unsigned paths are rejected once legacy compatibility is disabled.
* The registration API validates same-origin requests, JSON size and format, and uses database-backed, atomic per-network, email, and student-ID rate limits. Network limits are best-effort against distributed attackers; for high traffic add an independent edge WAF or CAPTCHA.
* Admin mutation actions must call `requireAdmin()` and rely on Supabase RLS. Never expose a Supabase service role secret or the registration signing secret in `NEXT_PUBLIC_*` variables.

## Deployment order
1. Apply `supabase/migrations/009_security_signed_submissions.sql` to the live project; it initially permits legacy application paths to avoid downtime.
2. Provision one identical 64-hex-character random `VAC_REGISTRATION_SECRET` in Vercel (production + preview) and `security_private.vac_registration_config.secret_hex` in Supabase. Never commit this secret.
3. Deploy the new registration handler and verify live submissions are using signed paths.
4. Execute `UPDATE security_private.vac_registration_config SET allow_legacy=false WHERE id=true;` to reject direct unsigned database/storage uploads.
5. Verify a forged path fails; test a legitimate submission with a real, authorized account and confirm Drive/WhatsApp behavior.
6. Rotate the key only through a planned maintenance procedure. Previous signed PDF paths are not revalidated for download, but new uploads must use the updated key.

## Admin protection
* Use a strong unique password and enable MFA in Supabase Auth if your account supports it. Enable Supabase Auth **leaked password protection** from Dashboard > Authentication > Settings, if available for your plan.
* Remove admin privileges as soon as an administrator leaves.
* Use only HTTPS and private personal accounts for committee management. Do not share admin credentials.
* The admin export feature neutralizes CSV cells that spreadsheet applications could otherwise interpret as formulas.

## Browser protection
* Content Security Policy, frame-ancestor restrictions, clickjacking prevention, HSTS, no-sniff, referrer privacy, permission restrictions and private API cache policies are configured in `next.config.ts`.
* The current CSP permits inline scripts and styles for Next.js compatibility. A future nonce-based strict CSP would further reduce XSS exposure and needs a separate compatibility test.
* Uploaded media is checked for real image file signatures and capped at 8 MB in the admin workflow.

## Ongoing actions and limitations
* Review Supabase Security Advisors regularly and enable Auth leaked-password protection.
* Check Vercel security events and abuse patterns, and add bot protection at the edge if registration abuse grows.
* Review any sensitive information copied to Google Drive; ensure the folder is private and access is limited.
* Set a retention and deletion policy for registration PDFs and student personal details.
* Verify automated backups and account recovery procedures, including a restoration drill.
* Audit third-party dependencies and GitHub security alerts. Automated tests help but do **not** replace independent penetration testing.
* Keep application, Vercel, and Supabase logs free of credentials, tokens, student IDs, bKash sender numbers, and full PDF URLs.

## Security checks
* `npm run security:test` runs safe, synthetic validation tests.
* `npm audit --omit=dev --audit-level=high` examines known package advisories.
* CI runs both the TypeScript/production build and security tests.
* Anonymous denial tests must not use actual student submissions or private tokens.
