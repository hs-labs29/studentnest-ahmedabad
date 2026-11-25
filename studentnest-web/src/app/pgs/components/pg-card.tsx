import Link from "next/link";
import type { SamplePg } from "../data/sample-pgs";

export default function PgCard({ pg }: { pg: SamplePg }) {
  return (
    <Link
      className="pgs-card"
      href={`/pgs/${pg.id}`}
      aria-label={`View sample PG in ${pg.locality}, Ahmedabad`}
    >
      <div
        className="pgs-cardPhoto"
        role="img"
        aria-label={`Representative sample photo for a PG in ${pg.locality}`}
        style={{ backgroundImage: `url("${pg.image}")` }}
      >
        <span className="pgs-sampleBadge">Sample photo</span>
        <span className="pgs-categoryBadge">{pg.accommodationType}</span>
      </div>
      <div className="pgs-cardBody">
        <div className="pgs-cardLocation">
          <span aria-hidden="true">⌖</span>
          {pg.locality}, Ahmedabad
        </div>
        <div className="pgs-cardTitleRow">
          <h2>Sample PG · {pg.id.slice(-2)}</h2>
          <span className="pgs-roomType">{pg.roomType}</span>
        </div>
        <div className="pgs-amenityList" aria-label="Sample amenities">
          {pg.amenities.map((amenity) => (
            <span className="pgs-amenity" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>
        <div className="pgs-cardBottom">
          <p>
            <strong>₹{pg.monthlyRent.toLocaleString("en-IN")}</strong>
            <span> / month · sample rent</span>
          </p>
          <span className="pgs-demoLabel">Demo listing</span>
        </div>
      </div>
    </Link>
  );
}
