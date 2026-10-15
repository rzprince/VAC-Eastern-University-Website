-- Align VAC schema defaults with live 150 BDT registration and official club copy.
-- Preserve historical applications and existing uploaded PDFs.
ALTER TABLE public.site_settings ALTER COLUMN registration_fee SET DEFAULT 150;
ALTER TABLE public.member_applications ALTER COLUMN registration_fee SET DEFAULT 150;
ALTER TABLE public.site_settings ALTER COLUMN contact_email SET DEFAULT 'vac.easternuni@gmail.com';
ALTER TABLE public.site_settings ALTER COLUMN about_text SET DEFAULT E'Visual Archive Club (VAC) is a club for creative minds.\n\nFrom photography and filmmaking to videography and content creation, we bring ideas to life through visuals and stories.\n\nSince 2010, VAC has been a place to learn, create, experiment, and inspire.';

-- Anonymous submissions can create only unreviewed applications linked
-- to a private PDF. Admin workflow retains its own update rights.
DROP POLICY IF EXISTS "Public application submit" ON public.member_applications;
CREATE POLICY "Public application submit" ON public.member_applications
FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'awaiting_whatsapp'
  AND registration_fee = (
    SELECT registration_fee FROM public.site_settings WHERE id = true
  )
  AND bkash_transaction_id IS NULL
  AND reviewed_at IS NULL
  AND admin_notes IS NULL
  AND pdf_storage_path = 'membership/' || id::text || '.pdf'
  AND pdf_download_token ~ '^[0-9a-f]{64}$'
  AND pdf_generated_at IS NOT NULL
);

REVOKE SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
ON TABLE public.member_applications FROM anon;
GRANT INSERT ON TABLE public.member_applications TO anon;

-- This bucket remains private; constrain public uploads to PDF and 5 MB.
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf'], file_size_limit = 5242880
WHERE id = 'vac-applications';