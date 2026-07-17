
-- RLS on storage.objects for the brand-assets bucket.
-- Files are namespaced by org: <org_id>/<...>. First path segment must belong
-- to an org the caller is a member of.

CREATE POLICY "Org members can read brand asset files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
        AND m.org_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Org members can upload brand asset files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
        AND m.org_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Org members can update brand asset files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
        AND m.org_id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Org members can delete brand asset files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.org_memberships m
      WHERE m.user_id = auth.uid()
        AND m.org_id::text = (storage.foldername(name))[1]
    )
  );
