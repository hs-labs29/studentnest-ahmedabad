import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { requireAdminSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSignedListingImages } from "@/lib/owner/listings";
import type {
  OwnerApplication,
  OwnerProfile,
  PgListing,
} from "@/lib/supabase/database.types";
import {
  OwnerApplicationReviewForm,
  PgListingReviewForm,
} from "../moderation-form";
import "./admin-dashboard.css";

export const metadata: Metadata = {
  title: "Admin moderation | StudentNest Ahmedabad",
};

function AdminSetupRequired() {
  return (
    <main className="admin-setup">
      <h1>Administrator setup required</h1>
      <p>
        Configure Supabase, apply the owner migration, and grant the admin role
        through the Supabase SQL Editor.
      </p>
      <Link href="/login">Go to log in</Link>
    </main>
  );
}

function AdminDashboardLoading() {
  return (
    <main className="admin-main" aria-live="polite">
      Loading moderation queue…
    </main>
  );
}

async function AdminDashboardContent() {
  await connection();
  const { supabase } = await requireAdminSession();
  const [
    applicationsResult,
    pendingListingsResult,
    publishedListingsResult,
    suspendedListingsResult,
    auditResult,
    applicationCount,
    listingCount,
    publishedCount,
    suspendedCount,
  ] = await Promise.all([
    supabase
      .from("owner_applications")
      .select("*")
      .eq("status", "pending")
      .order("submitted_at", { ascending: true })
      .limit(100),
    supabase
      .from("pg_listings")
      .select("*")
      .eq("approval_status", "pending")
      .order("created_at", { ascending: true })
      .limit(100),
    supabase
      .from("pg_listings")
      .select("*")
      .eq("approval_status", "approved")
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("pg_listings")
      .select("*")
      .eq("approval_status", "suspended")
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("owner_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("pg_listings")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "pending"),
    supabase
      .from("pg_listings")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "approved")
      .eq("is_published", true),
    supabase
      .from("pg_listings")
      .select("id", { count: "exact", head: true })
      .eq("approval_status", "suspended"),
  ]);

  const queryErrors = [
    applicationsResult.error,
    pendingListingsResult.error,
    publishedListingsResult.error,
    suspendedListingsResult.error,
    auditResult.error,
    applicationCount.error,
    listingCount.error,
    publishedCount.error,
    suspendedCount.error,
  ];
  if (queryErrors.some(Boolean)) {
    throw new Error("Unable to load the administrator moderation dashboard.");
  }

  const applications = applicationsResult.data ?? [];
  const listings = [
    ...(pendingListingsResult.data ?? []),
    ...(publishedListingsResult.data ?? []),
    ...(suspendedListingsResult.data ?? []),
  ];
  const ownerIds = [
    ...new Set([
      ...applications.map((application) => application.owner_id),
      ...listings.map((listing) => listing.owner_id),
    ]),
  ];

  const [ownerProfileResult, ownerApplicationResult, images] =
    ownerIds.length > 0
      ? await Promise.all([
          supabase
            .from("owner_profiles")
            .select("*")
            .in("user_id", ownerIds),
          supabase
            .from("owner_applications")
            .select("*")
            .in("owner_id", ownerIds),
          getSignedListingImages(
            supabase,
            listings.map((listing) => listing.id),
          ),
        ])
      : [
          { data: [], error: null },
          { data: [], error: null },
          [],
        ];

  if (ownerProfileResult.error || ownerApplicationResult.error) {
    throw new Error("Unable to load owner review details.");
  }

  const ownerProfiles = new Map(
    (ownerProfileResult.data ?? []).map((profile) => [
      profile.user_id,
      profile,
    ]),
  );
  const ownerApplications = new Map(
    (ownerApplicationResult.data ?? []).map((application) => [
      application.owner_id,
      application,
    ]),
  );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <Link className="admin-brand" href="/">
          StudentNest <span>Ahmedabad</span>
        </Link>
        <div className="admin-headerActions">
          <Link href="/pgs">View public PGs</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">ADMINISTRATION</p>
            <h1>Moderation dashboard</h1>
            <p>
              Review owner applications and property submissions before
              anything is shown publicly.
            </p>
          </div>
          <span className="admin-roleBadge">Administrator</span>
        </section>

        <section className="admin-stats" aria-label="Moderation statistics">
          <article>
            <span>Pending owners</span>
            <strong>{applicationCount.count ?? 0}</strong>
          </article>
          <article>
            <span>Pending listings</span>
            <strong>{listingCount.count ?? 0}</strong>
          </article>
          <article>
            <span>Published listings</span>
            <strong>{publishedCount.count ?? 0}</strong>
          </article>
          <article>
            <span>Suspended listings</span>
            <strong>{suspendedCount.count ?? 0}</strong>
          </article>
        </section>

        <section className="admin-card">
          <div className="admin-cardHeading">
            <div>
              <h2>Pending owner applications</h2>
              <p>Verify contact and property details before approval.</p>
            </div>
            <span>{applications.length} in queue</span>
          </div>
          {applications.length ? (
            <div className="admin-reviewList">
              {applications.map((application) => (
                <OwnerApplicationCard
                  application={application}
                  profile={ownerProfiles.get(application.owner_id)}
                  key={application.id}
                />
              ))}
            </div>
          ) : (
            <div className="admin-emptyState">
              No owner applications are waiting for review.
            </div>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-cardHeading">
            <div>
              <h2>Pending PG listings</h2>
              <p>Listings stay private until approved and owner-published.</p>
            </div>
            <span>{pendingListingsResult.data?.length ?? 0} in queue</span>
          </div>
          {(pendingListingsResult.data ?? []).length ? (
            <div className="admin-reviewList">
              {(pendingListingsResult.data ?? []).map((listing) => (
                <ListingReviewCard
                  listing={listing}
                  profile={ownerProfiles.get(listing.owner_id)}
                  application={ownerApplications.get(listing.owner_id)}
                  photos={images.filter(
                    (image) => image.listing_id === listing.id,
                  )}
                  options={["approved", "rejected"]}
                  key={listing.id}
                />
              ))}
            </div>
          ) : (
            <div className="admin-emptyState">
              No PG listings are waiting for review.
            </div>
          )}
        </section>

        <section className="admin-card">
          <div className="admin-cardHeading">
            <div>
              <h2>Published listings</h2>
              <p>Suspend a listing to immediately remove it from public search.</p>
            </div>
            <span>{publishedListingsResult.data?.length ?? 0} live</span>
          </div>
          {(publishedListingsResult.data ?? []).length ? (
            <div className="admin-reviewList">
              {(publishedListingsResult.data ?? []).map((listing) => (
                <ListingReviewCard
                  listing={listing}
                  profile={ownerProfiles.get(listing.owner_id)}
                  application={ownerApplications.get(listing.owner_id)}
                  photos={images.filter(
                    (image) => image.listing_id === listing.id,
                  )}
                  options={["suspended"]}
                  key={listing.id}
                />
              ))}
            </div>
          ) : (
            <div className="admin-emptyState">
              No listings are currently published.
            </div>
          )}
        </section>

        {(suspendedListingsResult.data ?? []).length > 0 && (
          <section className="admin-card">
            <div className="admin-cardHeading">
              <div>
                <h2>Suspended listings</h2>
                <p>Approving a suspended listing requires the owner to publish it again.</p>
              </div>
              <span>{suspendedListingsResult.data?.length ?? 0} suspended</span>
            </div>
            <div className="admin-reviewList">
              {(suspendedListingsResult.data ?? []).map((listing) => (
                <ListingReviewCard
                  listing={listing}
                  profile={ownerProfiles.get(listing.owner_id)}
                  application={ownerApplications.get(listing.owner_id)}
                  photos={images.filter(
                    (image) => image.listing_id === listing.id,
                  )}
                  options={["approved", "rejected"]}
                  key={listing.id}
                />
              ))}
            </div>
          </section>
        )}

        <section className="admin-card">
          <div className="admin-cardHeading">
            <div>
              <h2>Recent audit activity</h2>
              <p>Application and listing decisions are recorded in the database.</p>
            </div>
          </div>
          {auditResult.data?.length ? (
            <ul className="admin-auditList">
              {auditResult.data.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.action.replaceAll(".", " ")}</strong>
                    <span>
                      {entry.previous_status ?? "new"}
                      {entry.new_status ? ` → ${entry.new_status}` : ""}
                    </span>
                    {entry.reason && <p>{entry.reason}</p>}
                  </div>
                  <time dateTime={entry.created_at}>
                    {new Date(entry.created_at).toLocaleString("en-IN")}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="admin-emptyState">No moderation activity recorded yet.</div>
          )}
        </section>
      </main>
    </div>
  );
}

function OwnerApplicationCard({
  application,
  profile,
}: {
  application: OwnerApplication;
  profile?: OwnerProfile;
}) {
  return (
    <article className="admin-reviewItem">
      <div className="admin-ownerDetails">
        <span className="admin-stateBadge">Pending</span>
        <h3>{profile?.business_name ?? "Owner business details unavailable"}</h3>
        <dl>
          <div>
            <dt>Contact</dt>
            <dd>{profile?.full_name ?? "Not available"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile?.email ?? "Not available"}</dd>
          </div>
          <div>
            <dt>Mobile</dt>
            <dd>{profile?.mobile_number ?? "Not available"}</dd>
          </div>
          <div className="admin-detailWide">
            <dt>Address</dt>
            <dd>{profile?.address ?? "Not available"}</dd>
          </div>
          <div>
            <dt>Submitted</dt>
            <dd>
              <time dateTime={application.submitted_at}>
                {new Date(application.submitted_at).toLocaleDateString("en-IN")}
              </time>
            </dd>
          </div>
        </dl>
      </div>
      <OwnerApplicationReviewForm applicationId={application.id} />
    </article>
  );
}

function ListingReviewCard({
  listing,
  profile,
  application,
  photos,
  options,
}: {
  listing: PgListing;
  profile?: OwnerProfile;
  application?: OwnerApplication;
  photos: Array<{ id: string; alt_text: string; signedUrl: string }>;
  options: Array<"approved" | "rejected" | "suspended">;
}) {
  return (
    <article className="admin-reviewItem">
      <div className="admin-listingDetails">
        <span className="admin-stateBadge">{listing.approval_status}</span>
        <h3>{listing.name}</h3>
        <p>
          {listing.locality} · {listing.accommodation_type} ·{" "}
          {listing.sharing_type}
        </p>
        <p>
          ₹{listing.monthly_rent.toLocaleString("en-IN")} / month · deposit ₹
          {listing.security_deposit.toLocaleString("en-IN")} ·{" "}
          {listing.food_included ? "food included" : "food not included"}
        </p>
        <p>{listing.address}</p>
        <p>{listing.description}</p>
        <p>
          Amenities:{" "}
          {[...listing.amenities, ...(listing.food_included ? ["Food"] : [])].join(
            ", ",
          ) || "None selected"}
        </p>
        <p>House rules: {listing.house_rules}</p>
        <div className="admin-ownerSummary">
          <strong>Owner</strong>
          <span>{profile?.business_name ?? "Profile unavailable"}</span>
          <span>{profile?.full_name ?? "Name unavailable"}</span>
          <span>{profile?.email ?? "Email unavailable"}</span>
          <span>{profile?.mobile_number ?? "Mobile unavailable"}</span>
          <span>Application: {application?.status ?? "unavailable"}</span>
        </div>
        {listing.decision_reason && (
          <p className="admin-reason">Previous decision: {listing.decision_reason}</p>
        )}
        {photos.length > 0 ? (
          <div className="admin-photoGrid">
            {photos.map((photo) => (
              <div
                className="admin-photoPreview"
                role="img"
                aria-label={photo.alt_text}
                key={photo.id}
                style={{ backgroundImage: `url("${photo.signedUrl}")` }}
              />
            ))}
          </div>
        ) : (
          <p className="admin-formHint">No photos attached to this listing.</p>
        )}
      </div>
      <PgListingReviewForm listingId={listing.id} options={options} />
    </article>
  );
}

export default function AdminDashboardPage() {
  if (!isSupabaseConfigured()) return <AdminSetupRequired />;
  return (
    <Suspense fallback={<AdminDashboardLoading />}>
      <AdminDashboardContent />
    </Suspense>
  );
}
