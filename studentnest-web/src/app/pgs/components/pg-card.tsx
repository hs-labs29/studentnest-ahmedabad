import Link from "next/link";
import type { PgDirectoryItem } from "../data/pg-types";

export default function PgCard({ pg }: { pg: PgDirectoryItem }) {
  return (
    <Link
      className="pgs-card"
      href={pg.href}
      aria-label={`View ${pg.isSample ? "sample" : "approved"} PG ${pg.name} in ${pg.locality}, Ahmedabad`}
    >
      <div
        className="pgs-cardPhoto"
        role="img"
        aria-label={
          pg.image
            ? `${pg.isSample ? "Representative sample" : "Listing"} photo for ${pg.name}`
            : `No photo uploaded for ${pg.name}`
        }
        style={pg.image ? { backgroundImage: `url("${pg.image}")` } : undefined}
      >
        <span className="pgs-sampleBadge">
          {pg.isSample ? "Sample photo" : "Owner photo"}
        </span>
        <span className="pgs-categoryBadge">{pg.accommodationType}</span>
      </div>
      <div className="pgs-cardBody">
        <div className="pgs-cardLocation">
          <span aria-hidden="true">⌖</span>
          {pg.locality}, Ahmedabad
        </div>
        <div className="pgs-cardTitleRow">
          <h2>{pg.name}</h2>
          <span className="pgs-roomType">{pg.roomType}</span>
        </div>
        <div
          className="pgs-amenityList"
          aria-label={pg.isSample ? "Sample amenities" : "Listing amenities"}
        >
          {pg.amenities.map((amenity) => (
            <span className="pgs-amenity" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>
        <div className="pgs-cardBottom">
          <p>
            <strong>₹{pg.monthlyRent.toLocaleString("en-IN")}</strong>
            <span>{pg.isSample ? " / month · sample rent" : " / month"}</span>
          </p>
          <span className="pgs-demoLabel">
            {pg.isSample ? "Demo listing" : "Approved"}
          </span>
        </div>
      </div>
    </Link>
  );
}
