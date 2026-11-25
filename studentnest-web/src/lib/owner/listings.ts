import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { PgListingImage } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { PublishedPgCard } from "@/app/pgs/data/pg-types";

const LISTING_IMAGE_BUCKET = "pg-listing-images";
const SIGNED_URL_SECONDS = 60 * 45;

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
export type SignedListingImage = PgListingImage & { signedUrl: string };

export async function getSignedListingImages(
  supabase: SupabaseServerClient,
  listingIds: string[],
): Promise<SignedListingImage[]> {
  if (listingIds.length === 0) return [];

  const { data, error } = await supabase
    .from("pg_listing_images")
    .select("*")
    .in("listing_id", listingIds)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error("Unable to load listing photos.");

  return Promise.all(
    (data ?? []).map(async (image) => {
      const { data: signedUrl, error: signedUrlError } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .createSignedUrl(image.storage_path, SIGNED_URL_SECONDS);
      if (signedUrlError) {
        throw new Error("Unable to securely open a listing photo.");
      }
      return { ...image, signedUrl: signedUrl.signedUrl };
    }),
  );
}

export async function getPublishedPgCards(): Promise<PublishedPgCard[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pg_listings")
    .select(
      "id, name, locality, monthly_rent, accommodation_type, sharing_type, amenities, food_included, created_at",
    )
    .eq("approval_status", "approved")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load approved PG listings.");

  const images = await getSignedListingImages(
    supabase,
    (data ?? []).map((listing) => listing.id),
  );
  const firstImageByListing = new Map<string, string>();
  for (const image of images) {
    if (!firstImageByListing.has(image.listing_id)) {
      firstImageByListing.set(image.listing_id, image.signedUrl);
    }
  }

  return (data ?? []).map((listing) => ({
    id: listing.id,
    name: listing.name,
    locality: listing.locality,
    monthlyRent: listing.monthly_rent,
    accommodationType: listing.accommodation_type,
    amenities: [
      ...listing.amenities,
      ...(listing.food_included ? ["Food"] : []),
    ],
    roomType: listing.sharing_type,
    image: firstImageByListing.get(listing.id) ?? null,
  }));
}
