-- Allow org members to read the org's subscription row
drop policy if exists "Org members can view subscription" on public.subscriptions;
create policy "Org members can view subscription"
  on public.subscriptions for select
  to authenticated
  using (
    org_id is not null
    and private.is_org_member(org_id, auth.uid())
  );

-- Org-level active-subscription helper. Kept in private schema (not
-- exposed via PostgREST); called by service_role paths and safe SQL RLS.
create or replace function private.org_has_active_subscription(_org uuid, _env text default 'sandbox')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions
    where org_id = _org
      and environment = _env
      and (
        (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
        or (status = 'canceled' and current_period_end > now())
      )
  );
$$;

revoke all on function private.org_has_active_subscription(uuid, text) from public;
grant execute on function private.org_has_active_subscription(uuid, text) to authenticated, service_role;
