
-- Master admin email identifier
CREATE OR REPLACE FUNCTION public.master_admin_email()
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 'rileyothmer67@gmail.com'::text $$;

-- Check whether a given user is the master admin (by verified email)
CREATE OR REPLACE FUNCTION public.is_master_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = _user_id
      AND lower(email) = public.master_admin_email()
  )
$$;

-- Ensure master admin exists in user_roles right now
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE lower(email) = public.master_admin_email()
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-grant admin to master admin on signup / email confirm
CREATE OR REPLACE FUNCTION public.grant_master_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = public.master_admin_email() THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_master_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_master_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_master_admin_role();

DROP TRIGGER IF EXISTS on_auth_user_updated_master_admin ON auth.users;
CREATE TRIGGER on_auth_user_updated_master_admin
AFTER UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_master_admin_role();

-- Prevent the master admin's admin role from ever being deleted
CREATE OR REPLACE FUNCTION public.protect_master_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'admin' AND public.is_master_admin(OLD.user_id) THEN
    RAISE EXCEPTION 'The master admin role cannot be removed';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_master_admin_role_trg ON public.user_roles;
CREATE TRIGGER protect_master_admin_role_trg
BEFORE DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_master_admin_role();

-- RLS: only master admin can insert/delete roles from the app.
-- (SELECT policy for own roles already exists.)
DROP POLICY IF EXISTS "Master admin can insert roles" ON public.user_roles;
CREATE POLICY "Master admin can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_master_admin(auth.uid()));

DROP POLICY IF EXISTS "Master admin can delete roles" ON public.user_roles;
CREATE POLICY "Master admin can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.is_master_admin(auth.uid()));

DROP POLICY IF EXISTS "Master admin can view all roles" ON public.user_roles;
CREATE POLICY "Master admin can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.is_master_admin(auth.uid()));
