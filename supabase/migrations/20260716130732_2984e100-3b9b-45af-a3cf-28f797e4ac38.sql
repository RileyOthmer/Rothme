drop policy if exists "user can insert self as first member" on public.org_memberships;

create policy "user can insert self via bootstrap or invite"
on public.org_memberships
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    (
      exists (
        select 1 from public.organizations o
        where o.id = org_memberships.org_id
          and o.created_by = auth.uid()
      )
      and not exists (
        select 1 from public.org_memberships m
        where m.org_id = org_memberships.org_id
      )
    )
    or exists (
      select 1 from public.org_invites i
      where i.org_id = org_memberships.org_id
        and i.role = org_memberships.role
        and lower(i.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and i.accepted_at is null
        and i.expires_at > now()
    )
  )
);

drop policy if exists "auth read registry" on public.plugin_registry;

create policy "auth read official or installed registry"
on public.plugin_registry
for select
to authenticated
using (
  is_official = true
  or exists (
    select 1 from public.plugin_installations pi
    where pi.plugin_slug = plugin_registry.slug
      and private.is_org_member(pi.org_id, auth.uid())
  )
);