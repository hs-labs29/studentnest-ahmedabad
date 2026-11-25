create table public.student_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  email text not null unique check (email = lower(email)),
  mobile_number text not null check (mobile_number ~ '^[+]?[0-9][0-9 ()-]{7,19}$'),
  college_name text not null check (char_length(btrim(college_name)) between 2 and 120),
  preferred_locality text not null check (
    preferred_locality in (
      'Navrangpura',
      'Vastrapur',
      'Satellite',
      'Thaltej',
      'Chandkheda'
    )
  ),
  role text not null default 'student' check (role = 'student'),
  terms_accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function public.create_student_profile_for_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.raw_user_meta_data ->> 'terms_accepted' is distinct from 'true' then
    raise exception 'Student account terms must be accepted before sign-up';
  end if;

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
  return new;
end;
$$;

create trigger on_auth_user_created_student_profile
  after insert on auth.users
  for each row execute function public.create_student_profile_for_auth_user();

create function public.sync_student_profile_email()
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
  return new;
end;
$$;

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_student_profile_email();

create function public.set_student_profile_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_student_profile_updated_at
  before update on public.student_profiles
  for each row execute function public.set_student_profile_updated_at();

alter table public.student_profiles enable row level security;
revoke all on table public.student_profiles from public, anon, authenticated;
grant select on table public.student_profiles to authenticated;
grant update (full_name, mobile_number, college_name, preferred_locality)
  on table public.student_profiles to authenticated;

create policy "Students can read their own profile"
  on public.student_profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Students can update their own profile"
  on public.student_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id and role = 'student');

create table public.student_saved_pgs (
  user_id uuid not null references auth.users (id) on delete cascade,
  pg_slug text not null check (
    pg_slug in ('sample-01', 'sample-02', 'sample-03', 'sample-04', 'sample-05', 'sample-06')
  ),
  created_at timestamptz not null default now(),
  primary key (user_id, pg_slug)
);

alter table public.student_saved_pgs enable row level security;
revoke all on table public.student_saved_pgs from public, anon, authenticated;
grant select, insert, delete on table public.student_saved_pgs to authenticated;

create policy "Students can read their own saved PGs"
  on public.student_saved_pgs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Students can save PGs for themselves"
  on public.student_saved_pgs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Students can remove their own saved PGs"
  on public.student_saved_pgs for delete to authenticated
  using ((select auth.uid()) = user_id);

create table public.student_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pg_slug text not null check (
    pg_slug in ('sample-01', 'sample-02', 'sample-03', 'sample-04', 'sample-05', 'sample-06')
  ),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  status text not null default 'submitted'
    check (status in ('submitted', 'in_progress', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index student_enquiries_user_created_idx
  on public.student_enquiries (user_id, created_at desc);

alter table public.student_enquiries enable row level security;
revoke all on table public.student_enquiries from public, anon, authenticated;
grant select on table public.student_enquiries to authenticated;

create policy "Students can read their own enquiries"
  on public.student_enquiries for select to authenticated
  using ((select auth.uid()) = user_id);
