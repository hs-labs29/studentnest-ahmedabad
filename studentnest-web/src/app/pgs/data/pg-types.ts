import type { AccommodationType, Locality } from "./sample-pgs";

export type PublishedPgCard = {
  id: string;
  name: string;
  locality: Locality;
  monthlyRent: number;
  accommodationType: AccommodationType;
  amenities: string[];
  roomType: string;
  image: string | null;
};

export type PgDirectoryItem = PublishedPgCard & {
  href: string;
  isSample: boolean;
};
