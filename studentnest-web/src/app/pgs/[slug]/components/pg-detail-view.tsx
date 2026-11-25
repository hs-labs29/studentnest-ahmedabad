import Link from "next/link";
import ContactActions from "./contact-actions";
import PhotoGallery from "./photo-gallery";
import type { SamplePg } from "../../data/sample-pgs";
import {
  SAMPLE_HOUSE_RULES,
  type SamplePgDetails,
  type SamplePhoto,
} from "../../data/sample-pg-details";

type DetailFacility =
  | "Wi-Fi"
  | "AC"
  | "Food"
  | "Laundry"
  | "Washing machine"
  | "Attached bathroom"
  | "Parking";

const detailFacilities: DetailFacility[] = [
  "Wi-Fi",
  "AC",
  "Food",
  "Laundry",
  "Washing machine",
  "Attached bathroom",
  "Parking",
];

function isIncluded(
  facility: DetailFacility,
  pg: SamplePg,
  details: SamplePgDetails,
) {
  if (facility === "Washing machine" || facility === "Parking") {
    return details.additionalFacilities.includes(facility);
  }
  return pg.amenities.includes(facility);
}

export default function PgDetailView({
  pg,
  details,
  initialSaved,
}: {
  pg: SamplePg;
  details: SamplePgDetails;
  initialSaved: boolean;
}) {
  const photos: SamplePhoto[] = [
    {
      src: pg.image,
      label: "Representative sample living area",
    },
    ...details.additionalPhotos.filter(
      (photo) => photo.src.split("?")[0] !== pg.image.split("?")[0],
    ),
  ];
  const monthlyEstimate = pg.monthlyRent + details.utilitiesEstimate;

  return (
    <div className="pgd-page">
      <header className="pgd-header">
        <div className="pgd-headerInner">
          <Link className="pgd-brand" href="/" aria-label="StudentNest home">
            <span className="pgd-brandMark" aria-hidden="true">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v12h14V9M9 21v-7h6v7" />
              </svg>
            </span>
            <span className="pgd-brandText">
              StudentNest
              <small>Ahmedabad</small>
            </span>
          </Link>
          <nav className="pgd-nav" aria-label="Main navigation">
            <Link href="/pgs">Explore PGs</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#about">About</Link>
          </nav>
          <Link className="pgd-backLink" href="/pgs">
            All sample stays <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <main className="pgd-main">
        <nav className="pgd-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/pgs">Explore PGs</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{pg.locality}</span>
        </nav>

        <PhotoGallery title={details.name} photos={photos} />

        <div className="pgd-titleBlock">
          <div>
            <div className="pgd-titleBadges">
              <span className="pgd-sampleBadge">Sample listing</span>
              <span className="pgd-verifiedNotice">Details not verified</span>
            </div>
            <h1>{details.name}</h1>
            <p className="pgd-locality">
              <span aria-hidden="true">⌖</span>
              {pg.locality}, Ahmedabad, Gujarat
              <span className="pgd-localityNote">· locality only</span>
            </p>
          </div>
          <div className="pgd-priceSummary">
            <strong>₹{pg.monthlyRent.toLocaleString("en-IN")}</strong>
            <span>/ month · sample rent</span>
          </div>
        </div>

        <p className="pgd-demoDisclaimer">
          This is a demonstration listing. Rent, occupancy, facilities, house
          rules, and photos are illustrative only; no property or availability
          is being represented.
        </p>

        <div className="pgd-detailLayout">
          <div className="pgd-detailMain">
            <section className="pgd-section pgd-overview">
              <div className="pgd-sectionHeading">
                <p className="pgd-eyebrow">THE BASICS</p>
                <h2>A little more about this stay</h2>
              </div>
              <div className="pgd-overviewGrid">
                <div className="pgd-overviewItem">
                  <span className="pgd-overviewIcon" aria-hidden="true">
                    ◈
                  </span>
                  <span>
                    <small>Accommodation</small>
                    <strong>{pg.accommodationType}</strong>
                  </span>
                </div>
                <div className="pgd-overviewItem">
                  <span className="pgd-overviewIcon" aria-hidden="true">
                    ⌂
                  </span>
                  <span>
                    <small>Sharing type</small>
                    <strong>{pg.roomType}</strong>
                  </span>
                </div>
                <div className="pgd-overviewItem">
                  <span className="pgd-overviewIcon" aria-hidden="true">
                    ♧
                  </span>
                  <span>
                    <small>Occupancy · sample only</small>
                    <strong>{details.occupancyExample}</strong>
                  </span>
                </div>
                <div className="pgd-overviewItem">
                  <span className="pgd-overviewIcon" aria-hidden="true">
                    ◷
                  </span>
                  <span>
                    <small>Security deposit · sample</small>
                    <strong>
                      ₹{details.securityDeposit.toLocaleString("en-IN")}
                    </strong>
                  </span>
                </div>
              </div>
            </section>

            <section className="pgd-section">
              <div className="pgd-sectionHeading">
                <p className="pgd-eyebrow">COMFORTS & ESSENTIALS</p>
                <h2>Facilities in this sample</h2>
                <p>
                  Status shown is illustrative and has not been confirmed for a
                  real property.
                </p>
              </div>
              <ul className="pgd-facilityGrid">
                {detailFacilities.map((facility) => {
                  const included = isIncluded(facility, pg, details);
                  return (
                    <li
                      className={`pgd-facility${included ? " is-included" : " is-unavailable"}`}
                      key={facility}
                    >
                      <span className="pgd-facilityIcon" aria-hidden="true">
                        {included ? "✓" : "—"}
                      </span>
                      <span>{facility}</span>
                      <small>
                        {included ? "Included · sample" : "Unavailable · sample"}
                      </small>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="pgd-section">
              <div className="pgd-sectionHeading">
                <p className="pgd-eyebrow">GOOD TO KNOW</p>
                <h2>Sample rent breakdown</h2>
                <p>
                  Example prices only. Actual charges and deposit terms are
                  unconfirmed.
                </p>
              </div>
              <div className="pgd-rentBreakdown">
                <div>
                  <span>Monthly room rent · sample</span>
                  <strong>₹{pg.monthlyRent.toLocaleString("en-IN")}</strong>
                </div>
                <div>
                  <span>Utilities estimate · sample</span>
                  <strong>
                    ₹{details.utilitiesEstimate.toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="pgd-rentTotal">
                  <span>Estimated monthly total · sample</span>
                  <strong>₹{monthlyEstimate.toLocaleString("en-IN")}</strong>
                </div>
                <div className="pgd-depositLine">
                  <span>One-time security deposit · sample</span>
                  <strong>
                    ₹{details.securityDeposit.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </section>

            <section className="pgd-section">
              <div className="pgd-sectionHeading">
                <p className="pgd-eyebrow">AROUND THE NEIGHBORHOOD</p>
                <h2>Locality & address</h2>
              </div>
              <div className="pgd-addressCard">
                <div>
                  <span className="pgd-addressIcon" aria-hidden="true">
                    ⌖
                  </span>
                  <div>
                    <small>Locality-only sample address</small>
                    <address>{pg.locality}, Ahmedabad, Gujarat</address>
                  </div>
                </div>
                <p>
                  No street address or exact property coordinates are provided
                  for this sample listing.
                </p>
              </div>
              <div
                className="pgd-mapPreview"
                role="img"
                aria-label={`Illustrative, approximate area map for ${pg.locality}, Ahmedabad; no property pin or coordinates`}
              >
                <span className="pgd-mapLabel">Approximate area preview</span>
                <span className="pgd-mapLocality">{pg.locality}</span>
                <span className="pgd-mapFootnote">
                  Illustrative map · not a property location
                </span>
              </div>
            </section>

            <section className="pgd-section pgd-rulesSection">
              <div className="pgd-sectionHeading">
                <p className="pgd-eyebrow">BEFORE YOU SETTLE IN</p>
                <h2>House rules to confirm</h2>
                <p>
                  These are unconfirmed examples and prompts—not rules for a
                  real property.
                </p>
              </div>
              <ul className="pgd-rulesList">
                {SAMPLE_HOUSE_RULES.map((rule) => (
                  <li key={rule.title}>
                    <span className="pgd-ruleMark" aria-hidden="true">
                      !
                    </span>
                    <span>
                      <strong>{rule.title}</strong>
                      <small>{rule.example}</small>
                    </span>
                    <em>Sample</em>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="pgd-sidebar" aria-label="Sample price and contact">
            <div className="pgd-bookingCard">
              <p className="pgd-eyebrow">ILLUSTRATIVE PRICING</p>
              <p className="pgd-sidebarPrice">
                <strong>₹{pg.monthlyRent.toLocaleString("en-IN")}</strong>
                <span>/ month</span>
              </p>
              <p className="pgd-sidebarNote">
                Sample rent only; availability is not known.
              </p>
              <div className="pgd-sidebarDeposit">
                <span>Sample security deposit</span>
                <strong>₹{details.securityDeposit.toLocaleString("en-IN")}</strong>
              </div>
              <ContactActions
                pgSlug={pg.id}
                listingName={details.name}
                locality={pg.locality}
                monthlyRent={pg.monthlyRent}
                initialSaved={initialSaved}
              />
            </div>
            <div className="pgd-sideNote">
              <span aria-hidden="true">✦</span>
              <p>
                <strong>New to Ahmedabad?</strong>
                Explore the sample stays and services available in the city.
                <Link href="/pgs">Browse all sample PGs</Link>
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="pgd-footer">
        <div>
          <Link href="/">StudentNest Ahmedabad</Link>
          <p>Sample accommodation details for demonstration only.</p>
        </div>
        <Link href="/pgs">Back to PG discovery</Link>
      </footer>
    </div>
  );
}
