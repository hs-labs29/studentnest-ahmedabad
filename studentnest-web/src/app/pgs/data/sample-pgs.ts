export const LOCALITIES = [
  "Navrangpura",
  "Vastrapur",
  "Satellite",
  "Thaltej",
  "Chandkheda",
] as const;

export type Locality = (typeof LOCALITIES)[number];
export type AccommodationType = "Boys" | "Girls" | "Co-living";
export type Amenity =
  | "Wi-Fi"
  | "AC"
  | "Food"
  | "Laundry"
  | "Attached bathroom";

export interface SamplePg {
  id: string;
  locality: Locality;
  monthlyRent: number;
  accommodationType: AccommodationType;
  amenities: Amenity[];
  roomType: string;
  image: string;
}

export const AMENITIES: Amenity[] = [
  "Wi-Fi",
  "AC",
  "Food",
  "Laundry",
  "Attached bathroom",
];

export const SAMPLE_PGS: SamplePg[] = [
  {
    id: "sample-01",
    locality: "Navrangpura",
    monthlyRent: 7800,
    accommodationType: "Boys",
    amenities: ["Wi-Fi", "Food", "Laundry"],
    roomType: "Triple sharing",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "sample-02",
    locality: "Navrangpura",
    monthlyRent: 11200,
    accommodationType: "Girls",
    amenities: ["Wi-Fi", "AC", "Food", "Attached bathroom"],
    roomType: "Double sharing",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "sample-03",
    locality: "Vastrapur",
    monthlyRent: 13500,
    accommodationType: "Co-living",
    amenities: ["Wi-Fi", "AC", "Laundry", "Attached bathroom"],
    roomType: "Private room",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "sample-04",
    locality: "Satellite",
    monthlyRent: 15800,
    accommodationType: "Girls",
    amenities: ["Wi-Fi", "AC", "Food", "Laundry", "Attached bathroom"],
    roomType: "Double sharing",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "sample-05",
    locality: "Chandkheda",
    monthlyRent: 6800,
    accommodationType: "Boys",
    amenities: ["Wi-Fi", "Food", "Attached bathroom"],
    roomType: "Triple sharing",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
  },
  {
    id: "sample-06",
    locality: "Thaltej",
    monthlyRent: 18500,
    accommodationType: "Co-living",
    amenities: ["Wi-Fi", "AC", "Food", "Laundry", "Attached bathroom"],
    roomType: "Private room",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  },
];
