"use client";

import {
  AMENITIES,
  LOCALITIES,
  type AccommodationType,
  type Amenity,
} from "../data/sample-pgs";

const accommodationTypes: AccommodationType[] = ["Boys", "Girls", "Co-living"];

interface PgFilterPanelProps {
  locality: string;
  minRent: string;
  maxRent: string;
  accommodationTypes: AccommodationType[];
  amenities: Amenity[];
  onLocalityChange: (value: string) => void;
  onMinRentChange: (value: string) => void;
  onMaxRentChange: (value: string) => void;
  onAccommodationChange: (value: AccommodationType) => void;
  onAmenityChange: (value: Amenity) => void;
  onClear: () => void;
  hasFilters: boolean;
}

export default function PgFilterPanel({
  locality,
  minRent,
  maxRent,
  accommodationTypes: selectedTypes,
  amenities: selectedAmenities,
  onLocalityChange,
  onMinRentChange,
  onMaxRentChange,
  onAccommodationChange,
  onAmenityChange,
  onClear,
  hasFilters,
}: PgFilterPanelProps) {
  return (
    <aside className="pgs-filters" aria-label="Filter PG listings">
      <div className="pgs-filterHeading">
        <div>
          <h2>Filters</h2>
          <p>Find a fit for your budget and routine.</p>
        </div>
        <button
          className="pgs-clearButton"
          type="button"
          onClick={onClear}
          disabled={!hasFilters}
        >
          Clear all
        </button>
      </div>

      <label className="pgs-fieldLabel" htmlFor="pg-locality">
        Ahmedabad locality
      </label>
      <select
        className="pgs-select"
        id="pg-locality"
        value={locality}
        onChange={(event) => onLocalityChange(event.target.value)}
      >
        <option value="">All localities</option>
        {LOCALITIES.map((place) => (
          <option value={place} key={place}>
            {place}
          </option>
        ))}
      </select>

      <fieldset className="pgs-filterGroup">
        <legend>Monthly rent</legend>
        <div className="pgs-rentFields">
          <label>
            <span>Minimum</span>
            <div className="pgs-rentInput">
              <span aria-hidden="true">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                inputMode="numeric"
                aria-label="Minimum monthly rent"
                placeholder="No min"
                value={minRent}
                onChange={(event) => onMinRentChange(event.target.value)}
              />
            </div>
          </label>
          <label>
            <span>Maximum</span>
            <div className="pgs-rentInput">
              <span aria-hidden="true">₹</span>
              <input
                type="number"
                min="0"
                step="500"
                inputMode="numeric"
                aria-label="Maximum monthly rent"
                placeholder="No max"
                value={maxRent}
                onChange={(event) => onMaxRentChange(event.target.value)}
              />
            </div>
          </label>
        </div>
      </fieldset>

      <fieldset className="pgs-filterGroup">
        <legend>Accommodation</legend>
        <div className="pgs-checkList">
          {accommodationTypes.map((option) => (
            <label className="pgs-checkOption" key={option}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(option)}
                onChange={() => onAccommodationChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="pgs-filterGroup">
        <legend>Amenities</legend>
        <div className="pgs-checkList">
          {AMENITIES.map((amenity) => (
            <label className="pgs-checkOption" key={amenity}>
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => onAmenityChange(amenity)}
              />
              <span>{amenity}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        className="pgs-clearButtonMobile"
        type="button"
        onClick={onClear}
        disabled={!hasFilters}
      >
        Clear all filters
      </button>
    </aside>
  );
}
