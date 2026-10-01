# Visual Archive Club (VAC) — Eastern University

Full-stack website for Visual Archive Club, Eastern University.

## Current v1 build

- Professional VAC/Eastern University responsive homepage
- Official Committee 2026–2027 data
- Committee cards with photo, phone, email and department
- Admin editing for committee details, images, public visibility and order
- Upcoming event posters with automatic Bangladesh-time countdowns
- Structured newest-first photo + Facebook-video archive
- Facebook video workflow: upload thumbnail + paste exact Facebook post/video URL
- Online member registration based on the former paper form
- ৳100 bKash Send Money workflow to **01860899999**, storing sender number + Transaction ID for verification
- Membership application statuses: payment submitted, verified, approved, rejected
- Editable club settings from Admin (about text, tenure, social links, bKash number and registration fee)
- Supabase Postgres + Auth + Storage + Row Level Security
- GitHub Actions TypeScript/build validation
- Ready for Vercel once the Supabase project is connected

Official Facebook Page: https://www.facebook.com/visualarchiveeu  
Official Facebook Group: https://www.facebook.com/groups/603306963175089

## Stack

- Next.js + TypeScript
- Supabase (Postgres, Auth, Storage)
- Vercel
- GitHub Actions

## Supabase setup

Run migrations in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_site_settings.sql`

Then create the first VAC admin in Supabase Authentication and add that user's UUID:

```sql
insert into public.admin_users (user_id, display_name)
values ('YOUR_AUTH_USER_UUID', 'VAC Admin');
```

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Install/run:

```bash
npm install
npm run dev
```

Admin login:

```text
/admin/login
```

## Daily VAC update workflow

### New photo

Admin → **Latest photos & Facebook videos** → Photo → title → upload image → optionally Featured → Publish.

Existing media can be opened in Admin and edited, hidden, given a replacement image, or deleted.

### New Facebook video

Admin → **Latest photos & Facebook videos** → Video → title → upload the thumbnail/poster you want displayed → paste the **exact Facebook post/video URL** → Publish.

The thumbnail appears on the VAC website with a play button. Clicking it redirects directly to that Facebook video/post.

### Upcoming event

Admin → **Upcoming & past events** → title → Dhaka-local date/time → location → poster → description → Publish.

The website automatically shows the remaining days/hours. Events can later be edited, hidden, have their poster replaced, or be deleted.

### Committee updates

Admin → **Committee manager**.

You can:
- replace a member photo,
- update name/position/department/phone/email,
- change display order,
- mark leadership cards,
- hide former members from the public site,
- add future committee members.

### General club information

Admin → **Club settings**.

You can update:
- club/university name,
- current tenure,
- tagline,
- About VAC text,
- Facebook page,
- Facebook group,
- bKash registration number,
- registration fee.

No source-code editing is needed for these normal updates.

## bKash

The current release uses **Send Money + Transaction ID verification**. The registration page shows the current bKash number and fee from the database.

Official automated bKash Checkout can be added later if VAC obtains bKash merchant/API credentials.

## Privacy

Public committee cards intentionally expose only the club contact information requested for the website. EU IDs and home addresses from the official committee registration sheet are not published.

Member application data is protected by Supabase Row Level Security and is available to authorized VAC administrators.

## Development

Work is being developed on:

```text
build/vac-fullstack-v1
```

Draft pull request: #1

## Vercel deployment

The repository is connected to Vercel. Preview deployments are created from the `build/vac-fullstack-v1` branch while production remains on `main` until final approval.
