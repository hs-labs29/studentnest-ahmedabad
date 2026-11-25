import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PgDetailView from "./components/pg-detail-view";
import "./detail.css";
import { SAMPLE_PGS } from "../data/sample-pgs";
import { SAMPLE_PG_DETAILS } from "../data/sample-pg-details";

type PgPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SAMPLE_PGS.map((pg) => ({ slug: pg.id }));
}

export async function generateMetadata({
  params,
}: PgPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pg = SAMPLE_PGS.find((samplePg) => samplePg.id === slug);
  const details = SAMPLE_PG_DETAILS[slug];

  if (!pg || !details) {
    return {
      title: "Sample PG not found | StudentNest Ahmedabad",
    };
  }

  return {
    title: `${details.name} | StudentNest Ahmedabad`,
    description: `Illustrative sample PG in ${pg.locality}, Ahmedabad. Rent, facilities, and availability are not verified.`,
  };
}

export default async function PgDetailPage({ params }: PgPageProps) {
  const { slug } = await params;
  const pg = SAMPLE_PGS.find((samplePg) => samplePg.id === slug);
  const details = SAMPLE_PG_DETAILS[slug];

  if (!pg || !details) notFound();

  return <PgDetailView pg={pg} details={details} />;
}
