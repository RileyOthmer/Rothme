
CREATE OR REPLACE FUNCTION public.master_admin_email()
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$ SELECT 'rileyothmer67@gmail.com'::text $$;
REVOKE EXECUTE ON FUNCTION public.master_admin_email() FROM public, anon, authenticated;
