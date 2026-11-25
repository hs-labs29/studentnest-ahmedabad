"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

type IconName =
  | "arrow"
  | "bed"
  | "check"
  | "heart"
  | "home"
  | "key"
  | "map"
  | "pin"
  | "search"
  | "shield"
  | "spark"
  | "wifi";

const iconArtwork: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  bed: (
    <>
      <path d="M3 19v-8m18 8v-5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3" />
      <path d="M5 11V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v4m0 0V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3M3 16h18" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v12h14V9M9 21v-7h6v7" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="5" />
      <path d="m11.5 11.5 8-8 2 2-2 2 2 2-3 3-2-2-3.5 3.5" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z" />
      <path d="M9 3v15m6-12v15" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" />
      <path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1 1-2.5Z" />
    </>
  ),
  wifi: (
    <>
      <path d="M5 12.5a11 11 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0M12 20h.01" />
    </>
  ),
};

function Icon({
  name,
  size = 20,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconArtwork[name]}
    </svg>
  );
}

const listings = [
  {
    name: "The Courtyard House",
    area: "Navrangpura",
    type: "PG",
    rent: 8500,
    gender: "Girls",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85",
    facilities: ["Meals included", "Wi-Fi", "Housekeeping"],
  },
  {
    name: "Olive & Oak Residence",
    area: "Vastrapur",
    type: "Hostel",
    rent: 12000,
    gender: "Co-living",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85",
    facilities: ["Study lounge", "AC rooms", "24/7 security"],
  },
  {
    name: "The Sunday Studio",
    area: "Satellite",
    type: "Flat",
    rent: 16500,
    gender: "Private room",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1100&q=85",
    facilities: ["Furnished", "Kitchen access", "Balcony"],
  },
];

const areas = ["Navrangpura", "Vastrapur", "Satellite", "Thaltej", "Chandkheda"];

const services = [
  {
    icon: "home" as const,
    title: "Find your people",
    description:
      "Meet compatible roommates and settle into a place that feels like yours.",
    label: "Roommate matching",
    color: "sage",
  },
  {
    icon: "spark" as const,
    title: "Good food, sorted",
    description:
      "Discover reliable tiffin services serving fresh, homestyle meals nearby.",
    label: "Tiffin & meals",
    color: "peach",
  },
  {
    icon: "check" as const,
    title: "One less thing to do",
    description:
      "Find trusted laundry and housekeeping services around your new home.",
    label: "Laundry & care",
    color: "lavender",
  },
  {
    icon: "map" as const,
    title: "Get around with ease",
    description:
      "Explore convenient transport options for campus, work, and weekends.",
    label: "Local transport",
    color: "blue",
  },
];

function Brand() {
  return (
    <a className="brand" href="#" aria-label="StudentNest Ahmedabad home">
      <span className="brand-mark">
        <Icon name="home" size={20} />
      </span>
      <span className="brand-name">
        StudentNest<span>Ahmedabad</span>
      </span>
    </a>
  );
}

function ListingCard({ listing }: { listing: (typeof listings)[number] }) {
  return (
    <article className="listing-card">
      <div
        className="listing-photo"
        role="img"
        aria-label={`Sample photo of a ${listing.type.toLowerCase()} in ${listing.area}`}
        style={{ backgroundImage: `url("${listing.image}")` }}
      >
        <span className="sample-label">Sample photo</span>
        <span className="photo-tag">{listing.gender}</span>
        <span className="heart-mark" aria-hidden="true">
          <Icon name="heart" size={17} />
        </span>
      </div>
      <div className="listing-body">
        <div className="listing-location">
          <span>
            <Icon name="pin" size={14} />
            {listing.area}, Ahmedabad
          </span>
          <span className="rating">★ {listing.rating}</span>
        </div>
        <div className="listing-title-row">
          <h3>{listing.name}</h3>
          <span className="type-pill">{listing.type}</span>
        </div>
        <div className="facility-list">
          {listing.facilities.map((facility) => (
            <span key={facility}>{facility}</span>
          ))}
        </div>
        <div className="listing-bottom">
          <p>
            <strong>₹{listing.rent.toLocaleString("en-IN")}</strong>
            <span> / month</span>
          </p>
          <details className="sample-details">
            <summary>View sample</summary>
            <p>
              Example listing for demonstration. Details and availability
              haven&apos;t been verified.
            </p>
          </details>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [area, setArea] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    area: "",
    type: "",
    budget: "",
  });
  const [hasSearched, setHasSearched] = useState(false);

  const filteredListings = useMemo(
    () =>
      listings.filter((listing) => {
        const matchesArea =
          !appliedFilters.area || listing.area === appliedFilters.area;
        const matchesType =
          !appliedFilters.type || listing.type === appliedFilters.type;
        const matchesBudget =
          !appliedFilters.budget || listing.rent <= Number(appliedFilters.budget);
        return matchesArea && matchesType && matchesBudget;
      }),
    [appliedFilters],
  );

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedFilters({ area, type, budget });
    setHasSearched(true);
    document.getElementById("stays")?.scrollIntoView({ behavior: "smooth" });
  }

  function chooseArea(selectedArea: string) {
    setArea(selectedArea);
    setAppliedFilters({ area: selectedArea, type, budget });
    setHasSearched(true);
    document.getElementById("stays")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav className="nav-links" aria-label="Main navigation">
            <Link href="/pgs">Explore PGs</Link>
            <a href="#services">Services</a>
            <a href="#about">About</a>
          </nav>
          <div className="header-actions">
            <Link className="login-link" href="/login">
              Log in <Icon name="arrow" size={15} />
            </Link>
            <Link className="signup-link" href="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full flex-1">
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                YOUR NEXT CHAPTER STARTS HERE
              </span>
              <h1>
                Find Your Perfect Student Home in{" "}
                <span>Ahmedabad.</span>
              </h1>
              <p className="hero-description">
                New city, new beginnings. Find a place to stay, people to share
                it with, and everything you need to feel at home.
              </p>
              <div className="hero-trust">
                <div className="avatar-stack" aria-hidden="true">
                  <span>R</span>
                  <span>A</span>
                  <span>M</span>
                  <span>S</span>
                </div>
                <p>
                  <strong>A little help goes a long way.</strong>
                  <span>Made for students, by people who get it.</span>
                </p>
              </div>
            </div>
            <div className="hero-visual">
              <div
                className="hero-photo"
                role="img"
                aria-label="Sample photo of a bright, welcoming student apartment"
              />
              <div className="hero-photo-note">
                <span className="note-icon">
                  <Icon name="key" size={20} />
                </span>
                <span>
                  <strong>A softer landing</strong>
                  <small>Your Ahmedabad story starts here</small>
                </span>
              </div>
              <span className="hero-floating-tag">
                <Icon name="spark" size={15} />
                Made for student life
              </span>
              <span className="hero-image-caption">A sample of what home can feel like</span>
            </div>
          </div>

          <form className="search-panel" onSubmit={applySearch}>
            <label className="search-field">
              <span className="field-icon">
                <Icon name="pin" />
              </span>
              <span className="field-content">
                <span className="field-label">Where in Ahmedabad?</span>
                <select
                  aria-label="Choose a neighborhood"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                >
                  <option value="">All neighborhoods</option>
                  {areas.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
              </span>
            </label>
            <label className="search-field">
              <span className="field-icon">
                <Icon name="bed" />
              </span>
              <span className="field-content">
                <span className="field-label">Type of stay</span>
                <select
                  aria-label="Choose an accommodation type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                >
                  <option value="">Any accommodation</option>
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Flat">Flat</option>
                </select>
              </span>
            </label>
            <label className="search-field search-budget">
              <span className="field-icon">
                <span className="rupee-icon">₹</span>
              </span>
              <span className="field-content">
                <span className="field-label">Monthly budget</span>
                <select
                  aria-label="Choose a monthly budget"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                >
                  <option value="">Any budget</option>
                  <option value="10000">Up to ₹10,000</option>
                  <option value="15000">Up to ₹15,000</option>
                  <option value="20000">Up to ₹20,000</option>
                </select>
              </span>
            </label>
            <button className="search-button" type="submit">
              <Icon name="search" size={18} />
              Find a place
            </button>
            <p className="search-disclaimer">
              Try the filters with our sample stays — no live listings yet.
            </p>
          </form>
        </section>

        <section className="areas-section section-wrap">
          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow">GET TO KNOW THE CITY</span>
              <h2>Find your kind of neighborhood.</h2>
            </div>
            <p>
              Five student-favorite corners of Ahmedabad, each with a little
              something of its own.
            </p>
          </div>
          <div className="area-list" aria-label="Popular Ahmedabad areas">
            {areas.map((place, index) => (
              <button
                className={`area-chip${area === place ? " is-selected" : ""}`}
                key={place}
                type="button"
                aria-pressed={area === place}
                onClick={() => chooseArea(place)}
              >
                <span className={`area-number area-number-${index + 1}`}>
                  0{index + 1}
                </span>
                {place}
                <Icon name="arrow" size={15} />
              </button>
            ))}
          </div>
        </section>

        <section className="stays-section section-wrap" id="stays">
          <div className="section-heading">
            <div>
              <span className="eyebrow">A GOOD PLACE TO BEGIN</span>
              <h2>Stays worth settling into.</h2>
            </div>
            <a className="text-link" href="#services">
              Explore student services <Icon name="arrow" size={16} />
            </a>
          </div>
          <div className="stays-note">
            <span className="sample-dot" />
            Sample listings for demonstration · Prices and details are examples
          </div>
          {filteredListings.length > 0 ? (
            <div className="listing-grid grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.name} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="empty-results" aria-live="polite">
              <span className="empty-icon">
                <Icon name="search" size={24} />
              </span>
              <h3>No sample stays match those filters yet.</h3>
              <p>
                {hasSearched
                  ? "Try another area, stay type, or budget to explore the examples."
                  : "Choose another filter to explore the sample stays."}
              </p>
              <button
                className="clear-filters"
                type="button"
                onClick={() => {
                  setArea("");
                  setType("");
                  setBudget("");
                  setAppliedFilters({ area: "", type: "", budget: "" });
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          {filteredListings.length > 0 && hasSearched && (
            <p className="results-note" aria-live="polite">
              Showing {filteredListings.length} sample{" "}
              {filteredListings.length === 1 ? "stay" : "stays"} to help you
              explore.
            </p>
          )}
        </section>

        <section className="about-section" id="about">
          <div className="about-inner section-wrap">
            <div className="about-copy">
              <span className="eyebrow eyebrow-light">MORE THAN FOUR WALLS</span>
              <h2>
                Moving cities is a lot.
                <br />
                Finding home shouldn&apos;t be.
              </h2>
              <p>
                From your first room search to your first home-cooked meal,
                StudentNest brings the little big things of student life into
                one friendly place.
              </p>
              <a className="about-link" href="#services">
                See how we help <Icon name="arrow" size={16} />
              </a>
            </div>
            <div className="about-points">
              <div className="about-point">
                <span className="point-icon">
                  <Icon name="shield" size={21} />
                </span>
                <div>
                  <h3>Feel more confident</h3>
                  <p>Clear information helps you know what to ask and look for.</p>
                </div>
              </div>
              <div className="about-point">
                <span className="point-icon">
                  <Icon name="heart" size={20} />
                </span>
                <div>
                  <h3>Find your people</h3>
                  <p>Explore stays and services around student-friendly areas.</p>
                </div>
              </div>
              <div className="about-point">
                <span className="point-icon">
                  <Icon name="spark" size={20} />
                </span>
                <div>
                  <h3>Settle in, your way</h3>
                  <p>Make the new city feel a little more familiar, one day at a time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section section-wrap" id="services">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE LITTLE THINGS, TAKEN CARE OF</span>
              <h2>Student life, made a bit lighter.</h2>
            </div>
            <p>
              It takes more than a room to feel at home. Start with the
              essentials that make a city yours.
            </p>
          </div>
          <div className="service-grid grid">
            {services.map((service) => (
              <article className="service-card" key={service.title}>
                <span className={`service-icon ${service.color}`}>
                  <Icon name={service.icon} size={22} />
                </span>
                <span className="service-label">{service.label}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <a href="#contact" aria-label={`Learn about ${service.label}`}>
                  <Icon name="arrow" size={16} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-section">
          <div className="closing-inner">
            <div className="closing-mark">
              <Icon name="home" size={22} />
            </div>
            <p className="eyebrow">AHMEDABAD IS WAITING</p>
            <h2>Let&apos;s make it feel like home.</h2>
            <p className="closing-copy">
              Your next chapter deserves a good beginning.
            </p>
            <a className="closing-button" href="#stays">
              Explore student stays <Icon name="arrow" size={17} />
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-main section-wrap">
          <div className="footer-brand">
            <Brand />
            <p>
              Helping students find their footing, their people, and their
              place in Ahmedabad.
            </p>
          </div>
          <div className="footer-column">
            <h3>Explore</h3>
            <a href="#stays">Student stays</a>
            <a href="#services">Local services</a>
            <a href="#about">Why StudentNest</a>
          </div>
          <div className="footer-column">
            <h3>Popular areas</h3>
            {areas.slice(0, 3).map((place) => (
              <a
                href="#stays"
                key={place}
                onClick={() => {
                  setArea(place);
                  setAppliedFilters({ area: place, type, budget });
                  setHasSearched(true);
                }}
              >
                {place}
              </a>
            ))}
          </div>
          <div className="footer-note">
            <span className="footer-note-icon">
              <Icon name="wifi" size={20} />
            </span>
            <p>
              <strong>Just getting started</strong>
              This is a preview with sample listings. Real stays and services
              are coming soon.
            </p>
          </div>
        </div>
        <div className="footer-bottom section-wrap">
          <span>© StudentNest Ahmedabad</span>
          <span>Made with care for students finding their way.</span>
        </div>
      </footer>
    </>
  );
}
