import Link from "next/link";
import "./detail.css";

export default function PgNotFound() {
  return (
    <main className="pgd-notFound">
      <Link className="pgd-notFoundBrand" href="/">
        StudentNest <span>Ahmedabad</span>
      </Link>
      <span className="pgd-notFoundCode">404 · SAMPLE STAY NOT FOUND</span>
      <h1>This stay isn&apos;t in our sample collection.</h1>
      <p>
        The PG link may be incorrect or the sample may have been removed. No
        real accommodation listings are connected here.
      </p>
      <Link className="pgd-notFoundButton" href="/pgs">
        Browse sample PGs
      </Link>
    </main>
  );
}
