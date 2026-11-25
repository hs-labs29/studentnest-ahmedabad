import {
  LOCALITIES,
  type AccommodationType,
  type Locality,
} from "@/app/pgs/data/sample-pgs";
import type {
  ListingAmenity,
  ListingSharingType,
} from "@/lib/supabase/database.types";
import type { FormState } from "@/lib/auth/types";

const LISTING_AMENITIES: ListingAmenity[] = [
  "Wi-Fi",
  "AC",
  "Laundry",
  "Washing machine",
  "Attached bathroom",
  "Parking",
];
const ACCOMMODATION_TYPES: AccommodationType[] = ["Boys", "Girls", "Co-living"];
const SHARING_TYPES: ListingSharingType[] = [
  "Single",
  "Double sharing",
  "Triple sharing",
  "Four sharing",
  "Private room",
];

export function readFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readFormPassword(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validMobileNumber(value: string) {
  return /^\+?[0-9][0-9 ()-]{7,19}$/.test(value);
}

function isLocality(value: string): value is Locality {
  return LOCALITIES.some((locality) => locality === value);
}

function isAccommodationType(value: string): value is AccommodationType {
  return ACCOMMODATION_TYPES.some((option) => option === value);
}

function isSharingType(value: string): value is ListingSharingType {
  return SHARING_TYPES.some((option) => option === value);
}

function isListingAmenity(value: string): value is ListingAmenity {
  return LISTING_AMENITIES.some((option) => option === value);
}

export function validateOwnerSignup(formData: FormData) {
  const fullName = readFormString(formData, "fullName");
  const email = readFormString(formData, "email").toLowerCase();
  const mobileNumber = readFormString(formData, "mobileNumber");
  const businessName = readFormString(formData, "businessName");
  const address = readFormString(formData, "address");
  const password = readFormPassword(formData, "password");
  const confirmPassword = readFormPassword(formData, "confirmPassword");

  if (fullName.length < 2 || fullName.length > 100) {
    return { error: "Enter your full name (2–100 characters)." } as const;
  }
  if (!validEmail(email)) return { error: "Enter a valid email address." } as const;
  if (!validMobileNumber(mobileNumber)) {
    return { error: "Enter a valid mobile number." } as const;
  }
  if (businessName.length < 2 || businessName.length > 120) {
    return { error: "Enter a business or property name (2–120 characters)." } as const;
  }
  if (address.length < 8 || address.length > 300) {
    return { error: "Enter an address (8–300 characters)." } as const;
  }
  if (password.length < 12 || password.length > 128 || !/\S/.test(password)) {
    return { error: "Use a password between 12 and 128 characters." } as const;
  }
  if (password !== confirmPassword) {
    return { error: "The passwords do not match." } as const;
  }
  if (formData.get("termsAccepted") !== "on") {
    return { error: "Accept the owner application terms to continue." } as const;
  }

  return {
    data: { fullName, email, mobileNumber, businessName, address, password },
  } as const;
}

export function validateListing(formData: FormData) {
  const name = readFormString(formData, "name");
  const description = readFormString(formData, "description");
  const locality = readFormString(formData, "locality");
  const address = readFormString(formData, "address");
  const accommodationType = readFormString(formData, "accommodationType");
  const rentValue = readFormString(formData, "monthlyRent");
  const depositValue = readFormString(formData, "securityDeposit");
  const sharingType = readFormString(formData, "sharingType");
  const houseRules = readFormString(formData, "houseRules");
  const selectedAmenities = formData
    .getAll("amenities")
    .filter((value): value is string => typeof value === "string");
  const amenities = [...new Set(selectedAmenities)];
  const validAmenities = amenities.filter(isListingAmenity);
  const monthlyRent = Number(rentValue);
  const securityDeposit = Number(depositValue);

  if (name.length < 3 || name.length > 120) {
    return { error: "Enter a PG name (3–120 characters)." } as const;
  }
  if (description.length < 20 || description.length > 4000) {
    return { error: "Description must be 20–4,000 characters." } as const;
  }
  if (!isLocality(locality)) {
    return { error: "Choose an Ahmedabad locality." } as const;
  }
  if (address.length < 8 || address.length > 300) {
    return { error: "Enter a complete property address (8–300 characters)." } as const;
  }
  if (!isAccommodationType(accommodationType)) {
    return { error: "Choose an accommodation category." } as const;
  }
  if (!/^\d+$/.test(rentValue) || monthlyRent < 1000 || monthlyRent > 1000000) {
    return { error: "Monthly rent must be between ₹1,000 and ₹1,000,000." } as const;
  }
  if (
    !/^\d+$/.test(depositValue) ||
    securityDeposit < 0 ||
    securityDeposit > 5000000
  ) {
    return { error: "Security deposit must be between ₹0 and ₹5,000,000." } as const;
  }
  if (!isSharingType(sharingType)) {
    return { error: "Choose a room sharing type." } as const;
  }
  if (validAmenities.length !== amenities.length) {
    return { error: "Choose only the listed amenities." } as const;
  }
  if (houseRules.length < 10 || houseRules.length > 2000) {
    return { error: "House rules must be 10–2,000 characters." } as const;
  }

  return {
    data: {
      name,
      description,
      locality,
      address,
      accommodationType,
      monthlyRent,
      securityDeposit,
      sharingType,
      amenities: validAmenities,
      foodIncluded: formData.get("foodIncluded") === "on",
      houseRules,
    },
  } as const;
}

export function validateDecisionReason(value: string, required: boolean) {
  const reason = value.trim();
  if (required && (reason.length < 5 || reason.length > 1000)) {
    return {
      error: "Enter a reason between 5 and 1,000 characters.",
    } satisfies FormState;
  }
  if (!required && reason.length > 0 && reason.length < 5) {
    return {
      error: "Enter a reason of at least 5 characters, or leave it blank.",
    } satisfies FormState;
  }
  if (reason.length > 1000) {
    return { error: "Reason must not exceed 1,000 characters." } satisfies FormState;
  }
  return { data: reason || null } as const;
}
