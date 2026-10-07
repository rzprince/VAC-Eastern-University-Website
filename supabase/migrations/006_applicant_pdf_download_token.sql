-- Public applicant PDF download token for VAC membership submissions.
-- Generated server-side and returned only to the applicant who submitted the form.

alter table public.member_applications
  add column if not exists pdf_download_token text unique;

create index if not exists idx_member_applications_pdf_download_token
  on public.member_applications (pdf_download_token)
  where pdf_download_token is not null;
