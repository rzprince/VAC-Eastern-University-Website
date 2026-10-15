# VAC admin recovery and operations

## Password recovery

1. Open `https://vac-eastern-university.vercel.app/admin/login`.
2. Choose **Forgot your password? Get a secure reset link**.
3. Enter the email **of your existing Supabase Auth admin user**. This is not necessarily `vac.easternuni@gmail.com`, which is the public club contact address.
4. Check that mailbox, open the one-time recovery link, enter a strong new password and confirm it. The admin login requires a fresh sign-in afterward.
5. Do not share reset links. Supabase handles the recovery token and email-delivery limits. An account must ALSO exist in the VAC `admin_users` table to access the dashboard and reset screen.

### Required Supabase Auth dashboard configuration

Go to **Supabase Dashboard → Authentication → URL Configuration** for the connected VAC project.

- Set **Site URL** to the active production domain: `https://vac-eastern-university.vercel.app`.
- Under **Redirect URLs**, add the **exact** recovery callback:
  `https://vac-eastern-university.vercel.app/admin/auth/callback`
- If you later attach another domain, add the identical `/admin/auth/callback` path under that domain, and update Site URL accordingly.
- Configure/test Supabase Auth email sending in **Authentication → Email / SMTP**. Default service limits are intended for testing; production users may need a configured sender.
- In Supabase's **Reset Password** email template, keep the Supabase verification link as generated; use the recovery redirect URL above. Do not paste passwords or tokens into GitHub, client code or environment variables.
- For the PKCE flow, request and open the reset link in the same browser if the email client opens a different browser and produces an expired-link error.

### Security properties

- Supabase recovery uses expiring one-time auth links; no VAC-defined reset-token database.
- The UI gives the same response for registered and unregistered email addresses.
- No arbitrary `next` or redirect URL is accepted by the callback.
- New passwords must be 12–128 characters including upper- and lowercase, a digit, and a symbol.
- Resetting does not create an admin. The account must remain authorized in `admin_users` and all write operations still require `requireAdmin()` and database RLS.
- The recovery flow signs out globally after updating the password, revoking active Supabase refresh sessions so a fresh sign-in is needed.
- Enable **Leaked Password Protection** under Supabase Authentication password security; the current Supabase security advisor flags it as disabled. See https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection .
- Consider MFA for Supabase admins when enabling additional contributors, and use unique admin accounts rather than sharing a password.

## VAC dashboard data operations

| Dataset | Create | Read | Update | Delete |
|---|---|---|---|---|
| Announcements | Dashboard | Dashboard + public published | Dashboard | Dashboard |
| Archive media and thumbnails | Dashboard upload | Dashboard + public published | Dashboard | Dashboard |
| Events and event posters | Dashboard upload | Dashboard + public published | Dashboard | Dashboard |
| Committee records | Dashboard upload | Dashboard + public active | Dashboard (including hide) | Dashboard, type DELETE to confirm |
| Site settings | Initial database row | Dashboard + public selected fields | Dashboard | Restricted to prevent accidental deletion |
| Member applications and payments | Public registration only | Authorized dashboard | Authorized review and TRX verification | Restricted; preserve payment audit history |
| Approved club members | Generated from approved application workflow | Authorized dashboard | Authorized activate/deactivate and member ID | Restricted; preserve membership history |

When replacing committee images or deleting records, use **hide** rather than **permanent delete** for historical committee members. Permanent committee delete requires typing `DELETE` into the confirmation field and only runs after a server-side authorization check.

## Launch verification (without touching member data)

1. Confirm homepage, `/join`, `/admin/login`, `/admin/forgot-password`, `/admin/reset-password` respond successfully.
2. Request a recovery email to your **own** admin address and complete the reset; verify that a non-admin Supabase account cannot access `/admin`.
3. Verify editor permissions with a **draft/test announcement**: publish, edit, hide and delete. Never use an actual member/application for destructive tests.
4. Test upload/edit/remove on a disposable media thumbnail; check its public link and cleanup.
5. Check mobile width and Reduced Motion accessibility; confirm the VAC/EU logo effect stays within its rounded panel.
6. Test a new membership only with authorized, non-sensitive test data and a clear plan not to interfere with real fees; check PDF size, Supabase storage and Google Drive sync status.
7. If Drive reports not configured or failed, complete its service-account setup and use the admin dashboard's **Sync pending PDFs** function.

No database content or admin passwords are modified automatically by this UI release.
