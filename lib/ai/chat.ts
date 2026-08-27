export function generateSmartDescription(property: {
  features: string[];
  bedrooms: number;
  location: string;
  propertyType: string;
  nearbySchools?: boolean;
  transportLinks?: boolean;
}): string[] {
  const highlights: string[] = [];
  const familyFeatures = [
    "garden",
    "driveway",
    "garage",
    "conservatory",
    "ensuite",
  ];
  const hasFamilyFeatures = property.features.some((feature) =>
    familyFeatures.some((familyFeature) =>
      feature.toLowerCase().includes(familyFeature),
    ),
  );

  if (property.bedrooms >= 3 && hasFamilyFeatures) {
    highlights.push("Perfect for families");
  }
  if (property.transportLinks) {
    highlights.push("Great for commuters");
  }
  if (
    property.features.some((feature) =>
      ["swimming pool", "cinema room", "wine cellar", "gym"].some(
        (premiumFeature) => feature.toLowerCase().includes(premiumFeature),
      ),
    )
  ) {
    highlights.push("Luxury living");
  }
  if (
    property.bedrooms <= 2 &&
    !property.features.some((feature) =>
      feature.toLowerCase().includes("chain"),
    )
  ) {
    highlights.push("Ideal for first-time buyers");
  }
  if (
    property.features.some((feature) =>
      ["garden", "landscaped", "patio", "terrace"].some((gardenFeature) =>
        feature.toLowerCase().includes(gardenFeature),
      ),
    )
  ) {
    highlights.push("Outdoor space to enjoy");
  }

  return highlights;
}
