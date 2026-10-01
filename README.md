# Visual Archive Club (VAC) — Eastern University

Full-stack website for Visual Archive Club, Eastern University.

## Included in v1
- Professional VAC/Eastern University responsive homepage
- Official Committee 2026–2027 data
- Committee cards with phone, email and department
- Upcoming event posters with automatic countdowns
- Structured photo + Facebook-video archive
- Online member registration based on the paper form
- ৳100 bKash Send Money workflow to **01860899999**, storing sender number + Transaction ID for verification
- Supabase-backed Admin Dashboard for media, events, committee additions and membership review

Facebook Page: https://www.facebook.com/visualarchiveeu  
Facebook Group: https://www.facebook.com/groups/603306963175089

## Facebook video workflow
Admin → Latest photos & video links → choose **Video** → upload a thumbnail → paste the exact Facebook video/post URL → Publish. The thumbnail appears on the website; clicking it redirects to that Facebook post/video.

## Setup
1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor.
3. Create the VAC admin in Supabase Auth.
4. Add the admin user UUID:
   ```sql
   insert into public.admin_users (user_id,display_name) values ('YOUR_AUTH_USER_UUID','VAC Admin');
   ```
5. Copy `.env.example` to `.env.local` and add the Supabase URL and anon key.
6. `npm install` then `npm run dev`.
7. Visit `/admin/login`.

## Daily updates
Normal content changes do not require code edits. Upload media, paste Facebook links, publish events and review membership applications from Admin.

## bKash
This first version uses Send Money + Transaction ID verification. Official automated bKash Checkout can be added later when merchant API credentials are available.

## Privacy
Public committee cards intentionally show the club contact fields requested (phone, email and department). Home addresses and EU IDs from the committee sheet are not published.
