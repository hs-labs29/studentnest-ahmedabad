import type { Metadata } from "next";
import PgExplorer from "./pg-explorer";

export const metadata: Metadata = {
  title: "Explore Sample PGs | StudentNest Ahmedabad",
  description:
    "Explore illustrative PG options by Ahmedabad locality, rent, accommodation type, and amenities.",
};

export default function PgsPage() {
  return <PgExplorer />;
}
