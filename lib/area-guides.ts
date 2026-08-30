// Area guide copy sourced verbatim from bancproperty.com/area-guide/* (captured 2026-08-27).
// Obvious typos in the live source were corrected without changing any factual claim —
// see docs/audits/2026-08-27-banc-live-content-parity-audit.md.

export interface AreaGuide {
  slug: string;
  name: string;
  teaser: string;
  image: string;
  paragraphs: string[];
}

export const areaGuides: AreaGuide[] = [
  {
    name: "Cuffley",
    slug: "cuffley",
    image: "https://images.unsplash.com/photo-1694556586916-7b5912ba8e62?w=1200&q=85",
    teaser: "Picturesque village living",
    paragraphs: [
      "Cuffley is very much in the London commuter belt and the village offers rail access into London Moorgate and there are evening and weekend services to Kings Cross. Ideally positioned just outside the M25, it has always been a migration point for a lot of North London residents and other areas to settle here with the links to the financial centre of London.",
      "A fabulous place to raise a family with good schooling, state and private, along with lots of leisure activities including tennis and football clubs to join and open countryside and the great woods to explore.",
    ],
  },
  {
    name: "Potters Bar",
    slug: "potters-bar",
    image: "https://images.unsplash.com/photo-1746283209286-3a3d13a4279b?w=1200&q=85",
    teaser: "Commuter haven with charm",
    paragraphs: [
      "Potters Bar is a town in Hertfordshire, with two main streets — Darkes Lane and the High Street — both offering an amazing number of shops, restaurants and amenities.",
      "The town has always been favoured by commuters working in London as Darkes Lane is home to Potters Bar train station, which offers frequent trains to London Kings Cross in 16 minutes and also Finsbury Park and Moorgate. Northbound, the service provides a route to Hatfield, Welwyn Garden City, Cambridge and Peterborough. Approximately 3 miles away is Cockfosters Underground station, which is on the Piccadilly line.",
    ],
  },
  {
    name: "Cheshunt",
    slug: "cheshunt",
    image: "https://images.unsplash.com/photo-1604775567578-712a3acce497?w=1200&q=85",
    teaser: "Vibrant commuter town",
    paragraphs: [
      "Cheshunt is a Hertfordshire town that is considered to be in the Greater London region, due to its proximity to the northern parishes of the city and its situation just outside of the M25 boundary. The town is divided into two halves by the A10, which has two junctions at either end of the town.",
      "Whilst having plenty of local industry, Cheshunt has a strong commuting population that makes use of the excellent links to London that are on offer. Cheshunt is a vibrant, increasingly younger town, with a large cultural diversity and plenty to encourage families to thrive within its borders.",
      "Waltham Cross is adjacent to Cheshunt and straddles the M25 corridor. Waltham Cross is more industriously focused with pockets of housing between areas of commerce.",
    ],
  },
  {
    name: "Northaw",
    slug: "northaw",
    image: "https://images.unsplash.com/photo-1761474909776-32abcf1322c3?w=1200&q=85",
    teaser: "Rural retreat",
    paragraphs: [
      "Northaw is a small village between Potters Bar and Cuffley and has remained relatively unchanged for many years. There is a variety of houses, from small cottages to country estates surrounded by serene countryside, with a C of E Primary School, St. Thomas A Becket Church and restaurant and country pubs.",
    ],
  },
  {
    name: "Brookmans Park",
    slug: "brookmans-park",
    image: "https://images.unsplash.com/photo-1596292748295-1ab106b1f5a2?w=1200&q=85",
    teaser: "Affluent suburban elegance",
    paragraphs: [
      "The village of Brookmans Park offers much to many. Whilst still retaining a village feel, the train station provides direct access into London with Kings Cross 34 minutes away and Moorgate 39 minutes.",
      "The village green is surrounded with many shops including traditional independents such as a butcher, fishmongers, bakers, tea house and hardware stores as well as many hairdressers and beauty salons. Brookmans is the gastropub of choice for locals which brings together the village.",
    ],
  },
  {
    name: "Goffs Oak",
    slug: "goffs-oak",
    image: "https://images.unsplash.com/photo-1633354991957-2368ef603ec2?w=1200&q=85",
    teaser: "Village community spirit",
    paragraphs: [
      "Goffs Oak is a large village positioned between Cuffley and Cheshunt. Goffs Oak offers more rurality than neighbouring Cheshunt and is comprised of mainly private, residential homes. The housing demographic in Goffs Oak lends to four and five-bedroom detached homes with private parking, though there are a handful of three-bedroom semi-detached residences.",
      "Goffs Oak, due to its proximity to Cheshunt and Cuffley stations, is a popular village for commuters looking to make the most of their time away from the office. Goffs Oak does not have a train station of its own but it is almost equidistant from three very well-established stations.",
    ],
  },
  {
    name: "Newgate Street Village",
    slug: "newgate-street-village",
    image: "https://images.unsplash.com/photo-1759330014698-a6835e445c09?w=1200&q=85",
    teaser: "Historic rural setting",
    paragraphs: [
      "Newgate Street is a highly regarded and sought after village that enjoys a convenient position close to Cuffley, Cheshunt, Broxbourne and Hertford yet surrounded by countryside. It has two lovely pubs (The Crown and The Coach & Horses) and an upmarket Mediterranean, Thai and an Indian restaurant.",
      "The village is also in the catchment to the hugely popular Ponsbourne St Mary's C of E Primary School. Both Cuffley and Bayford Stations are just a short drive with terrific links into London. Only 30 mins from London yet set amongst thousands of acres of woodland and countryside, the village sits on the Hertfordshire Way and miles of footpaths, bike trails and bridgeways.",
    ],
  },
  {
    name: "Enfield",
    slug: "enfield",
    image: "https://images.unsplash.com/photo-1676802584541-dc901dcaa815?w=1200&q=85",
    teaser: "Urban convenience meets green space",
    paragraphs: [
      "Enfield straddles the border between North London and Hertfordshire. There are still some 14th-century remnants of Enfield's past as a small town, but today it is a thriving suburb offering the best of both London life and country living.",
      "Enfield has several train stations, as well as good bus and road links, making commuting into Central London easy. It's a good place to look for a family home — or a home for pets — that's relatively affordable, in an area with an abundance of green space. Schools are also good, making this area ever popular with families.",
    ],
  },
  {
    name: "Essendon",
    slug: "essendon",
    image: "https://images.unsplash.com/photo-1760299477450-1730f8f7d61e?w=1200&q=85",
    teaser: "Countryside tranquillity",
    paragraphs: [
      "Essendon is a small village between Brookmans Park, Hertford and Hatfield with a variety of character properties and private estates. It is also home to Essendon Country Club with two golf courses, a golf academy, restaurant and function facilities. There is a C of E Primary School in the village, too.",
    ],
  },
];

export function getAreaGuide(slug: string): AreaGuide | undefined {
  return areaGuides.find((area) => area.slug === slug);
}
