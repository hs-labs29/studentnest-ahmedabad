import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/lib/auth/actions";
import { requireOwnerSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSignedListingImages } from "@/lib/owner/listings";
import ListingForm from "../listing-form";
import {
  publishListingAction,
  removeListingAction,
} from "@/lib/owner/actions";
import type { PgListing } from "@/lib/supabase/database.types";
import "./owner-dashboard.css";

export const metadata: Metadata = {
  title: "Owner dashboard | StudentNest Ahmedabad",
};

function OwnerSetupRequired() {
  return (
    <main className="owner-setup">
      <h1>Owner portal setup required</h1>
      <p>Configure Supabase and apply the owner approval migration first.</p>
      <Link href="/login">Go to log in</Link>
    </main>
  );
}

function OwnerDashboardLoading() {
  return (
    <main className="owner-main" aria-live="polite">
      Loading your owner dashboard…
    </main>
  );
}

async function OwnerDashboardContent() {
  const { supabase, profile, application } = await requireOwnerSession();
  const { data: listings, error: listingsError } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("owner_id", profile.user_id)
    .order("created_at", { ascending: false });
  if (listingsError) throw new Error("Unable to load your PG listings.");

  const ownedListings = listings ?? [];
  const listingIds = ownedListings.map((listing) => listing.id);
  const [images, enquiryResult] = await Promise.all([
    getSignedListingImages(supabase, listingIds),
    listingIds.length
      ? supabase
          .from("student_enquiries")
          .select("id, pg_listing_id, message, status, created_at")
          .in("pg_listing_id", listingIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (enquiryResult.error) throw new Error("Unable to load listing enquiries.");

  const publishedCount = ownedListings.filter(
    (listing) =>
      listing.approval_status === "approved" && listing.is_published,
  ).length;
  const pendingCount = ownedListings.filter(
    (listing) => listing.approval_status === "pending",
  ).length;

  return (
    <div className="owner-page">
      <header className="owner-header">
        <Link className="owner-brand" href="/">
          StudentNest <span>Ahmedabad</span>
        </Link>
        <div className="owner-headerActions">
          <Link href="/pgs">View public PGs</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </header>

      <main className="owner-main">
        <section className="owner-welcome">
          <div>
            <p className="owner-eyebrow">PROPERTY OWNER PORTAL</p>
            <h1>Welcome, {profile.full_name}</h1>
            <p>
              Manage your owner application and property listings. Only
              approved and published listings are visible to students.
            </p>
          </div>
          <span className="owner-roleBadge">Owner account</span>
        </section>

        <section className={`owner-application owner-status-${application.status}`}>
          <div>
            <p className="owner-eyebrow">OWNER APPLICATION</p>
            <h2>Application {application.status}</h2>
            <p>
              {application.status === "pending"
                ? "Your application is awaiting administrator review. You can prepare your property details once approved."
                : application.status === "approved"
                  ? "Your owner application is approved. New and edited listings still require review before publication."
                  : "Your application was not approved. Review the reason below and contact StudentNest support if you need help."}
            </p>
            {application.decision_reason && (
              <p className="owner-decisionReason">
                Review reason: {application.decision_reason}
              </p>
            )}
          </div>
          <span className="owner-statusBadge">{application.status}</span>
        </section>

        <section className="owner-stats" aria-label="Listing statistics">
          <article>
            <span>Your listings</span>
            <strong>{ownedListings.length}</strong>
          </article>
          <article>
            <span>Pending review</span>
            <strong>{pendingCount}</strong>
          </article>
          <article>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </article>
        </section>

        <div className="owner-layout">
          <div>
            <section className="owner-card">
              <div className="owner-cardHeading">
                <div>
                  <h2>Owner profile</h2>
                  <p>Details submitted with your application.</p>
                </div>
              </div>
              <dl className="owner-profileDetails">
                <div>
                  <dt>Business / property</dt>
                  <dd>{profile.business_name}</dd>
                </div>
                <div>
                  <dt>Contact name</dt>
                  <dd>{profile.full_name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email}</dd>
                </div>
                <div>
                  <dt>Mobile</dt>
                  <dd>{profile.mobile_number}</dd>
                </div>
                <div className="owner-profileWide">
                  <dt>Address</dt>
                  <dd>{profile.address}</dd>
                </div>
              </dl>
            </section>

            <section className="owner-card">
              <div className="owner-cardHeading">
                <div>
                  <h2>PG listings</h2>
                  <p>
                    New submissions begin pending. Editing or adding photos
                    returns a listing to review.
                  </p>
                </div>
              </div>
              {application.status === "approved" ? (
                <details className="owner-addListing">
                  <summary>Add a PG listing</summary>
                  <ListingForm />
                </details>
              ) : (
                <p className="owner-muted">
                  Listing tools unlock after the owner application is approved.
                </p>
              )}
              {ownedListings.length ? (
                <div className="owner-listingList">
                  {ownedListings.map((listing) => (
                    <OwnerListingCard
                      key={listing.id}
                      listing={listing}
                      photos={images.filter(
                        (image) => image.listing_id === listing.id,
                      )}
                      canManage={application.status === "approved"}
                    />
                  ))}
                </div>
              ) : (
                <div className="owner-emptyState">
                  <strong>No PG listings yet</strong>
                  <p>
                    Your first listing will remain private until reviewed and
                    published.
                  </p>
                </div>
              )}
            </section>
          </div>

          <aside className="owner-card">
            <div className="owner-cardHeading">
              <div>
                <h2>Student enquiries</h2>
                <p>Messages for your property listings.</p>
              </div>
            </div>
            {enquiryResult.data.length ? (
              <div className="owner-enquiryList">
                {enquiryResult.data.map((enquiry) => {
                  const listing = ownedListings.find(
                    (item) => item.id === enquiry.pg_listing_id,
                  );
                  return (
                    <article className="owner-enquiry" key={enquiry.id}>
                      <header>
                        <strong>{listing?.name ?? "PG enquiry"}</strong>
                        <time dateTime={enquiry.created_at}>
                          {new Date(enquiry.created_at).toLocaleDateString(
                            "en-IN",
                          )}
                        </time>
                      </header>
                      <p>{enquiry.message}</p>
                      <small>
                        Status: {enquiry.status.replaceAll("_", " ")}
                      </small>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="owner-emptyState">
                <strong>No enquiries yet</strong>
                <p>Student messages will appear here for your published PGs.</p>
              </div>
            )}
          </aside>
        </div>
        <p className="owner-footer">
          Listings are shown publicly only after administrator approval and
          owner publication. New images are stored in a private bucket.
        </p>
      </main>
    </div>
  );
}

function OwnerListingCard({
  listing,
  photos,
  canManage,
}: {
  listing: PgListing;
  photos: Array<{ id: string; alt_text: string; signedUrl: string }>;
  canManage: boolean;
}) {
  const status =
    listing.approval_status === "approved" && listing.is_published
      ? "published"
      : listing.approval_status;

  return (
    <article className="owner-listing">
      <header className="owner-listingHeader">
        <div>
          <span className={`owner-statusBadge owner-statusBadge-${status}`}>
            {status}
          </span>
          <h3>{listing.name}</h3>
          <p>
            {listing.locality} · {listing.accommodation_type} ·{" "}
            {listing.sharing_type}
          </p>
        </div>
        <strong>₹{listing.monthly_rent.toLocaleString("en-IN")} / month</strong>
      </header>
      <p className="owner-listingDescription">{listing.description}</p>
      <p className="owner-listingAddress">{listing.address}</p>
      {listing.decision_reason && (
        <p className="owner-decisionReason">
          Review reason: {listing.decision_reason}
        </p>
      )}
      {photos.length > 0 && (
        <ListingPhotoStrip photos={photos} />
      )}
      {canManage && listing.approval_status === "approved" && (
        <form className="owner-inlineForm" action={publishListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input
            type="hidden"
            name="published"
            value={listing.is_published ? "false" : "true"}
          />
          <button className="owner-secondaryButton" type="submit">
            {listing.is_published ? "Unpublish" : "Publish approved listing"}
          </button>
        </form>
      )}
      {canManage &&
        listing.approval_status !== "suspended" &&
        listing.approval_status !== "removed" && (
          <details className="owner-editListing">
            <summary>Edit listing and resubmit</summary>
            <ListingForm listing={listing} photos={photos} />
          </details>
        )}
      {canManage && listing.approval_status !== "removed" && (
        <form action={removeListingAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <button className="owner-linkButton" type="submit">
            Remove from public listings
          </button>
          <small>
            This hides the listing and retains its enquiry history.
          </small>
        </form>
      )}
    </article>
  );
}

function ListingPhotoStrip({
  photos,
}: {
  photos: Array<{ id: string; alt_text: string; signedUrl: string }>;
}) {
  return (
    <div className="owner-photoGrid">
      {photos.map((photo) => (
        <div
          className="owner-photoPreview"
          role="img"
          aria-label={photo.alt_text}
          key={photo.id}
          style={{ backgroundImage: `url("${photo.signedUrl}")` }}
        />
      ))}
    </div>
  );
}

export default function OwnerDashboardPage() {
  if (!isSupabaseConfigured()) return <OwnerSetupRequired />;
  return (
    <Suspense fallback={<OwnerDashboardLoading />}>
      <OwnerDashboardContent />
    </Suspense>
  );
}
