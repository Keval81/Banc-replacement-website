// Example: Updated Property Usage with Map and Floorplan

import PropertyCard from "@/components/PropertyCard";

// Example property data with map and floorplan images
const propertyWithExtras = {
  id: "the-laurels-hadley-wood",
  title: "The Laurels",
  address: "Hadley Wood, EN4",
  price: "£2,450,000",
  tags: ["New Listing", "Premium", "Video Tour"],
  stats: { beds: 5, baths: 4, sqft: 3820, epc: "B" },
  images: [
    "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  ],
  summary: "Elegant modern residence with landscaped gardens and seamless indoor-outdoor living.",
  
  // NEW: Optional map image (static map screenshot or Google Maps embed image)
  mapImage: "/properties/laurels-hadley-wood-map.jpg",
  
  // NEW: Optional floorplan image
  floorplanImage: "/properties/laurels-hadley-wood-floorplan.jpg",
};

// Example without map/floorplan (backwards compatible)
const propertyBasic = {
  id: "cuffley-house-hertfordshire",
  title: "Cuffley House",
  address: "Cuffley, Hertfordshire",
  price: "£1,350,000",
  tags: ["New Listing", "Premium"],
  stats: { beds: 4, baths: 3, sqft: 2600, epc: "B" },
  images: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
  ],
  summary: "Characterful family home with open-plan living, media room, and expansive gardens.",
  // No mapImage or floorplanImage - tabs won't show
};

// Usage:
// <PropertyCard {...propertyWithExtras} />  // Shows Photos | Map | Floorplan tabs
// <PropertyCard {...propertyBasic} />       // Shows image carousel only (no tabs)

/* 
KEY FEATURES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. IMAGE LIGHTBOX
   • Click any image to open full-screen lightbox
   • Keyboard navigation (ESC to close, ← → arrows)
   • Thumbnail strip for quick navigation
   • Shows "Click to expand" hint on hover

2. TABBED VIEW SWITCHER (like Foxtons)
   • Photos tab - property image carousel
   • Map tab - shows location map image (if provided)
   • Floorplan tab - shows floorplan image (if provided)
   • Only shows tabs when map/floorplan images are provided
   • Smooth fade transitions between views

3. BACKWARDS COMPATIBLE
   • Works exactly as before if no map/floorplan provided
   • Existing properties won't show tabs

4. MOBILE FRIENDLY
   • Touch swipe for image navigation
   • Responsive lightbox
   • Accessible with ARIA labels

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UPDATED PROPERTY DATA STRUCTURE:

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  price: string;
  tags: string[];
  stats: { beds: number; baths: number; sqft: number; epc: string };
  images: string[];
  summary: string;
  mapImage?: string;        // NEW: Optional map image URL
  floorplanImage?: string;  // NEW: Optional floorplan image URL
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUGGESTED MAP/FLOORPLAN SOURCES:

• Map: Google Maps Static API
  https://maps.googleapis.com/maps/api/staticmap?center=ADDRESS&zoom=15&size=800x600&key=API_KEY

• Map: Screenshot from Google Maps / OpenStreetMap

• Floorplan: Upload property floorplan PDFs as images

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

export default function ExampleUsage() {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {/* With map and floorplan - shows all 3 tabs */}
      <PropertyCard {...propertyWithExtras} />
      
      {/* Without extras - shows photos only */}
      <PropertyCard {...propertyBasic} />
    </div>
  );
}
