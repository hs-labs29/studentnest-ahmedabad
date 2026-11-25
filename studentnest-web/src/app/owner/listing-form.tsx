"use client";

import { useActionState } from "react";
import { LOCALITIES } from "@/app/pgs/data/sample-pgs";
import type {
  ListingAmenity,
  PgListing,
  PgListingImage,
} from "@/lib/supabase/database.types";
import { EMPTY_FORM_STATE } from "@/lib/auth/types";
import FormFeedback from "../(auth)/components/form-feedback";
import { removeListingImageAction, saveListingAction } from "@/lib/owner/actions";

const accommodationTypes = ["Boys", "Girls", "Co-living"] as const;
const sharingTypes = [
  "Single",
  "Double sharing",
  "Triple sharing",
  "Four sharing",
  "Private room",
] as const;
const amenities: ListingAmenity[] = [
  "Wi-Fi",
  "AC",
  "Laundry",
  "Washing machine",
  "Attached bathroom",
  "Parking",
];

type ListingPhoto = Pick<PgListingImage, "id" | "alt_text"> & {
  signedUrl: string;
};

export default function ListingForm({
  listing,
  photos = [],
}: {
  listing?: PgListing;
  photos?: ListingPhoto[];
}) {
  const [state, formAction, pending] = useActionState(
    saveListingAction,
    EMPTY_FORM_STATE,
  );
  const prefix = listing ? `listing-${listing.id}` : "new-listing";

  return (
    <div className="owner-formWrap">
      {photos.length > 0 && (
        <div className="owner-photoGrid">
          {photos.map((photo) => (
            <article className="owner-photoItem" key={photo.id}>
              <div
                className="owner-photoPreview"
                role="img"
                aria-label={photo.alt_text}
                style={{ backgroundImage: `url("${photo.signedUrl}")` }}
              />
              <form action={removeListingImageAction}>
                <input type="hidden" name="imageId" value={photo.id} />
                <button className="owner-linkButton" type="submit">
                  Remove photo
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
      <form className="owner-listingForm" action={formAction}>
        {listing && (
          <input type="hidden" name="listingId" value={listing.id} />
        )}
        <div className="owner-formGrid">
          <div className="owner-field">
            <label htmlFor={`${prefix}-name`}>PG name</label>
            <input
              id={`${prefix}-name`}
              name="name"
              defaultValue={listing?.name}
              minLength={3}
              maxLength={120}
              required
            />
          </div>
          <div className="owner-field">
            <label htmlFor={`${prefix}-locality`}>Ahmedabad locality</label>
            <select
              id={`${prefix}-locality`}
              name="locality"
              defaultValue={listing?.locality ?? ""}
              required
            >
              <option value="" disabled>
                Choose a locality
              </option>
              {LOCALITIES.map((locality) => (
                <option key={locality} value={locality}>
                  {locality}
                </option>
              ))}
            </select>
          </div>
          <div className="owner-field owner-fieldWide">
            <label htmlFor={`${prefix}-description`}>Description</label>
            <textarea
              id={`${prefix}-description`}
              name="description"
              defaultValue={listing?.description}
              minLength={20}
              maxLength={4000}
              rows={4}
              required
            />
          </div>
          <div className="owner-field owner-fieldWide">
            <label htmlFor={`${prefix}-address`}>Property address</label>
            <textarea
              id={`${prefix}-address`}
              name="address"
              defaultValue={listing?.address}
              autoComplete="street-address"
              minLength={8}
              maxLength={300}
              rows={2}
              required
            />
          </div>
          <div className="owner-field">
            <label htmlFor={`${prefix}-category`}>Accommodation category</label>
            <select
              id={`${prefix}-category`}
              name="accommodationType"
              defaultValue={listing?.accommodation_type ?? ""}
              required
            >
              <option value="" disabled>
                Choose a category
              </option>
              {accommodationTypes.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="owner-field">
            <label htmlFor={`${prefix}-sharing`}>Sharing type</label>
            <select
              id={`${prefix}-sharing`}
              name="sharingType"
              defaultValue={listing?.sharing_type ?? ""}
              required
            >
              <option value="" disabled>
                Choose sharing type
              </option>
              {sharingTypes.map((sharingType) => (
                <option key={sharingType} value={sharingType}>
                  {sharingType}
                </option>
              ))}
            </select>
          </div>
          <div className="owner-field">
            <label htmlFor={`${prefix}-rent`}>Monthly rent (₹)</label>
            <input
              id={`${prefix}-rent`}
              name="monthlyRent"
              type="number"
              min={1000}
              max={1000000}
              step={100}
              defaultValue={listing?.monthly_rent}
              required
            />
          </div>
          <div className="owner-field">
            <label htmlFor={`${prefix}-deposit`}>Security deposit (₹)</label>
            <input
              id={`${prefix}-deposit`}
              name="securityDeposit"
              type="number"
              min={0}
              max={5000000}
              step={100}
              defaultValue={listing?.security_deposit}
              required
            />
          </div>
          <fieldset className="owner-fieldset">
            <legend>Amenities</legend>
            <div className="owner-checkGrid">
              {amenities.map((amenity) => (
                <label key={amenity}>
                  <input
                    type="checkbox"
                    name="amenities"
                    value={amenity}
                    defaultChecked={listing?.amenities.includes(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
            <label className="owner-checkOption">
              <input
                type="checkbox"
                name="foodIncluded"
                defaultChecked={listing?.food_included}
              />
              <span>Food included</span>
            </label>
          </fieldset>
          <div className="owner-field owner-fieldWide">
            <label htmlFor={`${prefix}-rules`}>House rules</label>
            <textarea
              id={`${prefix}-rules`}
              name="houseRules"
              defaultValue={listing?.house_rules}
              minLength={10}
              maxLength={2000}
              rows={3}
              required
            />
          </div>
          <div className="owner-field owner-fieldWide">
            <label htmlFor={`${prefix}-photos`}>
              Property photographs {listing ? "(optional when editing)" : ""}
            </label>
            <input
              id={`${prefix}-photos`}
              name="photos"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              required={!listing}
            />
            <small>
              JPEG, PNG, or WebP; up to 5 MB each, 4 per save. New or edited
              listings return to review and are unpublished.
            </small>
          </div>
        </div>
        <FormFeedback state={state} />
        <button className="owner-primaryButton" type="submit" disabled={pending}>
          {pending
            ? "Saving listing…"
            : listing
              ? "Save changes for review"
              : "Submit listing for review"}
        </button>
      </form>
    </div>
  );
}
