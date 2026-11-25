import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  logoutAction,
  toggleSavedPgAction,
} from "@/lib/auth/actions";
import { requireStudentSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SAMPLE_PGS } from "@/app/pgs/data/sample-pgs";
import ProfileForm from "./profile-form";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Student dashboard | StudentNest Ahmedabad",
};

function DashboardLoading() {
  return (
    <main className="dash-main" aria-live="polite">
      Loading your student dashboard…
    </main>
  );
}

function SetupRequired() {
  return (
    <main className="dash-setup">
      <h1>StudentNest account setup required</h1>
      <p>
        Configure Supabase and apply the student profile migration before
        accessing a dashboard.
      </p>
      <Link href="/login">Go to log in</Link>
    </main>
  );
}

async function DashboardContent() {
  const { supabase, profile } = await requireStudentSession();
  const [savedResult, enquiryResult] = await Promise.all([
    supabase
      .from("student_saved_pgs")
      .select("pg_slug, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_enquiries")
      .select("id, pg_slug, pg_listing_id, message, status, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  if (savedResult.error || enquiryResult.error) {
    throw new Error("Unable to load your student dashboard data.");
  }

  const ownerListingIds = [
    ...new Set(
      (enquiryResult.data ?? [])
        .flatMap((enquiry) => enquiry.pg_listing_id)
        .filter((listingId): listingId is string => Boolean(listingId)),
    ),
  ];
  const ownerListingsResult =
    ownerListingIds.length > 0
      ? await supabase
          .from("pg_listings")
          .select("id, name, locality")
          .in("id", ownerListingIds)
      : { data: [], error: null };
  if (ownerListingsResult.error) {
    throw new Error("Unable to load the PG listing details for your enquiries.");
  }
  const ownerListings = new Map(
    (ownerListingsResult.data ?? []).map((listing) => [
      listing.id,
      listing,
    ]),
  );

  const savedPgs = (savedResult.data ?? []).flatMap((saved) => {
    const pg = SAMPLE_PGS.find((samplePg) => samplePg.id === saved.pg_slug);
    return pg ? [{ saved, pg }] : [];
  });

  return (
    <div className="dash-page">
      <header className="dash-header">
        <Link className="dash-brand" href="/">
          StudentNest Ahmedabad
        </Link>
        <div className="dash-headerActions">
          <Link href="/pgs">Explore sample PGs</Link>
          <form action={logoutAction}>
            <button type="submit">Log out</button>
          </form>
        </div>
      </header>
      <main className="dash-main">
        <section className="dash-welcome">
          <div>
            <p className="dash-eyebrow">YOUR STUDENT DASHBOARD</p>
            <h1>Welcome, {profile.full_name}</h1>
            <p>Manage your profile and saved Ahmedabad sample stays.</p>
          </div>
          <span className="dash-roleBadge">Student account</span>
        </section>

        <div className="dash-grid">
          <div>
            <section className="dash-card">
              <div className="dash-cardHeading">
                <div>
                  <h2>Student profile</h2>
                  <p>Your profile is visible only to your authenticated account.</p>
                </div>
              </div>
              <ProfileForm profile={profile} />
            </section>

            <section className="dash-card">
              <div className="dash-cardHeading">
                <div>
                  <h2>Saved PGs</h2>
                  <p>Your sample favourites are stored in your own account.</p>
                </div>
              </div>
              {savedPgs.length ? (
                <div className="dash-savedList">
                  {savedPgs.map(({ saved, pg }) => (
                    <article className="dash-savedItem" key={saved.pg_slug}>
                      <Link
                        className="dash-savedPhoto"
                        href={`/pgs/${pg.id}`}
                        aria-label={`View sample PG in ${pg.locality}`}
                        style={{ backgroundImage: `url("${pg.image}")` }}
                      />
                      <div className="dash-savedInfo">
                        <Link href={`/pgs/${pg.id}`}>
                          Sample PG · {pg.id.slice(-2)}
                        </Link>
                        <p>
                          {pg.locality}, Ahmedabad · {pg.roomType}
                        </p>
                        <strong>
                          ₹{pg.monthlyRent.toLocaleString("en-IN")} / month ·
                          sample rent
                        </strong>
                      </div>
                      <form className="dash-removeForm" action={toggleSavedPgAction}>
                        <input type="hidden" name="pgSlug" value={pg.id} />
                        <input type="hidden" name="intent" value="remove" />
                        <button className="dash-removeButton" type="submit">
                          Remove
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="dash-emptyState">
                  <strong>No saved PGs yet</strong>
                  <p>
                    Save a sample stay from its detail page to keep it here.
                  </p>
                  <Link href="/pgs">Explore sample PGs</Link>
                </div>
              )}
            </section>
          </div>

          <aside>
            <section className="dash-card">
              <div className="dash-cardHeading">
                <div>
                  <h2>Enquiries</h2>
                  <p>Messages linked to your StudentNest account.</p>
                </div>
              </div>
              {enquiryResult.data?.length ? (
                <div className="dash-enquiryList">
                  {enquiryResult.data.map((enquiry) => {
                    const pg = SAMPLE_PGS.find(
                      (samplePg) => samplePg.id === enquiry.pg_slug,
                    );
                    const ownerListing = enquiry.pg_listing_id
                      ? ownerListings.get(enquiry.pg_listing_id)
                      : undefined;
                    return (
                      <article className="dash-enquiry" key={enquiry.id}>
                        <header>
                          <strong>
                            {pg
                              ? `Sample PG · ${pg.id.slice(-2)}`
                              : ownerListing?.name ?? "Previously viewed PG"}
                          </strong>
                          <time dateTime={enquiry.created_at}>
                            {new Date(enquiry.created_at).toLocaleDateString(
                              "en-IN",
                            )}
                          </time>
                        </header>
                        {ownerListing && (
                          <Link href={`/pgs/listings/${ownerListing.id}`}>
                            {ownerListing.locality}, Ahmedabad
                          </Link>
                        )}
                        <p>{enquiry.message}</p>
                        <small>Status: {enquiry.status.replaceAll("_", " ")}</small>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="dash-emptyState">
                  <strong>No enquiries yet</strong>
                  <p>
                    Contact actions are disabled for sample listings until
                    verified owner contacts are available.
                  </p>
                </div>
              )}
            </section>
          </aside>
        </div>
        <p className="dash-footer">
          PG names, rent, facilities, photos, and availability are illustrative
          sample data.
        </p>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  if (!isSupabaseConfigured()) return <SetupRequired />;
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}
