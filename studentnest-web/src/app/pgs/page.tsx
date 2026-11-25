import type { Metadata } from "next";
import { Suspense } from "react";
import PgExplorer from "./pg-explorer";
import { getPublishedPgCards } from "@/lib/owner/listings";

export const metadata: Metadata = {
  title: "Explore PGs | StudentNest Ahmedabad",
  description:
    "Explore sample and approved PG options by Ahmedabad locality, rent, accommodation type, and amenities.",
};

export default function PgsPage() {
  return (
    <Suspense fallback={<PgExplorer />}>
      <PublishedListings />
    </Suspense>
  );
}

async function PublishedListings() {
  const publishedPgs = await getPublishedPgCards();
  return <PgExplorer publishedPgs={publishedPgs} />;
}
