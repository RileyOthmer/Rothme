
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ensure_personal_org(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_org_role(uuid, uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.ensure_personal_org(uuid, text) TO service_role;
