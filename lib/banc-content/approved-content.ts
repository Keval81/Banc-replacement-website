import { areaGuides } from "../area-guides.ts";
import { describeSchool, LOCAL_SCHOOL_AREAS, nearestSchools } from "../local-schools.ts";
import { BUYERS_GUIDE } from "./buyers-guide.ts";
import { CONTACT_PAGE } from "./contact.ts";
import { LANDLORDS_GUIDE } from "./landlords-guide.ts";
import { SELLERS_GUIDE } from "./sellers-guide.ts";
import { TENANTS_GUIDE } from "./tenants-guide.ts";
import type {
  ApprovedBancDocument,
  ApprovedBancPage,
} from "./types.ts";

const APPROVED_PAGES = [
  BUYERS_GUIDE,
  SELLERS_GUIDE,
  LANDLORDS_GUIDE,
  TENANTS_GUIDE,
  CONTACT_PAGE,
] as const satisfies readonly ApprovedBancPage[];

function pageId(page: ApprovedBancPage): string {
  return page.href.slice(1).replaceAll("/", ":");
}

function buildPageDocuments(
  page: ApprovedBancPage,
): ApprovedBancDocument[] {
  return page.sections.map((section) => ({
    id: `${pageId(page)}:${section.id}`,
    title: page.title,
    sectionTitle: section.title,
    href: page.href,
    text: section.body.join("\n\n"),
    aliases: section.aliases,
  }));
}

const AREA_GUIDE_DOCUMENTS: readonly ApprovedBancDocument[] = areaGuides.map(
  (guide) => ({
    id: `area-guide:${guide.slug}`,
    title: `${guide.name} area guide`,
    sectionTitle: guide.teaser,
    href: `/area-guides/${guide.slug}`,
    text: guide.paragraphs.join("\n\n"),
    aliases: [guide.name, guide.teaser, `${guide.name} neighbourhood`],
  }),
);

// "What areas do you cover?" had no answer: each guide covers one place and
// nothing listed them together. Built from the published guides, so it cannot
// name an area the site does not have a page for.
const AREAS_COVERED_DOCUMENT: ApprovedBancDocument = {
  id: "areas-covered",
  title: "Areas Banc covers",
  sectionTitle: "Areas we cover",
  href: "/area-guides",
  text: `Banc Property Group is an independent sales and lettings agency based in Cuffley, Hertfordshire. The areas Banc covers are ${
    areaGuides.map((guide) => guide.name).join(", ").replace(/, ([^,]*)$/, " and $1")
  }.`,
  aliases: ["areas covered", "areas we cover", "which areas", "where do you cover", "coverage area", "local areas"],
};

const MAX_SCHOOLS_TEXT_LENGTH = 480;

function schoolsText(area: string, schools: readonly string[]): string {
  return `State-funded schools nearest the centre of ${area}, by straight-line distance: ${
    schools.join(", ").replace(/, ([^,]*)$/, " and $1")
  }. Distances are a guide only; each school and the local council decide catchment areas and admissions.`;
}

// Schools are the first thing buyers ask about an area and the guides barely
// mention them. Names and distances come from the Department for Education
// register, so the bot never has to guess one.
const AREA_SCHOOLS_DOCUMENTS: readonly ApprovedBancDocument[] = areaGuides.flatMap((guide) => {
  const centre = LOCAL_SCHOOL_AREAS.find((area) => area.name === guide.name);
  if (centre === undefined) return [];
  const schools = nearestSchools(centre.lat, centre.lng);
  if (schools.length === 0) return [];

  const primaries = schools.filter((school) => school.phase === "primary").map(describeSchool);
  const others = schools.filter((school) => school.phase !== "primary").map(describeSchool);
  let text = schoolsText(guide.name, [...primaries, ...others]);
  // The excerpt shown to the reply writer is capped; drop the furthest primary rather than cut a name in half.
  if (text.length > MAX_SCHOOLS_TEXT_LENGTH) {
    text = schoolsText(guide.name, [...primaries.slice(0, -1), ...others]);
  }
  return [{
    id: `schools:${guide.slug}`,
    title: `Schools near ${guide.name}`,
    sectionTitle: `Nearest state-funded schools to ${guide.name}`,
    href: `/area-guides/${guide.slug}`,
    text,
    aliases: [
      `${guide.name} schools`,
      `schools in ${guide.name}`,
      `schools near ${guide.name}`,
      `${guide.name} primary school`,
      `${guide.name} secondary school`,
      `${guide.name} catchment`,
    ],
  }];
});

export const APPROVED_BANC_DOCUMENTS: readonly ApprovedBancDocument[] = [
  ...APPROVED_PAGES.flatMap(buildPageDocuments),
  AREAS_COVERED_DOCUMENT,
  ...AREA_SCHOOLS_DOCUMENTS,
  ...AREA_GUIDE_DOCUMENTS,
];
