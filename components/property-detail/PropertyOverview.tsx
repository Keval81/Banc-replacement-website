import {
  cleanDescriptionParagraphs,
  getDisplayFact,
} from "@/lib/property-detail-view";
import type { LivePropertyDetail } from "@/lib/property-view";

interface PropertyOverviewProps {
  property: LivePropertyDetail;
}

export function PropertyOverview({ property }: PropertyOverviewProps): React.ReactElement {
  const features = property.features
    .map(getDisplayFact)
    .filter((feature): feature is string => feature !== null);
  const featureCounts = features.reduce<Map<string, number>>((counts, feature) => {
    counts.set(feature, (counts.get(feature) ?? 0) + 1);
    return counts;
  }, new Map());
  const paragraphs = cleanDescriptionParagraphs(property.description);
  const rooms = property.rooms
    .map((room) => ({
      name: getDisplayFact(room.name),
      measurement: getDisplayFact(room.measurement),
      description: getDisplayFact(room.description),
    }))
    .filter((room) => room.name || room.measurement || room.description);

  if (features.length === 0 && paragraphs.length === 0 && rooms.length === 0) return <></>;

  return (
    <div className="space-y-10">
      {features.length > 0 && (
        <section aria-labelledby="at-a-glance-heading">
          <h2 id="at-a-glance-heading" className="font-serif text-2xl text-banc-dark sm:text-3xl">
            At a glance
          </h2>
          <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {features.map((feature, index) => (
              <li
                key={
                  featureCounts.get(feature) === 1 ? feature : `${feature}-${index}`
                }
                className="border-l-2 border-banc-sky pl-3 text-sm leading-6 text-banc-dark"
              >
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {paragraphs.length > 0 && (
        <section aria-labelledby="about-property-heading">
          <h2 id="about-property-heading" className="font-serif text-2xl text-banc-dark sm:text-3xl">
            About this property
          </h2>
          <div className="mt-5 max-w-[72ch] space-y-4 text-base leading-7 text-banc-grey">
            {paragraphs.map((paragraph, index) => (
              <p key={`${paragraph}-${index}`}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {rooms.length > 0 && (
        <section aria-labelledby="room-dimensions-heading">
          <h2 id="room-dimensions-heading" className="font-serif text-2xl text-banc-dark sm:text-3xl">
            Room dimensions
          </h2>
          <dl className="mt-5 divide-y divide-banc-grey/20 border-y border-banc-grey/20">
            {rooms.map((room, index) => (
              <div
                key={`${room.name ?? "room"}-${room.measurement ?? ""}-${index}`}
                className="py-4 first:pt-0 last:pb-0"
              >
                <dt className="font-medium text-banc-dark">{room.name ?? `Room ${index + 1}`}</dt>
                {room.measurement && <dd className="mt-1 text-sm text-banc-grey">{room.measurement}</dd>}
                {room.description && <dd className="mt-2 text-sm leading-6 text-banc-grey">{room.description}</dd>}
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}
