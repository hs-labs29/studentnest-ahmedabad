import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import EnquiryForm from "./enquiry-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getSignedListingImages } from "@/lib/owner/listings";
import "./public-listing.css";

export const metadata: Metadata = {
  title: "Approved PG listing | StudentNest Ahmedabad",
};

type ListingPageProps = {
  params: Promise<{ id: string }>;
};

function ListingLoading() {
  return (
    <main className="public-listingMain" aria-live="polite">
      Loading approved listing…
    </main>
  );
}

async function ListingContent({ id }: { id: string }) {
  if (!isUuid(id) || !isSupabaseConfigured()) notFound();

  const supabase = await createClient();
  const { data: listing, error } = await supabase
    .from("pg_listings")
    .select("*")
    .eq("id", id)
    .eq("approval_status", "approved")
    .eq("is_published", true)
    .maybeSingle();

  if (error) throw new Error("Unable to load this PG listing.");
  if (!listing) notFound();

  const photos = await getSignedListingImages(supabase, [listing.id]);

  return (
    <div className="public-listingPage">
      <header className="public-listingHeader">
        <Link href="/" className="public-listingBrand">
          StudentNest <span>Ahmedabad</span>
        </Link>
        <nav>
          <Link href="/pgs">Explore PGs</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </header>
      <main className="public-listingMain">
        <nav className="public-listingBreadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/pgs">Explore PGs</Link>
          <span>/</span>
          <span aria-current="page">{listing.locality}</span>
        </nav>

        <section className="public-listingGallery" aria-label="Property photos">
          {photos.length ? (
            photos.slice(0, 5).map((photo, index) => (
              <div
                className={`public-listingPhoto${index === 0 ? " is-main" : ""}`}
                role="img"
                aria-label={photo.alt_text}
                key={photo.id}
                style={{ backgroundImage: `url("${photo.signedUrl}")` }}
              />
            ))
          ) : (
            <div className="public-listingPhoto is-empty">
              No property photographs available
            </div>
          )}
        </section>

        <section className="public-listingHeading">
          <div>
            <div className="public-listingBadges">
              <span>Approved by StudentNest</span>
              <span>Owner-published</span>
            </div>
            <h1>{listing.name}</h1>
            <p>
              {listing.locality}, Ahmedabad · {listing.accommodation_type}
            </p>
          </div>
          <div className="public-listingPrice">
            <strong>₹{listing.monthly_rent.toLocaleString("en-IN")}</strong>
            <span>per month</span>
          </div>
        </section>

        <div className="public-listingLayout">
          <div className="public-listingDetails">
            <section>
              <p className="public-listingEyebrow">ABOUT THIS PG</p>
              <h2>{listing.name}</h2>
              <p>{listing.description}</p>
            </section>
            <section>
              <p className="public-listingEyebrow">ACCOMMODATION</p>
              <div className="public-listingSpecs">
                <div>
                  <small>Category</small>
                  <strong>{listing.accommodation_type}</strong>
                </div>
                <div>
                  <small>Sharing</small>
                  <strong>{listing.sharing_type}</strong>
                </div>
                <div>
                  <small>Security deposit</small>
                  <strong>
                    ₹{listing.security_deposit.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div>
                  <small>Food</small>
                  <strong>{listing.food_included ? "Included" : "Not included"}</strong>
                </div>
              </div>
            </section>
            <section>
              <p className="public-listingEyebrow">AMENITIES</p>
              <ul className="public-listingAmenities">
                {[
                  ...listing.amenities,
                  ...(listing.food_included ? ["Food"] : []),
                ].map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
                {listing.amenities.length === 0 && !listing.food_included && (
                  <li>No amenities have been listed.</li>
                )}
              </ul>
            </section>
            <section>
              <p className="public-listingEyebrow">ADDRESS</p>
              <h2>Property location</h2>
              <address>{listing.address}</address>
              <p className="public-listingNote">
                Address supplied by the owner; confirm the location directly
                before making arrangements.
              </p>
            </section>
            <section>
              <p className="public-listingEyebrow">HOUSE RULES</p>
              <h2>Owner-provided rules</h2>
              <p className="public-listingRules">{listing.house_rules}</p>
            </section>
          </div>
          <aside className="public-listingAside">
            <div className="public-listingEnquiryCard">
              <p className="public-listingEyebrow">MONTHLY RENT</p>
              <strong>₹{listing.monthly_rent.toLocaleString("en-IN")}</strong>
              <span>Security deposit ₹{listing.security_deposit.toLocaleString("en-IN")}</span>
              <p>
                Listing status was approved by StudentNest and published by its
                owner. Confirm current details before making a decision.
              </p>
              <EnquiryForm listingId={listing.id} />
            </div>
          </aside>
        </div>
      </main>
      <footer className="public-listingFooter">
        <Link href="/">StudentNest Ahmedabad</Link>
        <span>Owner-provided listing details; confirm all arrangements.</span>
      </footer>
    </div>
  );
}

async function ListingRoute({ params }: ListingPageProps) {
  const { id } = await params;
  return <ListingContent id={id} />;
}

export default function PublicListingPage({ params }: ListingPageProps) {
  return (
    <Suspense fallback={<ListingLoading />}>
      <ListingRoute params={params} />
    </Suspense>
  );
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
