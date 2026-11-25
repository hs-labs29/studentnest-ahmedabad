"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/auth/types";
import { requireOwnerSession } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { validateListing, readFormString } from "./validation";

const IMAGE_BUCKET = "pg-listing-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BATCH_BYTES = 15 * 1024 * 1024;
const MAX_IMAGES_PER_SAVE = 4;

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type SupportedImageType = keyof typeof IMAGE_TYPES;

export async function saveListingAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const validation = validateListing(formData);
  if ("error" in validation) return { error: validation.error };

  const { supabase, profile, application } = await requireOwnerSession();
  if (application.status !== "approved") {
    return {
      error: "Your owner application must be approved before managing listings.",
    };
  }

  const listingId = readFormString(formData, "listingId");
  if (listingId && !isUuid(listingId)) {
    return { error: "The listing identifier is invalid." };
  }

  const photoResult = validatePhotos(formData.getAll("photos"), !listingId);
  if ("error" in photoResult) return { error: photoResult.error };

  const values = {
    name: validation.data.name,
    description: validation.data.description,
    locality: validation.data.locality,
    address: validation.data.address,
    accommodation_type: validation.data.accommodationType,
    monthly_rent: validation.data.monthlyRent,
    security_deposit: validation.data.securityDeposit,
    sharing_type: validation.data.sharingType,
    amenities: validation.data.amenities,
    food_included: validation.data.foodIncluded,
    house_rules: validation.data.houseRules,
  };

  let savedListingId = listingId;
  if (listingId) {
    const { data, error } = await supabase
      .from("pg_listings")
      .update(values)
      .eq("id", listingId)
      .eq("owner_id", profile.user_id)
      .select("id")
      .maybeSingle();
    if (error || !data) {
      return {
        error:
          "We could not update this listing. It may have been removed or you may not own it.",
      };
    }
    savedListingId = data.id;
  } else {
    const { data, error } = await supabase
      .from("pg_listings")
      .insert({ ...values, owner_id: profile.user_id })
      .select("id")
      .single();
    if (error) {
      return {
        error: "We could not create the listing. Please review the details and try again.",
      };
    }
    savedListingId = data.id;
  }

  const { error: reviewError } = await supabase.rpc(
    "resubmit_own_pg_listing",
    { target_listing_id: savedListingId },
  );
  if (reviewError) {
    revalidateOwnerListingPaths(savedListingId);
    return {
      error:
        "Listing details were saved, but the listing could not be resubmitted for review. It remains unpublished.",
    };
  }

  const photoError = await uploadListingPhotos(
    supabase,
    profile.user_id,
    savedListingId,
    photoResult.photos,
  );
  revalidateOwnerListingPaths(savedListingId);
  if (photoError) {
    return {
      error: `Listing details were saved, but ${photoError} The listing remains unpublished.`,
    };
  }

  return {
    success: listingId
      ? "Listing updated. Changes are pending administrator review before it can be published again."
      : "Listing submitted for administrator review. It is not public until approved and published.",
  };
}

export async function publishListingAction(formData: FormData) {
  const listingId = readFormString(formData, "listingId");
  if (!isUuid(listingId)) throw new Error("Invalid listing identifier.");

  const { supabase, profile, application } = await requireOwnerSession();
  if (application.status !== "approved") {
    throw new Error("Owner approval is required before publishing listings.");
  }

  const publishedValue = formData.get("published");
  if (publishedValue !== "true" && publishedValue !== "false") {
    throw new Error("Invalid listing publication action.");
  }

  const { data, error } = await supabase
    .from("pg_listings")
    .update({ is_published: publishedValue === "true" })
    .eq("id", listingId)
    .eq("owner_id", profile.user_id)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    throw new Error(
      "Only an approved listing from an approved owner can be published.",
    );
  }
  revalidateOwnerListingPaths(listingId);
}

export async function removeListingAction(formData: FormData) {
  const listingId = readFormString(formData, "listingId");
  if (!isUuid(listingId)) throw new Error("Invalid listing identifier.");

  const { supabase } = await requireOwnerSession();
  const { error } = await supabase.rpc("remove_own_pg_listing", {
    target_listing_id: listingId,
  });
  if (error) throw new Error("Could not remove this listing.");
  revalidateOwnerListingPaths(listingId);
}

export async function removeListingImageAction(formData: FormData) {
  const imageId = readFormString(formData, "imageId");
  if (!isUuid(imageId)) throw new Error("Invalid photo identifier.");

  const { supabase, profile } = await requireOwnerSession();
  const { data: image, error: lookupError } = await supabase
    .from("pg_listing_images")
    .select("id, listing_id, storage_path")
    .eq("id", imageId)
    .eq("owner_id", profile.user_id)
    .maybeSingle();
  if (lookupError || !image) {
    throw new Error("This photo does not belong to your account.");
  }

  const { error: reviewError } = await supabase.rpc(
    "resubmit_own_pg_listing",
    { target_listing_id: image.listing_id },
  );
  if (reviewError) {
    throw new Error("The listing could not be unpublished before photo removal.");
  }
  revalidateOwnerListingPaths(image.listing_id);

  const { error: storageError } = await supabase.storage
    .from(IMAGE_BUCKET)
    .remove([image.storage_path]);
  if (storageError) throw new Error("Could not remove the uploaded photo.");

  const { error: rowError } = await supabase
    .from("pg_listing_images")
    .delete()
    .eq("id", image.id)
    .eq("owner_id", profile.user_id);
  if (rowError) throw new Error("The photo record could not be removed.");

  revalidateOwnerListingPaths(image.listing_id);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function validatePhotos(values: FormDataEntryValue[], required: boolean) {
  const photos: File[] = [];
  for (const value of values) {
    if (typeof value === "string") {
      if (value !== "") return { error: "Choose valid image files." } as const;
      continue;
    }
    if (value.size === 0 && value.name === "") continue;
    photos.push(value);
  }

  if (required && photos.length === 0) {
    return { error: "Upload at least one property photo." } as const;
  }
  if (photos.length > MAX_IMAGES_PER_SAVE) {
    return { error: `Upload no more than ${MAX_IMAGES_PER_SAVE} photos at a time.` } as const;
  }
  if (photos.some((photo) => photo.size > MAX_IMAGE_BYTES)) {
    return { error: "Each photo must be 5 MB or smaller." } as const;
  }
  if (photos.reduce((total, photo) => total + photo.size, 0) > MAX_BATCH_BYTES) {
    return { error: "The combined photo upload must be 15 MB or smaller." } as const;
  }
  if (photos.some((photo) => !isSupportedImageType(photo.type))) {
    return { error: "Upload JPEG, PNG, or WebP photos only." } as const;
  }

  return { photos } as const;
}

async function uploadListingPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ownerId: string,
  listingId: string,
  photos: File[],
) {
  if (photos.length === 0) return null;

  const { count, error: countError } = await supabase
    .from("pg_listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);
  if (countError) return "the existing photos could not be checked.";
  if ((count ?? 0) + photos.length > 20) {
    return "a listing can have no more than 20 photos.";
  }

  for (const [index, photo] of photos.entries()) {
    if (!isSupportedImageType(photo.type)) {
      return "a file was not a supported image format.";
    }
    const type = photo.type;
    const bytes = new Uint8Array(await photo.slice(0, 12).arrayBuffer());
    if (!matchesImageSignature(type, bytes)) {
      return "a file did not match its declared image format.";
    }

    const path = `${ownerId}/${listingId}/${crypto.randomUUID()}.${IMAGE_TYPES[type]}`;
    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, photo, {
        contentType: photo.type,
        cacheControl: "3600",
        upsert: false,
      });
    if (uploadError) return "a photo could not be uploaded.";

    const { error: rowError } = await supabase
      .from("pg_listing_images")
      .insert({
        listing_id: listingId,
        owner_id: ownerId,
        storage_path: path,
        display_order: (count ?? 0) + index,
      });
    if (rowError) {
      const { error: cleanupError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .remove([path]);
      if (cleanupError) {
        throw new Error("A failed photo upload could not be cleaned up.");
      }
      return "a photo could not be attached to the listing.";
    }
  }
  return null;
}

function matchesImageSignature(type: SupportedImageType, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }
  return (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  );
}

function isSupportedImageType(value: string): value is SupportedImageType {
  return value === "image/jpeg" || value === "image/png" || value === "image/webp";
}

function revalidateOwnerListingPaths(listingId: string) {
  revalidatePath("/owner/dashboard");
  revalidatePath("/pgs");
  revalidatePath(`/pgs/listings/${listingId}`);
  revalidatePath("/admin/dashboard");
}
