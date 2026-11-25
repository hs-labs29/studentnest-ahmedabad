export interface SamplePhoto {
  src: string;
  label: string;
}

export interface SamplePgDetails {
  name: string;
  securityDeposit: number;
  occupancyExample: string;
  utilitiesEstimate: number;
  additionalFacilities: ("Washing machine" | "Parking")[];
  additionalPhotos: SamplePhoto[];
}

const representativePhotos: SamplePhoto[] = [
  {
    src: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
    label: "Representative sample bedroom",
  },
  {
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85",
    label: "Representative sample shared space",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=85",
    label: "Representative sample washroom",
  },
];

export const SAMPLE_PG_DETAILS: Record<string, SamplePgDetails> = {
  "sample-01": {
    name: "Sample PG 01 · Navrangpura",
    securityDeposit: 15600,
    occupancyExample: "2 of 3 example spaces",
    utilitiesEstimate: 900,
    additionalFacilities: ["Washing machine"],
    additionalPhotos: representativePhotos,
  },
  "sample-02": {
    name: "Sample PG 02 · Navrangpura",
    securityDeposit: 22400,
    occupancyExample: "1 of 2 example spaces",
    utilitiesEstimate: 1100,
    additionalFacilities: ["Parking"],
    additionalPhotos: representativePhotos,
  },
  "sample-03": {
    name: "Sample PG 03 · Vastrapur",
    securityDeposit: 27000,
    occupancyExample: "1 of 1 example spaces",
    utilitiesEstimate: 1300,
    additionalFacilities: ["Washing machine", "Parking"],
    additionalPhotos: representativePhotos,
  },
  "sample-04": {
    name: "Sample PG 04 · Satellite",
    securityDeposit: 31600,
    occupancyExample: "1 of 2 example spaces",
    utilitiesEstimate: 1200,
    additionalFacilities: ["Washing machine"],
    additionalPhotos: representativePhotos,
  },
  "sample-05": {
    name: "Sample PG 05 · Chandkheda",
    securityDeposit: 13600,
    occupancyExample: "2 of 3 example spaces",
    utilitiesEstimate: 800,
    additionalFacilities: [],
    additionalPhotos: representativePhotos,
  },
  "sample-06": {
    name: "Sample PG 06 · Thaltej",
    securityDeposit: 37000,
    occupancyExample: "1 of 1 example spaces",
    utilitiesEstimate: 1500,
    additionalFacilities: ["Washing machine", "Parking"],
    additionalPhotos: representativePhotos,
  },
};

export const SAMPLE_HOUSE_RULES = [
  {
    title: "Quiet hours",
    example: "Illustrative example: 10 pm–7 am. Not verified for any property.",
  },
  {
    title: "Visitors",
    example: "Sample prompt: confirm the guest policy with the owner.",
  },
  {
    title: "Move-in requirements",
    example: "Sample prompt: confirm ID, notice, and move-in requirements.",
  },
  {
    title: "Meals and shared spaces",
    example: "Sample prompt: confirm meal timings and shared-space guidelines.",
  },
];
