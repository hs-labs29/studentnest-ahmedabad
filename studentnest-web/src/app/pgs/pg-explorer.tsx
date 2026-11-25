"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import PgCard from "./components/pg-card";
import PgFilterPanel from "./components/pg-filter-panel";
import "./pgs.css";
import {
  SAMPLE_PGS,
  type AccommodationType,
  type Amenity,
} from "./data/sample-pgs";

type SortOrder = "price-asc" | "price-desc";

export default function PgExplorer() {
  const [locality, setLocality] = useState("");
  const [minRent, setMinRent] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [accommodationTypes, setAccommodationTypes] = useState<
    AccommodationType[]
  >([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>("price-asc");

  const filteredPgs = useMemo(() => {
    const min = minRent === "" ? undefined : Number(minRent);
    const max = maxRent === "" ? undefined : Number(maxRent);

    return SAMPLE_PGS.filter((pg) => {
      const matchesLocality = !locality || pg.locality === locality;
      const matchesMin = min === undefined || pg.monthlyRent >= min;
      const matchesMax = max === undefined || pg.monthlyRent <= max;
      const matchesAccommodation =
        accommodationTypes.length === 0 ||
        accommodationTypes.includes(pg.accommodationType);
      const matchesAmenities = amenities.every((amenity) =>
        pg.amenities.includes(amenity),
      );

      return (
        matchesLocality &&
        matchesMin &&
        matchesMax &&
        matchesAccommodation &&
        matchesAmenities
      );
    }).sort((first, second) =>
      sortOrder === "price-asc"
        ? first.monthlyRent - second.monthlyRent
        : second.monthlyRent - first.monthlyRent,
    );
  }, [accommodationTypes, amenities, locality, maxRent, minRent, sortOrder]);

  const hasFilters =
    Boolean(locality || minRent || maxRent) ||
    accommodationTypes.length > 0 ||
    amenities.length > 0 ||
    sortOrder !== "price-asc";

  function toggleAccommodation(value: AccommodationType) {
    setAccommodationTypes((current) =>
      current.includes(value)
        ? current.filter((selected) => selected !== value)
        : [...current, value],
    );
  }

  function toggleAmenity(value: Amenity) {
    setAmenities((current) =>
      current.includes(value)
        ? current.filter((selected) => selected !== value)
        : [...current, value],
    );
  }

  function clearAll() {
    setLocality("");
    setMinRent("");
    setMaxRent("");
    setAccommodationTypes([]);
    setAmenities([]);
    setSortOrder("price-asc");
  }

  return (
    <div className="pgs-pageShell">
      <header className="pgs-siteHeader">
        <div className="pgs-headerInner">
          <Link className="pgs-brand" href="/" aria-label="StudentNest home">
            <span className="pgs-brandMark" aria-hidden="true">
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
            <span className="pgs-brandName">
              StudentNest
              <small>Ahmedabad</small>
            </span>
          </Link>
          <nav className="pgs-navLinks" aria-label="Main navigation">
            <Link className="pgs-activeLink" href="/pgs" aria-current="page">
              Explore PGs
            </Link>
            <Link href="/#services">Services</Link>
            <Link href="/#about">About</Link>
          </nav>
          <Link className="pgs-homeLink" href="/">
            Back to home <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <main className="w-full flex-1">
        <section className="pgs-hero">
          <div className="pgs-heroInner">
            <div className="pgs-heroCopy">
              <p className="pgs-eyebrow">
                <span aria-hidden="true" />
                YOUR AHMEDABAD SEARCH STARTS HERE
              </p>
              <h1>
                A place to stay.
                <br />
                <span>A place to belong.</span>
              </h1>
              <p className="pgs-heroDescription">
                Explore student-friendly PG options across the city. Set your
                budget, choose what matters, and see what fits.
              </p>
              <p className="pgs-sampleNotice">
                <strong>Sample experience.</strong> Listings, rents, facilities,
                and photos are illustrative only—not real properties or live
                availability.
              </p>
            </div>
            <div
              className="pgs-heroImage"
              role="img"
              aria-label="Representative stock photo of a welcoming shared living room"
            >
              <span className="pgs-heroImageBadge">A new city, a fresh start</span>
            </div>
          </div>
        </section>

        <section className="pgs-discovery" aria-labelledby="results-heading">
          <div className="pgs-resultsHeading">
            <div>
              <p className="pgs-eyebrow">MADE FOR STUDENT LIFE</p>
              <h2 id="results-heading">Explore sample PG stays</h2>
              <p className="pgs-resultsCount" aria-live="polite">
                {filteredPgs.length} sample{" "}
                {filteredPgs.length === 1 ? "stay" : "stays"} to explore
              </p>
            </div>
            <label className="pgs-sortControl">
              <span>Sort by</span>
              <select
                aria-label="Sort sample PGs by rent"
                value={sortOrder}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "price-asc" || value === "price-desc") {
                    setSortOrder(value);
                  }
                }}
              >
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="pgs-discoveryLayout">
            <PgFilterPanel
              locality={locality}
              minRent={minRent}
              maxRent={maxRent}
              accommodationTypes={accommodationTypes}
              amenities={amenities}
              onLocalityChange={setLocality}
              onMinRentChange={setMinRent}
              onMaxRentChange={setMaxRent}
              onAccommodationChange={toggleAccommodation}
              onAmenityChange={toggleAmenity}
              onClear={clearAll}
              hasFilters={hasFilters}
            />

            {filteredPgs.length > 0 ? (
              <div className="pgs-listingGrid">
                {filteredPgs.map((pg) => (
                  <PgCard key={pg.id} pg={pg} />
                ))}
              </div>
            ) : (
              <div className="pgs-emptyState" aria-live="polite">
                <span className="pgs-emptyIcon" aria-hidden="true">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>
                </span>
                <h3>No sample stays match those filters.</h3>
                <p>Try widening your rent range or removing a filter.</p>
                <button type="button" onClick={clearAll}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="pgs-footer">
        <div className="pgs-footerInner">
          <Link className="pgs-footerBrand" href="/">
            StudentNest <span>Ahmedabad</span>
          </Link>
          <p>
            Sample data for preview only. Properties, prices, amenities, and
            photographs are not verified; no availability is represented.
          </p>
          <span>Made with care for students finding their way.</span>
        </div>
      </footer>
    </div>
  );
}
