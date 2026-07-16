
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id text NOT NULL UNIQUE,
  client_id_ciphertext text,
  client_secret_ciphertext text,
  client_id_last4 text,
  client_secret_last4 text,
  notes text,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_credentials TO authenticated;
GRANT ALL ON public.admin_credentials TO service_role;

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage credentials"
  ON public.admin_credentials
  FOR ALL
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER admin_credentials_set_updated_at
  BEFORE UPDATE ON public.admin_credentials
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
