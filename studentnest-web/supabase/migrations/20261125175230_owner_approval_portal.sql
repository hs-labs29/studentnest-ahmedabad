create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('student', 'owner', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
revoke all on table public.user_roles from public, anon, authenticated;
grant select on table public.user_roles to authenticated;

create function public.has_current_role(required_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = required_role
  );
$$;

revoke all on function public.has_current_role(text) from public, anon;
grant execute on function public.has_current_role(text) to authenticated;

create policy "Users can read their own role and admins can read all roles"
  on public.user_roles for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.has_current_role('admin'))
  );

insert into public.user_roles (user_id, role)
select id, 'student'
from auth.users
on conflict (user_id) do nothing;

create table public.owner_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  email text not null unique check (email = lower(email)),
  mobile_number text not null check (mobile_number ~ '^[+]?[0-9][0-9 ()-]{7,19}$'),
  business_name text not null check (char_length(btrim(business_name)) between 2 and 120),
  address text not null check (char_length(btrim(address)) between 8 and 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.owner_applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  decision_reason text check (
    decision_reason is null or char_length(btrim(decision_reason)) between 5 and 1000
  ),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending' and reviewed_at is null and reviewed_by is null)
    or (status <> 'pending' and reviewed_at is not null)
  )
);

create index owner_applications_status_submitted_idx
  on public.owner_applications (status, submitted_at desc);

alter table public.owner_profiles enable row level security;
alter table public.owner_applications enable row level security;
revoke all on table public.owner_profiles, public.owner_applications
  from public, anon, authenticated;
grant select on table public.owner_profiles, public.owner_applications to authenticated;

create policy "Owners and admins can read owner profiles"
  on public.owner_profiles for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select public.has_current_role('admin'))
  );

create policy "Owners and admins can read applications"
  on public.owner_applications for select to authenticated
  using (
    owner_id = (select auth.uid())
    or (select public.has_current_role('admin'))
  );

drop policy "Students can read their own saved PGs" on public.student_saved_pgs;
drop policy "Students can save PGs for themselves" on public.student_saved_pgs;
drop policy "Students can remove their own saved PGs" on public.student_saved_pgs;

create policy "Students can read their own saved PGs"
  on public.student_saved_pgs for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.has_current_role('student'))
  );

create policy "Students can save PGs for themselves"
  on public.student_saved_pgs for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.has_current_role('student'))
  );

create policy "Students can remove their own saved PGs"
  on public.student_saved_pgs for delete to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.has_current_role('student'))
  );

create or replace function public.create_student_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_account_type text := coalesce(
    new.raw_user_meta_data ->> 'account_type',
    'student'
  );
begin
  if new.raw_user_meta_data ->> 'terms_accepted' is distinct from 'true' then
    raise exception 'Account terms must be accepted before sign-up';
  end if;

  if requested_account_type = 'owner' then
    insert into public.owner_profiles (
      user_id,
      full_name,
      email,
      mobile_number,
      business_name,
      address
    )
    values (
      new.id,
      btrim(new.raw_user_meta_data ->> 'full_name'),
      lower(new.email),
      btrim(new.raw_user_meta_data ->> 'mobile_number'),
      btrim(new.raw_user_meta_data ->> 'business_name'),
      btrim(new.raw_user_meta_data ->> 'address')
    );

    insert into public.owner_applications (owner_id)
    values (new.id);

    insert into public.user_roles (user_id, role)
    values (new.id, 'owner');
  elsif requested_account_type = 'student' then
    insert into public.student_profiles (
      id,
      full_name,
      email,
      mobile_number,
      college_name,
      preferred_locality
    )
    values (
      new.id,
      btrim(new.raw_user_meta_data ->> 'full_name'),
      lower(new.email),
      btrim(new.raw_user_meta_data ->> 'mobile_number'),
      btrim(new.raw_user_meta_data ->> 'college_name'),
      btrim(new.raw_user_meta_data ->> 'preferred_locality')
    );

    insert into public.user_roles (user_id, role)
    values (new.id, 'student');
  else
    raise exception 'Unsupported account type';
  end if;

  return new;
end;
$$;

create or replace function public.sync_student_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.student_profiles
  set email = lower(new.email),
      updated_at = now()
  where id = new.id;

  update public.owner_profiles
  set email = lower(new.email),
      updated_at = now()
  where user_id = new.id;

  return new;
end;
$$;

create function public.set_owner_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_owner_profile_updated_at
  before update on public.owner_profiles
  for each row execute function public.set_owner_profile_updated_at();

create trigger set_owner_application_updated_at
  before update on public.owner_applications
  for each row execute function public.set_owner_profile_updated_at();

create table public.pg_listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 3 and 120),
  description text not null check (char_length(btrim(description)) between 20 and 4000),
  locality text not null check (
    locality in ('Navrangpura', 'Vastrapur', 'Satellite', 'Thaltej', 'Chandkheda')
  ),
  address text not null check (char_length(btrim(address)) between 8 and 300),
  accommodation_type text not null check (
    accommodation_type in ('Boys', 'Girls', 'Co-living')
  ),
  monthly_rent integer not null check (monthly_rent between 1000 and 1000000),
  security_deposit integer not null check (security_deposit between 0 and 5000000),
  sharing_type text not null check (
    sharing_type in ('Single', 'Double sharing', 'Triple sharing', 'Four sharing', 'Private room')
  ),
  amenities text[] not null default '{}'
    check (amenities <@ array[
      'Wi-Fi',
      'AC',
      'Laundry',
      'Washing machine',
      'Attached bathroom',
      'Parking'
    ]::text[]),
  food_included boolean not null default false,
  house_rules text not null check (char_length(btrim(house_rules)) between 10 and 2000),
  approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected', 'suspended', 'removed')),
  is_published boolean not null default false,
  decision_reason text check (
    decision_reason is null or char_length(btrim(decision_reason)) between 5 and 1000
  ),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not is_published or approval_status = 'approved')
);

create index pg_listings_public_search_idx
  on public.pg_listings (locality, accommodation_type, monthly_rent)
  where approval_status = 'approved' and is_published;
create index pg_listings_owner_created_idx
  on public.pg_listings (owner_id, created_at desc);

create table public.pg_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.pg_listings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null unique,
  display_order smallint not null default 0 check (display_order between 0 and 19),
  alt_text text not null default 'PG property photo'
    check (char_length(btrim(alt_text)) between 3 and 160),
  created_at timestamptz not null default now(),
  check (
    (storage.foldername(storage_path))[1] = owner_id::text
    and (storage.foldername(storage_path))[2] = listing_id::text
    and (storage.foldername(storage_path))[3] is null
  )
);

create index pg_listing_images_listing_order_idx
  on public.pg_listing_images (listing_id, display_order, created_at);

alter table public.pg_listings enable row level security;
alter table public.pg_listing_images enable row level security;
revoke all on table public.pg_listings, public.pg_listing_images
  from public, anon, authenticated;
grant select on table public.pg_listings, public.pg_listing_images to anon, authenticated;
grant insert (
  owner_id,
  name,
  description,
  locality,
  address,
  accommodation_type,
  monthly_rent,
  security_deposit,
  sharing_type,
  amenities,
  food_included,
  house_rules
) on table public.pg_listings to authenticated;
grant update (
  name,
  description,
  locality,
  address,
  accommodation_type,
  monthly_rent,
  security_deposit,
  sharing_type,
  amenities,
  food_included,
  house_rules,
  is_published
) on table public.pg_listings to authenticated;
grant delete on table public.pg_listing_images to authenticated;
grant insert (listing_id, owner_id, storage_path, display_order, alt_text)
  on table public.pg_listing_images to authenticated;

create policy "Public can read approved published listings"
  on public.pg_listings for select to anon, authenticated
  using (approval_status = 'approved' and is_published);

create policy "Owners can read their own listings"
  on public.pg_listings for select to authenticated
  using (
    owner_id = (select auth.uid())
    and (select public.has_current_role('owner'))
  );

create policy "Admins can read all listings"
  on public.pg_listings for select to authenticated
  using ((select public.has_current_role('admin')));

create policy "Approved owners can submit pending listings"
  on public.pg_listings for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (select public.has_current_role('owner'))
    and approval_status = 'pending'
    and not is_published
    and reviewed_by is null
    and exists (
      select 1 from public.owner_applications
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  );

create policy "Owners can edit their own listings"
  on public.pg_listings for update to authenticated
  using (
    owner_id = (select auth.uid())
    and (select public.has_current_role('owner'))
    and approval_status not in ('suspended', 'removed')
    and exists (
      select 1 from public.owner_applications
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  )
  with check (
    owner_id = (select auth.uid())
    and (select public.has_current_role('owner'))
    and approval_status not in ('suspended', 'removed')
    and (not is_published or approval_status = 'approved')
    and exists (
      select 1 from public.owner_applications
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  );

create policy "Owners and admins can read listing images"
  on public.pg_listing_images for select to authenticated
  using (
    (owner_id = (select auth.uid()) and (select public.has_current_role('owner')))
    or (select public.has_current_role('admin'))
    or exists (
      select 1 from public.pg_listings
      where id = listing_id and approval_status = 'approved' and is_published
    )
  );

create policy "Public can read images for published listings"
  on public.pg_listing_images for select to anon
  using (
    exists (
      select 1 from public.pg_listings
      where id = listing_id and approval_status = 'approved' and is_published
    )
  );

create policy "Approved owners can add photos to their listings"
  on public.pg_listing_images for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and (select public.has_current_role('owner'))
    and exists (
      select 1 from public.pg_listings
      where id = listing_id
        and owner_id = (select auth.uid())
        and approval_status = 'pending'
    )
    and exists (
      select 1 from public.owner_applications
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  );

create policy "Owners and admins can remove listing photos"
  on public.pg_listing_images for delete to authenticated
  using (
    (
      owner_id = (select auth.uid())
      and (select public.has_current_role('owner'))
      and exists (
        select 1 from public.pg_listings
        where id = listing_id
          and owner_id = (select auth.uid())
          and approval_status = 'pending'
      )
    )
    or (select public.has_current_role('admin'))
  );

drop policy "Students can read their own enquiries" on public.student_enquiries;

create policy "Students can read their own enquiries"
  on public.student_enquiries for select to authenticated
  using (
    user_id = (select auth.uid())
    and (select public.has_current_role('student'))
  );

alter table public.student_enquiries
  alter column pg_slug drop not null,
  add column pg_listing_id uuid references public.pg_listings (id) on delete set null,
  add constraint student_enquiries_one_pg_reference
    check (
      pg_slug is null or pg_listing_id is null
    );

create index student_enquiries_listing_created_idx
  on public.student_enquiries (pg_listing_id, created_at desc)
  where pg_listing_id is not null;

revoke all on table public.student_enquiries from public, anon, authenticated;
grant select on table public.student_enquiries to authenticated;
grant insert (user_id, pg_listing_id, message)
  on table public.student_enquiries to authenticated;

create policy "Students can create enquiries for published listings"
  on public.student_enquiries for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and pg_slug is null
    and pg_listing_id is not null
    and (select public.has_current_role('student'))
    and exists (
      select 1 from public.pg_listings
      where id = pg_listing_id and approval_status = 'approved' and is_published
    )
  );

create policy "Owners can read enquiries for their listings"
  on public.student_enquiries for select to authenticated
  using (
    pg_listing_id is not null
    and (select public.has_current_role('owner'))
    and exists (
      select 1 from public.pg_listings
      where id = pg_listing_id and owner_id = (select auth.uid())
    )
  );

create policy "Admins can read all enquiries"
  on public.student_enquiries for select to authenticated
  using ((select public.has_current_role('admin')));

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (
    action in (
      'owner_application.submitted',
      'owner_application.approved',
      'owner_application.rejected',
      'pg_listing.created',
      'pg_listing.status_changed',
      'pg_listing.published',
      'pg_listing.unpublished',
      'pg_listing.removed'
    )
  ),
  entity_type text not null check (entity_type in ('owner_application', 'pg_listing')),
  entity_id uuid not null,
  previous_status text,
  new_status text,
  reason text,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_created_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);
alter table public.audit_logs enable row level security;
revoke all on table public.audit_logs from public, anon, authenticated;
grant select on table public.audit_logs to authenticated;

create policy "Admins can read audit logs"
  on public.audit_logs for select to authenticated
  using ((select public.has_current_role('admin')));

create function public.audit_owner_application_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.audit_logs (
      actor_id, action, entity_type, entity_id, new_status
    )
    values (
      new.owner_id,
      'owner_application.submitted',
      'owner_application',
      new.id,
      new.status
    );
  elsif old.status is distinct from new.status then
    insert into public.audit_logs (
      actor_id, action, entity_type, entity_id, previous_status, new_status, reason
    )
    values (
      coalesce(new.reviewed_by, (select auth.uid())),
      case new.status
        when 'approved' then 'owner_application.approved'
        else 'owner_application.rejected'
      end,
      'owner_application',
      new.id,
      old.status,
      new.status,
      new.decision_reason
    );
  end if;
  return new;
end;
$$;

create trigger audit_owner_application_insert
  after insert on public.owner_applications
  for each row execute function public.audit_owner_application_change();
create trigger audit_owner_application_decision
  after update of status on public.owner_applications
  for each row when (old.status is distinct from new.status)
  execute function public.audit_owner_application_change();

create function public.audit_pg_listing_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  event_action text;
  old_status text;
  new_status text;
  event_reason text;
  event_actor uuid;
  event_entity uuid;
begin
  if tg_op = 'INSERT' then
    event_action := 'pg_listing.created';
    new_status := new.approval_status;
    event_reason := null;
    event_actor := new.owner_id;
    event_entity := new.id;
  elsif tg_op = 'DELETE' then
    event_action := 'pg_listing.removed';
    old_status := old.approval_status;
    event_reason := old.decision_reason;
    event_actor := coalesce((select auth.uid()), old.owner_id);
    event_entity := old.id;
  elsif old.approval_status is distinct from new.approval_status then
    event_action := case
      when new.approval_status = 'removed' then 'pg_listing.removed'
      else 'pg_listing.status_changed'
    end;
    old_status := old.approval_status;
    new_status := new.approval_status;
    event_reason := new.decision_reason;
    event_actor := coalesce(new.reviewed_by, (select auth.uid()), new.owner_id);
    event_entity := new.id;
  elsif old.is_published is distinct from new.is_published then
    event_action := case
      when new.is_published then 'pg_listing.published'
      else 'pg_listing.unpublished'
    end;
    old_status := old.approval_status;
    new_status := new.approval_status;
    event_reason := new.decision_reason;
    event_actor := coalesce((select auth.uid()), new.owner_id);
    event_entity := new.id;
  else
    return new;
  end if;

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, previous_status, new_status, reason
  )
  values (
    event_actor,
    event_action,
    'pg_listing',
    event_entity,
    old_status,
    new_status,
    event_reason
  );

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger audit_pg_listing_insert
  after insert on public.pg_listings
  for each row execute function public.audit_pg_listing_change();
create trigger audit_pg_listing_update
  after update on public.pg_listings
  for each row execute function public.audit_pg_listing_change();
create trigger audit_pg_listing_delete
  after delete on public.pg_listings
  for each row execute function public.audit_pg_listing_change();

create function public.guard_pg_listing_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.has_current_role('admin')) then
    if (
      new.approval_status is distinct from old.approval_status
      or new.reviewed_at is distinct from old.reviewed_at
      or new.reviewed_by is distinct from old.reviewed_by
      or new.decision_reason is distinct from old.decision_reason
    ) and not (
      (
        (
          new.approval_status = 'pending'
          and old.approval_status in ('approved', 'rejected')
          and exists (
            select 1 from public.owner_applications
            where owner_id = (select auth.uid()) and status = 'approved'
          )
        )
        or (
          new.approval_status = 'removed'
          and old.approval_status <> 'removed'
        )
      )
      and new.owner_id = (select auth.uid())
      and (select public.has_current_role('owner'))
      and not new.is_published
      and new.reviewed_at is null
      and new.reviewed_by is null
      and new.decision_reason is null
    ) then
      raise exception 'Only admins can change listing moderation fields';
    end if;

    if row(
      new.name,
      new.description,
      new.locality,
      new.address,
      new.accommodation_type,
      new.monthly_rent,
      new.security_deposit,
      new.sharing_type,
      new.amenities,
      new.food_included,
      new.house_rules
    ) is distinct from row(
      old.name,
      old.description,
      old.locality,
      old.address,
      old.accommodation_type,
      old.monthly_rent,
      old.security_deposit,
      old.sharing_type,
      old.amenities,
      old.food_included,
      old.house_rules
    ) then
      new.approval_status := 'pending';
      new.is_published := false;
      new.reviewed_at := null;
      new.reviewed_by := null;
      new.decision_reason := null;
    end if;

    if new.is_published and (
      new.approval_status <> 'approved'
      or not exists (
        select 1 from public.owner_applications
        where owner_id = new.owner_id and status = 'approved'
      )
    ) then
      raise exception 'Only approved owners can publish approved listings';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger guard_pg_listing_update
  before update on public.pg_listings
  for each row execute function public.guard_pg_listing_update();

create function public.review_owner_application(
  target_application_id uuid,
  decision text,
  decision_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_reason text := nullif(btrim(coalesce(decision_reason, '')), '');
begin
  if not (select public.has_current_role('admin')) then
    raise exception 'Admin access required';
  end if;
  if decision not in ('approved', 'rejected') then
    raise exception 'Unsupported owner application decision';
  end if;
  if normalized_reason is null or char_length(normalized_reason) < 5 then
    raise exception 'A reason is required for every application decision';
  end if;

  update public.owner_applications
  set status = decision,
      decision_reason = normalized_reason,
      reviewed_at = now(),
      reviewed_by = (select auth.uid())
  where id = target_application_id and status = 'pending';

  if not found then
    raise exception 'Pending owner application not found';
  end if;
end;
$$;

revoke all on function public.review_owner_application(uuid, text, text)
  from public, anon;
grant execute on function public.review_owner_application(uuid, text, text)
  to authenticated;

create function public.review_pg_listing(
  target_listing_id uuid,
  decision text,
  decision_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_reason text := nullif(btrim(coalesce(decision_reason, '')), '');
  next_status text;
begin
  if not (select public.has_current_role('admin')) then
    raise exception 'Admin access required';
  end if;
  if decision not in ('approved', 'rejected', 'suspended') then
    raise exception 'Unsupported listing decision';
  end if;
  if normalized_reason is null or char_length(normalized_reason) < 5 then
    raise exception 'A reason is required for every listing decision';
  end if;

  next_status := decision;
  update public.pg_listings
  set approval_status = next_status,
      is_published = false,
      decision_reason = normalized_reason,
      reviewed_at = now(),
      reviewed_by = (select auth.uid())
  where id = target_listing_id
    and (
      (decision in ('approved', 'rejected') and approval_status in ('pending', 'suspended'))
      or (decision = 'suspended' and approval_status = 'approved')
    );

  if not found then
    raise exception 'Listing cannot be changed from its current status';
  end if;
end;
$$;

revoke all on function public.review_pg_listing(uuid, text, text)
  from public, anon;
grant execute on function public.review_pg_listing(uuid, text, text)
  to authenticated;

create function public.resubmit_own_pg_listing(target_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.has_current_role('owner')) then
    raise exception 'Owner access required';
  end if;
  if not exists (
    select 1 from public.owner_applications
    where owner_id = (select auth.uid()) and status = 'approved'
  ) then
    raise exception 'Owner application approval required';
  end if;

  update public.pg_listings
  set approval_status = 'pending',
      is_published = false,
      decision_reason = null,
      reviewed_at = null,
      reviewed_by = null
  where id = target_listing_id
    and owner_id = (select auth.uid())
    and approval_status in ('pending', 'approved', 'rejected');

  if not found then
    raise exception 'Owned listing cannot be resubmitted';
  end if;
end;
$$;

revoke all on function public.resubmit_own_pg_listing(uuid) from public, anon;
grant execute on function public.resubmit_own_pg_listing(uuid) to authenticated;

create function public.remove_own_pg_listing(target_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.has_current_role('owner')) then
    raise exception 'Owner access required';
  end if;

  update public.pg_listings
  set approval_status = 'removed',
      is_published = false,
      decision_reason = null,
      reviewed_at = null,
      reviewed_by = null
  where id = target_listing_id
    and owner_id = (select auth.uid())
    and approval_status <> 'removed';

  if not found then
    raise exception 'Owned listing not found';
  end if;
end;
$$;

revoke all on function public.remove_own_pg_listing(uuid) from public, anon;
grant execute on function public.remove_own_pg_listing(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pg-listing-images',
  'pg-listing-images',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "Approved owners can upload listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pg-listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[3] is null
    and (select public.has_current_role('owner'))
    and exists (
      select 1 from public.pg_listings
      where id::text = (storage.foldername(name))[2]
        and owner_id = (select auth.uid())
        and approval_status = 'pending'
    )
    and exists (
      select 1 from public.owner_applications
      where owner_id = (select auth.uid()) and status = 'approved'
    )
  );

create policy "Owners and admins can read private listing images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'pg-listing-images'
    and (
      (storage.foldername(name))[3] is null
      and (
        (
          (storage.foldername(name))[1] = (select auth.uid())::text
          and (select public.has_current_role('owner'))
        )
        or (select public.has_current_role('admin'))
        or exists (
          select 1
          from public.pg_listing_images i
          join public.pg_listings l on l.id = i.listing_id
          where i.storage_path = name
            and l.approval_status = 'approved'
            and l.is_published
        )
      )
    )
  );

create policy "Public can read images for published listings"
  on storage.objects for select to anon
  using (
    bucket_id = 'pg-listing-images'
    and (storage.foldername(name))[3] is null
    and exists (
      select 1
      from public.pg_listing_images i
      join public.pg_listings l on l.id = i.listing_id
      where i.storage_path = name
        and l.approval_status = 'approved'
        and l.is_published
    )
  );

create policy "Owners and admins can remove listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'pg-listing-images'
    and (storage.foldername(name))[3] is null
    and (
      (
        (storage.foldername(name))[1] = (select auth.uid())::text
        and (select public.has_current_role('owner'))
        and exists (
          select 1 from public.pg_listings
          where id::text = (storage.foldername(name))[2]
            and owner_id = (select auth.uid())
            and approval_status = 'pending'
        )
      )
      or (select public.has_current_role('admin'))
    )
  );
