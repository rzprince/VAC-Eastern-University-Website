# Visual Archive Club (VAC) — Eastern University\n\nLive website: https://vac-eastern-university.vercel.app\n\nFull-stack website and content-management system for Visual Archive Club (VAC), Eastern University.\n\n## Production stack\n\n- Next.js + TypeScript\n- Supabase Postgres, Auth and Storage\n- Vercel\n- GitHub Actions\n\n## Public website\n\n- Responsive VAC + Eastern University homepage\n- Official Committee 2026–2027\n- Clickable committee cards with public contact details\n- Homepage announcements\n- Upcoming events with automatic countdowns\n- Recent and past event archive\n- Dedicated /events page\n- Featured photos and Facebook-video thumbnails\n- Filterable /archive page\n- Official VAC Facebook Page and Group links\n- Online membership registration\n- Mobile navigation\n- SEO metadata, sitemap and robots rules\n\n## Admin Dashboard\n\nAdmin login: https://vac-eastern-university.vercel.app/admin/login\n\nAuthorized admins can:\n- edit club information and public contact details\n- open or close membership registration\n- change the bKash registration number and fee\n- publish/edit/delete announcements\n- publish/edit/hide/delete events and posters\n- add Facebook links to events\n- publish/edit/hide/delete photos and video thumbnails\n- upload committee photos and maintain committee order/details\n- search and filter applications\n- verify bKash sender numbers and Transaction IDs\n- save private review notes\n- approve or reject applicants\n- manage the automatically-created approved-member registry\n- assign VAC member numbers\n- export applications and approved members as CSV\n\n## Facebook video workflow\n\nAdmin → Latest photos & Facebook videos → choose Video → upload the thumbnail/poster → paste the exact Facebook post/video URL → Publish.\n\nThe public thumbnail shows a play icon and redirects to that exact Facebook post/video when clicked.\n\n## Membership workflow\n\nThe registration form collects full name, EU ID, department, address, date of birth, blood group, email, phone/WhatsApp, skills, reason for joining, bKash sender number and bKash Transaction ID.\n\nApplication status flow:\n\nPayment Submitted → Verified → Approved / Rejected\n\nWhen an application is approved, the database automatically creates a VAC member-registry record.\n\n## bKash\n\nThe current production workflow uses Send Money + Transaction ID verification. Official automated bKash Checkout is intentionally not enabled because it requires VAC/bKash merchant API credentials.\n\n## Database migrations\n\nRun in order for a fresh Supabase project:\n\n1. 001_initial_schema.sql\n2. 002_site_settings.sql\n3. 003_rls_security_hardening.sql\n4. 004_complete_v1_features.sql\n\nAll four migrations are already applied to the connected production Supabase project.\n\n## Environment variables\n\nVercel uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.\n\nNever commit a Supabase service-role key or private payment credentials.\n\n## Privacy and security\n\n- Membership applications are protected by Supabase Row Level Security.\n- Only authorized VAC admins can read and review applicant records.\n- Public committee cards do not expose EU IDs or home addresses.\n- Admin routes require Supabase Auth.\n- CSV exports require an authenticated authorized admin session.\n- Admin image uploads are restricted to JPG, PNG and WebP up to 8 MB.\n\n## Production branch\n\nmain

## Google Drive PDF sync

Membership applications generate a private PDF automatically and store it in the `vac-applications` Supabase Storage bucket.

The production code can also copy each PDF into the connected Google Drive folder:

- VAC Website
- Membership Applications
- Folder ID: `1JPVZHucyP8lqSxIeDAINvOXZT8462vA2`

To enable automatic runtime Drive uploads from Vercel, add these server-only environment variables:

```env
GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_DRIVE_PRIVATE_KEY=...
GOOGLE_DRIVE_FOLDER_ID=1JPVZHucyP8lqSxIeDAINvOXZT8462vA2
```

Then share the **Membership Applications** Drive folder with the service-account email as an Editor. Never commit the private key.

If these credentials are not configured, registration still works: the PDF is generated and stored privately in Supabase, WhatsApp opens for the TRX ID, and Admin shows the Drive sync state as `not_configured`.
