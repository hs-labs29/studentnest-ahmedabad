import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PgDetailView from "./components/pg-detail-view";
import "./detail.css";
import { SAMPLE_PGS } from "../data/sample-pgs";
import { SAMPLE_PG_DETAILS } from "../data/sample-pg-details";
import { getStudentSession } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

  return (
    <Suspense
      fallback={<PgDetailView pg={pg} details={details} initialSaved={false} />}
    >
      <SavedAwareDetail pg={pg} details={details} />
    </Suspense>
  );
}

async function SavedAwareDetail({
  pg,
  details,
}: {
  pg: (typeof SAMPLE_PGS)[number];
  details: (typeof SAMPLE_PG_DETAILS)[string];
}) {
  if (!isSupabaseConfigured()) {
    return <PgDetailView pg={pg} details={details} initialSaved={false} />;
  }

  const session = await getStudentSession();
  if (!session) {
    return <PgDetailView pg={pg} details={details} initialSaved={false} />;
  }
  const { data, error } = await session.supabase
    .from("student_saved_pgs")
    .select("pg_slug")
    .eq("user_id", session.profile.id)
    .eq("pg_slug", pg.id)
    .maybeSingle();

  if (error) throw new Error("Unable to load the saved PG state.");
  return <PgDetailView pg={pg} details={details} initialSaved={Boolean(data)} />;
}
