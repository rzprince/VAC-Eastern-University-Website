-- Public VAC copy and membership fee update.
-- Existing application fees remain unchanged.
update public.site_settings
set registration_fee = 150,
    about_text = E'Visual Archive Club (VAC) is a club for creative minds.\n\nFrom photography and filmmaking to videography and content creation, we bring ideas to life through visuals and stories.\n\nSince 2010, VAC has been a place to learn, create, experiment, and inspire.'
where id = true;
