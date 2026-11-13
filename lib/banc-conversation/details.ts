import { areaGuides } from "../area-guides.ts";
import { LOCAL_SCHOOL_AREAS, nearestSchools } from "../local-schools.ts";
import { readableLabel } from "../readable-label.ts";
import type { ConversationDetails } from "./contracts.ts";
import type { TrustedOperationResult } from "./tools.ts";

const MAX_ITEMS = 8;
const SCHOOLS_QUESTION = /\bschools?\b|\bcatchment\b/i;
const OVERVIEW_QUESTION =
  /\bfeatures?\b|\btell me (?:more |a bit more )?about\b|\bmore (?:details?|info(?:rmation)?)\b|\bdescribe\b|\bwhat (?:makes|does) (?:it|this)\b|\bwhat is it like\b/i;
const SCHOOL_TEXT = /^(.+) \((primary|secondary|all-through), (\d+\.\d) miles\)$/;
const AREA_SCHOOLS_DOCUMENT = /^schools:([a-z0-9-]+)$/;

function capitalised(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function schoolItem(name: string, phase: string, miles: string) {
  return { label: name, note: `${capitalised(phase)} · ${miles} miles` };
}

/**
 * The items an answer is really a list of, for the panel to lay out as rows.
 * Decided here, from the visitor's words and the trusted results, never by
 * the model.
 */
export function detailsFor(
  message: string,
  results: readonly TrustedOperationResult[],
): ConversationDetails | undefined {
  const asksAboutSchools = SCHOOLS_QUESTION.test(message);

  for (const result of results) {
    if (result.status === "property_facts" && result.facts.length === 1) {
      const fact = result.facts[0]!;
      if (asksAboutSchools) {
        const items = (fact.nearbySchools ?? []).flatMap((school) => {
          const parsed = SCHOOL_TEXT.exec(school);
          return parsed === null ? [] : [schoolItem(parsed[1]!, parsed[2]!, parsed[3]!)];
        });
        return items.length === 0 ? undefined : { title: "Nearest schools", items: items.slice(0, MAX_ITEMS) };
      }
      if (OVERVIEW_QUESTION.test(message) && (fact.keyFeatures?.length ?? 0) >= 2) {
        return {
          title: "Key features",
          items: fact.keyFeatures!.slice(0, MAX_ITEMS).map((label) => ({ label: readableLabel(label) })),
        };
      }
    }

    if (result.status === "knowledge" && asksAboutSchools) {
      const slug = AREA_SCHOOLS_DOCUMENT.exec(result.sources[0]?.documentId ?? "")?.[1];
      const guide = areaGuides.find((candidate) => candidate.slug === slug);
      const centre = LOCAL_SCHOOL_AREAS.find((area) => area.name === guide?.name);
      if (guide === undefined || centre === undefined) continue;
      const items = nearestSchools(centre.lat, centre.lng).map((school) =>
        schoolItem(school.name, school.phase, school.distanceMiles.toFixed(1))
      );
      if (items.length > 0) return { title: `Schools near ${guide.name}`, items };
    }
  }
  return undefined;
}
