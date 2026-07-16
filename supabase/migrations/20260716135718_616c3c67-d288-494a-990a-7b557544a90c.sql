
REVOKE EXECUTE ON FUNCTION public.is_master_admin(uuid) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_master_admin_role() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_master_admin_role() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.master_admin_email() FROM public, anon, authenticated;
-- Policies run as the table owner, so they can still evaluate is_master_admin.
