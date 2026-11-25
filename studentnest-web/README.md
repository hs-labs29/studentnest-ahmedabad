# StudentNest Ahmedabad

StudentNest is a Next.js App Router demo for student accommodation discovery in
Ahmedabad. The PG listings, photos, prices, and facilities are illustrative
sample data; they do not represent real properties or availability.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and
   `SITE_URL` to your own project and local app URL.
3. Apply the migrations in `supabase/migrations/` in filename order using the
   Supabase CLI or the Supabase Dashboard SQL Editor.
4. Configure Supabase Auth as described below. Set public environment variables
   before building for production.
5. Run `npm run dev`.

Authentication is not active until a Supabase project is configured, the
migration has been applied, and email authentication is configured. Do not add
a Supabase secret/service-role key to this app.

## Supabase project configuration

- In **Project Settings → API**, copy the Project URL and publishable key into
  `.env.local`. The publishable key is intended for browser-facing applications;
  database access is restricted by the migration's grants and RLS policies.
- In **Authentication → Providers → Email**, enable email/password sign-in and
  require email confirmations.
- In **Authentication → URL Configuration**, set the Site URL to
  `http://localhost:3000` for local development and add both
  `http://localhost:3000/auth/callback/signup`,
  `http://localhost:3000/auth/callback/owner-signup`, and
  `http://localhost:3000/auth/callback/recovery` to the allowed redirect URLs.
  Add the equivalent HTTPS URLs for each deployed environment.
- Set `SITE_URL` to the app's origin (for example `http://localhost:3000`) so
  verification and recovery emails return to the correct app.
- Apply `supabase/migrations/20261125120000_student_auth.sql` before signing up.
  It creates student profiles, saved sample PGs, enquiries, and their
  row-level security policies. The `student_profiles` row is created by a
  database trigger when an Auth user is created.
- Then apply `supabase/migrations/20261125175230_owner_approval_portal.sql`.
  This additive migration adds owner applications and profiles, role records,
  PG listings and photo metadata, enquiry links, audit logs, RLS policies, and
  the private `pg-listing-images` Storage bucket. It replaces the Auth trigger
  so new public registrations can create student or pending-owner accounts;
  neither the signup form nor user metadata can assign the admin role.
- After registering the account that should administer the site, assign its
  role manually in the Supabase SQL Editor. Replace the email below with that
  account's email and verify the affected row before relying on the admin
  dashboard:

  ```sql
  insert into public.user_roles (user_id, role)
  select id, 'admin'
  from auth.users
  where lower(email) = lower('your-admin@example.com')
  on conflict (user_id) do update set role = excluded.role;
  ```

- Owner registrations remain pending until an administrator approves them.
  Approved owners can submit listings; each listing remains private until an
  administrator approves it and the owner explicitly publishes it. Listing
  edits and photo changes return the listing to pending review. Images are
  stored in a private bucket and served through short-lived signed URLs.
- The database enforces student, owner, and admin roles with RLS. Owners can
  manage only their own listings; moderation RPCs require the admin role and a
  reason. Audit rows record application and listing moderation/publication.
  Never grant admin from application metadata or expose a service-role key.

Student enquiries are tied to the signed-in student and the selected published
listing. Owners can view enquiries for their own listings without access to
students' private contact details. Sample listing contact actions remain
disabled rather than implying real availability.

## Checks

```powershell
npm run lint
npm run build
```

## Permission verification

The migration has not been applied to a configured Supabase project by this
repository's local checks. Before launch, use separate student, owner, and
admin test accounts in a non-production Supabase project and verify:

- Students can browse only approved, published listings and submit enquiries,
  but cannot read or change owner applications, listings, photos, or roles.
- Pending owners cannot create listings; approved owners can create and edit
  only their own listings. They cannot change moderation fields, publish a
  pending listing, or upload/delete photos on an approved listing without
  returning it to review.
- Admins can read moderation queues and audit records and can approve, reject,
  or suspend listings only through the reason-required moderation actions.
- Pending, rejected, suspended, unpublished, and removed listings and their
  photos are not publicly readable. Approval alone does not publish a listing.
